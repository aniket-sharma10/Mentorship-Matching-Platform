import { StatusCodes } from "http-status-codes";
import { NotFoundError } from "../errors/index.js";
import prisma from "../db/prisma.js";

export const getMatches = async (req, res) => {
  const userId = req.user.id;

  // fetching user's profile and role
  const userProfile = await prisma.profile.findUnique({
    where: { userId },
    include: {
      user: true,
      skills: {
        include: { skill: true },
      },
      interests: {
        include: { interest: true },
      },
    },
  });

  if (!userProfile) {
    throw new NotFoundError("User profile not found.");
  }

  const userRole = userProfile.user.role;

  // potential matches based on skills or interests
  const potentialMatches = await prisma.profile.findMany({
    where: {
      userId: { not: userId },
      OR: [
        {
          skills: {
            some: {
              skillId: { in: userProfile.skills.map((s) => s.skillId) },
            },
          },
        },
        {
          interests: {
            some: {
              interestId: { in: userProfile.interests.map((i) => i.interestId) },
            },
          },
        },
      ],
    },
    include: {
      user: true,
      skills: {
        include: { skill: true },
      },
      interests: {
        include: { interest: true },
      },
    },
  });

  // filtering matches based on the user's role
  const filteredMatches = potentialMatches.filter((match) => {
    if (userRole === "MENTOR") {
      return match.user.role === "MENTEE"; // Only show mentees to mentors
    } else if (userRole === "MENTEE") {
      return match.user.role === "MENTOR"; // Only show mentors to mentees
    }
    return false;
  });

  // Calculate match scores
  const scoredMatches = filteredMatches.map((match) => {
    let score = 0;

    // Score based on shared skills
    match.skills.forEach((matchSkill) => {
      if (userProfile.skills.some((userSkill) => userSkill.skillId === matchSkill.skillId)) {
        score += 1;
      }
    });

    // Score based on shared interests
    match.interests.forEach((matchInterest) => {
      if (userProfile.interests.some((userInterest) => userInterest.interestId === matchInterest.interestId)) {
        score += 1;
      }
    });

    return { ...match, score };
  });

  // sorting matches
  const sortedMatches = scoredMatches.sort((a, b) => b.score - a.score).slice(0, 10);

  if (sortedMatches.length === 0) {
    return res.status(StatusCodes.OK).json({
      message: "No matches found, try expanding your profile with more skills or interests.",
    });
  }

  res.status(StatusCodes.OK).json(sortedMatches);
};
