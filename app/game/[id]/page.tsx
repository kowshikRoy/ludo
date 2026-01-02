"use client";
import { useParams } from 'next/navigation';
import Board from '@/components/Board';
import { useOnlineGame } from '@/hooks/useOnlineGame';
import { startGame } from '@/lib/firebaseGame';
import { useEffect, useState } from 'react';

export default function GamePage() {
  const params = useParams();
  const gameId = params.id as string;
  const [uid, setUid] = useState('');

  useEffect(() => {
    console.log('GamePage mounted, ID:', gameId);
    const storedUid = localStorage.getItem('ludo_uid');
    if (storedUid) setUid(storedUid);
  }, [gameId]);

  const { gameState, loading, myColor, isMyTurn, handleRoll, handleMove } = useOnlineGame(gameId, uid);

  if (loading || !gameState) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <p>Loading Room: {gameId}...</p>
      </div>
    );
  }

  if (gameState.status === 'waiting') {
    const players = Object.values(gameState.players || {});
    const amICreator = myColor === 'blue';
    const canStart = players.length >= 2;

    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-6 p-4">
        <h2 className="text-3xl font-bold">Lobby: {gameId}</h2>
        <div className="bg-gray-100 p-6 rounded shadow-md w-full max-w-md">
          <h3 className="font-bold text-lg mb-4">Players Joined: {players.length}/4</h3>
          <ul className="space-y-2">
            {players.map((p, i) => (
              <li key={i} className="flex items-center gap-2">
                <span
                  className="w-4 h-4 rounded-full"
                  style={{ backgroundColor: `var(--color-${p.color})` }}
                />
                <span className="font-medium">{p.name}</span>
                {p.color === myColor && <span className="text-sm text-gray-500">(You)</span>}
              </li>
            ))}
          </ul>
          {!canStart && (
            <p className="text-sm text-orange-600 mt-4 font-medium">
              ⚠️ Minimum 2 players required to start
            </p>
          )}
        </div>

        <div className="flex flex-col items-center gap-2">
          <p className="text-sm text-gray-600">Share the Room ID to invite friends!</p>
          <div className="flex gap-2">
            <code className="bg-gray-200 p-2 rounded">{gameId}</code>
            <button
              onClick={() => navigator.clipboard.writeText(gameId)}
              className="text-blue-500 hover:underline"
            >
              Copy
            </button>
          </div>
        </div>

        {amICreator && (
          <button
            onClick={() => startGame(gameId)}
            disabled={!canStart}
            className={`px-8 py-3 rounded text-xl font-bold ${canStart
              ? 'bg-green-500 text-white hover:bg-green-600'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
          >
            Start Game
          </button>
        )}
        {!amICreator && (
          <p className="text-gray-500 italic">Waiting for host to start...</p>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-8 p-6 min-h-screen justify-center w-full max-w-[1200px] mx-auto overflow-hidden">

      {/* MD3 Center-aligned Top App Bar */}
      <header className="fixed top-0 left-0 right-0 h-16 flex items-center justify-between px-6 bg-transparent z-[1000]">
        <div className="flex items-center gap-3">
          <button
            className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-white/10 active:bg-white/20 transition-colors"
            title="Go back"
            onClick={() => window.history.back()}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z" /></svg>
          </button>
          <div className="flex flex-col">
            <h2 className="text-xl font-semibold tracking-tight">Room</h2>
            <span className="text-xs font-mono opacity-60">{gameId}</span>
          </div>
        </div>

        <div className="flex items-center gap-2 bg-white/5 pr-2 pl-4 py-1.5 rounded-full border border-white/10 hover:bg-white/10 transition-colors cursor-pointer" onClick={() => navigator.clipboard.writeText(gameId)}>
          <span className="text-xs font-medium uppercase tracking-wider opacity-80">Copy Link</span>
          <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z" /></svg>
          </div>
        </div>
      </header>

      <Board
        diceValue={gameState.diceValue}
        rolling={gameState.rolling}
        turn={gameState.turn}
        pawns={gameState.pawns}
        onRoll={handleRoll}
        onPawnClick={handleMove}
        players={Object.values(gameState.players || {}).map(p => ({
          name: p.name,
          color: p.color
        }))}
        activeColors={Object.values(gameState.players || {}).map(p => p.color)}
      />

      {/* MD3 Status Banner */}
      <div className="fixed top-20 left-1/2 -translate-x-1/2 z-[1000]">
        {isMyTurn ? (
          <div className="flex items-center gap-4 px-6 py-3 rounded-2xl bg-green-500 text-white shadow-lg animate-in fade-in slide-in-from-top-2 duration-500">
            <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center animate-bounce">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z" /></svg>
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-bold uppercase tracking-tight">Your Turn</span>
              <span className="text-xs opacity-90">Roll the dice to move</span>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-4 px-6 py-3 rounded-2xl bg-white/10 backdrop-blur-md border border-white/10 text-white/80">
            <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center">
              <div className="w-2 h-2 rounded-full bg-white animate-ping" />
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-medium">Waiting for <span className="capitalize" style={{ color: `var(--color-${gameState.turn})` }}>{gameState.turn}</span></span>
              <span className="text-[10px] uppercase tracking-widest opacity-40">Opponent Thinking</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}