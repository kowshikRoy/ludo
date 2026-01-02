import { useState, useEffect, useCallback } from 'react';
import { PlayerColor } from '@/lib/ludoConstants';
import { checkMove, PawnState } from '@/lib/gameLogic';
import { GameState, subscribeToRoom, updateGameState } from '@/lib/firebaseGame';

export const useOnlineGame = (roomId: string, uid: string) => {
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!roomId) return;

    const unsubscribe = subscribeToRoom(roomId, (data) => {
      setGameState(data);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [roomId]);

  const myColor = gameState?.players[uid]?.color;
  const isMyTurn = gameState?.turn === myColor;

  const handleRoll = useCallback(async () => {
    if (!gameState || !isMyTurn || gameState.rolling || gameState.awaitingMove) return;

    // Start Rolling
    await updateGameState(roomId, { rolling: true });

    // Simulate Roll Delay
    setTimeout(async () => {
      // Re-fetch state or use current ref? 
      // In a real hook, we should be careful about closure staleness. 
      // 'gameState' in this scope is from the render cycle when handleRoll was created.
      // Since it's in dependency array, it should be fresh.

      const val = Math.floor(Math.random() * 6) + 1;

      const myPawns = gameState.pawns.filter(p => p.color === myColor);
      const validMoves = myPawns.filter(p => checkMove(p, val, myColor!, gameState.pawns).valid);

      const updates: Partial<GameState> = {
        diceValue: val,
        rolling: false,
        lastUpdated: Date.now()
      };

      if (validMoves.length > 0) {
        updates.awaitingMove = true;
      } else {
        // No moves possible, next turn
        updates.turn = getNextTurn(gameState.turn, gameState.players);
        updates.awaitingMove = false;
      }

      await updateGameState(roomId, updates);
    }, 500);
  }, [gameState, roomId, myColor, isMyTurn]);

  const handleMove = useCallback(async (pawnId: number) => {
    if (!gameState || !gameState.awaitingMove || !isMyTurn) return;

    const pawn = gameState.pawns.find(p => p.id === pawnId);
    if (!pawn || pawn.color !== myColor) return;

    const result = checkMove(pawn, gameState.diceValue, myColor!, gameState.pawns);

    if (!result.valid || !result.newPos || result.newPathIndex === undefined) return;

    // Apply Move locally then update
    const newPawns = gameState.pawns.map(p => {
      if (p.id === pawnId) {
        return { ...p, pos: result.newPos!, pathIndex: result.newPathIndex! };
      }
      if (result.captured && result.captured.includes(p.id)) {
        return { ...p, pos: 'base' as const, pathIndex: -1 };
      }
      return p;
    });

    const updates: Partial<GameState> = {
      pawns: newPawns,
      awaitingMove: false,
      lastUpdated: Date.now()
    };

    if (gameState.diceValue !== 6) {
      // Next Turn
      updates.turn = getNextTurn(gameState.turn, gameState.players);
    } else {
      // Roll again
      updates.rolling = false; // Just to be safe
    }

    await updateGameState(roomId, updates);
  }, [gameState, roomId, myColor, isMyTurn]);

  return {
    gameState,
    loading,
    myColor,
    isMyTurn,
    handleRoll,
    handleMove
  };
};

function getNextTurn(currentTurn: PlayerColor, players: GameState['players']): PlayerColor {
  const colors: PlayerColor[] = ['blue', 'yellow', 'green', 'red'];
  let currentIndex = colors.indexOf(currentTurn);
  const activeColors = new Set(Object.values(players || {}).map(p => p.color));

  if (activeColors.size === 0) return currentTurn; // Should not happen

  // Loop to find next active player
  for (let i = 1; i <= 4; i++) {
    const nextColor = colors[(currentIndex + i) % 4];
    if (activeColors.has(nextColor)) {
      return nextColor;
    }
  }
  return currentTurn;
}