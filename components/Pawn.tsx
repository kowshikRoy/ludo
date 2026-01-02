"use client";
import React from 'react';

interface PawnProps {
  color: 'red' | 'green' | 'blue' | 'yellow';
  onClick?: () => void;
  // Optional: distinct ID or player indicator
}

const Pawn: React.FC<PawnProps> = ({ color, onClick }) => {
  return (
    <div
      className={`pawn ${color}`}
      onClick={onClick}
      style={{
        cursor: onClick ? 'pointer' : 'default',
        width: '60%',
        height: '60%',
        backgroundColor: `var(--color-${color})`,
        borderRadius: '50%',
        border: '2px solid white',
        boxShadow: '0 4px 6px rgba(0,0,0,0.3)',
        position: 'relative'
      }}
    >
      <div style={{
        position: 'absolute',
        top: '10%',
        left: '20%',
        width: '30%',
        height: '30%',
        backgroundColor: 'rgba(255,255,255,0.4)',
        borderRadius: '50%'
      }}></div>
    </div>
  );
};

export default Pawn;
