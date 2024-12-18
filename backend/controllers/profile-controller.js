import { StatusCodes } from "http-status-codes";
import { PrismaClient } from '@prisma/client';
import bcrypt from "bcryptjs";
import { BadRequestError, NotFoundError } from "../errors/index.js";

const prisma = new PrismaClient();

// Get Profile
export const getProfile = async (req, res) => {
  const userId = req.user.id;

  const profile = await prisma.profile.findUnique({
    where: { userId },
    include: {
      user:{
        select:{
          role: true
        }
      },
      skills: {
        include: {
          skill: true,
        },
      },
      interests: {
        include: {
          interest: true,
        },
      },
    },
  });

  if (!profile) {
    throw new NotFoundError("Profile not found.");
  }

  res.status(StatusCodes.OK).json(profile);
};

// Create Profile
export const createProfile = async (req, res) => {
  const userId = req.user.id;
  const { name, bio, avatarUrl, skills, interests } = req.body;

  // checking for existing profile
  const existingProfile = await prisma.profile.findUnique({
    where: { userId },
  });

  if (existingProfile) {
    throw new BadRequestError("Profile already exists. Please update it instead.");
  }

  // default profile avatarUrl
  const defaultAvatarUrl = "https://www.pngall.com/wp-content/uploads/5/Profile-PNG-File.png";

  // creating new profile
  const profile = await prisma.profile.create({
    data: {
      userId,
      name,
      bio,
      avatarUrl: avatarUrl || defaultAvatarUrl,
      isComplete: true,
    },
  });

  if (skills && skills.length > 0) {
    await prisma.profileSkill.createMany({
      data: skills.map((skillId) => ({
        profileId: profile.id,
        skillId,
      })),
    });
  }

  if (interests && interests.length > 0) {
    await prisma.profileInterest.createMany({
      data: interests.map((interestId) => ({
        profileId: profile.id,
        interestId,
      })),
    });
  }

  res.status(StatusCodes.CREATED).json(profile);
};

// Update Profile
export const updateProfile = async (req, res) => {
  const userId = req.user.id;
  const { name, bio, avatarUrl, skills, interests, password, role } = req.body;

  let updatedData = { name, bio, avatarUrl };

  // updating password if provided
  if (password) {
    const hashedPassword = await bcrypt.hash(password, 10);
    await prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword },
    });
  }


  // Update role if provided
  if (role) {
    await prisma.user.update({
      where: { id: userId },
      data: { role },
    });
  }

  const profile = await prisma.profile.findUnique({
    where: { userId },
  });

  const updatedProfile = await prisma.profile.update({
    where: { userId },
    data: updatedData,
  });

  // updating skills and interests
   if (skills && skills.length > 0) {
    // First, find or create skills
    const processedSkills = await Promise.all(
      skills.map(async (skillName) => {
        // If skillName is a number, it's already an ID
        if (typeof skillName === 'number') {
          return skillName;
        }

        // Find or create skill
        let skill = await prisma.skill.findUnique({
          where: { name: skillName },
        });

        if (!skill) {
          skill = await prisma.skill.create({
            data: { name: skillName },
          });
        }

        return skill.id;
      })
    );

    // Remove existing skills and add new ones
    await prisma.profileSkill.deleteMany({ 
      where: { profileId: profile.id } 
    });

    await prisma.profileSkill.createMany({
      data: processedSkills.map((skillId) => ({
        profileId: profile.id,
        skillId,
      })),
    });
  }

  if (interests && interests.length > 0) {
    const processedInterests = await Promise.all(
      interests.map(async (interestName) => {
        // If interestName is a number, it's already an ID
        if (typeof interestName === 'number') {
          return interestName;
        }

        // Find or create interest
        let interest = await prisma.interest.findUnique({
          where: { name: interestName },
        });

        if (!interest) {
          interest = await prisma.interest.create({
            data: { name: interestName },
          });
        }

        return interest.id;
      })
    );

    // Remove existing interests and add new ones
    await prisma.profileInterest.deleteMany({ 
      where: { profileId: profile.id } 
    });

    await prisma.profileInterest.createMany({
      data: processedInterests.map((interestId) => ({
        profileId: profile.id,
        interestId,
      })),
    });
  }

  const fullProfile = await prisma.profile.findUnique({
    where: { userId },
    include: {
      skills: {
        include: {
          skill: true,
        },
      },
      interests: {
        include: {
          interest: true,
        },
      },
    },
  });

  res.status(StatusCodes.OK).json(fullProfile);
};

// Delete Profile
export const deleteProfile = async (req, res) => {
  const userId = req.user.id;

  await prisma.profile.delete({
    where: { userId },
  });

  res.status(StatusCodes.OK).json({ msg: "Profile has been successfully deleted." });
};
