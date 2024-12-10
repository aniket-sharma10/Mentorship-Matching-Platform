import { StatusCodes } from "http-status-codes";
import { Prisma } from '@prisma/client';

const errorHandlerMiddleware = (err, req, res, next) => {
  let customError = {
    // set default
    statusCode: err.statusCode || StatusCodes.INTERNAL_SERVER_ERROR,
    msg: err.message || 'Something went wrong, try again later'
  };

  // Handle Prisma client known errors
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === 'P2002') {
      customError.msg = `${Object.keys(err.meta.target).join(', ')} already registered!`;
      customError.statusCode = StatusCodes.BAD_REQUEST;
    }
    // Record not found (Prisma P2025)
    if (err.code === 'P2025') {
      customError.msg = 'Record not found';
      customError.statusCode = StatusCodes.NOT_FOUND;
    }
    // Foreign key constraint violation (Prisma P2003)
    if (err.code === 'P2003') {
      customError.msg = `Foreign key constraint failed`;
      customError.statusCode = StatusCodes.BAD_REQUEST;
    }
    // Add other Prisma errors if needed
  }

  // Handle any other unexpected errors (e.g., runtime errors)
  if (!(err instanceof Prisma.PrismaClientKnownRequestError)) {
    customError.msg = 'An unexpected error occurred';
    customError.statusCode = StatusCodes.INTERNAL_SERVER_ERROR;
  }

  return res.status(customError.statusCode).json({ msg: customError.msg });
};

export default errorHandlerMiddleware;
