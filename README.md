# Mentorship Matching Platform

A platform designed to connect mentors and mentees based on shared skills and interests. Users can create profiles, browse potential matches, and send/receive mentorship requests. The platform is built with React (TypeScript), Node.js, Express, Prisma, and MySQL.

## Features
- **User Authentication:** Secure login and registration using JWT and Firebase for Google Sign-In.
- **Profile Management:** Users can create, edit, and delete their profiles, specifying roles (mentor or mentee), skills, and interests.
- **Discovery Page:** Browse and filter user profiles based on skills, interests, and roles.
- **Matchmaking Algorithm:** Suggests mentors or mentees based on shared skills and interests.
- **Connection Requests:** Users can send, accept, or decline mentorship requests.

## Technologies Used
- **Frontend:** 
  - React (with TypeScript)
  - Tailwind CSS
  - ShadCN UI Components
  - Redux
  - Firebase for Google Sign-In
- **Backend:** 
  - Node.js
  - Express
  - JWT (JSON Web Token) for authentication
  - bcryptjs for encrypting passwords
- **Database:**
  - Prisma ORM
  - MySQL
- **Other Tools:**
  - GitHub for version control
  - Vercel(for deployment)

## Deployed Application URL
You can access the live application here: https://mentorship-matching-platform-aniket.vercel.app/

## Setup Instructions

### Prerequisites
- Node.js (v14 or later)
- MySQL
- Firebase (for Google Authentication)

### Backend Setup
1. Clone the repository:
   ```bash
   git clone https://github.com/aniket-sharma10/Mentorship-Matching-Platform
   cd Mentorship-Matching-Platform
   ```

2. Install the dependencies:
   ```bash
   npm install
   ```

3. Configure your `.env` file in the `backend` directory (sample `.env.example` is provided):
   ```env
   DATABASE_URL="mysql://user:password@localhost:3306/yourdb"
   ```

4. Configure your `.env` file in the root directory for JWT:
   ```env
   JWT_SECRET="your_jwt_secret"
   ```

5. Run Prisma migrations to set up the database schema:
   ```bash
   npx prisma migrate dev --schema=./backend/prisma/schema.prisma
   ```

6. Start the backend server:
   ```bash
   npm run dev
   ```

### Frontend Setup
1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install the dependencies:
   ```bash
   npm install
   ```

3. Configure your `.env` file for the frontend (sample `.env.example` is provided):
   ```env
   VITE_FIREBASE_KEY="your_firebase_api_key"
   ```

4. Start the frontend:
   ```bash
   npm run dev
   ```

The frontend will run on [http://localhost:5173](http://localhost:5173).

## Folder Structure

```
/mentorship-matching-platform
│
├── /backend                # Backend API (Node.js, Express)
│   ├── /controllers        # Logic for API endpoints
│   ├── /db                 # Prisma files
│   ├── /errors             # Custom errors
│   ├── /routes             # Express routes for the API
│   ├── /prisma             # Prisma database schema
│   ├── /middlewares        # Custom middleware (e.g., authorization)
│   ├── /index.js           # Express server setup
│   └── .env                # env file for DATABASE URL
│
├── /frontend               # Frontend (React, TypeScript)
│   ├── /common             # Reusable components (Header, Footer)
│   ├── /components         # Shadcn components (e.g., buttons, inputs)
│   ├── /pages              # Page components (e.g., Profile, Discovery)
│   ├── /redux              # Redux store and slices
│   ├── .env                # env file for FIREBASE KEY
│   └── package.json        # Frontend dependencies
│
├── .env                    # env file for JWT SECRET
├── package.json            # Backend dependencies and scripts in root
└── README.md               # Project documentation
```
