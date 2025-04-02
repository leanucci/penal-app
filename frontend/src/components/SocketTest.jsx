import { useState, useEffect } from 'react';
import socketService from '../services/socket-service';

const SocketTest = () => {
  const [socketId, setSocketId] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [playerName, setPlayerName] = useState('');
  const [playerId, setPlayerId] = useState(null);
  const [gameId, setGameId] = useState(null);
  const [gameIdToJoin, setGameIdToJoin] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [messages, setMessages] = useState([]);

  // Initialize socket on component mount
  useEffect(() => {
    const socket = socketService.initializeSocket();
    
    // Connection status listeners
    socket.on('connect', () => {
      console.log('Connected to socket server, ID:', socket.id);
      setIsConnected(true);
      setSocketId(socket.id);
      addMessage('System', `Connected to server with ID: ${socket.id}`);
    });
    
    socket.on('disconnect', () => {
      console.log('Disconnected from socket server');
      setIsConnected(false);
      setSocketId(null);
      addMessage('System', 'Disconnected from server');
    });
    
    socket.on('connect_error', (err) => {
      console.error('Socket connection error:', err);
      setError(`Connection error: ${err.message}`);
      addMessage('Error', `Connection error: ${err.message}`);
    });
    
    if (socket.connected) {
      setIsConnected(true);
      setSocketId(socket.id);
      addMessage('System', `Already connected with ID: ${socket.id}`);
    }
    
    // Clean up
    return () => {
      socket.disconnect();
    };
  }, []);

  // Add message to log
  const addMessage = (sender, text) => {
    const timestamp = new Date().toLocaleTimeString();
    setMessages(prev => [...prev, { sender, text, timestamp }]);
  };

  // Handle player registration
  const handleRegister = async (e) => {
    e.preventDefault();
    if (!playerName.trim()) return;
    
    setLoading(true);
    setError(null);
    addMessage('System', `Attempting to register as "${playerName}"...`);
    
    try {
      console.log('Starting registration process');
      const result = await socketService.registerPlayer(playerName);
      console.log('Registration successful:', result);
      
      setPlayerId(result.playerId);
      addMessage('System', `Successfully registered as: ${result.playerId}`);
    } catch (err) {
      console.error('Registration failed:', err);
      setError(`Registration failed: ${err.message}`);
      addMessage('Error', `Registration failed: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Handle game creation
  const handleCreateGame = async () => {
    if (!playerId) {
      addMessage('System', `Player id: ${playerId}`)
      return
    };
    
    setLoading(true);
    setError(null);
    addMessage('System', 'Creating game...');
    
    try {
      const result = await socketService.createGame(playerId);
      setGameId(result.gameId);
      addMessage('System', `Game created: ${result.gameId}`);
    } catch (err) {
      setError(`Failed to create game: ${err.message}`);
      addMessage('Error', `Failed to create game: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Handle joining a game
  const handleJoinGame = async (e) => {
    e.preventDefault();
    if (!gameIdToJoin.trim() || !playerId) return;
    
    setLoading(true);
    setError(null);
    addMessage('System', `Joining game: ${gameIdToJoin}...`);
    
    try {
      const result = await socketService.joinGame(gameIdToJoin, playerId);
      setGameId(gameIdToJoin);
      addMessage('System', `Joined game: ${gameIdToJoin}`);
      if (result.message) {
        addMessage('System', result.message);
      }
    } catch (err) {
      setError(`Failed to join game: ${err.message}`);
      addMessage('Error', `Failed to join game: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Debug status
  const connectionStatus = isConnected ? 'Connected' : 'Disconnected';
  const statusColor = isConnected ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800';

  // Clear error after 5 seconds
  useEffect(() => {
    if (error) {
      const timeout = setTimeout(() => setError(null), 5000);
      return () => clearTimeout(timeout);
    }
  }, [error]);

  return (
    <div className="p-4 max-w-md mx-auto bg-white rounded-lg shadow-md">
      <h2 className="text-xl font-bold mb-4">Socket.io Connection Test</h2>
      
      {/* Status Section */}
      <div className="mb-4 p-3 bg-gray-50 rounded">
        <div className="flex items-center mb-2">
          <span className="mr-2">Status:</span>
          <span className={`px-2 py-1 rounded text-sm ${statusColor}`}>
            {connectionStatus}
          </span>
        </div>
        
        {socketId && (
          <div className="text-sm mb-2">
            <span className="font-medium">Socket ID:</span> {socketId}
          </div>
        )}
        
        {playerId && (
          <div className="text-sm mb-2">
            <span className="font-medium">Player ID:</span> {playerId}
          </div>
        )}
        
        {gameId && (
          <div className="text-sm mb-2">
            <span className="font-medium">Game ID:</span> {gameId}
          </div>
        )}
      </div>

      {/* Error Alert */}
      {error && (
        <div className="mb-4 p-3 bg-red-50 text-red-700 rounded">
          {error}
        </div>
      )}

      {/* Registration Form */}
      {!playerId ? (
        <form onSubmit={handleRegister} className="mb-4">
          <div className="flex">
            <input
              type="text"
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              placeholder="Enter your name"
              className="flex-1 px-3 py-2 border rounded-l"
              required
              disabled={!isConnected || loading}
            />
            <button
              type="submit"
              className="bg-blue-500 text-white px-4 py-2 rounded-r disabled:bg-blue-300"
              disabled={!isConnected || loading || !playerName.trim()}
            >
              {loading ? 'Registering...' : 'Register'}
            </button>
          </div>
        </form>
      ) : (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:space-x-2 space-y-2 sm:space-y-0">
            <button
              onClick={handleCreateGame}
              className="bg-green-500 text-white px-4 py-2 rounded disabled:bg-green-300"
              disabled={!isConnected || loading || !!gameId}
            >
              {loading ? 'Creating...' : 'Create Game'}
            </button>
            
            <form onSubmit={handleJoinGame} className="flex flex-1">
              <input
                type="text"
                value={gameIdToJoin}
                onChange={(e) => setGameIdToJoin(e.target.value)}
                placeholder="Game ID to join"
                className="flex-1 px-3 py-2 border rounded-l"
                disabled={!isConnected || loading || !!gameId}
              />
              <button
                type="submit"
                className="bg-blue-500 text-white px-4 py-2 rounded-r disabled:bg-blue-300"
                disabled={!isConnected || loading || !gameIdToJoin || !!gameId}
              >
                {loading ? 'Joining...' : 'Join'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Messages Log */}
      <div className="mt-6">
        <h3 className="font-medium mb-2">Messages:</h3>
        <div className="border rounded h-64 overflow-y-auto p-2 bg-gray-50">
          {messages.length === 0 ? (
            <p className="text-gray-500 italic">No messages yet</p>
          ) : (
            messages.map((msg, index) => (
              <div key={index} className="mb-1 text-sm">
                <span className="text-gray-500">[{msg.timestamp}]</span>{' '}
                <span className={`font-medium ${msg.sender === 'Error' ? 'text-red-600' : ''}`}>
                  {msg.sender}:
                </span>{' '}
                {msg.text}
              </div>
            ))
          )}
        </div>
      </div>

      {/* Debug Button */}
      <div className="mt-4">
        <button
          onClick={() => {
            const socket = socketService.getSocket();
            addMessage('Debug', `Socket ID: ${socket.id}, Connected: ${socket.connected}`);
            console.log('Socket object:', socket);
          }}
          className="text-sm text-gray-500 underline"
        >
          Debug Connection
        </button>
      </div>
    </div>
  );
};

export default SocketTest;