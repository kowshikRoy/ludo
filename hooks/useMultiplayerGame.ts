import { useState, useEffect } from 'react';
import { ref, onValue, set, update } from 'firebase/database';
import { db } from '@/lib/firebase';
import { PawnState, checkMove, MoveResult } from '@/lib/gameLogic';
import { PlayerColor } from '@/lib/ludoConstants';

export const useMultiplayerGame = (gameId: string, playerColor: PlayerColor) => {
  const [gameState, setGameState] = useState<{
    pawns: PawnState[];
    turn: PlayerColor;
    diceValue: number;
    rolling: boolean;
  } | null>(null);

  useEffect(() => {
    if (!gameId) return;

    const gameRef = ref(db, `games/${gameId}`);
    const unsubscribe = onValue(gameRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        setGameState({
          pawns: data.pawns || [],
          turn: data.turn || 'blue',
          diceValue: data.diceValue || 1,
          rolling: data.rolling || false,
        });
      }
    });

    return () => unsubscribe();
  }, [gameId]);

  const handleRoll = () => {
    if (!gameState || gameState.turn !== playerColor || gameState.rolling) return;

    // Set rolling true
    update(ref(db, `games/${gameId}`), { rolling: true });

    setTimeout(() => {
      const newValue = Math.floor(Math.random() * 6) + 1;

      // Basic next turn logic if no moves (simplified)
      // Check if any move possible?
      // For now, just set value and rolling false. The move logic handles turn passing if necessary?
      // Or we wait for user to click pawn. 
      // This is a simplified version based on typical "local" hook but adapted for MP.

      update(ref(db, `games/${gameId}`), {
        diceValue: newValue,
        rolling: false
        // Note: Turn passing typically happens after move, or if no moves possible.
        // We'll leave turn as is, waiting for move. 
        // If 6, they roll again (implemented in move often).
      });
    }, 1000);
  };

  const handleMove = (pawnId: number) => {
    if (!gameState || gameState.turn !== playerColor || gameState.rolling) return;

    const pawn = gameState.pawns.find((p) => p.id === pawnId);
    if (!pawn) return;

    const result: MoveResult = checkMove(pawn, gameState.diceValue, playerColor, gameState.pawns);

    if (result.valid && result.newPos) {
      // Update pawns
      const newPawns = gameState.pawns.map((p) => {
        if (p.id === pawnId) {
          return { ...p, pos: result.newPos!, pathIndex: result.newPathIndex! };
        }
        // Capture logic
        if (result.captured && result.captured.includes(p.id)) {
          return { ...p, pos: 'base' as const, pathIndex: -1 };
        }
        return p;
      });

      // Turn logic
      let nextTurn = gameState.turn;
      if (gameState.diceValue !== 6) {
        const colors: PlayerColor[] = ['blue', 'yellow', 'green', 'red'];
        const idx = colors.indexOf(gameState.turn);
        nextTurn = colors[(idx + 1) % 4];
      }

      update(ref(db, `games/${gameId}`), {
        pawns: newPawns,
        turn: nextTurn,
        rolling: false, // Ensure rolling is reset
        diceValue: gameState.diceValue // Keep value or reset? Usually keep until next roll start.
      });
    }
  };

  return { gameState, handleRoll, handleMove };
};
