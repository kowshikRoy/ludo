"use client";
import React from 'react';

interface DiceProps {
  value: number;
  rolling: boolean;
  onRoll: () => void;
  color?: string; // Color of the current player
}

const Dice: React.FC<DiceProps> = ({ value, rolling, onRoll, color }) => {
  // Dot positions for each face
  const dots: Record<number, number[]> = {
    1: [4],
    2: [0, 8],
    3: [0, 4, 8],
    4: [0, 2, 6, 8],
    5: [0, 2, 4, 6, 8],
    6: [0, 2, 3, 5, 6, 8]
  };

  return (
    <div
      onClick={!rolling ? onRoll : undefined}
      className={`dice-container ${rolling ? 'rolling' : ''} relative group`}
      style={{
        backgroundColor: color ? `var(--color-${color})` : 'white',
        cursor: rolling ? 'default' : 'pointer',
      }}
    >
      {/* State Layer */}
      <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-[var(--md-sys-state-hover-opacity)] group-active:opacity-[var(--md-sys-state-pressed-opacity)] transition-opacity duration-200 pointer-events-none" />

      {[0, 1, 2, 3, 4, 5, 6, 7, 8].map((idx) => (
        <div key={idx} style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          position: 'relative',
          zIndex: 1
        }}>
          {dots[value]?.includes(idx) && (
            <div style={{
              width: '12px',
              height: '12px',
              borderRadius: '50%',
              backgroundColor: color === 'yellow' ? '#1a1a1a' : 'white',
              boxShadow: color === 'yellow'
                ? 'inset 0 1px 2px rgba(255,255,255,0.2), 0 1px 1px rgba(0,0,0,0.5)'
                : 'inset 0 1px 2px rgba(0,0,0,0.2), 0 1px 1px rgba(255,255,255,0.5)',
              border: '1px solid rgba(0,0,0,0.1)'
            }} />
          )}
        </div>
      ))}
    </div>
  );
};

export default Dice;
