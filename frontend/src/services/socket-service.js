import { io } from 'socket.io-client';

// Get server URL from environment or use default
const SOCKET_SERVER_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

// Create a singleton socket instance
let socket;

/**
 * Initialize socket connection
 */
export const initializeSocket = () => {
  // Close existing connection if any
  if (socket) {
    socket.disconnect();
  }
  
  // Create new connection with proper options
  socket = io(SOCKET_SERVER_URL, {
    transports: ['websocket', 'polling'], // Try websocket first, fallback to polling
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 1000,
    timeout: 10000 // Increase timeout
  });
  
  // Debug connection events
  socket.on('connect', () => {
    console.log('Socket connected successfully:', socket.id);
  });
  
  socket.on('connect_error', (error) => {
    console.error('Socket connection error:', error);
  });
  
  socket.on('disconnect', (reason) => {
    console.log('Socket disconnected:', reason);
  });
  
  return socket;
};

/**
 * Get the current socket instance or initialize if needed
 */
export const getSocket = () => {
  if (!socket || !socket.connected) {
    return initializeSocket();
  }
  return socket;
};

/**
 * Register as a player with improved timeout handling
 */
export const registerPlayer = (playerName) => {
  const socket = getSocket();
  console.log('Registering player:', playerName);
  
  return new Promise((resolve, reject) => {
    // Set up listener first, before emitting
    const handleRegistration = (data) => {
      console.log('Registration response received:', data);
      socket.off('player_registered', handleRegistration); // Clean up listener
      clearTimeout(timeoutId); // Clear timeout
      resolve(data);
    };
    
    // Add listener for the event
    socket.on('player_registered', handleRegistration);
    
    // Set longer timeout
    const timeoutId = setTimeout(() => {
      socket.off('player_registered', handleRegistration); // Clean up listener
      reject(new Error('Registration timed out after 8 seconds'));
    }, 8000);
    
    // Now emit the event
    socket.emit('register_player', { name: playerName });
    console.log('register_player event emitted');
  });
};

// Other methods...
export const createGame = (playerId) => {
  const socket = getSocket();
  
  return new Promise((resolve, reject) => {
    const handleGameCreated = (data) => {
      socket.off('game_created', handleGameCreated);
      clearTimeout(timeoutId);
      resolve(data);
    };
    
    socket.on('game_created', handleGameCreated);
    
    const timeoutId = setTimeout(() => {
      socket.off('game_created', handleGameCreated);
      reject(new Error('Game creation timed out'));
    }, 8000);
    
    socket.emit('create_game', { playerId });
  });
};

export const joinGame = (gameId, playerId) => {
  const socket = getSocket();
  
  return new Promise((resolve, reject) => {
    const handleGameReady = (data) => {
      socket.off('game_ready', handleGameReady);
      socket.off('game_error', handleError);
      clearTimeout(timeoutId);
      resolve(data);
    };
    
    const handleError = (error) => {
      socket.off('game_ready', handleGameReady);
      socket.off('game_error', handleError);
      clearTimeout(timeoutId);
      reject(error);
    };
    
    socket.on('game_ready', handleGameReady);
    socket.on('game_error', handleError);
    
    const timeoutId = setTimeout(() => {
      socket.off('game_ready', handleGameReady);
      socket.off('game_error', handleError);
      reject(new Error('Game join timed out'));
    }, 8000);
    
    socket.emit('join_game', { gameId, playerId });
  });
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
  }
};

export default {
  initializeSocket,
  getSocket,
  registerPlayer,
  createGame,
  joinGame,
  disconnectSocket,
};