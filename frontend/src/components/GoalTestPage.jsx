import { useState } from 'react';
import Goal from './Goal';

/**
 * Test page for the Goal component
 */
const GoalTestPage = () => {
  const [selectedPosition, setSelectedPosition] = useState(null);
  const [playerRole, setPlayerRole] = useState('kicker');
  const [isDisabled, setIsDisabled] = useState(false);
  
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
  
  return (
    <div className="max-w-2xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6 text-center">Goal Component Test</h1>
      
      <div className="bg-green-100 p-6 rounded-lg shadow-md">
        <Goal 
          onPositionSelect={handlePositionSelect}
          isDisabled={isDisabled}
          playerRole={playerRole}
        />
      </div>
      
      <div className="mt-8 bg-white p-4 rounded-lg shadow border">
        <h2 className="text-lg font-medium mb-2">Component Controls</h2>
        
        <div className="flex flex-wrap gap-4 mb-4">
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
            {isDisabled ? 'Enable' : 'Disable'} Goal
          </button>
        </div>
        
        <div className="mt-4">
          <h3 className="font-medium">Selected Position:</h3>
          {selectedPosition ? (
            <pre className="bg-gray-100 p-2 rounded mt-1">
              {JSON.stringify(selectedPosition, null, 2)}
            </pre>
          ) : (
            <p className="text-gray-500 italic">No position selected</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default GoalTestPage;