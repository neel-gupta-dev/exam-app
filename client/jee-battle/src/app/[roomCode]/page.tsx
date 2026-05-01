"use client";

import { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';

export default function BattleRoom({ params }: { params: Promise<{ roomCode: string }> }) {
  const router = useRouter();
  const { roomCode } = use(params);
  const [token, setToken] = useState<string | null>(null);
  const [battleState, setBattleState] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(60);
  const [copied, setCopied] = useState(false);
  const [soloStarting, setSoloStarting] = useState(false);

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://api.vayl.in';

  useEffect(() => {
    const storedToken = localStorage.getItem('kv_token');
    if (storedToken) setToken(storedToken);
    else {
      setError("Not authenticated. Please join from the lobby.");
      setLoading(false);
    }
  }, []);

  const fetchState = async () => {
    if (!token) return;
    try {
      const res = await fetch(`${apiUrl}/battle/${roomCode}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to fetch battle state');
      
      setBattleState(data);
      
      if (data.status === 'active' && data.myProgress !== undefined) {
        if (data.myProgress < data.questions.length) {
          setCurrentQuestionIndex(data.myProgress);
        }
      }
      setLoading(false);
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!token) return;
    fetchState();
    const interval = setInterval(fetchState, 5000);
    return () => clearInterval(interval);
  }, [token, roomCode]);

  useEffect(() => {
    if (battleState?.status !== 'active' || currentQuestionIndex >= battleState?.questions?.length) return;
    
    setTimeRemaining(60);
    const timerInterval = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 1) {
          submitAnswer(-1);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    
    return () => clearInterval(timerInterval);
  }, [currentQuestionIndex, battleState?.status]);

  const submitAnswer = async (optionIndex: number) => {
    if (!token || !battleState || submitting) return;
    setSubmitting(true);
    
    const questionId = battleState.questions[currentQuestionIndex]._id;
    const timeTaken = 60 - timeRemaining;

    try {
      const res = await fetch(`${apiUrl}/battle/submit`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          roomCode,
          questionId,
          selectedOptionIndex: optionIndex,
          timeTakenSeconds: timeTaken
        })
      });
      
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      
      setSelectedOption(null);
      setCurrentQuestionIndex(prev => prev + 1);
      await fetchState();
      
    } catch (err: any) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const soloStart = async () => {
    if (!token) return;
    setSoloStarting(true);
    try {
      const res = await fetch(`${apiUrl}/battle/solo-start`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ roomCode })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      // Trigger immediate state refresh
      await fetchState();
    } catch (err: any) {
      alert(err.message);
      setSoloStarting(false);
    }
  };

  const copyCode = () => {
    navigator.clipboard.writeText(roomCode.toUpperCase());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) return (
    <div className="min-h-screen bg-[#0f1115] flex items-center justify-center text-white">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
    </div>
  );

  if (error) return (
    <div className="min-h-screen bg-[#0f1115] flex items-center justify-center">
      <div className="text-center space-y-4">
        <p className="text-red-400">{error}</p>
        <button onClick={() => router.push('/')} className="text-indigo-400 hover:underline text-sm">Back to Lobby</button>
      </div>
    </div>
  );

  if (!battleState) return null;

  // ── Waiting Screen ──
  if (battleState.status === 'waiting') {
    return (
      <div className="min-h-screen bg-[#0f1115] text-white flex flex-col items-center justify-center p-4">
        <div className="max-w-md w-full bg-[#16191f] rounded-2xl border border-white/5 p-8 text-center space-y-6 shadow-2xl">
          <div className="animate-pulse">
            <div className="text-6xl mb-4">⚔️</div>
            <h2 className="text-2xl font-bold">Waiting for opponent...</h2>
          </div>
          
          <div className="space-y-3">
            <p className="text-gray-400 text-sm">Share this code with a friend:</p>
            <button
              onClick={copyCode}
              className="inline-flex items-center gap-3 px-6 py-4 bg-black/40 rounded-xl border border-white/10 
                hover:border-indigo-500/50 transition-all group cursor-pointer"
            >
              <span className="text-4xl font-mono font-black tracking-[0.4em] text-indigo-400">
                {roomCode.toUpperCase()}
              </span>
              <span className="text-xs text-gray-500 group-hover:text-indigo-400 transition-colors">
                {copied ? '✓ Copied!' : '📋 Copy'}
              </span>
            </button>
          </div>

          <button onClick={() => router.push('/')} className="text-gray-500 hover:text-gray-300 text-sm transition-colors">
            ← Cancel and return to lobby
          </button>

          {battleState.isAdmin && (
            <div className="border-t border-white/5 pt-4">
              <p className="text-xs text-amber-500/70 mb-3 uppercase tracking-wider font-bold">⚙ Admin Testing</p>
              <button
                onClick={soloStart}
                disabled={soloStarting}
                className="w-full py-3 rounded-xl text-sm font-bold transition-all
                  bg-amber-500/10 text-amber-400 border border-amber-500/20
                  hover:bg-amber-500/20 hover:border-amber-500/40 disabled:opacity-40"
              >
                {soloStarting ? 'Starting...' : '⚡ Start Solo (Admin Only)'}
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  // ── Finished Screen ──
  if (battleState.status === 'finished') {
    return (
      <div className="min-h-screen bg-[#0f1115] text-white flex flex-col items-center justify-center p-4">
        <div className="max-w-lg w-full bg-[#16191f] rounded-2xl border border-white/5 p-8 text-center space-y-8 shadow-2xl">
          <h1 className="text-5xl font-black">Match Finished!</h1>
          
          <div className="flex justify-between items-center bg-black/30 p-6 rounded-xl">
             <div className="text-center flex-1">
               <div className="text-sm text-gray-400 mb-1">{battleState.player1?.name || 'Player 1'}</div>
               <div className="text-3xl font-bold text-indigo-400">{battleState.player1Score}</div>
             </div>
             <div className="text-2xl font-bold text-gray-600 px-4">VS</div>
             <div className="text-center flex-1">
               <div className="text-sm text-gray-400 mb-1">{battleState.player2?.name || 'Player 2'}</div>
               <div className="text-3xl font-bold text-blue-400">{battleState.player2Score}</div>
             </div>
          </div>
          
          <button onClick={() => router.push('/')} className="w-full py-3 bg-white/10 hover:bg-white/20 rounded-xl transition font-bold">
            Return to Lobby
          </button>
        </div>
      </div>
    );
  }

  // ── Waiting for opponent to finish ──
  const totalQuestions = battleState.questions.length;
  
  if (currentQuestionIndex >= totalQuestions) {
    return (
      <div className="min-h-screen bg-[#0f1115] text-white flex flex-col items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-indigo-500 mx-auto"></div>
          <h2 className="text-2xl font-bold">Waiting for opponent to finish...</h2>
          <p className="text-gray-400">You completed all questions! Results incoming.</p>
        </div>
      </div>
    );
  }

  // ── Active Game ──
  const currentQuestion = battleState.questions[currentQuestionIndex];

  return (
    <div className="min-h-screen bg-[#0f1115] text-white flex flex-col items-center p-4 md:p-8">
      {/* Header */}
      <div className="w-full max-w-4xl flex justify-between items-center mb-8 bg-[#16191f] p-4 rounded-xl border border-white/5">
        <div>
          <div className="text-xs text-gray-400 uppercase tracking-wider">Opponent</div>
          <div className="font-bold">{battleState.opponentProgress} / {totalQuestions}</div>
        </div>
        
        <div className="text-center">
          <div className={`text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r 
            ${timeRemaining <= 10 ? 'from-red-500 to-red-400 animate-pulse' : 'from-orange-400 to-amber-400'}`}>
            {timeRemaining}s
          </div>
        </div>

        <div className="text-right">
          <div className="text-xs text-gray-400 uppercase tracking-wider">You</div>
          <div className="font-bold text-indigo-400">{currentQuestionIndex + 1} / {totalQuestions}</div>
        </div>
      </div>

      {/* Question Card */}
      <div className="w-full max-w-4xl bg-[#16191f] rounded-2xl border border-white/5 p-6 md:p-10 shadow-2xl">
        <div className="inline-block px-3 py-1 bg-indigo-500/20 text-indigo-400 rounded-lg text-sm font-bold mb-6">
          {currentQuestion.subject}
        </div>
        
        <h2 className="text-xl md:text-2xl font-medium leading-relaxed mb-8">
          {currentQuestion.questionText}
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {currentQuestion.options.map((opt: any, idx: number) => (
            <button
              key={idx}
              onClick={() => {
                setSelectedOption(idx);
                submitAnswer(idx);
              }}
              disabled={submitting}
              className={`text-left p-5 rounded-xl border transition-all duration-200
                ${selectedOption === idx 
                  ? 'bg-indigo-600 border-indigo-500 shadow-[0_0_15px_rgba(79,70,229,0.4)]' 
                  : 'bg-black/20 border-white/10 hover:border-indigo-500/50 hover:bg-white/5'}
                ${submitting ? 'opacity-50 cursor-not-allowed' : ''}
              `}
            >
              <div className="flex items-center gap-4">
                <span className="flex-shrink-0 w-8 h-8 rounded-full bg-white/10 flex items-center justify-center font-bold text-sm">
                  {String.fromCharCode(65 + idx)}
                </span>
                <span className="text-base">{opt.text}</span>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
