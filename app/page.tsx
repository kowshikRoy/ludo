"use client";
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createRoom, joinRoom } from '@/lib/firebaseGame';

export default function Lobby() {
  const router = useRouter();
  const [gameIdInput, setGameIdInput] = useState('');
  const [playerName, setPlayerName] = useState('');
  const [uid, setUid] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    // Simple UID generation or retrieval
    let storedUid = localStorage.getItem('ludo_uid');
    if (!storedUid) {
      storedUid = 'user_' + Math.random().toString(36).substr(2, 9);
      localStorage.setItem('ludo_uid', storedUid);
    }
    setUid(storedUid);

    const storedName = localStorage.getItem('ludo_name');
    if (storedName) setPlayerName(storedName);
  }, []);

  const handleCreateGame = async () => {
    if (!playerName.trim()) {
      setError('Please enter your name');
      return;
    }
    localStorage.setItem('ludo_name', playerName);

    try {
      const roomId = await createRoom(playerName, uid);
      console.log('Created room:', roomId); // Debugging
      if (roomId) {
        // Use window.location to force a hard navigation, avoiding potential client-side router 404s on new routes
        window.location.href = `/game/${roomId}`;
      } else {
        setError('Failed to create room. Check Firebase config.');
      }
    } catch (err) {
      console.error(err);
      setError('Error creating room');
    }
  };

  const handleJoinGame = async () => {
    if (!gameIdInput.trim()) {
      setError('Please enter Game ID');
      return;
    }
    if (!playerName.trim()) {
      setError('Please enter your name');
      return;
    }
    localStorage.setItem('ludo_name', playerName);

    try {
      const result = await joinRoom(gameIdInput, playerName, uid);
      if (result.success) {
        router.push(`/game/${gameIdInput}`);
      } else {
        setError(result.message || 'Failed to join room');
      }
    } catch (err) {
      console.error(err);
      setError('Error joining room');
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-8 p-4">
      <h1 className="text-4xl font-bold">Ludo Multiplayer</h1>

      <div className="flex flex-col gap-4 w-full max-w-md">
        {error && <div className="bg-red-100 text-red-700 p-2 rounded">{error}</div>}

        <div>
          <label className="block text-sm font-bold mb-1">Your Name</label>
          <input
            value={playerName}
            onChange={(e) => setPlayerName(e.target.value)}
            placeholder="Enter your name"
            className="border p-2 w-full rounded"
          />
        </div>

        <button
          onClick={() => router.push('/lobby')}
          className="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-4 rounded-lg hover:from-blue-600 hover:to-purple-700 font-bold text-xl shadow-lg transform transition-all hover:scale-105"
        >
          🎮 Quick Match
        </button>

        <button
          onClick={handleCreateGame}
          className="bg-blue-500 text-white p-4 rounded hover:bg-blue-600 font-bold text-xl mt-4"
        >
          Create New Room
        </button>

        <button
          onClick={() => router.push('/local')}
          className="bg-yellow-500 text-white p-4 rounded hover:bg-yellow-600 font-bold text-xl"
        >
          Play Locally
        </button>

        <div className="border-t border-gray-300 my-4 relative">
          <span className="absolute top-[-12px] left-1/2 -translate-x-1/2 bg-white px-2 text-gray-500">OR</span>
        </div>

        <div className="flex flex-col gap-2">
          <label className="block text-sm font-bold">Join Existing Game</label>
          <div className="flex gap-2">
            <input
              value={gameIdInput}
              onChange={(e) => setGameIdInput(e.target.value)}
              placeholder="Enter Game ID"
              className="border p-2 flex-grow rounded"
            />
            <button
              onClick={handleJoinGame}
              className="bg-green-500 text-white p-2 rounded hover:bg-green-600 px-6 font-bold"
            >
              Join
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
