const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
require('dotenv').config();

// Initialize app
const app = express();
const server = http.createServer(app);

// Set up Socket.io with more permissive CORS
const io = socketIo(server, {
  cors: {
    origin: "*", // Allow all origins for testing
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true
  },
  transports: ['websocket', 'polling'] // Support both
});

// Middleware - also more permissive for testing
app.use(cors({
  origin: "*", // Allow all origins for testing
  credentials: true
}));
app.use(express.json());

// Routes
app.get('/', (req, res) => {
  res.send('Soccer Penalty Shootout API is running');
});

app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'OK', message: 'Server is running' });
});

// Import socket manager
try {
  const { initializeSocketManager } = require('./socket/socket-manager');
  initializeSocketManager(io);
  console.log('Socket manager initialized');
} catch (error) {
  console.error('Error initializing socket manager:', error);
  // Simple fallback
  io.on('connection', (socket) => {
    console.log('Client connected via fallback handler:', socket.id);
    
    socket.on('register_player', (data) => {
      console.log('Fallback register_player handler:', data);
      socket.emit('player_registered', { playerId: socket.id, message: 'Registered via fallback' });
    });
    
    socket.on('disconnect', () => {
      console.log('Client disconnected:', socket.id);
    });
  });
}

// Start server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});