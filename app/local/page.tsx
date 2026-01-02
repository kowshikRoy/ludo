"use client";
import React from 'react';
import Board from '@/components/Board';
import { useLudoGame } from '@/hooks/useLudoGame';

export default function LocalGamePage() {
  const { diceValue, rolling, turn, pawns, handleRoll, handleMove } = useLudoGame();

  return (
    <div className="flex flex-col items-center p-4">
      <h1 className="text-2xl font-bold mb-4">Local Game</h1>
      <Board
        diceValue={diceValue}
        rolling={rolling}
        turn={turn}
        pawns={pawns}
        onRoll={handleRoll}
        onPawnClick={handleMove}
        players={[
          { name: 'Red Player', color: 'red' },
          { name: 'Green Player', color: 'green' },
          { name: 'Blue Player', color: 'blue' },
          { name: 'Yellow Player', color: 'yellow' },
        ]}
        activeColors={['red', 'green', 'blue', 'yellow']}
      />
    </div>
  );
}
