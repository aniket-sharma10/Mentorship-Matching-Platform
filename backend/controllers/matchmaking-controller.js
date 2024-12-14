import { StatusCodes } from "http-status-codes";
import { PrismaClient } from '@prisma/client';
import { NotFoundError } from "../errors/index.js";

const prisma = new PrismaClient();

export const getMatches = async (req, res) => {
  const userId = req.user.id;

  const userProfile = await prisma.profile.findUnique({
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

  const userPreferences = await prisma.matchingPreference.findUnique({
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

  if (!userProfile || !userPreferences) {
    throw new NotFoundError("Profile or matching preferences not found.");
  }

  const potentialMatches = await prisma.user.findMany({
    where: {
      id: {
        not: userId,
      },
    },
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
      matchingPreference: {
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

  // calculating scores for possible matches
  const scoredMatches = potentialMatches.map((match) => {
    let score = 0;

    // score based on skills
    match.profile.skills.forEach((matchSkill) => {
      if (userPreferences.skills.some((userSkill) => userSkill.skillId === matchSkill.skillId)) {
        score += 1; // Increase score for matching skills
      }
    });

    // score based on interests
    match.profile.interests.forEach((matchInterest) => {
      if (userPreferences.interests.some((userInterest) => userInterest.interestId === matchInterest.interestId)) {
        score += 1; // Increase score for matching interests
      }
    });

    return { ...match, score };
  });

  // sorting matches by score
  const sortedMatches = scoredMatches.sort((a, b) => b.score - a.score);

  // getting only the top 10 matches
  const topMatches = sortedMatches.slice(0, 10);

  if (topMatches.length === 0) {
    return res.status(StatusCodes.OK).json({
      message: "No matches found, try broadening your preferences.",
    });
  }

  res.status(StatusCodes.OK).json(topMatches);
};
