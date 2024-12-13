// profile-controller.js
import { StatusCodes } from "http-status-codes";
import prisma from "../prisma/prisma-client.js";
import bcrypt from "bcrypt";

// Get Profile
export const getProfile = async (req, res) => {
  const userId = req.user.id;

  const profile = await prisma.profile.findUnique({
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

  if (!profile) {
    return res
      .status(StatusCodes.NOT_FOUND)
      .json({ msg: "Profile not found." });
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
    return res
      .status(StatusCodes.BAD_REQUEST)
      .json({ msg: "Profile already exists. Please update it instead." });
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
  const { name, bio, avatarUrl, skills, interests, password } = req.body;

  let updatedData = { name, bio, avatarUrl };

  // updating password if provided
  if (password) {
    const hashedPassword = await bcrypt.hash(password, 10);
    await prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword },
    });
  }

  const updatedProfile = await prisma.profile.update({
    where: { userId },
    data: updatedData,
  });

  // updating skills and interests
  if (skills && skills.length > 0) {
    await prisma.profileSkill.deleteMany({ where: { profileId: updatedProfile.id } });
    await prisma.profileSkill.createMany({
      data: skills.map((skillId) => ({
        profileId: updatedProfile.id,
        skillId,
      })),
    });
  }

  if (interests && interests.length > 0) {
    await prisma.profileInterest.deleteMany({ where: { profileId: updatedProfile.id } });
    await prisma.profileInterest.createMany({
      data: interests.map((interestId) => ({
        profileId: updatedProfile.id,
        interestId,
      })),
    });
  }

  res.status(StatusCodes.OK).json(updatedProfile);
};

// Delete Profile
export const deleteProfile = async (req, res) => {
  const userId = req.user.id;

  await prisma.profile.delete({
    where: { userId },
  });

  res.status(StatusCodes.OK).json({ msg: "Profile has been successfully deleted." });
};
