import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const connectDB = async () => {
  try {
    // connect to the MySQL database using Prisma
    await prisma.$connect();
    console.log('Connected to the database');
  } catch (err) {
    console.error('Error connecting to the database:', err);
    process.exit(1); // Exit the process with an error code
  }
};

export default connectDB;
