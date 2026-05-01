"use client";

import { Suspense, useEffect, useState, useCallback, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

function LobbyContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [token, setToken] = useState<string | null>(null);
  const [status, setStatus] = useState<'idle' | 'searching' | 'waiting'>('idle');
  const [error, setError] = useState<string | null>(null);
  const [checking, setChecking] = useState(true);
  const [joinCode, setJoinCode] = useState('');
  const [joining, setJoining] = useState(false);
  const [onlineCount, setOnlineCount] = useState<number | null>(null);
  const [waitingRoomCode, setWaitingRoomCode] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [creating, setCreating] = useState(false);

  // Track polling interval for cleanup
  const pollRef = useRef<NodeJS.Timeout | null>(null);

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://api.vayl.in';

  useEffect(() => {
    const urlToken = searchParams.get('token');
    if (urlToken) {
      localStorage.setItem('kv_token', urlToken);
      router.replace('/');
      setToken(urlToken);
      setChecking(false);
    } else {
      const storedToken = localStorage.getItem('kv_token');
      if (storedToken) setToken(storedToken);
      setChecking(false);
    }
  }, [searchParams, router]);

  // Fetch online player count periodically
  const fetchOnlineCount = useCallback(async () => {
    if (!token) return;
    try {
      const res = await fetch(`${apiUrl}/battle/online-count`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setOnlineCount(data.onlinePlayers);
      }
    } catch {
      // Silently fail — this is non-critical
    }
  }, [token, apiUrl]);

  useEffect(() => {
    if (!token) return;
    fetchOnlineCount();
    const interval = setInterval(fetchOnlineCount, 15000);
    return () => clearInterval(interval);
  }, [token, fetchOnlineCount]);

  // Poll waiting room for opponent joining
  const pollForOpponent = useCallback(async (roomCode: string) => {
    if (!token) return;
    try {
      const res = await fetch(`${apiUrl}/battle/${roomCode}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) return;
      const data = await res.json();

      if (data.status === 'active') {
        // Opponent joined! Navigate to room
        if (pollRef.current) clearInterval(pollRef.current);
        router.push(`/${roomCode}`);
      } else if (data.status === 'abandoned') {
        // Room was abandoned
        if (pollRef.current) clearInterval(pollRef.current);
        setStatus('idle');
        setWaitingRoomCode(null);
        setError('Room expired. Try again.');
      }
    } catch {
      // Ignore polling errors
    }
  }, [token, apiUrl, router]);

  // Cleanup polling on unmount
  useEffect(() => {
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, []);

  const handleGoogleLogin = () => {
    window.location.href = `${apiUrl}/auth/google?origin=battle`;
  };

  const findMatch = async () => {
    if (!token) return;
    setStatus('searching');
    setError(null);
    try {
      const res = await fetch(`${apiUrl}/battle/queue`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to queue');

      if (data.status === 'active') {
        // Instantly matched with someone!
        router.push(`/${data.roomCode}`);
      } else if (data.status === 'waiting') {
        // Created a waiting room — start polling
        setStatus('waiting');
        setWaitingRoomCode(data.roomCode);
        pollRef.current = setInterval(() => pollForOpponent(data.roomCode), 3000);
      }
    } catch (err: any) {
      setError(err.message);
      setStatus('idle');
    }
  };

  const cancelSearch = async () => {
    if (!token || !waitingRoomCode) return;
    if (pollRef.current) clearInterval(pollRef.current);

    try {
      await fetch(`${apiUrl}/battle/cancel`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ roomCode: waitingRoomCode })
      });
    } catch {
      // Best effort
    }
    setStatus('idle');
    setWaitingRoomCode(null);
  };

  const createRoom = async () => {
    if (!token) return;
    setCreating(true);
    setError(null);
    try {
      const res = await fetch(`${apiUrl}/battle/create`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to create room');

      if (data.roomCode) {
        router.push(`/${data.roomCode}`);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setCreating(false);
    }
  };

  const joinRoom = async () => {
    if (!token || !joinCode.trim()) return;
    setJoining(true);
    setError(null);
    try {
      const res = await fetch(`${apiUrl}/battle/join`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ roomCode: joinCode.trim().toUpperCase() })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to join');
      if (data.roomCode) {
        router.push(`/${data.roomCode}`);
      }
    } catch (err: any) {
      setError(err.message);
      setJoining(false);
    }
  };

  const copyCode = () => {
    if (!waitingRoomCode) return;
    navigator.clipboard.writeText(waitingRoomCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (checking) {
    return (
      <div className="max-w-md w-full flex items-center justify-center py-16">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  return (
    <div className="max-w-md w-full space-y-6">
      {/* Hero Card */}
      <div className="bg-[#16191f] rounded-2xl border border-white/5 p-8 text-center space-y-4 shadow-2xl">
        <div className="text-5xl mb-2">⚔️</div>
        <h1 className="text-4xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-500">
          JEE Battle
        </h1>
        <p className="text-gray-400 text-sm">Compete head-to-head. Prove your speed and accuracy.</p>

        {/* Online indicator */}
        {token && onlineCount !== null && (
          <div className="flex items-center justify-center gap-2 pt-1">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
            </span>
            <span className="text-xs text-emerald-400/80 font-medium">
              {onlineCount} player{onlineCount !== 1 ? 's' : ''} online
            </span>
          </div>
        )}
      </div>

      {!token ? (
        /* Not logged in */
        <div className="bg-[#16191f] rounded-2xl border border-white/5 p-8 text-center space-y-4 shadow-2xl">
          <p className="text-gray-500 text-sm">Sign in to start battling</p>
          <button
            onClick={handleGoogleLogin}
            className="w-full py-4 rounded-xl font-bold text-base transition-all duration-300
              bg-white text-gray-800 hover:bg-gray-100 shadow-lg hover:shadow-xl active:scale-[0.98]
              flex items-center justify-center gap-3"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18A10.96 10.96 0 0 0 1 12c0 1.77.42 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            Continue with Google
          </button>
          <p className="text-gray-600 text-xs">New here? We'll create your account automatically.</p>
        </div>
      ) : status === 'waiting' && waitingRoomCode ? (
        /* Waiting for opponent — inline waiting UI */
        <div className="bg-[#16191f] rounded-2xl border border-white/5 p-8 text-center space-y-6 shadow-2xl">
          <div className="animate-pulse">
            <div className="flex justify-center mb-4">
              <div className="relative">
                <div className="w-16 h-16 rounded-full border-4 border-indigo-500/30 flex items-center justify-center">
                  <svg className="animate-spin h-8 w-8 text-indigo-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                </div>
              </div>
            </div>
            <h2 className="text-xl font-bold text-white">Searching for opponent...</h2>
            <p className="text-gray-500 text-sm mt-1">This may take a moment</p>
          </div>

          <div className="space-y-3">
            <p className="text-gray-400 text-xs">Or share this code with a friend:</p>
            <button
              onClick={copyCode}
              className="inline-flex items-center gap-3 px-5 py-3 bg-black/40 rounded-xl border border-white/10 
                hover:border-indigo-500/50 transition-all group cursor-pointer"
            >
              <span className="text-2xl font-mono font-black tracking-[0.3em] text-indigo-400">
                {waitingRoomCode}
              </span>
              <span className="text-xs text-gray-500 group-hover:text-indigo-400 transition-colors">
                {copied ? '✓ Copied!' : '📋 Copy'}
              </span>
            </button>
          </div>

          <button
            onClick={cancelSearch}
            className="text-red-400/60 hover:text-red-400 text-sm transition-colors font-medium"
          >
            ✕ Cancel Search
          </button>
        </div>
      ) : (
        <>
          {error && (
            <div className="bg-red-500/10 text-red-400 p-4 rounded-xl text-sm border border-red-500/20 text-center">
              {error}
            </div>
          )}

          {/* Find Random Match */}
          <div className="bg-[#16191f] rounded-2xl border border-white/5 p-6 shadow-2xl">
            <button
              onClick={findMatch}
              disabled={status === 'searching'}
              className="w-full py-4 rounded-xl font-bold text-lg transition-all duration-300 disabled:opacity-50
                bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 
                shadow-[0_0_20px_rgba(79,70,229,0.3)] hover:shadow-[0_0_30px_rgba(79,70,229,0.5)] active:scale-[0.98]"
            >
              {status === 'searching' ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Finding Opponent...
                </span>
              ) : '⚔️ Find Opponent'}
            </button>
          </div>

          {/* Create Custom Room */}
          <div className="bg-[#16191f] rounded-2xl border border-white/5 p-6 shadow-2xl space-y-3">
            <button
              onClick={createRoom}
              disabled={creating}
              className="w-full py-4 rounded-xl font-bold text-lg transition-all duration-300 disabled:opacity-50
                bg-gradient-to-r from-emerald-600/80 to-teal-600/80 hover:from-emerald-500/80 hover:to-teal-500/80
                shadow-[0_0_20px_rgba(16,185,129,0.15)] hover:shadow-[0_0_30px_rgba(16,185,129,0.3)] active:scale-[0.98]
                border border-emerald-500/20"
            >
              {creating ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Creating Room...
                </span>
              ) : '🏠 Create Custom Room'}
            </button>
            <p className="text-gray-500 text-xs text-center">Create a private room and share the code with a friend</p>
          </div>

          {/* Divider */}
          <div className="flex items-center gap-4">
            <div className="flex-1 h-px bg-white/10"></div>
            <span className="text-xs text-gray-500 uppercase tracking-widest font-bold">or join</span>
            <div className="flex-1 h-px bg-white/10"></div>
          </div>

          {/* Join by Code */}
          <div className="bg-[#16191f] rounded-2xl border border-white/5 p-6 shadow-2xl space-y-4">
            <p className="text-sm text-gray-400 text-center font-medium">Join a friend&apos;s room</p>
            <div className="flex gap-3">
              <input
                type="text"
                maxLength={5}
                value={joinCode}
                onChange={(e) => setJoinCode(e.target.value.toUpperCase().replace(/[^A-Z]/g, ''))}
                placeholder="ABCDE"
                className="flex-1 bg-black/30 border border-white/10 rounded-xl px-4 py-3 text-center text-2xl 
                  font-mono tracking-[0.3em] placeholder:text-gray-700 placeholder:tracking-[0.3em]
                  focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/30 transition-all"
              />
              <button
                onClick={joinRoom}
                disabled={joinCode.length !== 5 || joining}
                className="px-6 py-3 rounded-xl font-bold transition-all duration-200 disabled:opacity-30
                  bg-white/10 hover:bg-white/20 border border-white/10 active:scale-[0.97]"
              >
                {joining ? '...' : 'Join'}
              </button>
            </div>
          </div>

          {/* Sign out */}
          <div className="text-center">
            <button
              onClick={() => { localStorage.removeItem('kv_token'); setToken(null); }}
              className="text-gray-600 hover:text-gray-400 text-xs transition-colors"
            >
              Sign out
            </button>
          </div>
        </>
      )}
    </div>
  );
}

export default function LobbyPage() {
  return (
    <div className="min-h-screen bg-[#0f1115] text-white flex flex-col items-center justify-center p-4">
      <Suspense fallback={<div className="animate-pulse w-full max-w-md h-64 bg-[#16191f] rounded-2xl"></div>}>
        <LobbyContent />
      </Suspense>
    </div>
  );
}
