# Polling Application

A real-time polling application built with React, Express, and MongoDB.

## Features

- Create polls with multiple options
- Vote on polls
- Real-time results with auto-refresh
- MongoDB database integration

## API Endpoints

### Polls

- `GET /api/polls` - Get all polls
- `GET /api/polls/:id` - Get a specific poll
- `POST /api/polls` - Create a new poll
- `POST /api/polls/:id/vote` - Vote on a poll
- `GET /api/polls/:id/results` - Get poll results

## Database Schema

### Poll Collection

```javascript
{
  _id: ObjectId,
  question: String,
  options: [
    {
      text: String,
      votes: Number
    }
  ],
  createdAt: Date
}
```

## Setup Instructions

1. Clone the repository
2. Install dependencies:
   ```bash
   # Install backend dependencies
   cd backend
   npm install

   # Install frontend dependencies
   cd ../frontend
   npm install
   ```

3. Create a `.env` file in the backend directory with:
   ```
   MONGODB_URI=your_mongodb_connection_string
   PORT=5000
   ```

4. Start the development servers:
   ```bash
   # Start backend (from backend directory)
   npm run dev

   # Start frontend (from frontend directory)
   npm run dev
   ```

## Technologies Used

- Frontend: React (Vite)
- Backend: Express.js
- Database: MongoDB
- Real-time updates: Server-sent events (SSE)
