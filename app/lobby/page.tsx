"use client";
import { useState, useEffect } from 'react';
import LobbyQueue from '@/components/LobbyQueue';

export default function LobbyPage() {
  const [playerName, setPlayerName] = useState('');
  const [uid, setUid] = useState('');
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // Get or create UID
    let storedUid = localStorage.getItem('ludo_uid');
    if (!storedUid) {
      storedUid = 'user_' + Math.random().toString(36).substr(2, 9);
      localStorage.setItem('ludo_uid', storedUid);
    }
    setUid(storedUid);

    // Get stored name
    const storedName = localStorage.getItem('ludo_name');
    if (storedName) {
      setPlayerName(storedName);
      setIsReady(true);
    }
  }, []);

  if (!isReady || !playerName) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return <LobbyQueue playerName={playerName} uid={uid} />;
}
