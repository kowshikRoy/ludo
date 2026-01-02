export type Coord = { r: number; c: number };
export type PlayerColor = 'blue' | 'yellow' | 'green' | 'red';
// Order: Blue (TL), Yellow (TR), Green (BR), Red (BL).

// The Main Loop (52 steps), starting from Blue's Start position (6,1) and going clockwise.
// NOTE: We assume (Row, Col). 
// ludo-meet index 0 is {x:1, y:6} => Col 1, Row 6. ==> {r:6, c:1}.
export const MAIN_PATH: Coord[] = [
  // 1. Blue Section (West Wing) - Moving Right ? 
  // Wait, ludo-meet path check:
  // {x:1, y:6}, {x:2, y:6}, {x:3, y:6}, {x:4, y:6}, {x:5, y:6} -> Col increases. Moving Right.
  // Then {x:6, y:5}... {x:6, y:0} -> Col 6 fixed, Row decreases. Moving Up.
  // Then {x:7, y:0}, {x:8, y:0} -> Row 0 fixed, Col increases. Moving Right.
  // This matches standard path logic.

  // Blue Leg (Moving Right)
  { r: 6, c: 1 }, { r: 6, c: 2 }, { r: 6, c: 3 }, { r: 6, c: 4 }, { r: 6, c: 5 },
  // Up Leg (towards TR)
  { r: 5, c: 6 }, { r: 4, c: 6 }, { r: 3, c: 6 }, { r: 2, c: 6 }, { r: 1, c: 6 }, { r: 0, c: 6 },
  // TR Turn
  { r: 0, c: 7 }, { r: 0, c: 8 },
  // Down Leg (towards Yellow Start)
  { r: 1, c: 8 }, { r: 2, c: 8 }, { r: 3, c: 8 }, { r: 4, c: 8 }, { r: 5, c: 8 },
  // Right Leg (towards East)
  { r: 6, c: 9 }, { r: 6, c: 10 }, { r: 6, c: 11 }, { r: 6, c: 12 }, { r: 6, c: 13 }, { r: 6, c: 14 },
  // East Turn
  { r: 7, c: 14 }, { r: 8, c: 14 },
  // Left Leg (towards Green Start)
  // Stops at c=9. (c=8 is invalid center).
  { r: 8, c: 13 }, { r: 8, c: 12 }, { r: 8, c: 11 }, { r: 8, c: 10 }, { r: 8, c: 9 },
  // Down Leg (towards South)
  // Starts at c=8, r=9.
  { r: 9, c: 8 }, { r: 10, c: 8 }, { r: 11, c: 8 }, { r: 12, c: 8 }, { r: 13, c: 8 }, { r: 14, c: 8 },
  // South Turn
  { r: 14, c: 7 }, { r: 14, c: 6 },
  // Up Leg (towards Red Start)
  // Starts at r=13. Stops at r=9. (r=8 is invalid center).
  { r: 13, c: 6 }, { r: 12, c: 6 }, { r: 11, c: 6 }, { r: 10, c: 6 }, { r: 9, c: 6 },
  // Left Leg (towards West)
  // Starts at r=8, c=5.
  { r: 8, c: 5 }, { r: 8, c: 4 }, { r: 8, c: 3 }, { r: 8, c: 2 }, { r: 8, c: 1 }, { r: 8, c: 0 },
  // West Turn
  { r: 7, c: 0 }, { r: 6, c: 0 }
];

// Home Paths (5 steps leading to center)
export const HOME_PATHS: Record<PlayerColor, Coord[]> = {
  blue: [{ r: 7, c: 1 }, { r: 7, c: 2 }, { r: 7, c: 3 }, { r: 7, c: 4 }, { r: 7, c: 5 }, { r: 7, c: 6 }],
  yellow: [{ r: 1, c: 7 }, { r: 2, c: 7 }, { r: 3, c: 7 }, { r: 4, c: 7 }, { r: 5, c: 7 }, { r: 6, c: 7 }],
  green: [{ r: 7, c: 13 }, { r: 7, c: 12 }, { r: 7, c: 11 }, { r: 7, c: 10 }, { r: 7, c: 9 }, { r: 7, c: 8 }],
  red: [{ r: 13, c: 7 }, { r: 12, c: 7 }, { r: 11, c: 7 }, { r: 10, c: 7 }, { r: 9, c: 7 }, { r: 8, c: 7 }]
};

// Start Offsets in MAIN_PATH
// Blue = 0.
// Yellow = 13.
// Green = 26.
// Red = 39.
export const PLAYER_START_OFFSET: Record<PlayerColor, number> = {
  blue: 0,
  yellow: 13,
  green: 26,
  red: 39
};

// Safe Zones (Indices in MAIN_PATH where capture is disabled)
// 0, 8, 13, 21, 26, 34, 39, 47
export const SAFE_ZONES = [0, 8, 13, 21, 26, 34, 39, 47];

// Base Positions (Abstracted here for reference, but usually layout driven)
export const BASE_POS: Record<PlayerColor, Coord[]> = {
  blue: [{ r: 1, c: 1 }, { r: 1, c: 4 }, { r: 4, c: 1 }, { r: 4, c: 4 }],     // TL
  yellow: [{ r: 1, c: 10 }, { r: 1, c: 13 }, { r: 4, c: 10 }, { r: 4, c: 13 }], // TR
  green: [{ r: 10, c: 10 }, { r: 10, c: 13 }, { r: 13, c: 10 }, { r: 13, c: 13 }], // BR
  red: [{ r: 10, c: 1 }, { r: 10, c: 4 }, { r: 13, c: 1 }, { r: 13, c: 4 }]    // BL
};
