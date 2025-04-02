import { useState, useEffect, useCallback } from 'react';
import socketService from '../services/socket-service';

/**
 * Custom hook for Socket.io integration in React components
 */
const useSocket = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [playerId, setPlayerId] = useState(null);
  const [gameId, setGameId] = useState(null);
  const [error, setError] = useState(null);

  // Initialize socket connection on component mount
  useEffect(() => {
    const socket = socketService.initializeSocket();
    
    // Set up connection status listeners
    const handleConnect = () => {
      setIsConnected(true);
      setError(null);
    };
    
    const handleDisconnect = () => {
      setIsConnected(false);
    };
    
    const handleError = (err) => {
      setError(err.message || 'Connection error');
    };
    
    socket.on('connect', handleConnect);
    socket.on('disconnect', handleDisconnect);
    socket.on('connect_error', handleError);
    
    if (socket.connected) {
      setIsConnected(true);
    }
    
    // Clean up listeners on unmount
    return () => {
      socket.off('connect', handleConnect);
      socket.off('disconnect', handleDisconnect);
      socket.off('connect_error', handleError);
    };
  }, []);

  // Register player
  const registerPlayer = useCallback(async (playerName) => {
    try {
      setError(null);
      const response = await socketService.registerPlayer(playerName);
      setPlayerId(response.playerId);
      return response;
    } catch (err) {
      setError(err.message || 'Failed to register player');
      throw err;
    }
  }, []);

  // Create a new game
  const createGame = useCallback(async () => {
    if (!playerId) {
      setError('Player must be registered first');
      throw new Error('Player must be registered first');
    }
    
    try {
      setError(null);
      const response = await socketService.createGame(playerId);
      setGameId(response.gameId);
      return response;
    } catch (err) {
      setError(err.message || 'Failed to create game');
      throw err;
    }
  }, [playerId]);

  // Join an existing game
  const joinGame = useCallback(async (gameIdToJoin) => {
    if (!playerId) {
      setError('Player must be registered first');
      throw new Error('Player must be registered first');
    }
    
    try {
      setError(null);
      const response = await socketService.joinGame(gameIdToJoin, playerId);
      setGameId(gameIdToJoin);
      return response;
    } catch (err) {
      setError(err.message || 'Failed to join game');
      throw err;
    }
  }, [playerId]);

  // Make a move in the game
  const makeMove = useCallback((moveType, position) => {
    if (!gameId || !playerId) {
      setError('Game and player must be set');
      throw new Error('Game and player must be set');
    }
    
    return socketService.makeMove(gameId, playerId, moveType, position);
  }, [gameId, playerId]);

  // Add event listener
  const addEventListener = useCallback((event, callback) => {
    return socketService.addSocketListener(event, callback);
  }, []);

  // Manual disconnect
  const disconnect = useCallback(() => {
    socketService.disconnectSocket();
    setIsConnected(false);
    setPlayerId(null);
    setGameId(null);
  }, []);

  return {
    isConnected,
    playerId,
    gameId,
    error,
    registerPlayer,
    createGame,
    joinGame,
    makeMove,
    addEventListener,
    disconnect,
  };
};

export default useSocket;