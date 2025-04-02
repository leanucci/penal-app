# Soccer Penalty Shootout Game

A turn-based web game that simulates penalty shootouts in soccer. Players take turns choosing kick and save positions to outscore their opponents.

## Overview

This project is a multiplayer web game where:
- Players alternate between being the kicker and goalkeeper
- Each player selects a spot on the goal to either kick or defend
- Goals are scored when the goalkeeper doesn't select the same spot as the kicker
- Games follow standard soccer penalty shootout rules (best of 5 kicks)

## Technology Stack

- **Frontend**: React (Vite)
- **Backend**: Node.js & Express
- **Real-time Communication**: Socket.io
- **Styling**: CSS (or your preferred CSS solution)

## Project Structure

```
soccer-penalty-shootout/
├── frontend/             # React frontend (Vite)
│   ├── public/           # Static assets
│   ├── src/              # React components
│   │   ├── components/   # UI components
│   │   ├── services/     # API and socket services
│   │   └── ...
│   └── ...
└── backend/              # Node.js backend
    ├── src/              # Source code
    │   ├── controllers/  # Request handlers
    │   ├── routes/       # API routes
    │   └── server.js     # Main server file
    └── ...
```

## Setup Instructions

### Prerequisites

- Node.js (v16 or higher)
- npm (v8 or higher)

### Frontend Setup

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

The frontend will be available at http://localhost:5173.

### Backend Setup

```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Create .env file with required environment variables
echo "PORT=3000\nCLIENT_URL=http://localhost:5173" > .env

# Start development server
npm run dev
```

The backend will be available at http://localhost:3000.

## Development Workflow

1. Choose an issue from the project board
2. Create a new branch: `git checkout -b feature/your-feature-name`
3. Implement your changes
4. Test locally
5. Create a pull request
6. After review, merge into main

## API Endpoints

### Game Endpoints

- `POST /api/games` - Create a new game
- `GET /api/games` - List available games
- `GET /api/games/:gameId` - Get game details
- `POST /api/games/:gameId/join` - Join a game

### Player Endpoints

- `POST /api/players` - Create a player
- `GET /api/players/:playerId` - Get player details

## Socket.io Events

- `connection` - New player connected
- `disconnect` - Player disconnected
- Events for game actions to be implemented

## License

[MIT](LICENSE)
