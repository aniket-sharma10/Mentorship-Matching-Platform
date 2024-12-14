import express from 'express';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import connectDB from './db/connect.js';  // Prisma MySQL connection
import 'express-async-errors'

// Middleware imports
import errorHandlerMiddleware from './middlewares/error-handler.js';
import notFound from './middlewares/not-found.js';


const app = express();

// router imports
import authRoute from './routes/auth-route.js'
import profileRoute from './routes/profile-route.js'
import connectionRoute from './routes/connection-route.js'
import discoveryRoute from './routes/discovery-route.js'
import matchmakingRoute from './routes/matchmaking-route.js'

dotenv.config();
// Middleware setup
app.use(cors());
app.use(express.json());
app.use(cookieParser());

// using routes
app.use('/api/auth', authRoute)
app.use('/api/profile', profileRoute)
app.use('/api/connection', connectionRoute)
app.use('/api/discovery', discoveryRoute)
app.use('/api/matchmaking', matchmakingRoute)


// Error handling middlewares
app.use(errorHandlerMiddleware); 
app.use(notFound);

const port = process.env.PORT || 5000;

// Database connection and server start
const start = async () => {
  try {
    await connectDB();  // Connecting to MySQL via Prisma
    app.listen(port, () => {
      console.log(`Server running on port ${port}`);
    });
  } catch (err) {
    console.log('Error starting the server:', err);
  }
};

start();
