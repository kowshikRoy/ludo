import { useState, useCallback, useEffect } from 'react';
import { PlayerColor, BASE_POS, PLAYER_START_OFFSET } from '@/lib/ludoConstants';
import { checkMove, PawnState } from '@/lib/gameLogic';

export const useLudoGame = () => {
  const [diceValue, setDiceValue] = useState(1);
  const [rolling, setRolling] = useState(false);
  const [turn, setTurn] = useState<PlayerColor>('blue'); // Blue starts typically?
  const [pawns, setPawns] = useState<PawnState[]>([
    ...[0, 1, 2, 3].map(i => ({ id: i, color: 'blue' as const, pos: 'base' as const, pathIndex: -1 })),
    ...[0, 1, 2, 3].map(i => ({ id: i + 4, color: 'yellow' as const, pos: 'base' as const, pathIndex: -1 })),
    ...[0, 1, 2, 3].map(i => ({ id: i + 8, color: 'green' as const, pos: 'base' as const, pathIndex: -1 })),
    ...[0, 1, 2, 3].map(i => ({ id: i + 12, color: 'red' as const, pos: 'base' as const, pathIndex: -1 })),
  ]);
  const [awaitingMove, setAwaitingMove] = useState(false);

  const PLAYERS: PlayerColor[] = ['blue', 'yellow', 'green', 'red'];

  const nextTurn = useCallback(() => {
    setTurn(prev => {
      const idx = PLAYERS.indexOf(prev);
      return PLAYERS[(idx + 1) % 4];
    });
    setAwaitingMove(false);
  }, []);

  const handleRoll = useCallback(() => {
    if (rolling || awaitingMove) return;
    setRolling(true);

    setTimeout(() => {
      const val = Math.floor(Math.random() * 6) + 1;
      setDiceValue(val);
      setRolling(false);

      const myPawns = pawns.filter(p => p.color === turn);
      const validMoves = myPawns.filter(p => checkMove(p, val, turn, pawns).valid);

      if (validMoves.length > 0) {
        setAwaitingMove(true);
        // Auto-move handled by effect
      } else {
        setTimeout(nextTurn, 1000);
      }
    }, 500);
  }, [rolling, awaitingMove, turn, pawns, nextTurn]);

  const handleMove = useCallback((pawnId: number) => {
    if (!awaitingMove) return;

    setPawns(prev => {
      const p = prev.find(pw => pw.id === pawnId);
      if (!p || p.color !== turn) return prev;

      const result = checkMove(p, diceValue, turn, prev);

      if (!result.valid || !result.newPos || result.newPathIndex === undefined) {
        return prev;
      }

      // Apply Capture
      let updated = prev.map(pw => {
        if (pw.id === pawnId) {
          return { ...pw, pos: result.newPos!, pathIndex: result.newPathIndex! };
        }
        if (result.captured && result.captured.includes(pw.id)) {
          return { ...pw, pos: 'base' as const, pathIndex: -1 };
        }
        return pw;
      });

      return updated;
    });

    // Valid Move Complete
    if (diceValue === 6) {
      setRolling(false);
      setAwaitingMove(false);
    } else {
      nextTurn();
    }
  }, [awaitingMove, diceValue, turn, nextTurn]);

  // Auto-Move Effect
  useEffect(() => {
    if (awaitingMove && !rolling) {
      const myPawns = pawns.filter(p => p.color === turn);
      const validMoves = myPawns.filter(p => checkMove(p, diceValue, turn, pawns).valid);
      if (validMoves.length === 1) {
        const timer = setTimeout(() => {
          handleMove(validMoves[0].id);
        }, 500);
        return () => clearTimeout(timer);
      }
    }
  }, [awaitingMove, rolling, diceValue, turn, pawns, handleMove]);

  return {
    diceValue,
    rolling,
    turn,
    pawns,
    handleRoll,
    handleMove,
    awaitingMove
  };
};
