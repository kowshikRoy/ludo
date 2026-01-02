"use client";
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { joinLobby, leaveLobby, subscribeToLobbyStatus, LobbyPlayer } from '@/lib/firebaseGame';

interface LobbyQueueProps {
  playerName: string;
  uid: string;
}

export default function LobbyQueue({ playerName, uid }: LobbyQueueProps) {
  const router = useRouter();
  const [lobbyStatus, setLobbyStatus] = useState<LobbyPlayer | null>(null);
  const [isJoining, setIsJoining] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let unsubscribe: (() => void) | undefined;

    const initializeLobby = async () => {
      try {
        // Join the lobby
        const success = await joinLobby(playerName, uid);

        if (!success) {
          setError('Failed to join lobby. Please check your connection.');
          setIsJoining(false);
          return;
        }

        setIsJoining(false);

        // Subscribe to lobby status updates
        unsubscribe = subscribeToLobbyStatus(uid, (data) => {
          setLobbyStatus(data);

          // If matched, redirect to game room
          if (data?.status === 'matched' && data.roomId) {
            router.push(`/game/${data.roomId}`);
          }
        });
      } catch (err) {
        console.error('Error joining lobby:', err);
        setError('Failed to join lobby');
        setIsJoining(false);
      }
    };

    initializeLobby();

    // Cleanup on unmount
    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [playerName, uid, router]);

  const handleLeaveQueue = async () => {
    try {
      await leaveLobby(uid);
      router.push('/');
    } catch (err) {
      console.error('Error leaving lobby:', err);
      setError('Failed to leave lobby');
    }
  };

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4 p-4">
        <div className="bg-red-100 text-red-700 p-4 rounded-lg">
          {error}
        </div>
        <button
          onClick={() => router.push('/')}
          className="bg-blue-500 text-white px-6 py-2 rounded hover:bg-blue-600"
        >
          Back to Home
        </button>
      </div>
    );
  }

  if (isJoining) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        <p className="text-lg">Joining lobby...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-8 p-4">
      <h1 className="text-4xl font-bold">Quick Match</h1>

      <div className="flex flex-col items-center gap-6 w-full max-w-md">
        {lobbyStatus?.status === 'waiting' && (
          <>
            <div className="flex flex-col items-center gap-4">
              <div className="relative">
                <div className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></div>
                <div className="relative inline-flex rounded-full h-16 w-16 bg-blue-500 items-center justify-center">
                  <svg
                    className="animate-spin h-8 w-8 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                </div>
              </div>

              <div className="text-center">
                <p className="text-2xl font-semibold text-blue-600 animate-pulse">
                  Looking for players...
                </p>
                <p className="text-gray-600 mt-2">
                  Waiting for opponents to join
                </p>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 w-full">
              <p className="text-sm text-gray-700 text-center">
                <span className="font-semibold">Player:</span> {playerName}
              </p>
              <p className="text-xs text-gray-500 text-center mt-2">
                You'll be matched with 1 or 3 other players
              </p>
            </div>

            <button
              onClick={handleLeaveQueue}
              className="bg-red-500 text-white px-8 py-3 rounded-lg hover:bg-red-600 font-semibold transition-colors"
            >
              Leave Queue
            </button>
          </>
        )}

        {lobbyStatus?.status === 'matched' && (
          <div className="flex flex-col items-center gap-4">
            <div className="text-green-500 text-6xl">✓</div>
            <p className="text-2xl font-semibold text-green-600">
              Match Found!
            </p>
            <p className="text-gray-600">Redirecting to game...</p>
          </div>
        )}
      </div>
    </div>
  );
}
