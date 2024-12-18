import { StatusCodes } from "http-status-codes";
import { PrismaClient } from '@prisma/client';
import { BadRequestError } from "../errors/index.js";

const prisma = new PrismaClient();

export const discoverUsers = async (req, res) => {
  const { role, skills, interests, page = 1, limit = 10 } = req.query;

  const pageNum = parseInt(page, 10);
  const limitNum = parseInt(limit, 10);

  if (isNaN(pageNum) || pageNum < 1 || isNaN(limitNum) || limitNum < 1) {
    throw new BadRequestError("Invalid page or limit parameters.");
  }

  let filterConditions = {
    profile: {
      isComplete: true,
    },
  };

  if (role && role !== " ") {
    filterConditions.role = role;
  }

  // Filter skills
  if (skills) {
    filterConditions.profile.skills = {
      some: {
        skill: {
          name: {
            contains: skills,
            // mode: 'insensitive',
          },
        },
      },
    };
  }

  // Filter interests
  if (interests) {
    filterConditions.profile.interests = {
      some: {
        interest: {
          name: {
            contains: interests,
            // mode: 'insensitive',
          },
        },
      },
    };
  }

  // fetching users with filters and pagination
  const users = await prisma.user.findMany({
    where: filterConditions,
    skip: (pageNum - 1) * limitNum,
    take: limitNum,
    include: {
      profile: {
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
      },
    },
  });

  // fetching total count for pagination
  const totalUsers = await prisma.user.count({
    where: filterConditions,
  });

  res.status(StatusCodes.OK).json({
    users: users.map((user) => ({
      id: user.id,
      email: user.email,
      role: user.role,
      profile: {
        name: user.profile.name,
        bio: user.profile.bio,
        avatarUrl: user.profile.avatarUrl,
        skills: user.profile.skills.map((skill) => skill.skill.name),
        interests: user.profile.interests.map((interest) => interest.interest.name),
      },
    })),
    pagination: {
      totalUsers,
      totalPages: Math.ceil(totalUsers / limitNum),
      currentPage: pageNum,
      perPage: limitNum,
    },
  });
};
