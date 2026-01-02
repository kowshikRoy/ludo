import { MAIN_PATH, HOME_PATHS, PLAYER_START_OFFSET, SAFE_ZONES, Coord, PlayerColor } from './ludoConstants';

export type PawnState = {
  id: number;
  color: PlayerColor;
  pos: Coord | 'base' | 'home';
  pathIndex: number; // -1=base, 0-51=main, 52+=home
};

export type MoveResult = {
  valid: boolean;
  newPos?: Coord | 'home' | 'base';
  newPathIndex?: number;
  captured?: number[]; // IDs of captured pawns
};

export const checkMove = (
  pawn: PawnState,
  steps: number,
  turn: PlayerColor,
  allPawns: PawnState[]
): MoveResult => {
  if (pawn.color !== turn) return { valid: false };

  // Base Logic
  if (pawn.pos === 'base') {
    if (steps === 6) {
      const newPathIndex = 0;
      const mainIdx = (PLAYER_START_OFFSET[pawn.color] + 0) % 52;

      // Validation: Can we land here? 
      // Rule: Can land on own pawn? Usually yes (stack).
      // Can capture? Yes.
      // But if opponent has 2 pawns on safe spot? (Advanced rules involved).
      // We implement Simple Capture: Single opponent piece is captured.

      return resolveLanding(newPathIndex, mainIdx, pawn, allPawns);
    }
    return { valid: false };
  }

  // Home Logic
  if (pawn.pos === 'home') return { valid: false };

  // Regular Move
  const potentialIndex = pawn.pathIndex + steps;

  // Overshot Home Check
  if (potentialIndex > 56) return { valid: false };

  // Calculate generic new Coordinates
  let newPos: Coord | 'home';
  if (potentialIndex >= 51) {
    // Home Stretch
    const homeIdx = potentialIndex - 51;
    if (homeIdx < 6) {
      newPos = HOME_PATHS[pawn.color][homeIdx];
    } else {
      newPos = 'home';
    }
    // No capturing in Home Stretch
    return { valid: true, newPos, newPathIndex: potentialIndex, captured: [] };
  } else {
    // Main Path
    const mainIdx = (PLAYER_START_OFFSET[pawn.color] + potentialIndex) % 52;
    // Resolve Landing (Collision/Capture)
    return resolveLanding(potentialIndex, mainIdx, pawn, allPawns);
  }
};

function resolveLanding(
  pathIndex: number,
  mainIdx: number,
  currentPawn: PawnState,
  allPawns: PawnState[]
): MoveResult {
  const newPos = MAIN_PATH[mainIdx];
  const isSafe = SAFE_ZONES.includes(mainIdx);

  // Check occupants
  const occupants = allPawns.filter(p =>
    p.id !== currentPawn.id &&
    p.pos !== 'base' && p.pos !== 'home' &&
    (p.pos as Coord).r === newPos.r && (p.pos as Coord).c === newPos.c
  );

  const opponents = occupants.filter(p => p.color !== currentPawn.color);
  // const own = occupants.filter(p => p.color === currentPawn.color);

  // Capture Rule
  if (!isSafe && opponents.length === 1) {
    // CAPTURE!
    return {
      valid: true,
      newPos,
      newPathIndex: pathIndex,
      captured: opponents.map(p => p.id)
    };
  }

  // Blockade Rule (optional)? 
  // If opponents.length > 1 on a spot (safe or not), usually blocks?
  // ludo-meet implementation allows multiple pawns.
  // We will allow landing.

  return { valid: true, newPos, newPathIndex: pathIndex, captured: [] };
}
