"use client";

import { Suspense, useEffect, useState, useCallback, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';

/** Parse user ID from a JWT token (no verification — just decode payload) */
function getUserIdFromToken(token: string): string | null {
  try {
    const payloadPart = token.split('.')[1];
    if (!payloadPart) return null;
    const base64 = payloadPart.replace(/-/g, '+').replace(/_/g, '/');
    const padded = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), '=');
    const payload = JSON.parse(atob(padded));
    return payload.id || payload._id || payload.sub || null;
  } catch {
    return null;
  }
}

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
  const [showSoloPrompt, setShowSoloPrompt] = useState(false);

  // Leaderboard state
  type LeaderboardEntry = {
    userId: string;
    name?: string;
    avatar?: string | null;
    points?: number;
    rank?: number;
    gamesPlayed?: number;
    correctAnswers?: number;
    wrongAnswers?: number;
  };
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [lbLoading, setLbLoading] = useState(true);
  const [countdown, setCountdown] = useState('');

  // Track polling interval and bot assignment timer for cleanup
  const pollRef = useRef<NodeJS.Timeout | null>(null);
  const botTimerRef = useRef<NodeJS.Timeout | null>(null);

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://api.vayl.in';

  const clearOpponentPoll = useCallback(() => {
    if (pollRef.current) {
      clearInterval(pollRef.current);
      pollRef.current = null;
    }
    if (botTimerRef.current) {
      clearTimeout(botTimerRef.current);
      botTimerRef.current = null;
    }
  }, []);

  // Decode current user ID from token
  const currentUserId = token ? getUserIdFromToken(token) : null;

  // Fetch leaderboard (public, no auth needed)
  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const res = await fetch(`${apiUrl}/battle/leaderboard`);
        if (res.ok) {
          const data = await res.json();
          // Support both { leaderboard: [] } and direct [] formats for backwards compatibility
          const lbData = Array.isArray(data) ? data : (data.leaderboard || []);
          setLeaderboard(lbData);
        }
      } catch {
        // Non-critical
      } finally {
        setLbLoading(false);
      }
    };
    fetchLeaderboard();
    // Refresh every 30 seconds
    const interval = setInterval(fetchLeaderboard, 30000);
    return () => clearInterval(interval);
  }, [apiUrl]);

  // Countdown to midnight IST
  useEffect(() => {
    const updateCountdown = () => {
      const now = new Date();
      // Get current time in IST
      const istOffset = 5.5 * 60 * 60 * 1000;
      const istNow = new Date(now.getTime() + (now.getTimezoneOffset() * 60000) + istOffset);
      // Next midnight IST
      const nextMidnight = new Date(istNow);
      nextMidnight.setHours(24, 0, 0, 0);
      const diff = nextMidnight.getTime() - istNow.getTime();

      const h = Math.floor(diff / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      const s = Math.floor((diff % 60000) / 1000);
      setCountdown(`${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`);
    };
    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, []);

  // Show Solo Rush prompt after 4 seconds of waiting/searching
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (status === 'waiting' || status === 'searching') {
      timer = setTimeout(() => setShowSoloPrompt(true), 4000);
    } else {
      setShowSoloPrompt(false);
    }
    return () => clearTimeout(timer);
  }, [status]);

  // Auto-assign bot after 6 seconds of waiting with no opponent
  const assignBot = useCallback(async (roomCode: string) => {
    if (!token) return;
    try {
      const res = await fetch(`${apiUrl}/battle/bot/assign`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ roomCode })
      });
      const data = await res.json();
      if (res.ok && data.roomCode) {
        clearOpponentPoll();
        router.push(`/${data.roomCode}`);
      }
    } catch {
      // Silently fail — polling will keep trying for a real opponent
    }
  }, [token, apiUrl, clearOpponentPoll, router]);

  useEffect(() => {
    // Read token from hash fragment first (secure — never sent to server),
    // then fall back to query params (backward compatibility).
    let urlToken: string | null = null;

    if (typeof window !== 'undefined' && window.location.hash) {
      const hashParams = new URLSearchParams(window.location.hash.substring(1));
      urlToken = hashParams.get('token');
    }

    if (!urlToken) {
      urlToken = searchParams.get('token');
    }

    if (urlToken) {
      localStorage.setItem('kv_token', urlToken);
      // Clean token from URL immediately to prevent leaking via history/referrer
      window.history.replaceState({}, '', '/');
    }
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setToken(urlToken || localStorage.getItem('kv_token'));
    setChecking(false);
  }, [searchParams]);

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
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchOnlineCount();
    const interval = setInterval(fetchOnlineCount, 45000); // Increased interval to mitigate DB write amplification
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
        clearOpponentPoll();
        router.push(`/${roomCode}`);
      } else if (data.status === 'abandoned') {
        // Room was abandoned
        clearOpponentPoll();
        setStatus('idle');
        setWaitingRoomCode(null);
        setError('Room expired. Try again.');
      }
    } catch {
      // Ignore polling errors
    }
  }, [token, apiUrl, router, clearOpponentPoll]);

  // Cleanup polling on unmount
  useEffect(() => {
    return () => {
      clearOpponentPoll();
    };
  }, [clearOpponentPoll]);

  const handleGoogleLogin = () => {
    window.location.href = `${apiUrl}/auth/google?origin=battle`;
  };

  const executeSoloRush = async () => {
    setCreating(true);
    setError(null);

    try {
      const res = await fetch(`${apiUrl}/battle/solo/create`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to create solo room');

      router.push(`/${data.roomCode}`);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to create solo room');
      setCreating(false);
    }
  };

  const handleSoloRush = async () => {
    if (!token || creating) return;

    const confirmed = window.confirm(
      "Solo Rush is for practice only. Points earned in this mode will be added to your Solo XP and will NOT count toward the Daily Competitive Leaderboard. Continue?"
    );
    if (!confirmed) return;

    executeSoloRush();
  };

  const onSoloPromptClick = async () => {
    if (!token || creating) return;
    
    const confirmed = window.confirm(
      "Solo Rush is for practice only. Points earned in this mode will be added to your Solo XP and will NOT count toward the Daily Competitive Leaderboard. Continue?"
    );
    if (!confirmed) return;

    if (status === 'waiting') {
      // Cancel the current search without triggering state resets that break flow
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
    }
    
    clearOpponentPoll();
    executeSoloRush();
  };

  const findMatch = async () => {
    if (!token) return;
    clearOpponentPoll();
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
        pollForOpponent(data.roomCode);
        pollRef.current = setInterval(() => pollForOpponent(data.roomCode), 3000);
        // Auto-assign bot after 6 seconds if no real opponent joins
        botTimerRef.current = setTimeout(() => assignBot(data.roomCode), 6000);
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to queue');
      setStatus('idle');
    }
  };

  const cancelSearch = async () => {
    if (!token || !waitingRoomCode) return;
    clearOpponentPoll();

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
    clearOpponentPoll();
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
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to create room');
    } finally {
      setCreating(false);
    }
  };

  const joinRoom = async () => {
    if (!token || !joinCode.trim()) return;
    clearOpponentPoll();
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
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to join');
    } finally {
      setJoining(false);
    }
  };

  const copyCode = () => {
    if (!waitingRoomCode) return;
    navigator.clipboard.writeText(waitingRoomCode).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-7xl w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
      {/* ── Left Column: Actions ── */}
      <div className="lg:col-span-5 space-y-6 lg:sticky lg:top-8">
        {/* Hero Card */}
        <div className="bg-[#16191f] rounded-2xl border border-white/5 p-8 text-center space-y-4 shadow-2xl">
          <div className="text-5xl mb-2">⚔️</div>
          <h1 className="text-4xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-500">
            JEE Battle
          </h1>
          <p className="text-gray-400 text-sm">Compete head-to-head. Prove your speed and accuracy.</p>

          {/* Online indicator */}
          <div className="min-h-[28px]">
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
        </div>

        {checking ? (
          <div className="bg-[#16191f] rounded-2xl border border-white/5 p-8 flex items-center justify-center min-h-[200px] shadow-2xl">
            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-indigo-500"></div>
          </div>
        ) : !token ? (
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
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18A10.96 10.96 0 0 0 1 12c0 1.77.42 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
              </svg>
              Continue with Google
            </button>
            <p className="text-gray-600 text-xs">New here? We&apos;ll create your account automatically.</p>
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

            <div className="min-h-[180px] mt-4 w-full">
              {showSoloPrompt && (
                <div className="bg-amber-500/10 rounded-xl p-5 border border-amber-500/20 space-y-3 text-left animate-in fade-in zoom-in duration-300">
                  <p className="text-sm font-semibold text-amber-400">Can't find an opponent?</p>
                  <p className="text-xs text-amber-400/80 mb-2">You can practice instantly by playing a Solo Rush instead.</p>
                  <button
                    onClick={onSoloPromptClick}
                    disabled={creating}
                    className="w-full py-3 rounded-xl font-bold text-sm transition-all duration-300 disabled:opacity-50
                      bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-400 hover:to-yellow-500 
                      text-black shadow-[0_0_15px_rgba(245,158,11,0.2)] hover:shadow-[0_0_25px_rgba(245,158,11,0.4)] active:scale-[0.98]"
                  >
                    {creating ? 'Creating...' : '⚡ Play Solo Rush'}
                  </button>
                </div>
              )}
            </div>

            <button
              onClick={cancelSearch}
              className="text-red-400/60 hover:text-red-400 text-sm transition-colors font-medium mt-4 inline-block"
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
                ) : '⚔️ Find Opponent (10 Qs)'}
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

            {/* Solo Rush */}
            <div className="bg-[#16191f] rounded-2xl border border-white/5 p-6 shadow-2xl space-y-3">
              <button
                onClick={handleSoloRush}
                disabled={creating}
                className="w-full py-4 rounded-xl font-bold text-lg transition-all duration-300 disabled:opacity-50
                  bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-400 hover:to-yellow-500 
                  text-black shadow-[0_0_20px_rgba(245,158,11,0.2)] hover:shadow-[0_0_30px_rgba(245,158,11,0.4)] active:scale-[0.98]"
              >
                {creating ? 'Creating...' : '⚡ Solo Rush (5 Qs)'}
              </button>
              <p className="text-[10px] text-amber-500/60 text-center font-medium px-4">
                Practice Mode: Points do not count toward the main competitive leaderboard.
              </p>
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

      {/* ── Right Column: Leaderboard & Community ── */}
      <div className="lg:col-span-7 space-y-6">
        {/* Leaderboard */}
        <div className="bg-[#16191f] rounded-2xl border border-white/5 shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="p-6 pb-4 border-b border-white/5">
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-2">
                <span className="text-xl">🏆</span>
                <h2 className="text-lg font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-yellow-500">
                  Today&apos;s Leaderboard
                </h2>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <p className="text-[10px] text-gray-500 uppercase tracking-widest font-medium">Top JEE Warriors</p>
              {countdown && (
                <div className="flex items-center gap-1.5 px-2 py-0.5 bg-amber-500/10 rounded text-[10px] font-bold text-amber-500 border border-amber-500/20">
                  <span className="w-1 h-1 rounded-full bg-amber-500 animate-pulse"></span>
                  Resets in: {countdown}
                </div>
              )}
            </div>
          </div>

          <div className="p-0">
            {lbLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-amber-500"></div>
              </div>
            ) : leaderboard.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-600 text-sm">No battles played today yet.</p>
                <p className="text-gray-700 text-xs mt-1">Be the first to play! 🚀</p>
              </div>
            ) : (
              <table className="w-full">
                <thead>
                  <tr className="text-[10px] uppercase tracking-widest text-gray-500 border-b border-white/5">
                    <th className="py-3 px-4 text-left font-bold">#</th>
                    <th className="py-3 px-4 text-left font-bold">Player</th>
                    <th className="py-3 px-4 text-right font-bold">Pts</th>
                    <th className="py-3 px-4 text-right font-bold hidden sm:table-cell">W/L</th>
                  </tr>
                </thead>
                <tbody>
                  {leaderboard.map((entry) => {
                    const isMe = currentUserId && entry.userId?.toString() === currentUserId.toString();
                    const rankBadge = entry.rank === 1 ? '🥇' : entry.rank === 2 ? '🥈' : entry.rank === 3 ? '🥉' : null;
                    return (
                      <tr
                        key={entry.userId}
                        className={`border-b border-white/[0.03] transition-colors ${isMe
                          ? 'bg-indigo-500/10 border-indigo-500/20'
                          : 'hover:bg-white/[0.02]'
                          }`}
                      >
                        <td className="py-3 px-4">
                          {rankBadge ? (
                            <span className="text-lg">{rankBadge}</span>
                          ) : (
                            <span className={`text-sm font-bold ${isMe ? 'text-indigo-400' : 'text-gray-600'}`}>
                              {entry.rank}
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            <span className={`text-sm font-semibold truncate max-w-[90px] xs:max-w-[120px] sm:max-w-[200px] ${isMe ? 'text-indigo-300' : 'text-gray-300'
                              }`}>
                              {entry.name}
                            </span>
                            {isMe && (
                              <span className="text-[9px] font-black uppercase tracking-widest text-indigo-400 bg-indigo-500/15 px-1.5 py-0.5 rounded">
                                You
                              </span>
                            )}
                          </div>
                          <p className="text-[10px] text-gray-600 mt-0.5">
                            {entry.gamesPlayed ?? 0} game{(entry.gamesPlayed ?? 0) !== 1 ? 's' : ''}
                          </p>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <span className={`text-lg font-black ${(entry.points ?? 0) > 0 ? 'text-emerald-400' : (entry.points ?? 0) < 0 ? 'text-red-400' : 'text-gray-500'
                            }`}>
                            {(entry.points ?? 0) > 0 ? '+' : ''}{entry.points ?? 0}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right hidden sm:table-cell">
                          <span className="text-xs text-gray-500">
                            <span className="text-emerald-500">{entry.correctAnswers ?? 0}</span>
                            <span className="text-gray-700 mx-0.5">/</span>
                            <span className="text-red-500">{entry.wrongAnswers ?? 0}</span>
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>

          {/* Scoring legend */}
          <div className="px-6 py-3 border-t border-white/5 flex items-center justify-center gap-4">
            <span className="text-[10px] text-gray-600 flex items-center gap-1">
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500"></span> Correct = +4
            </span>
            <span className="text-[10px] text-gray-600 flex items-center gap-1">
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-red-500"></span> Wrong = −1
            </span>
          </div>
        </div>

        {/* ── How it Works ── */}
        <div className="bg-[#16191f] rounded-2xl border border-white/5 p-8 shadow-2xl space-y-6">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <span>🎯</span> How it Works
          </h2>
          <div className="grid gap-4 text-sm text-gray-400">
            <div className="flex gap-3">
              <div className="w-6 h-6 rounded-full bg-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold shrink-0">1</div>
              <p><span className="text-gray-200 font-semibold">Join the Queue:</span> Find a random opponent or create a private room to challenge a specific friend.</p>
            </div>
            <div className="flex gap-3">
              <div className="w-6 h-6 rounded-full bg-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold shrink-0">2</div>
              <p><span className="text-gray-200 font-semibold">Quickfire Duel:</span> Answer 10 sharp JEE-level questions in Physics, Chemistry, and Math. You have 120 seconds per question.</p>
            </div>
            <div className="flex gap-3">
              <div className="w-6 h-6 rounded-full bg-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold shrink-0">3</div>
              <p><span className="text-gray-200 font-semibold">Win Points:</span> Get +4 for every right answer and watch out for the -1 penalty on wrong ones. Top the daily leaderboard!</p>
            </div>
          </div>
          <div className="pt-2 border-t border-white/5">
            <p className="text-xs text-gray-500 italic">
              &quot;The goal isn&apos;t just to solve, but to solve faster than the person next to you. That&apos;s the real JEE spirit.&quot;
            </p>
          </div>
        </div>

        {/* ── Community ── */}
        <div className="bg-[#ff4500]/5 rounded-2xl border border-[#ff4500]/20 p-6 shadow-2xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-[#ff4500]/10 rounded-full blur-3xl -mr-16 -mt-16 group-hover:bg-[#ff4500]/20 transition-colors" />
          <div className="relative flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-[#ff4500] flex items-center justify-center text-white shadow-lg shadow-[#ff4500]/20">
                <svg viewBox="0 0 24 24" className="w-7 h-7 fill-current">
                  <path d="M12 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0zm5.01 4.744c.688 0 1.25.561 1.25 1.249a1.25 1.25 0 0 1-2.498.056l-2.597-.547-.8 3.747c1.824.07 3.48.632 4.674 1.488.308-.309.73-.491 1.207-.491.968 0 1.754.786 1.754 1.754 0 .716-.435 1.333-1.056 1.597.04.21.06.42.06.632 0 2.835-3.522 5.137-7.857 5.137-4.335 0-7.858-2.302-7.858-5.137 0-.21.021-.42.06-.632a1.734 1.734 0 0 1-1.055-1.597c0-.968.786-1.754 1.754-1.754.463 0 .873.181 1.18.471 1.201-.86 2.871-1.431 4.717-1.49l.846-3.955a.25.25 0 0 1 .255-.196l3.076.643c.045-.403.388-.716.8-.716zM9.03 12.056c-.687 0-1.25.562-1.25 1.25 0 .687.563 1.25 1.25 1.25.687 0 1.25-.563 1.25-1.25 0-.688-.563-1.25-1.25-1.25zm5.94 0c-.687 0-1.25.562-1.25 1.25 0 .687.563 1.25 1.25 1.25.688 0 1.25-.563 1.25-1.25 0-.688-.563-1.25-1.25-1.25zm-6.666 3.655c-.012.012-.023.023-.034.035a.25.25 0 0 0 .015.352c.813.738 2.146 1.134 3.715 1.134 1.565 0 2.898-.396 3.711-1.134a.25.25 0 0 0 .015-.352l-.034-.035a.25.25 0 0 0-.352-.015c-.636.574-1.785.886-3.34.886-1.555 0-2.703-.312-3.34-.886a.25.25 0 0 0-.351.015z" />
                </svg>
              </div>
              <div>
                <h3 className="text-white font-bold text-lg">Join the Vayl Community</h3>
                <p className="text-gray-400 text-xs">Discuss strategies, report issues, and compete on Reddit.</p>
              </div>
            </div>
            <a
              href="https://www.reddit.com/r/Vayl/"
              target="_blank"
              rel="noopener noreferrer"
              className="px-6 py-3 rounded-xl bg-[#ff4500] text-white font-black uppercase tracking-widest text-[10px] hover:scale-105 active:scale-95 transition-all shadow-lg shadow-[#ff4500]/20 whitespace-nowrap"
            >
              r/Vayl
            </a>
          </div>
        </div>
      </div>

      {/* ── Footer ── */}
      <div className="lg:col-span-12 pt-12 mt-8 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-6 text-[10px] text-gray-600 uppercase tracking-[0.2em] font-bold">
        <div className="flex items-center gap-8">
          <Link href="/privacy-policy" target="_blank" rel="noopener noreferrer" className="hover:text-indigo-400 transition-colors">Privacy Policy</Link>
          <Link href="/terms" target="_blank" rel="noopener noreferrer" className="hover:text-indigo-400 transition-colors">Terms of Service</Link>
          <Link href="/contact" className="hover:text-indigo-400 transition-colors">Contact Us</Link>
        </div>
        <div className="flex items-center gap-2">
          <span>© {new Date().getFullYear()} Vayl Technologies.</span>
          <span className="hidden sm:inline text-gray-800">•</span>
          <span>Built for JEE Warriors</span>
        </div>
      </div>
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
