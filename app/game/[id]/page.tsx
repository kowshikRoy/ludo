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
      <div className="flex flex-col items-center justify-center min-h-screen bg-background-dark p-6 relative overflow-hidden">
        {/* Background Ambient Effects */}
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-[128px] pointer-events-none"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-[128px] pointer-events-none"></div>

        {/* Main Content Card */}
        <div className="w-full max-w-lg z-10 flex flex-col gap-6">
          <div className="text-center mb-4">
            <h2 className="text-4xl font-bold text-white mb-2 tracking-tight">Game Lobby</h2>
            <p className="text-secondary">Waiting for players to join...</p>
          </div>

          {/* Room Code Card */}
          <div className="bg-surface-dark border border-surface-variant rounded-2xl p-6 shadow-xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
              <span className="material-symbols-outlined text-8xl text-white">vpn_key</span>
            </div>
            <p className="text-xs font-bold text-secondary uppercase tracking-widest mb-2">Room Code</p>
            <div className="flex items-center gap-3">
              <code className="text-3xl font-mono font-bold text-white tracking-widest">{gameId}</code>
              <button
                onClick={() => navigator.clipboard.writeText(gameId)}
                className="size-10 rounded-xl bg-surface-variant hover:bg-primary text-white flex items-center justify-center transition-all active:scale-95 ml-auto z-10"
                title="Copy Code"
              >
                <span className="material-symbols-outlined">content_copy</span>
              </button>
            </div>
            <p className="text-xs text-secondary/60 mt-4 flex items-center gap-1">
              <span className="material-symbols-outlined text-sm">info</span>
              Share this code with your friends to invite them.
            </p>
          </div>

          {/* Players List */}
          <div className="bg-surface-dark border border-surface-variant rounded-2xl overflow-hidden shadow-xl flex flex-col">
            <div className="p-4 border-b border-surface-variant flex items-center justify-between bg-surface-variant/10">
              <h3 className="font-bold text-white flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">group</span>
                Players ({players.length}/4)
              </h3>
              {canStart ? (
                <span className="text-xs font-bold text-green-400 bg-green-500/10 px-2 py-1 rounded-lg border border-green-500/20">Ready to Start</span>
              ) : (
                <span className="text-xs font-bold text-orange-400 bg-orange-500/10 px-2 py-1 rounded-lg border border-orange-500/20">Waiting...</span>
              )}
            </div>
            <div className="p-2 flex flex-col gap-1">
              {players.map((p, i) => (
                <div key={i} className="flex items-center gap-4 p-3 rounded-xl bg-background-dark/50 border border-surface-variant/50">
                  {/* Avatar Placeholder */}
                  <div className="size-10 rounded-full bg-gradient-to-br from-surface-variant to-background-dark border border-white/10 flex items-center justify-center shadow-inner">
                    <span className="material-symbols-outlined text-white/40 text-lg">person</span>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-bold text-white flex items-center gap-2">
                      {p.name}
                      {p.color === myColor && <span className="text-[10px] bg-primary/20 text-primary px-1.5 py-0.5 rounded border border-primary/20">ME</span>}
                    </p>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <span className={`size-2 rounded-full`} style={{ backgroundColor: `var(--color-${p.color})` }}></span>
                      <span className="text-xs text-secondary capitalize">{p.color} Team</span>
                    </div>
                  </div>
                  <span className="material-symbols-outlined text-green-500 text-lg">check_circle</span>
                </div>
              ))}
              {/* Empty Slots */}
              {Array.from({ length: 4 - players.length }).map((_, i) => (
                <div key={`empty-${i}`} className="flex items-center gap-4 p-3 rounded-xl border border-dashed border-surface-variant/50 opacity-50">
                  <div className="size-10 rounded-full bg-surface-variant/20 border border-white/5 flex items-center justify-center">
                    <span className="material-symbols-outlined text-white/20 text-lg">person_add</span>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-bold text-secondary">Empty Slot</p>
                    <p className="text-xs text-secondary/50">Waiting for player...</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Action Button */}
          {amICreator ? (
            <button
              onClick={() => startGame(gameId)}
              disabled={!canStart}
              className={`w-full h-14 rounded-2xl font-bold text-lg flex items-center justify-center gap-2 shadow-lg transition-all ${canStart
                ? 'bg-primary hover:bg-primary-dark text-white hover:scale-[1.02] active:scale-[0.98] shadow-primary/25'
                : 'bg-surface-variant text-secondary cursor-not-allowed opacity-50'
                }`}
            >
              <span className="material-symbols-outlined fill-1">play_arrow</span>
              Start Game
            </button>
          ) : (
            <div className="w-full h-14 rounded-2xl bg-surface-variant/20 border border-surface-variant flex items-center justify-center gap-3 text-secondary animate-pulse">
              <span className="animate-spin size-5 border-2 border-primary border-t-transparent rounded-full"></span>
              <span className="font-bold">Waiting for host to start...</span>
            </div>
          )}

          <div className="flex justify-center mt-2">
            <button onClick={() => window.history.back()} className="text-sm font-bold text-secondary hover:text-white transition-colors flex items-center gap-1">
              <span className="material-symbols-outlined text-lg">arrow_back</span>
              Leave Lobby
            </button>
          </div>
        </div>
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