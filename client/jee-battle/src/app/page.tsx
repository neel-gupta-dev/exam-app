"use client";

import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

function LobbyContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [token, setToken] = useState<string | null>(null);
  const [status, setStatus] = useState<'idle' | 'searching'>('idle');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const urlToken = searchParams.get('token');
    if (urlToken) {
      localStorage.setItem('kv_token', urlToken);
      router.replace('/');
      setToken(urlToken);
    } else {
      const storedToken = localStorage.getItem('kv_token');
      if (storedToken) setToken(storedToken);
      else setError("You must be logged in to play. Please access this from the main Vayl dashboard.");
    }
  }, [searchParams, router]);

  const findMatch = async () => {
    if (!token) return;
    setStatus('searching');
    setError(null);
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://api.vayl.in';
      const res = await fetch(`${apiUrl}/battle/queue`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await res.json();
      
      if (!res.ok) throw new Error(data.error || 'Failed to queue');
      
      if (data.roomId) {
        router.push(`/${data.roomId}`);
      }
    } catch (err: any) {
      setError(err.message);
      setStatus('idle');
    }
  };

  return (
    <div className="max-w-md w-full bg-[#16191f] rounded-2xl border border-white/5 p-8 text-center space-y-6 shadow-2xl">
      <div>
        <h1 className="text-4xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-500">
          JEE Battle
        </h1>
        <p className="text-gray-400 mt-2 text-sm">Compete in real-time. Boost your speed and accuracy.</p>
      </div>

      {error ? (
        <div className="bg-red-500/10 text-red-400 p-4 rounded-xl text-sm border border-red-500/20">
          {error}
        </div>
      ) : (
        <div className="py-8">
          <button
            onClick={findMatch}
            disabled={status === 'searching' || !token}
            className="w-full py-4 rounded-xl font-bold text-lg transition-all duration-300 disabled:opacity-50
              bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 shadow-[0_0_20px_rgba(79,70,229,0.3)] hover:shadow-[0_0_30px_rgba(79,70,229,0.5)] active:scale-[0.98]"
          >
            {status === 'searching' ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Finding Opponent...
              </span>
            ) : 'Find Match'}
          </button>
        </div>
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
