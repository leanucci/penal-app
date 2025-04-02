import { useState } from 'react';
import PropTypes from 'prop-types';

/**
 * Soccer goal visualization component with clickable grid for selecting positions
 */
const Goal = ({ onPositionSelect, isDisabled, playerRole }) => {
  // State for the currently selected position
  const [selectedPosition, setSelectedPosition] = useState(null);
  
  // Create a 3x3 grid for the goal
  const rows = 3;
  const cols = 3;
  
  // Handle click on a position
  const handlePositionClick = (row, col) => {
    if (isDisabled) return;
    
    const position = { row, col };
    setSelectedPosition(position);
    onPositionSelect(position);
  };
  
  // Determine cell label based on position
  const getCellLabel = (row, col) => {
    if (row === 0) {
      if (col === 0) return 'Top Left';
      if (col === 1) return 'Top Center';
      if (col === 2) return 'Top Right';
    } else if (row === 1) {
      if (col === 0) return 'Middle Left';
      if (col === 1) return 'Middle Center';
      if (col === 2) return 'Middle Right';
    } else {
      if (col === 0) return 'Bottom Left';
      if (col === 1) return 'Bottom Center';
      if (col === 2) return 'Bottom Right';
    }
  };
  
  return (
    <div className="flex flex-col items-center">
      <h3 className="text-lg font-medium mb-2">
        {playerRole === 'kicker' ? 'Select where to kick' : 'Select where to dive'}
      </h3>
      
      {/* Goal structure */}
      <div className="relative w-full max-w-md aspect-[16/9] border-t-8 border-x-8 border-gray-700 rounded-t-lg">
        {/* Goal net background */}
        <div className="absolute inset-0 bg-gray-100">
          {/* Net pattern */}
          <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
            <pattern id="net-pattern" width="20" height="20" patternUnits="userSpaceOnUse">
              <path d="M 0 0 L 20 0 M 0 0 L 0 20" stroke="rgba(0,0,0,0.1)" strokeWidth="1" fill="none" />
            </pattern>
            <rect width="100%" height="100%" fill="url(#net-pattern)" />
          </svg>
        </div>
        
        {/* Grid overlay */}
        <div className="absolute inset-0 grid grid-cols-3 grid-rows-3">
          {Array.from({ length: rows * cols }).map((_, index) => {
            const row = Math.floor(index / cols);
            const col = index % cols;
            const isSelected = selectedPosition && 
                              selectedPosition.row === row && 
                              selectedPosition.col === col;
            
            return (
              <div
                key={`${row}-${col}`}
                className={`
                  border border-dashed border-gray-400 
                  flex items-center justify-center
                  transition-all duration-200
                  cursor-pointer hover:bg-blue-100
                  ${isSelected ? 'bg-blue-200' : 'bg-transparent'}
                  ${isDisabled ? 'cursor-not-allowed opacity-50' : ''}
                `}
                onClick={() => handlePositionClick(row, col)}
                title={getCellLabel(row, col)}
              >
                {isSelected && (
                  <div className={`w-6 h-6 rounded-full ${playerRole === 'kicker' ? 'bg-red-500' : 'bg-yellow-500'}`} />
                )}
              </div>
            );
          })}
        </div>
      </div>
      
      {/* Goalposts */}
      <div className="h-4 w-12 bg-white border border-gray-300 rounded-full -mt-2 shadow-md"></div>
      
      {/* Selected position text */}
      {selectedPosition && (
        <div className="mt-4 text-center">
          <p className="text-sm">
            Selected: <span className="font-medium">{getCellLabel(selectedPosition.row, selectedPosition.col)}</span>
          </p>
        </div>
      )}
    </div>
  );
};

Goal.propTypes = {
  onPositionSelect: PropTypes.func.isRequired,
  isDisabled: PropTypes.bool,
  playerRole: PropTypes.oneOf(['kicker', 'goalkeeper']).isRequired
};

Goal.defaultProps = {
  isDisabled: false
};

export default Goal;