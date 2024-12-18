import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { StatusCodes } from 'http-status-codes';
import { BadRequestError, UnauthenticatedError } from '../errors/index.js';

const prisma = new PrismaClient();

// Signup logic
export const signup = async (req, res) => {
  const { email, password, role } = req.body;

  if (!email || !password || !role) {
    throw new BadRequestError('Please provide all fields');
  }

  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser) {
    throw new BadRequestError('User already exists');
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const user = await prisma.user.create({
    data: { email, password: hashedPassword, role },
  });

  const { password: pass, ...rest } = user;
  res.status(StatusCodes.OK).json(rest);
};

// Signin logic
export const signin = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    throw new BadRequestError('Please provide email and password');
  }

  const user = await prisma.user.findUnique({
    where: { email },
    include: {
      profile: { select: { avatarUrl: true } }
    }
  });
  if (!user) {
    throw new UnauthenticatedError('Invalid credentials');
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) {
    throw new UnauthenticatedError('Invalid credentials');
  }

  const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: '15d' });
  res
    .status(StatusCodes.OK)
    .cookie('access_token', token, { httpOnly: true, maxAge: 15 * 24 * 60 * 60 * 1000 })
    .json({
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        name: user.profile?.name || null,
        avatarUrl:
          user.profile?.avatarUrl ||
          "https://www.pngall.com/wp-content/uploads/5/Profile-PNG-File.png",
      },
    });
};

export const logout = (req, res) => {
  res.clearCookie('access_token').status(StatusCodes.OK).json('Logged out successfully')
}

export const google = async (req, res) => {
  const { name, email, googlePhotoUrl, role } = req.body;

  if (!name || !email || !googlePhotoUrl || !role) {
    throw new BadRequestError('Invalid credentials or missing role');
  }

  // Check if the user already exists
  const existingUser = await prisma.user.findUnique({ where: { email } });
  
  // If the user exists, then signin
  if (existingUser) {
    const { password: pass, ...rest } = existingUser;
    const token = jwt.sign({ userId: existingUser.id }, process.env.JWT_SECRET, { expiresIn: '15d' });
    res
      .status(StatusCodes.OK)
      .cookie('access_token', token, { httpOnly: true, maxAge: 15 * 24 * 60 * 60 * 1000 })
      .json(rest);
  } else {
    // If the user does not exist, create a new user
    const password = Math.random().toString(36).slice(-8) + Math.random().toString(36).slice(-8);

    // Create new user in the database
    const user = await prisma.user.create({
      data: {
        email,
        password, // Temporary password
        role,
        profile: {
          create: {
            name,
            avatarUrl: googlePhotoUrl,
            isComplete: true,
          },
        },
      },
    });

    // Return JWT for the newly created user
    const { password: pass, ...rest } = user;
    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: '15d' });
    res
      .status(StatusCodes.OK)
      .cookie('access_token', token, { httpOnly: true, maxAge: 15 * 24 * 60 * 60 * 1000 })
      .json(rest);
  }
};
