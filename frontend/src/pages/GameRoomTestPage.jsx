import { useState } from 'react';
import GameRoom from '../components/GameRoom';

/**
 * Test page for the GameRoom component
 */
const GameRoomTestPage = () => {
  // Mock game state for testing
  const [gameId] = useState('game_test_123');
  const [players] = useState([
    { id: 'player1', name: 'Alice' },
    { id: 'player2', name: 'Bob' }
  ]);
  const [currentPlayerId, setCurrentPlayerId] = useState('player1');
  const [gameState, setGameState] = useState('waiting');
  const [currentRound, setCurrentRound] = useState(1);
  const [scores, setScores] = useState([0, 0]);
  const [isSpectator, setIsSpectator] = useState(false);
  const [lastMove, setLastMove] = useState(null);
  const [moveHistory, setMoveHistory] = useState([]);
  
  // Handle making a move
  const handleMakeMove = (moveData) => {
    console.log('Move made:', moveData);
    
    // Simulate opponent's move (random position)
    const opponentRole = moveData.role === 'kicker' ? 'goalkeeper' : 'kicker';
    const opponentPosition = {
      row: Math.floor(Math.random() * 3),
      col: Math.floor(Math.random() * 3)
    };
    
    // Determine if it's a goal
    const isGoal = 
      moveData.role === 'kicker' &&
      (moveData.position.row !== opponentPosition.row || 
       moveData.position.col !== opponentPosition.col);
    
    // Create result data
    const resultData = {
      round: moveData.round,
      kickerName: moveData.role === 'kicker' ? players.find(p => p.id === moveData.playerId).name : players.find(p => p.id !== moveData.playerId).name,
      goalkeeperName: moveData.role === 'goalkeeper' ? players.find(p => p.id === moveData.playerId).name : players.find(p => p.id !== moveData.playerId).name,
      kickPosition: moveData.role === 'kicker' ? moveData.position : opponentPosition,
      savePosition: moveData.role === 'goalkeeper' ? moveData.position : opponentPosition,
      isGoal,
      roundComplete: true
    };
    
    // Update scores
    if (isGoal) {
      const newScores = [...scores];
      // Increment score for the player who scored
      if ((currentRound % 2 === 1 && currentPlayerId === 'player1') || 
          (currentRound % 2 === 0 && currentPlayerId === 'player2')) {
        newScores[0]++;
      } else {
        newScores[1]++;
      }
      setScores(newScores);
    }
    
    // Update last move and history
    setLastMove(resultData);
    setMoveHistory(prev => [...prev, resultData]);
    
    // Show the result
    setGameState('round-result');
  };
  
  // Continue to next round
  const handleContinueToNextRound = () => {
    if (currentRound >= 5) {
      setGameState('game-over');
    } else {
      setCurrentRound(prev => prev + 1);
      setGameState(currentRound % 2 === 0 ? 'player1-turn' : 'player2-turn');
    }
  };
  
  // Switch roles for testing
  const switchPlayer = () => {
    setCurrentPlayerId(prev => prev === 'player1' ? 'player2' : 'player1');
  };
  
  // Change game state for testing
  const changeGameState = (state) => {
    setGameState(state);
  };
  
  // Toggle spectator mode
  const toggleSpectator = () => {
    setIsSpectator(prev => !prev);
  };
  
  // Reset the game
  const resetGame = () => {
    setGameState('waiting');
    setCurrentRound(1);
    setScores([0, 0]);
    setLastMove(null);
    setMoveHistory([]);
  };
  
  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-6 text-center">Game Room Test</h1>
      
      {/* Control Panel */}
      <div className="bg-white p-4 rounded-lg shadow mb-6">
        <h2 className="text-lg font-medium mb-2">Test Controls</h2>
        
        <div className="flex flex-wrap gap-4 mb-4">
          <div>
            <span className="block text-sm text-gray-600">Current Player:</span>
            <div className="font-medium">{currentPlayerId === 'player1' ? 'Alice' : 'Bob'}</div>
          </div>
          
          <div>
            <span className="block text-sm text-gray-600">Game State:</span>
            <div className="font-medium">{gameState}</div>
          </div>
          
          <div>
            <span className="block text-sm text-gray-600">Round:</span>
            <div className="font-medium">{currentRound}</div>
          </div>
          
          <div>
            <span className="block text-sm text-gray-600">Scores:</span>
            <div className="font-medium">{scores[0]} - {scores[1]}</div>
          </div>
          
          <div>
            <span className="block text-sm text-gray-600">Mode:</span>
            <div className="font-medium">{isSpectator ? 'Spectator' : 'Player'}</div>
          </div>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          <button 
            onClick={switchPlayer}
            className="px-3 py-1 bg-blue-500 text-white rounded"
          >
            Switch Player
          </button>
          
          <button 
            onClick={toggleSpectator}
            className="px-3 py-1 bg-purple-500 text-white rounded"
          >
            Toggle Spectator
          </button>
          
          <button 
            onClick={resetGame}
            className="px-3 py-1 bg-red-500 text-white rounded"
          >
            Reset Game
          </button>
          
          {gameState === 'round-result' && (
            <button 
              onClick={handleContinueToNextRound}
              className="px-3 py-1 bg-green-500 text-white rounded"
            >
              Next Round
            </button>
          )}
        </div>
        
        <div className="mt-4 border-t pt-4">
          <h3 className="text-sm font-medium mb-2">Change Game State:</h3>
          <div className="flex flex-wrap gap-2">
            <button 
              onClick={() => changeGameState('waiting')}
              className={`px-2 py-1 text-sm rounded ${gameState === 'waiting' ? 'bg-blue-100 border border-blue-500' : 'bg-gray-100'}`}
            >
              Waiting
            </button>
            
            <button 
              onClick={() => changeGameState('ready')}
              className={`px-2 py-1 text-sm rounded ${gameState === 'ready' ? 'bg-blue-100 border border-blue-500' : 'bg-gray-100'}`}
            >
              Ready
            </button>
            
            <button 
              onClick={() => changeGameState('player1-turn')}
              className={`px-2 py-1 text-sm rounded ${gameState === 'player1-turn' ? 'bg-blue-100 border border-blue-500' : 'bg-gray-100'}`}
            >
              Player 1 Turn
            </button>
            
            <button 
              onClick={() => changeGameState('player2-turn')}
              className={`px-2 py-1 text-sm rounded ${gameState === 'player2-turn' ? 'bg-blue-100 border border-blue-500' : 'bg-gray-100'}`}
            >
              Player 2 Turn
            </button>
            
            <button 
              onClick={() => changeGameState('round-result')}
              className={`px-2 py-1 text-sm rounded ${gameState === 'round-result' ? 'bg-blue-100 border border-blue-500' : 'bg-gray-100'}`}
            >
              Round Result
            </button>
            
            <button 
              onClick={() => changeGameState('game-over')}
              className={`px-2 py-1 text-sm rounded ${gameState === 'game-over' ? 'bg-blue-100 border border-blue-500' : 'bg-gray-100'}`}
            >
              Game Over
            </button>
          </div>
        </div>
      </div>
      
      {/* Game Room Component */}
      <GameRoom 
        gameId={gameId}
        players={players}
        currentPlayerId={currentPlayerId}
        onMakeMove={handleMakeMove}
        gameState={gameState}
        currentRound={currentRound}
        scores={scores}
        lastMove={lastMove}
        isSpectator={isSpectator}
      />
      
      {/* Move History */}
      {moveHistory.length > 0 && (
        <div className="mt-6 bg-white p-4 rounded-lg shadow">
          <h2 className="text-lg font-medium mb-2">Move History (Debug)</h2>
          <pre className="bg-gray-100 p-4 rounded overflow-auto max-h-96 text-sm">
            {JSON.stringify(moveHistory, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
};

export default GameRoomTestPage;