import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import './Goal.css'; 
import netSvg from '../assets/net.svg';

const Goal = ({ 
  onPositionSelect, 
  isDisabled = false,
  playerRole = 'kicker',
  opponentPosition = null,
  selectedPosition = null,
  showResult = false,
  isGoal = false
}) => {
  // Internal state for tracking selection when not controlled
  const [internalSelectedPosition, setInternalSelectedPosition] = useState(null);
  
  // Use either the controlled selectedPosition or internal state
  const actualSelectedPosition = selectedPosition || internalSelectedPosition;
  
  // Reset internal selection when controlled value changes
  useEffect(() => {
    if (selectedPosition) {
      setInternalSelectedPosition(null);
    }
  }, [selectedPosition]);
  
  // Create a 2x3 grid for the goal
  const rows = 2;
  const cols = 3;
  
  // Handle click on a position
  const handlePositionClick = (row, col) => {
    if (isDisabled) return;
    
    const position = { row, col };
    
    // Update internal state if not controlled
    if (!selectedPosition) {
      setInternalSelectedPosition(position);
    }
    
    // Notify parent component
    onPositionSelect(position);
  };
  
  // Determine cell label based on position
  const getCellLabel = (row, col) => {
    if (row === 0) {
      if (col === 0) return 'Top Left';
      if (col === 1) return 'Top Center';
      if (col === 2) return 'Top Right';
    } else if (row === 1) {
      if (col === 0) return 'Bottom Left';
      if (col === 1) return 'Bottom Center';
      if (col === 2) return 'Bottom Right';
    }
  };
  
  return (
    <div className="goal-container">
      <h3 className={`goal-title ${showResult ? (isGoal ? 'goal-scored' : 'goal-saved') : ''}`}>
        {showResult
          ? (isGoal ? 'Goal conceded 😖' : 'Great save! 🎉')
          : (playerRole === 'kicker' ? 'Select where to kick' : 'Select where to dive')}
      </h3>
      
      <div className="field-background">
        <div className="goal-structure">
          <div className="goal-net">
          </div>
          
          <div className="goal-grid">
            {Array.from({ length: rows * cols }).map((_, index) => {
              const row = Math.floor(index / cols);
              const col = index % cols;
              
              // Determine if this cell is selected by player
              const isSelected = actualSelectedPosition && 
                               actualSelectedPosition.row === row && 
                               actualSelectedPosition.col === col;
              
              // Determine if this cell is selected by opponent
              const isOpponentSelected = opponentPosition && 
                                      opponentPosition.row === row && 
                                      opponentPosition.col === col;
              
              // Build class names
              let cellClassName = 'goal-cell';
              
              if (isDisabled && !showResult) cellClassName += ' disabled';
              if (isSelected) cellClassName += ' selected';
              if (showResult && isSelected && isOpponentSelected) cellClassName += ' collision';
              // etc. for other states
              
              return (
                <div
                  key={`${row}-${col}`}
                  className={cellClassName}
                  onClick={() => !showResult && handlePositionClick(row, col)}
                  title={getCellLabel(row, col)}
                >
                  {isSelected && (
                    <div className={`marker ${playerRole === 'kicker' ? 'kicker' : 'goalkeeper'}`} />
                  )}
                  
                  {/* More markers for different states would go here */}
                </div>
              );
            })}
          </div>
        </div>        
      </div>
      
      {actualSelectedPosition && !showResult && (
        <div className="selection-text">
          <p>Selected: <span>{getCellLabel(actualSelectedPosition.row, actualSelectedPosition.col)}</span></p>
        </div>
      )}
    </div>
  );
};

Goal.propTypes = {
  onPositionSelect: PropTypes.func.isRequired,
  isDisabled: PropTypes.bool,
  playerRole: PropTypes.oneOf(['kicker', 'goalkeeper']),
  opponentPosition: PropTypes.shape({
    row: PropTypes.number.isRequired,
    col: PropTypes.number.isRequired
  }),
  selectedPosition: PropTypes.shape({
    row: PropTypes.number.isRequired,
    col: PropTypes.number.isRequired
  }),
  showResult: PropTypes.bool,
  isGoal: PropTypes.bool
};

export default Goal;