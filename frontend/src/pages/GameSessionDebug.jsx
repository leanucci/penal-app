import { useState, useEffect, useRef } from 'react';
import socketService from '../services/socket-service';

const GameSessionDebug = () => {
  // Socket & player state
  const [isConnected, setIsConnected] = useState(false);
  const [socketId, setSocketId] = useState(null);
  const [playerName, setPlayerName] = useState('');
  const [playerId, setPlayerId] = useState(null);
  
  // Game state
  const [gameId, setGameId] = useState(null);
  const [gameIdToJoin, setGameIdToJoin] = useState('');
  const [gameState, setGameState] = useState(null);
  
  // UI state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [logs, setLogs] = useState([]);
  
  // Refs for tracking current values in async callbacks
  const playerIdRef = useRef(null);
  const gameIdRef = useRef(null);
  const socketRef = useRef(null);
  
  // Ref for auto-scrolling logs
  const logsEndRef = useRef(null);

  // Initialize socket connection
  useEffect(() => {
    let socket = socketService.getSocket();
    
    if (!socket) {
      addLog('System', 'Initializing socket connection...');
      socket = socketService.initializeSocket();
    } else {
      addLog('System', 'Using existing socket connection');
      
      if (socket.connected) {
        setIsConnected(true);
        setSocketId(socket.id);
        addLog('System', `Already connected with ID: ${socket.id}`);
      }
    }
    
    socketRef.current = socket;
    setupSocketListeners(socket);
    
    // Clean up event listeners on unmount
    return () => {
      cleanupSocketListeners(socket);
    };
  }, []);

  // Update refs when state changes
  useEffect(() => {
    playerIdRef.current = playerId;
  }, [playerId]);

  useEffect(() => {
    gameIdRef.current = gameId;
  }, [gameId]);

  // Set up socket event listeners
  const setupSocketListeners = (socket) => {
    // Connection events
    socket.on('connect', () => {
      addLog('System', `Connected to server with ID: ${socket.id}`);
      setIsConnected(true);
      setSocketId(socket.id);
    });
    
    socket.on('disconnect', (reason) => {
      addLog('System', `Disconnected from server: ${reason}`);
      setIsConnected(false);
      setSocketId(null);
    });
    
    socket.on('connect_error', (err) => {
      addLog('Error', `Connection error: ${err.message}`);
      setError(`Connection error: ${err.message}`);
    });
    
    // Game-specific events - these stay registered for the component lifetime
    socket.on('player_registered', handlePlayerRegistered);
    socket.on('game_created', handleGameCreated);
    socket.on('game_ready', handleGameReady);
    socket.on('game_error', handleGameError);
    socket.on('player_left', handlePlayerLeft);
    socket.on('player_disconnected', handlePlayerDisconnected);
  };
  
  // Clean up socket listeners
  const cleanupSocketListeners = (socket) => {
    if (!socket) return;
    
    socket.off('player_registered', handlePlayerRegistered);
    socket.off('game_created', handleGameCreated);
    socket.off('game_ready', handleGameReady);
    socket.off('game_error', handleGameError);
    socket.off('player_left', handlePlayerLeft);
    socket.off('player_disconnected', handlePlayerDisconnected);
  };
  
  // Event handlers
  const handlePlayerRegistered = (data) => {
    addLog('Server', `Registration response: ${JSON.stringify(data)}`);
    setPlayerId(data.playerId);
    setLoading(false);
  };
  
  const handleGameCreated = (data) => {
    addLog('Server', `Game created: ${JSON.stringify(data)}`);
    setGameId(data.gameId);
    setGameState(data.gameData || { status: 'waiting' });
    setLoading(false);
  };
  
  const handleGameReady = (data) => {
    addLog('Server', `Game ready: ${JSON.stringify(data)}`);
    // Only set game ID if we don't already have one (for the player who's joining)
    if (!gameIdRef.current) {
      setGameId(data.gameId);
    }
    setGameState(data);
    setLoading(false);
  };
  
  const handleGameError = (data) => {
    addLog('Error', `Game error: ${JSON.stringify(data)}`);
    setError(data.message || 'Game error occurred');
    setLoading(false);
  };
  
  const handlePlayerLeft = (data) => {
    addLog('Server', `Player left: ${JSON.stringify(data)}`);
    if (gameState) {
      setGameState(prev => ({
        ...prev,
        message: `Player ${data.playerId} left the game`,
        status: 'waiting'
      }));
    }
  };
  
  const handlePlayerDisconnected = (data) => {
    addLog('Server', `Player disconnected: ${JSON.stringify(data)}`);
    if (gameState) {
      setGameState(prev => ({
        ...prev,
        message: data.message || 'Opponent disconnected',
        status: 'abandoned'
      }));
    }
  };

  // Add log message
  const addLog = (sender, message) => {
    const timestamp = new Date().toISOString().substr(11, 8);
    setLogs(prevLogs => [...prevLogs, { sender, message, timestamp }]);
  };

  // Auto-scroll logs
  useEffect(() => {
    if (logsEndRef.current) {
      logsEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [logs]);

  // Register player
  const handleRegister = (e) => {
    e.preventDefault();
    if (!playerName.trim() || !isConnected) return;
    
    setLoading(true);
    setError(null);
    addLog('Client', `Registering as "${playerName}"...`);
    
    try {
      const socket = socketRef.current;
      addLog('Debug', `Socket connected: ${socket.connected}, ID: ${socket.id}`);
      
      // Emit the event
      socket.emit('register_player', { name: playerName });
      addLog('Debug', 'Emitted register_player event');
    } catch (err) {
      addLog('Error', `Registration error: ${err.message}`);
      setError(`Registration failed: ${err.message}`);
      setLoading(false);
    }
  };

  // Create game
  const handleCreateGame = () => {
    if (!playerIdRef.current || !isConnected) return;
    
    setLoading(true);
    setError(null);
    
    // Handle case where user already has a game
    if (gameIdRef.current) {
      addLog('Client', `Leaving current game (${gameIdRef.current}) to create a new one`);
    }
    
    addLog('Client', `Creating game with player ID: ${playerIdRef.current}`);
    
    try {
      const socket = socketRef.current;
      
      // Emit the event
      socket.emit('create_game', { playerId: playerIdRef.current });
      addLog('Debug', 'Emitted create_game event');
    } catch (err) {
      addLog('Error', `Game creation error: ${err.message}`);
      setError(`Failed to create game: ${err.message}`);
      setLoading(false);
    }
  };

  // Join game
  const handleJoinGame = (e) => {
    e.preventDefault();
    if (!gameIdToJoin.trim() || !playerIdRef.current || !isConnected) return;
    
    setLoading(true);
    setError(null);
    
    // Handle case where user is already in a game
    if (gameIdRef.current) {
      addLog('Client', `Leaving current game (${gameIdRef.current}) to join: ${gameIdToJoin}`);
    }
    
    addLog('Client', `Joining game: ${gameIdToJoin} with player ID: ${playerIdRef.current}`);
    
    try {
      const socket = socketRef.current;
      
      // Emit the event
      socket.emit('join_game', { 
        gameId: gameIdToJoin, 
        playerId: playerIdRef.current 
      });
      addLog('Debug', 'Emitted join_game event');
    } catch (err) {
      addLog('Error', `Join game error: ${err.message}`);
      setError(`Failed to join game: ${err.message}`);
      setLoading(false);
    }
  };

  // Send a test ping to verify connection
  const handleTestConnection = () => {
    const socket = socketRef.current;
    
    if (!socket || !socket.connected) {
      addLog('Error', 'Socket not connected, cannot test');
      return;
    }
    
    addLog('Client', 'Sending ping test...');
    const startTime = Date.now();
    
    // Custom ping event (needs to be handled on server)
    socket.emit('ping_test');
    
    // One-time listener for response
    const pongHandler = () => {
      const latency = Date.now() - startTime;
      addLog('Server', `Pong received! Latency: ${latency}ms`);
    };
    
    socket.once('pong_test', pongHandler);
    
    // Fallback timeout - clean up listener if no response
    setTimeout(() => {
      socket.off('pong_test', pongHandler);
      addLog('Debug', 'No pong response received after 3 seconds');
    }, 3000);
  };

  // Clear logs
  const handleClearLogs = () => {
    setLogs([]);
  };

  return (
    <div className="max-w-4xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Game Session Debug</h1>
      
      {/* Status Panel */}
      <div className="bg-white rounded-lg shadow-md p-4 mb-6">
        <h2 className="text-lg font-semibold mb-2">Connection Status</h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-600">Socket Connected:</p>
            <div className={`font-medium ${isConnected ? 'text-green-600' : 'text-red-600'}`}>
              {isConnected ? 'Connected' : 'Disconnected'}
            </div>
          </div>
          <div>
            <p className="text-sm text-gray-600">Socket ID:</p>
            <div className="font-mono text-sm truncate">{socketId || 'None'}</div>
          </div>
          <div>
            <p className="text-sm text-gray-600">Player ID:</p>
            <div className="font-mono text-sm truncate">{playerId || 'Not registered'}</div>
          </div>
          <div>
            <p className="text-sm text-gray-600">Game ID:</p>
            <div className="font-mono text-sm truncate">{gameId || 'Not in game'}</div>
          </div>
        </div>
        
        {/* Connection test button */}
        <div className="mt-4">
          <button 
            onClick={handleTestConnection}
            className="bg-blue-100 text-blue-700 px-3 py-1 rounded text-sm hover:bg-blue-200"
            disabled={!isConnected}
          >
            Test Connection
          </button>
        </div>
      </div>
      
      {/* Error display */}
      {error && (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6 rounded">
          <p>{error}</p>
        </div>
      )}
      
      {/* Action Panel */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {/* Player Registration */}
        <div className="bg-white rounded-lg shadow-md p-4">
          <h2 className="text-lg font-semibold mb-2">Player Registration</h2>
          <form onSubmit={handleRegister}>
            <div className="mb-3">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Player Name
              </label>
              <input
                type="text"
                value={playerName}
                onChange={(e) => setPlayerName(e.target.value)}
                className="w-full px-3 py-2 border rounded-md"
                placeholder="Enter name"
                disabled={!!playerId || loading || !isConnected}
                required
              />
            </div>
            <button
              type="submit"
              className="w-full bg-blue-500 text-white font-medium py-2 rounded-md hover:bg-blue-600 disabled:bg-gray-300"
              disabled={!!playerId || loading || !isConnected || !playerName.trim()}
            >
              {loading ? 'Registering...' : 'Register Player'}
            </button>
          </form>
        </div>
        
        {/* Game Creation/Joining */}
        <div className="bg-white rounded-lg shadow-md p-4">
          <h2 className="text-lg font-semibold mb-2">Game Management</h2>
          
          {/* Game Status Indicator */}
          {gameId && (
            <div className="mb-4 p-2 bg-blue-50 border border-blue-200 rounded">
              <p className="text-sm">
                Currently in game: <span className="font-mono font-medium">{gameId}</span>
              </p>
              <button
                onClick={() => {
                  setGameId(null);
                  setGameState(null);
                  addLog('Client', 'Left current game (client-side only)');
                }}
                className="mt-2 text-xs text-red-600 hover:text-red-800"
              >
                Leave Game (client-side only)
              </button>
            </div>
          )}
          
          {/* Create Game */}
          <div className="mb-4">
            <button
              onClick={handleCreateGame}
              className="w-full bg-green-500 text-white font-medium py-2 rounded-md hover:bg-green-600 disabled:bg-gray-300"
              disabled={!playerId || loading || !isConnected}
            >
              {loading ? 'Creating...' : 'Create New Game'}
            </button>
            {gameId && (
              <p className="mt-1 text-xs text-gray-500">
                Note: Creating a new game will replace your current game.
              </p>
            )}
          </div>
          
          {/* Join Game */}
          <form onSubmit={handleJoinGame}>
            <div className="mb-3">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Game ID to Join
              </label>
              <input
                type="text"
                value={gameIdToJoin}
                onChange={(e) => setGameIdToJoin(e.target.value)}
                className="w-full px-3 py-2 border rounded-md"
                placeholder="Enter game ID"
                disabled={!playerId || loading || !isConnected}
                required
              />
            </div>
            <button
              type="submit"
              className="w-full bg-blue-500 text-white font-medium py-2 rounded-md hover:bg-blue-600 disabled:bg-gray-300"
              disabled={!playerId || loading || !isConnected || !gameIdToJoin.trim()}
            >
              {loading ? 'Joining...' : 'Join Game'}
            </button>
            {gameId && (
              <p className="mt-1 text-xs text-gray-500">
                Note: Joining a new game will replace your current game.
              </p>
            )}
          </form>
        </div>
      </div>
      
      {/* Game State */}
      {gameState && (
        <div className="bg-white rounded-lg shadow-md p-4 mb-6">
          <h2 className="text-lg font-semibold mb-2">Game State</h2>
          <pre className="bg-gray-100 p-3 rounded-md text-sm overflow-auto">
            {JSON.stringify(gameState, null, 2)}
          </pre>
        </div>
      )}
      
      {/* Debug Logs */}
      <div className="bg-white rounded-lg shadow-md p-4">
        <div className="flex justify-between items-center mb-2">
          <h2 className="text-lg font-semibold">Event Logs</h2>
          <button
            onClick={handleClearLogs}
            className="text-sm text-gray-600 hover:text-gray-800"
          >
            Clear logs
          </button>
        </div>
        <div className="bg-gray-100 rounded-md h-64 overflow-y-auto p-3 font-mono text-sm">
          {logs.length === 0 ? (
            <p className="text-gray-500 italic">No events logged yet</p>
          ) : (
            logs.map((log, index) => (
              <div key={index} className="mb-1">
                <span className="text-gray-500">[{log.timestamp}]</span>{' '}
                <span 
                  className={`font-medium ${
                    log.sender === 'Error' 
                      ? 'text-red-600' 
                      : log.sender === 'Server' 
                        ? 'text-purple-600'
                        : log.sender === 'Debug'
                          ? 'text-gray-600'
                          : 'text-blue-600'
                  }`}
                >
                  {log.sender}:
                </span>{' '}
                <span>{log.message}</span>
              </div>
            ))
          )}
          <div ref={logsEndRef} />
        </div>
      </div>
    </div>
  );
};

export default GameSessionDebug;