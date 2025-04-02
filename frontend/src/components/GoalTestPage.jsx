import { useState } from 'react';
import Goal from '../components/Goal';

/**
 * Enhanced test page for the Goal component
 */
const GoalTestPage = () => {
  // Player's selection
  const [selectedPosition, setSelectedPosition] = useState(null);
  
  // Opponent's selection
  const [opponentPosition, setOpponentPosition] = useState(null);
  
  // Component state
  const [playerRole, setPlayerRole] = useState('kicker');
  const [isDisabled, setIsDisabled] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [isGoal, setIsGoal] = useState(false);
  
  // Testing scenarios
  const [testScenario, setTestScenario] = useState('selection');
  
  // Handle position selection
  const handlePositionSelect = (position) => {
    console.log('Position selected:', position);
    setSelectedPosition(position);
  };
  
  // Toggle player role
  const togglePlayerRole = () => {
    setPlayerRole(prev => prev === 'kicker' ? 'goalkeeper' : 'kicker');
  };
  
  // Toggle disabled state
  const toggleDisabled = () => {
    setIsDisabled(prev => !prev);
  };
  
  // Set random opponent position
  const randomOpponentPosition = () => {
    const row = Math.floor(Math.random() * 3);
    const col = Math.floor(Math.random() * 3);
    setOpponentPosition({ row, col });
  };
  
  // Clear positions
  const clearPositions = () => {
    setSelectedPosition(null);
    setOpponentPosition(null);
    setShowResult(false);
  };
  
  // Apply test scenario
  const applyScenario = (scenario) => {
    setTestScenario(scenario);
    
    switch (scenario) {
      case 'selection':
        clearPositions();
        setIsDisabled(false);
        setShowResult(false);
        break;
        
      case 'waiting':
        setIsDisabled(true);
        setShowResult(false);
        break;
        
      case 'goal':
        if (!selectedPosition) {
          setSelectedPosition({ row: 0, col: 0 }); // Default if none selected
        }
        
        // Create opponent position that doesn't match (for a goal)
        let oppRow, oppCol;
        do {
          oppRow = Math.floor(Math.random() * 3);
          oppCol = Math.floor(Math.random() * 3);
        } while (
          selectedPosition && 
          oppRow === selectedPosition.row && 
          oppCol === selectedPosition.col
        );
        
        setOpponentPosition({ row: oppRow, col: oppCol });
        setShowResult(true);
        setIsGoal(true);
        break;
        
      case 'save':
        if (!selectedPosition) {
          setSelectedPosition({ row: 1, col: 1 }); // Default if none selected
        }
        
        // Set opponent position to match (for a save)
        setOpponentPosition({
          row: selectedPosition ? selectedPosition.row : 1,
          col: selectedPosition ? selectedPosition.col : 1
        });
        setShowResult(true);
        setIsGoal(false);
        break;
        
      default:
        break;
    }
  };
  
  return (
    <div className="max-w-2xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6 text-center">Goal Component Test</h1>
      
      <div className="bg-green-50 p-6 rounded-lg shadow-md">
        <Goal 
          onPositionSelect={handlePositionSelect}
          isDisabled={isDisabled}
          playerRole={playerRole}
          selectedPosition={selectedPosition}
          opponentPosition={opponentPosition}
          showResult={showResult}
          isGoal={isGoal}
        />
      </div>
      
      <div className="mt-8 bg-white p-4 rounded-lg shadow border">
        <h2 className="text-lg font-medium mb-2">Component Controls</h2>
        
        <div className="mb-6">
          <h3 className="text-md font-medium mb-2">Test Scenarios</h3>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => applyScenario('selection')}
              className={`px-3 py-1 rounded border ${
                testScenario === 'selection' 
                  ? 'bg-blue-100 border-blue-500' 
                  : 'bg-gray-100 border-gray-300'
              }`}
            >
              Selection Mode
            </button>
            <button
              onClick={() => applyScenario('waiting')}
              className={`px-3 py-1 rounded border ${
                testScenario === 'waiting' 
                  ? 'bg-blue-100 border-blue-500' 
                  : 'bg-gray-100 border-gray-300'
              }`}
            >
              Waiting Mode
            </button>
            <button
              onClick={() => applyScenario('goal')}
              className={`px-3 py-1 rounded border ${
                testScenario === 'goal' 
                  ? 'bg-blue-100 border-blue-500' 
                  : 'bg-gray-100 border-gray-300'
              }`}
            >
              Goal Result
            </button>
            <button
              onClick={() => applyScenario('save')}
              className={`px-3 py-1 rounded border ${
                testScenario === 'save' 
                  ? 'bg-blue-100 border-blue-500' 
                  : 'bg-gray-100 border-gray-300'
              }`}
            >
              Save Result
            </button>
          </div>
        </div>
        
        <div className="flex flex-wrap gap-4 mb-6">
          <button
            onClick={togglePlayerRole}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Switch to {playerRole === 'kicker' ? 'Goalkeeper' : 'Kicker'}
          </button>
          
          <button
            onClick={toggleDisabled}
            className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
          >
            {isDisabled ? 'Enable' : 'Disable'} Interaction
          </button>
          
          <button
            onClick={randomOpponentPosition}
            className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600"
          >
            Random Opponent Position
          </button>
          
          <button
            onClick={clearPositions}
            className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
          >
            Clear Positions
          </button>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <h3 className="font-medium">Player Position:</h3>
            {selectedPosition ? (
              <pre className="bg-gray-100 p-2 rounded mt-1">
                {JSON.stringify(selectedPosition, null, 2)}
              </pre>
            ) : (
              <p className="text-gray-500 italic">No position selected</p>
            )}
          </div>
          
          <div>
            <h3 className="font-medium">Opponent Position:</h3>
            {opponentPosition ? (
              <pre className="bg-gray-100 p-2 rounded mt-1">
                {JSON.stringify(opponentPosition, null, 2)}
              </pre>
            ) : (
              <p className="text-gray-500 italic">No position set</p>
            )}
          </div>
        </div>
        
        <div className="mt-4">
          <h3 className="font-medium">Component State:</h3>
          <pre className="bg-gray-100 p-2 rounded mt-1">
{`{
  playerRole: "${playerRole}",
  isDisabled: ${isDisabled},
  showResult: ${showResult},
  isGoal: ${isGoal}
}`}
          </pre>
        </div>
      </div>
    </div>
  );
};

export default GoalTestPage;