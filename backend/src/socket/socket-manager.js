/**
 * Improved Socket.io manager with better debugging and error handling
 */

// Track active games and players
const activeGames = new Map();
const connectedPlayers = new Map();

// Debug helper
function debugLog(message) {
  console.log(`[${new Date().toISOString()}] ${message}`);
}

// Initialize socket manager
function initializeSocketManager(io) {
  debugLog('Socket manager initializing');
  
  // Connection event
  io.on('connection', (socket) => {
    debugLog(`New connection: ${socket.id}`);
    
    // PING test handler (for debugging latency)
    socket.on('ping_test', () => {
      debugLog(`Ping received from ${socket.id}, sending pong`);
      socket.emit('pong_test');
    });

    // Handle player registration
    socket.on('register_player', (playerData) => {
      debugLog(`Registration request from ${socket.id}: ${JSON.stringify(playerData)}`);
      
      try {
        // Create player entry
        const playerId = 'player_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7);
        const name = playerData?.name || 'Anonymous';
        
        // Store player data
        connectedPlayers.set(playerId, {
          socketId: socket.id,
          name: name,
          status: 'online',
          gameId: null,
          lastActivity: new Date()
        });
        
        // Send registration confirmation
        const responseData = { 
          playerId, 
          name,
          message: 'Successfully registered' 
        };
        
        socket.emit('player_registered', responseData);
        debugLog(`Player registered: ${playerId}, name: ${name}`);
      } catch (error) {
        console.error('Error in player registration:', error);
        socket.emit('game_error', { 
          message: 'Registration failed: ' + (error.message || 'Unknown error') 
        });
      }
    });

    // Handle game creation
    socket.on('create_game', (data) => {
      debugLog(`Game creation request from ${socket.id}: ${JSON.stringify(data)}`);
      
      try {
        const playerId = data?.playerId || socket.id;
        
        // Verify player exists
        if (!connectedPlayers.has(playerId)) {
          debugLog(`Player ${playerId} not found, registering automatically`);
          // Auto-register if needed
          connectedPlayers.set(playerId, {
            socketId: socket.id,
            name: 'Player ' + playerId.substring(0, 5),
            status: 'online',
            gameId: null,
            lastActivity: new Date()
          });
        }
        
        // Generate game ID
        const gameId = 'game_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7);
        
        // Create game instance
        activeGames.set(gameId, {
          id: gameId,
          status: 'waiting',
          players: [playerId],
          currentRound: 0,
          scores: [0, 0],
          rounds: [],
          createdAt: new Date(),
          lastActivity: new Date()
        });
        
        // Update player record
        const playerData = connectedPlayers.get(playerId);
        playerData.gameId = gameId;
        playerData.lastActivity = new Date();
        connectedPlayers.set(playerId, playerData);
        
        // Join socket room for this game
        socket.join(gameId);
        
        // Send confirmation
        socket.emit('game_created', { 
          gameId, 
          message: 'Game created successfully',
          gameData: {
            gameId: gameId,
            status: 'waiting',
            players: [{ id: playerId, name: playerData.name }],
            createdAt: new Date()
          }
        });
        
        debugLog(`Game created: ${gameId} by player ${playerId}`);
        debugLog(`Active games: ${activeGames.size}, Connected players: ${connectedPlayers.size}`);
      } catch (error) {
        console.error('Error in game creation:', error);
        socket.emit('game_error', { 
          message: 'Game creation failed: ' + (error.message || 'Unknown error') 
        });
      }
    });

    // Handle game joining
    socket.on('join_game', (data) => {
      debugLog(`Join game request from ${socket.id}: ${JSON.stringify(data)}`);
      
      try {
        const gameId = data?.gameId;
        const playerId = data?.playerId || socket.id;
        
        // Validate input
        if (!gameId) {
          socket.emit('game_error', { message: 'Game ID is required' });
          return;
        }
        
        // Check if game exists
        if (!activeGames.has(gameId)) {
          socket.emit('game_error', { message: 'Game not found' });
          return;
        }
        
        // Get game data
        const game = activeGames.get(gameId);
        
        // Validate game state
        if (game.status !== 'waiting') {
          socket.emit('game_error', { message: 'Game is not available to join' });
          return;
        }
        
        if (game.players.length >= 2) {
          socket.emit('game_error', { message: 'Game is full' });
          return;
        }
        
        // Verify player exists or auto-register
        if (!connectedPlayers.has(playerId)) {
          debugLog(`Player ${playerId} not found, registering automatically`);
          connectedPlayers.set(playerId, {
            socketId: socket.id,
            name: 'Player ' + playerId.substring(0, 5),
            status: 'online',
            gameId: null,
            lastActivity: new Date()
          });
        }
        
        // Update player
        const playerData = connectedPlayers.get(playerId);
        playerData.gameId = gameId;
        playerData.lastActivity = new Date();
        connectedPlayers.set(playerId, playerData);
        
        // Add player to game
        game.players.push(playerId);
        game.status = 'ready';
        game.lastActivity = new Date();
        activeGames.set(gameId, game);
        
        // Join socket room
        socket.join(gameId);
        
        // Prepare player info for response
        const playerInfo = game.players.map(pid => {
          const player = connectedPlayers.get(pid);
          return {
            id: pid,
            name: player ? player.name : 'Unknown player'
          };
        });
        
        // Notify all players in game
        io.to(gameId).emit('game_ready', {
          gameId,
          status: 'ready',
          players: playerInfo,
          message: 'Game is ready to start'
        });
        
        debugLog(`Player ${playerId} joined game ${gameId}`);
        debugLog(`Game now has ${game.players.length} players`);
      } catch (error) {
        console.error('Error in join game:', error);
        socket.emit('game_error', { 
          message: 'Failed to join game: ' + (error.message || 'Unknown error') 
        });
      }
    });

    // Disconnect handler
    socket.on('disconnect', () => {
      debugLog(`Disconnection: ${socket.id}`);
      
      try {
        // Find player and game
        let playerId = null;
        let gameId = null;
        
        // Check if this socket is a known player
        for (const [pid, data] of connectedPlayers.entries()) {
          if (data.socketId === socket.id) {
            playerId = pid;
            gameId = data.gameId;
            break;
          }
        }
        
        if (playerId) {
          // Handle player in a game
          if (gameId && activeGames.has(gameId)) {
            const game = activeGames.get(gameId);
            
            // Notify other players
            socket.to(gameId).emit('player_disconnected', {
              playerId,
              message: 'Opponent disconnected'
            });
            
            // Mark game as abandoned if in progress
            if (game.status === 'ready' || game.status === 'in-progress') {
              game.status = 'abandoned';
              activeGames.set(gameId, game);
              debugLog(`Game ${gameId} marked as abandoned due to player ${playerId} disconnect`);
            }
          }
          
          // Remove player from registry
          connectedPlayers.delete(playerId);
          debugLog(`Player ${playerId} removed from registry`);
        }
      } catch (error) {
        console.error('Error handling disconnect:', error);
      }
    });
  });
  
  // Log initial state
  debugLog(`Socket manager initialized. Active games: ${activeGames.size}, Connected players: ${connectedPlayers.size}`);
  
  // Set up periodic cleanup of inactive games and players
  setInterval(() => {
    const now = new Date();
    let cleanupCount = 0;
    
    // Clean up old games
    for (const [gameId, game] of activeGames.entries()) {
      const gameAge = now - game.lastActivity;
      
      // Remove games inactive for more than 30 minutes
      if (gameAge > 30 * 60 * 1000) {
        activeGames.delete(gameId);
        cleanupCount++;
      }
    }
    
    if (cleanupCount > 0) {
      debugLog(`Cleaned up ${cleanupCount} inactive games. Remaining: ${activeGames.size}`);
    }
  }, 15 * 60 * 1000); // Run cleanup every 15 minutes
}

// Get active games (for API endpoints)
function getActiveGames() {
  return Array.from(activeGames.entries()).map(([id, game]) => ({
    id,
    status: game.status,
    playerCount: game.players.length,
    createdAt: game.createdAt
  }));
}

// Get info about a specific game
function getGameById(gameId) {
  const game = activeGames.get(gameId);
  if (!game) return null;
  
  return {
    id: gameId,
    status: game.status,
    players: game.players.map(playerId => {
      const player = connectedPlayers.get(playerId);
      return {
        id: playerId,
        name: player ? player.name : 'Unknown'
      };
    }),
    currentRound: game.currentRound,
    scores: game.scores,
    createdAt: game.createdAt
  };
}

module.exports = {
  initializeSocketManager,
  getActiveGames,
  getGameById
};