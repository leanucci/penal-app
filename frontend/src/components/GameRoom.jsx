import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import Goal from './Goal';

/**
 * Game Room component - Main UI for the penalty shootout game
 */
const GameRoom = ({ 
  gameId,
  players,
  currentPlayerId,
  onMakeMove,
  gameState = 'waiting', // waiting, ready, player1-turn, player2-turn, round-result, game-over
  currentRound = 1,
  scores = [0, 0],
  lastMove = null,
  isSpectator = false
}) => {
  // Local state
  const [selectedPosition, setSelectedPosition] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [roundResults, setRoundResults] = useState([]);
  
  // Determine if the current player is player1 or player2
  const isPlayer1 = currentPlayerId === players[0]?.id;
  const isPlayer2 = currentPlayerId === players[1]?.id;
  
  // Determine player names (or default values)
  const player1Name = players[0]?.name || 'Player 1';
  const player2Name = players[1]?.name || 'Player 2';
  
  // Determine the current player's role based on the round
  const isKicker = (isPlayer1 && currentRound % 2 === 1) || (isPlayer2 && currentRound % 2 === 0);
  const isGoalkeeper = (isPlayer1 && currentRound % 2 === 0) || (isPlayer2 && currentRound % 2 === 1);
  
  // Handle position selection
  const handlePositionSelect = (position) => {
    if (isSubmitting || isSpectator) return;
    setSelectedPosition(position);
  };
  
  // Submit the selected move
  const handleSubmitMove = () => {
    if (!selectedPosition || isSubmitting || isSpectator) return;
    
    setIsSubmitting(true);
    
    // Call the provided onMakeMove callback
    onMakeMove({
      gameId,
      playerId: currentPlayerId,
      round: currentRound,
      position: selectedPosition,
      role: isKicker ? 'kicker' : 'goalkeeper'
    });
    
    // In a real implementation, this would be reset after server confirmation
    // For now, we'll reset it after a short delay
    setTimeout(() => {
      setIsSubmitting(false);
      setSelectedPosition(null);
    }, 500);
  };
  
  // Reset selected position when round changes
  useEffect(() => {
    setSelectedPosition(null);
  }, [currentRound]);
  
  // Update round results when a round is completed
  useEffect(() => {
    if (lastMove && lastMove.roundComplete) {
      setRoundResults(prev => [...prev, lastMove]);
    }
  }, [lastMove]);
  
  // Determine if the current player can make a move
  const canMakeMove = 
    (gameState === 'player1-turn' && isPlayer1) || 
    (gameState === 'player2-turn' && isPlayer2);
  
  // Get status text based on game state
  const getStatusText = () => {
    switch (gameState) {
      case 'waiting':
        return 'Waiting for opponent to join...';
      case 'ready':
        return 'Game ready to start!';
      case 'player1-turn':
        return `${player1Name}'s turn`;
      case 'player2-turn':
        return `${player2Name}'s turn`;
      case 'round-result':
        return 'Round complete!';
      case 'game-over':
        return 'Game over!';
      default:
        return 'Loading...';
    }
  };
  
  // Get winner name if game is over
  const getWinnerText = () => {
    if (gameState !== 'game-over') return null;
    
    if (scores[0] > scores[1]) {
      return `${player1Name} wins!`;
    } else if (scores[1] > scores[0]) {
      return `${player2Name} wins!`;
    } else {
      return 'It\'s a draw!';
    }
  };
  
  // Get text for whose turn it is for the player
  const getPlayerTurnText = () => {
    if (isSpectator) return 'You are spectating';
    
    if (canMakeMove) {
      return isKicker 
        ? 'Your turn to kick!' 
        : 'Your turn to save!';
    } else if (gameState === 'player1-turn' || gameState === 'player2-turn') {
      return 'Waiting for opponent...';
    }
    
    return '';
  };
  
  return (
    <div className="max-w-4xl mx-auto p-4">
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        {/* Header with game info */}
        <div className="bg-gradient-to-r from-green-600 to-green-700 text-white p-4">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-1">Penalty Shootout</h2>
            <p className="text-sm opacity-80">Game ID: {gameId}</p>
          </div>
          
          {/* Score and round info */}
          <div className="mt-4 flex justify-between items-center">
            <div className="text-center flex-1">
              <div className="text-lg font-medium">{player1Name}</div>
              <div className="text-3xl font-bold">{scores[0]}</div>
            </div>
            
            <div className="text-center px-4">
              <div className="text-sm uppercase tracking-wider opacity-80">Round</div>
              <div className="text-2xl font-bold">{currentRound}</div>
            </div>
            
            <div className="text-center flex-1">
              <div className="text-lg font-medium">{player2Name}</div>
              <div className="text-3xl font-bold">{scores[1]}</div>
            </div>
          </div>
        </div>
        
        {/* Game status */}
        <div className="p-4 bg-gray-100 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <div className="text-lg font-medium">
              {getStatusText()}
            </div>
            
            <div className={`px-3 py-1 rounded-full text-sm font-medium ${
              canMakeMove 
                ? 'bg-green-100 text-green-800' 
                : 'bg-gray-200 text-gray-700'
            }`}>
              {getPlayerTurnText()}
            </div>
          </div>
          
          {/* Winner announcement if game is over */}
          {getWinnerText() && (
            <div className="mt-4 text-center">
              <div className="text-2xl font-bold text-green-600">
                {getWinnerText()}
              </div>
            </div>
          )}
        </div>
        
        {/* Main game area */}
        <div className="p-6">
          {/* Show different content based on game state */}
          {gameState === 'waiting' ? (
            <div className="text-center py-8">
              <div className="animate-pulse mb-4">
                <div className="w-16 h-16 bg-blue-400 rounded-full mx-auto flex items-center justify-center">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                </div>
              </div>
              <h3 className="text-xl font-medium mb-2">Waiting for opponent</h3>
              <p className="text-gray-600">Share this game ID with your friend to play together</p>
              <div className="mt-4 bg-gray-100 p-2 rounded flex items-center justify-center">
                <code className="font-mono text-sm">{gameId}</code>
                <button 
                  className="ml-2 text-blue-600"
                  onClick={() => navigator.clipboard.writeText(gameId)}
                >
                  Copy
                </button>
              </div>
            </div>
          ) : gameState === 'round-result' || gameState === 'game-over' ? (
            // Show last round result
            lastMove && (
              <div className="py-4">
                <h3 className="text-xl font-medium mb-4 text-center">Round Result</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div>
                    <h4 className="text-center font-medium mb-2">
                      {lastMove.kickerName || 'Kicker'}'s Shot
                    </h4>
                    <Goal 
                      onPositionSelect={() => {}}
                      playerRole="kicker"
                      selectedPosition={lastMove.kickPosition}
                      opponentPosition={lastMove.savePosition}
                      showResult={true}
                      isGoal={lastMove.isGoal}
                      isDisabled={true}
                    />
                  </div>
                  
                  <div>
                    <h4 className="text-center font-medium mb-2">
                      {lastMove.goalkeeperName || 'Goalkeeper'}'s Save
                    </h4>
                    <Goal 
                      onPositionSelect={() => {}}
                      playerRole="goalkeeper"
                      selectedPosition={lastMove.savePosition}
                      opponentPosition={lastMove.kickPosition}
                      showResult={true}
                      isGoal={lastMove.isGoal}
                      isDisabled={true}
                    />
                  </div>
                </div>
                
                <div className="mt-6 text-center">
                  <p className={`text-lg font-medium ${lastMove.isGoal ? 'text-green-600' : 'text-red-600'}`}>
                    {lastMove.isGoal 
                      ? `Goal scored by ${lastMove.kickerName || 'Kicker'}!` 
                      : `Great save by ${lastMove.goalkeeperName || 'Goalkeeper'}!`}
                  </p>
                  
                  {gameState !== 'game-over' && (
                    <button 
                      className="mt-4 px-6 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                      onClick={() => {}}
                    >
                      Continue to Next Round
                    </button>
                  )}
                </div>
              </div>
            )
          ) : (
            // Show the goal for making a move
            <div className="py-4">
              <h3 className="text-xl font-medium mb-4 text-center">
                {canMakeMove
                  ? (isKicker ? 'Select where to kick' : 'Select where to dive')
                  : 'Waiting for opponent'}
              </h3>
              
              <div className="max-w-md mx-auto">
                <Goal 
                  onPositionSelect={handlePositionSelect}
                  playerRole={isKicker ? 'kicker' : 'goalkeeper'}
                  selectedPosition={selectedPosition}
                  isDisabled={!canMakeMove || isSubmitting}
                />
              </div>
              
              {canMakeMove && (
                <div className="mt-6 text-center">
                  <button 
                    className={`px-6 py-2 rounded-md ${
                      selectedPosition && !isSubmitting
                        ? 'bg-blue-500 text-white hover:bg-blue-600' 
                        : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    }`}
                    onClick={handleSubmitMove}
                    disabled={!selectedPosition || isSubmitting}
                  >
                    {isSubmitting ? 'Submitting...' : 'Confirm Selection'}
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
        
        {/* Round history */}
        {roundResults.length > 0 && (
          <div className="p-4 border-t border-gray-200">
            <h3 className="text-lg font-medium mb-2">Round History</h3>
            <div className="overflow-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="p-2 text-left">Round</th>
                    <th className="p-2 text-left">Kicker</th>
                    <th className="p-2 text-left">Goalkeeper</th>
                    <th className="p-2 text-center">Result</th>
                  </tr>
                </thead>
                <tbody>
                  {roundResults.map((result, index) => (
                    <tr key={index} className="border-t border-gray-200">
                      <td className="p-2">{result.round}</td>
                      <td className="p-2">{result.kickerName || 'Player'}</td>
                      <td className="p-2">{result.goalkeeperName || 'Player'}</td>
                      <td className="p-2 text-center">
                        <span className={`inline-block px-2 py-1 rounded ${
                          result.isGoal 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {result.isGoal ? 'GOAL' : 'SAVED'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

GameRoom.propTypes = {
  gameId: PropTypes.string.isRequired,
  players: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      name: PropTypes.string.isRequired
    })
  ).isRequired,
  currentPlayerId: PropTypes.string.isRequired,
  onMakeMove: PropTypes.func.isRequired,
  gameState: PropTypes.string,
  currentRound: PropTypes.number,
  scores: PropTypes.arrayOf(PropTypes.number),
  lastMove: PropTypes.object,
  isSpectator: PropTypes.bool
};

export default GameRoom;