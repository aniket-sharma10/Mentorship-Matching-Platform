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

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    throw new UnauthenticatedError('Invalid credentials');
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) {
    throw new UnauthenticatedError('Invalid credentials');
  }

  const { password: pass, ...rest } = user;
  const token = jwt.sign({ userId: user.id}, process.env.JWT_SECRET, { expiresIn: '15d' });
  res
    .status(StatusCodes.OK)
    .cookie('access_token', token, { httpOnly: true, maxAge: 15 * 24 * 60 * 60 * 1000 })
    .json(rest);
};

export const logout = (req, res) => {
  res.clearCookie('access_token').status(StatusCodes.OK).json('Logged out successfully')
}
