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
        width: '64%', /* Slightly larger for better visibility */
        height: '64%',
        /* 3D Gradient Base */
        background: `radial-gradient(circle at 35% 35%, white, var(--color-ludo-${color}), black)`,
        /* Better 3D Gradient using mix-blend-mode or just simple steps:
           - Highlight (top-left)
           - Midtone (base color)
           - Shadow (bottom-right)
        */
        backgroundImage: `radial-gradient(circle at 30% 30%, rgba(255,255,255,0.8) 0%, var(--color-ludo-${color}) 30%, rgba(0,0,0,0.2) 100%)`,
        backgroundColor: `var(--color-ludo-${color})`, // Fallback and base

        borderRadius: '50%',
        /* Removed border to enhance 3D effect (or make it very subtle) */
        border: '1px solid rgba(255,255,255,0.2)',

        /* Deep Shadow + Ambient Occlusion */
        boxShadow: `
          inset -3px -3px 6px rgba(0,0,0,0.4), /* Self shadow bottom-right */
          inset 2px 2px 4px rgba(255,255,255,0.4), /* Highlight top-left */
          0 4px 8px rgba(0,0,0,0.4) /* Drop shadow */
        `,
        position: 'relative',
        transition: 'transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1)'
      }}
    >
      {/* Specular Highlight (Glossy Shine) */}
      <div style={{
        position: 'absolute',
        top: '15%',
        left: '20%',
        width: '25%',
        height: '15%',
        background: 'linear-gradient(to bottom, rgba(255,255,255,0.9), rgba(255,255,255,0.1))',
        borderRadius: '50%',
        transform: 'rotate(-45deg)',
        filter: 'blur(0.5px)'
      }}></div>
    </div>
  );
};

export default Pawn;
