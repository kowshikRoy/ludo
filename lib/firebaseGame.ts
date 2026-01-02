import { ref, set, get, onValue, update, push, child, DatabaseReference, DataSnapshot } from "firebase/database";
import { db } from "./firebase";
import { PawnState } from "./gameLogic";
import { PlayerColor } from "./ludoConstants";

export interface GameState {
  roomId: string;
  players: {
    [uid: string]: {
      color: PlayerColor;
      name: string;
      ready: boolean;
    };
  };
  turn: PlayerColor;
  diceValue: number;
  rolling: boolean;
  pawns: PawnState[];
  awaitingMove: boolean;
  lastUpdated: number;
  status: 'waiting' | 'playing' | 'finished';
  winner?: PlayerColor;
}

export const createRoom = async (playerName: string, uid: string): Promise<string | null> => {
  if (!db) return null;

  const roomsRef = ref(db, 'rooms');
  const newRoomRef = push(roomsRef);
  const roomId = newRoomRef.key;

  if (!roomId) return null;

  const initialPawns: PawnState[] = [
    ...[0, 1, 2, 3].map(i => ({ id: i, color: 'blue' as const, pos: 'base' as const, pathIndex: -1 })),
    ...[0, 1, 2, 3].map(i => ({ id: i + 4, color: 'yellow' as const, pos: 'base' as const, pathIndex: -1 })),
    ...[0, 1, 2, 3].map(i => ({ id: i + 8, color: 'green' as const, pos: 'base' as const, pathIndex: -1 })),
    ...[0, 1, 2, 3].map(i => ({ id: i + 12, color: 'red' as const, pos: 'base' as const, pathIndex: -1 })),
  ];

  const initialState: GameState = {
    roomId,
    players: {
      [uid]: {
        color: 'blue', // Creator is blue
        name: playerName,
        ready: true
      }
    },
    turn: 'blue',
    diceValue: 1,
    rolling: false,
    pawns: initialPawns,
    awaitingMove: false,
    lastUpdated: Date.now(),
    status: 'waiting'
  };

  await set(newRoomRef, initialState);
  return roomId;
};

export const joinRoom = async (roomId: string, playerName: string, uid: string): Promise<{ success: boolean; message?: string }> => {
  if (!db) return { success: false, message: "Database not initialized" };

  const roomRef = ref(db, `rooms/${roomId}`);
  const snapshot = await get(roomRef);

  if (!snapshot.exists()) {
    return { success: false, message: "Room not found" };
  }

  const roomData = snapshot.val() as GameState;

  if (roomData.status !== 'waiting') {
    return { success: false, message: "Game already started" };
  }

  const existingColors = Object.values(roomData.players || {}).map(p => p.color);

  // For 2-player games, assign opposite colors
  // Blue <-> Green (vertical opposite)
  // Yellow <-> Red (vertical opposite)
  let nextColor: PlayerColor | undefined;

  if (existingColors.length === 1) {
    // Second player joins - assign opposite color
    const firstColor = existingColors[0];
    const oppositeMap: Record<PlayerColor, PlayerColor> = {
      'blue': 'green',
      'green': 'blue',
      'yellow': 'red',
      'red': 'yellow'
    };
    nextColor = oppositeMap[firstColor];
  } else if (existingColors.length === 2) {
    // Third player joins - assign from remaining colors
    const availableColors: PlayerColor[] = ['blue', 'yellow', 'green', 'red'];
    nextColor = availableColors.find(c => !existingColors.includes(c));
  } else if (existingColors.length === 3) {
    // Fourth player joins
    const availableColors: PlayerColor[] = ['blue', 'yellow', 'green', 'red'];
    nextColor = availableColors.find(c => !existingColors.includes(c));
  }

  if (!nextColor) {
    return { success: false, message: "Room is full" };
  }

  // Add player
  await update(ref(db, `rooms/${roomId}/players/${uid}`), {
    color: nextColor,
    name: playerName,
    ready: true
  });

  return { success: true };
};

export const subscribeToRoom = (roomId: string, callback: (data: GameState) => void) => {
  if (!db) return () => { };

  const roomRef = ref(db, `rooms/${roomId}`);
  const unsubscribe = onValue(roomRef, (snapshot) => {
    const data = snapshot.val();
    if (data) {
      callback(data);
    }
  });

  return unsubscribe;
};

export const updateGameState = async (roomId: string, updates: Partial<GameState>) => {
  if (!db) return;
  const roomRef = ref(db, `rooms/${roomId}`);
  await update(roomRef, { ...updates, lastUpdated: Date.now() });
};

export const startGame = async (roomId: string) => {
  if (!db) return;
  await update(ref(db, `rooms/${roomId}`), { status: 'playing' });
};

// ============ LOBBY MATCHMAKING FUNCTIONS ============

export interface LobbyPlayer {
  name: string;
  joinedAt: number;
  status: 'waiting' | 'matched';
  roomId?: string;
}

/**
 * Join the matchmaking lobby
 */
export const joinLobby = async (playerName: string, uid: string): Promise<boolean> => {
  if (!db) return false;

  const lobbyPlayerRef = ref(db, `lobby/${uid}`);

  await set(lobbyPlayerRef, {
    name: playerName,
    joinedAt: Date.now(),
    status: 'waiting'
  });

  // Trigger matchmaking process
  await processMatchmaking();

  return true;
};

/**
 * Leave the matchmaking lobby
 */
export const leaveLobby = async (uid: string): Promise<void> => {
  if (!db) return;

  const lobbyPlayerRef = ref(db, `lobby/${uid}`);
  await set(lobbyPlayerRef, null); // Remove player from lobby
};

/**
 * Subscribe to lobby status updates for a specific player
 */
export const subscribeToLobbyStatus = (
  uid: string,
  callback: (data: LobbyPlayer | null) => void
) => {
  if (!db) return () => { };

  const lobbyPlayerRef = ref(db, `lobby/${uid}`);
  const unsubscribe = onValue(lobbyPlayerRef, (snapshot) => {
    const data = snapshot.val();
    callback(data);
  });

  return unsubscribe;
};

/**
 * Process matchmaking - check for available players and create games
 * This function is called whenever a player joins the lobby
 */
export const processMatchmaking = async (): Promise<void> => {
  if (!db) return;

  const lobbyRef = ref(db, 'lobby');
  const snapshot = await get(lobbyRef);

  if (!snapshot.exists()) return;

  const lobbyData = snapshot.val() as { [uid: string]: LobbyPlayer };

  // Get all waiting players sorted by join time
  const waitingPlayers = Object.entries(lobbyData)
    .filter(([_, player]) => player.status === 'waiting')
    .sort(([_, a], [__, b]) => a.joinedAt - b.joinedAt);

  if (waitingPlayers.length < 2) {
    // Not enough players to create a game
    return;
  }

  // Determine how many players to match
  let playersToMatch: [string, LobbyPlayer][] = [];

  if (waitingPlayers.length >= 4) {
    // Create a 4-player game
    playersToMatch = waitingPlayers.slice(0, 4);
  } else if (waitingPlayers.length >= 2) {
    // Create a 2-player game
    playersToMatch = waitingPlayers.slice(0, 2);
  }

  if (playersToMatch.length === 0) return;

  // Create a new room for matched players
  const roomsRef = ref(db, 'rooms');
  const newRoomRef = push(roomsRef);
  const roomId = newRoomRef.key;

  if (!roomId) return;

  // Initialize pawns for all colors
  const initialPawns: PawnState[] = [
    ...[0, 1, 2, 3].map(i => ({ id: i, color: 'blue' as const, pos: 'base' as const, pathIndex: -1 })),
    ...[0, 1, 2, 3].map(i => ({ id: i + 4, color: 'yellow' as const, pos: 'base' as const, pathIndex: -1 })),
    ...[0, 1, 2, 3].map(i => ({ id: i + 8, color: 'green' as const, pos: 'base' as const, pathIndex: -1 })),
    ...[0, 1, 2, 3].map(i => ({ id: i + 12, color: 'red' as const, pos: 'base' as const, pathIndex: -1 })),
  ];

  // Assign colors to matched players
  const colors: PlayerColor[] = ['blue', 'yellow', 'green', 'red'];
  const players: GameState['players'] = {};

  // For 2-player games, use opposite colors
  if (playersToMatch.length === 2) {
    const oppositeColorPairs: [PlayerColor, PlayerColor][] = [
      ['blue', 'green'],
      ['yellow', 'red']
    ];
    const [color1, color2] = oppositeColorPairs[0]; // Use blue-green pair

    players[playersToMatch[0][0]] = {
      color: color1,
      name: playersToMatch[0][1].name,
      ready: true
    };
    players[playersToMatch[1][0]] = {
      color: color2,
      name: playersToMatch[1][1].name,
      ready: true
    };
  } else {
    // 4-player game - assign all colors
    playersToMatch.forEach(([uid, player], index) => {
      players[uid] = {
        color: colors[index],
        name: player.name,
        ready: true
      };
    });
  }

  // Create the game state
  const initialState: GameState = {
    roomId,
    players,
    turn: 'blue',
    diceValue: 1,
    rolling: false,
    pawns: initialPawns,
    awaitingMove: false,
    lastUpdated: Date.now(),
    status: 'playing' // Start game immediately
  };

  await set(newRoomRef, initialState);

  // Update lobby status for matched players
  const updates: { [key: string]: any } = {};
  playersToMatch.forEach(([uid, _]) => {
    updates[`lobby/${uid}/status`] = 'matched';
    updates[`lobby/${uid}/roomId`] = roomId;
  });

  await update(ref(db), updates);

  // Clean up matched players from lobby after a short delay
  setTimeout(async () => {
    const cleanupUpdates: { [key: string]: null } = {};
    playersToMatch.forEach(([uid, _]) => {
      cleanupUpdates[`lobby/${uid}`] = null;
    });
    await update(ref(db), cleanupUpdates);
  }, 2000); // 2 second delay to allow clients to read the roomId
};

