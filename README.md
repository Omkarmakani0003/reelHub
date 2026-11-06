# ReelNet

ReelNet is a full-stack MERN application inspired by short-form video platforms. It includes user authentication, a reel feed, profile page, reel upload flow, and server-side processing for uploaded videos.

## Features

- User registration and login
- JWT-based authentication with refresh support
- Reel feed with pagination
- User profile page showing uploaded reels
- Reel upload with video validation and processing
- MongoDB + Redis-backed architecture
- Responsive UI built with React + Vite + Tailwind CSS

## Tech Stack

### Frontend
- React
- Vite
- Tailwind CSS
- Axios
- React Router

### Backend
- Node.js
- Express.js
- MongoDB with Mongoose
- Redis
- BullMQ
- Cloudinary
- JWT
- Multer
- Zod

## Project Structure

```bash
ReelNet/
├── client/                 # React frontend
│   ├── src/
│   ├── package.json
│   └── vite.config.js
├── server/                 # Express backend
│   ├── src/
│   ├── server.js
│   └── package.json
├── .gitignore
├── README.md
└── package.json            # optional root script wrapper if added later
```

## Prerequisites

Before running the project locally, make sure you have:

- Node.js 18+
- MongoDB installed and running
- Redis installed and running
- Cloudinary account credentials

## Environment Variables

Create a `.env` file inside `server/` with values similar to:

```env
PORT=5000
DBURL=mongodb://localhost:27017/reelnet
JWT_ACCESS_TOKEN_SECRET=your_access_secret
JWT_REFRESH_TOKEN_SECRET=your_refresh_secret
JWT_ACCESS_TOKEN_EXPIRY=15m
JWT_REFRESH_TOKEN_EXPIRY=7d
REFRESH_COOKIE_MAX_AGE=604800000
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

## Installation

### 1. Clone the repository

```bash
git clone <your-repository-url>
cd ReelNet
```

### 2. Install backend dependencies

```bash
cd server
npm install
```

### 3. Install frontend dependencies

```bash
cd ../client
npm install
```

## Running the App

### Start backend server

```bash
cd server
npm run dev
```

### Start frontend app

```bash
cd client
npm run dev
```

The frontend typically runs at:

```text
http://localhost:5173
```

The backend API usually runs at:

```text
http://localhost:5000
```

## API Overview

Key backend routes include:

- `POST /api/v1/register` — register a new user
- `POST /api/v1/login` — login user
- `POST /api/v1/logout` — logout user
- `POST /api/v1/refresh` — refresh access token
- `GET /api/v1/me` — fetch authenticated user profile
- `GET /api/v1/user/:identifier` — fetch user profile by username or ID
- `POST /api/v1/reels/upload` — upload a reel
- `GET /api/v1/reels` — fetch reels feed

## Notes

- Video uploads are processed asynchronously using a queue worker.
- Uploaded files are validated for type and size before processing.
- Redis and Cloudinary are used to support feed/cache and media processing workflows.

## License

This project is licensed under the ISC License.

## Author

Omkar
