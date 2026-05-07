"use client";

import { useEffect, useState, use, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { MathJax } from 'better-react-mathjax';
import {
  Trophy, Users, Timer, ArrowRight,
  CheckCircle2, XCircle, Sword, LogOut,
  Share2, Copy, Zap
} from 'lucide-react';

export default function BattleRoom({ params }: { params: Promise<{ roomCode: string }> }) {
  const router = useRouter();
  const { roomCode } = use(params);

  useEffect(() => {
    if (roomCode) {
      document.title = `Battle: ${roomCode.toUpperCase()} | JEE Battle`;
    }
  }, [roomCode]);

  const [token, setToken] = useState<string | null>(null);
  const [battleState, setBattleState] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedOptions, setSelectedOptions] = useState<number[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(60);
  const [copied, setCopied] = useState(false);
  const [soloStarting, setSoloStarting] = useState(false);

  const lastSubmittedIndex = useRef<number>(-1);
  const [countdownMs, setCountdownMs] = useState<number>(0);

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
        if (data.startedAt && data.serverNow) {
          const deltaMs = new Date(data.startedAt).getTime() - data.serverNow;
          if (deltaMs > 0 && countdownMs === 0) {
            setCountdownMs(deltaMs);
          }
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
    if (countdownMs <= 0) return;
    const interval = setInterval(() => {
      setCountdownMs(prev => Math.max(0, prev - 100));
    }, 100);
    return () => clearInterval(interval);
  }, [countdownMs]);

  useEffect(() => {
    if (battleState?.status !== 'active' || currentQuestionIndex >= battleState?.questions?.length || countdownMs > 0) return;

    setTimeRemaining(60);
    const timerInterval = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 1) {
          if (lastSubmittedIndex.current !== currentQuestionIndex) {
            lastSubmittedIndex.current = currentQuestionIndex;
            submitAnswer([-1]);
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timerInterval);
  }, [currentQuestionIndex, battleState?.status, countdownMs]);

  const submitAnswer = async (manualIndices?: number[]) => {
    if (!token || !battleState || submitting) return;

    const currentQuestion = battleState.questions[currentQuestionIndex];
    const isMulti = currentQuestion.type === 'multi';

    // If manualIndices is provided (e.g. from timeout), use it.
    // Otherwise use state. For timeout, we pass [-1] to indicate skip.
    const indices = manualIndices || (isMulti ? selectedOptions : (selectedOptions.length > 0 ? [selectedOptions[0]] : [-1]));

    setSubmitting(true);

    const questionId = currentQuestion._id;
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
          selectedOptionIndex: isMulti ? -2 : (indices[0] ?? -1),
          selectedOptionIndices: indices,
          timeTakenSeconds: timeTaken
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setSelectedOptions([]);
      setCurrentQuestionIndex(prev => prev + 1);
      lastSubmittedIndex.current = -1;
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
    const cancelRoom = async () => {
      if (!token) return;
      try {
        await fetch(`${apiUrl}/battle/cancel`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ roomCode })
        });
      } catch {
        // Best effort
      }
      router.push('/');
    };

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

          <button onClick={cancelRoom} className="text-red-400/60 hover:text-red-400 text-sm transition-colors font-medium">
            ✕ Cancel and return to lobby
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
    // Compute leaderboard points earned in this battle (+4 correct, -1 wrong, 0 skip)
    const computeLbPoints = (answers: any[]) => {
      let pts = 0;
      let correct = 0;
      let wrong = 0;
      (answers || []).forEach((a: any) => {
        pts += (a.lbPoints || 0);
        if (a.isCorrect) {
          correct++;
        } else if (a.lbPoints < 0) {
          wrong++;
        }
      });
      return { pts, correct, wrong };
    };

    const myLb = computeLbPoints(battleState.myAnswers);

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

          {/* Leaderboard Points Earned */}
          <div className="bg-black/20 rounded-xl p-4 border border-white/5 space-y-2">
            <p className="text-[10px] uppercase tracking-widest text-amber-500/70 font-bold">Leaderboard Points Earned</p>
            <div className="flex items-center justify-center gap-3">
              <span className={`text-3xl font-black ${myLb.pts > 0 ? 'text-emerald-400' : myLb.pts < 0 ? 'text-red-400' : 'text-gray-500'}`}>
                {myLb.pts > 0 ? '+' : ''}{myLb.pts}
              </span>
              <span className="text-xs text-gray-500">pts</span>
            </div>
            <div className="flex items-center justify-center gap-4 text-xs text-gray-500">
              <span className="flex items-center gap-1">
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                {myLb.correct} correct (+{myLb.correct * 4})
              </span>
              <span className="flex items-center gap-1">
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-red-500"></span>
                {myLb.wrong} wrong (−{myLb.wrong})
              </span>
            </div>
          </div>

          <div className="flex gap-3">
            <button onClick={() => router.push('/')} className="flex-1 py-3 bg-white/10 hover:bg-white/20 rounded-xl transition font-bold">
              Return to Lobby
            </button>
            <button
              onClick={() => router.push('/')}
              className="flex-1 py-3 rounded-xl font-bold transition-all
                bg-gradient-to-r from-amber-600/80 to-yellow-600/80 hover:from-amber-500/80 hover:to-yellow-500/80
                border border-amber-500/20 shadow-[0_0_20px_rgba(245,158,11,0.15)]"
            >
              🏆 Leaderboard
            </button>
          </div>
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

  // ── Countdown Screen ──
  if (battleState.status === 'active' && countdownMs > 0) {
    return (
      <div className="min-h-screen bg-[#0f1115] text-white flex flex-col items-center justify-center p-4">
        <div className="max-w-md w-full bg-[#16191f] rounded-2xl border border-white/5 p-8 text-center space-y-6 shadow-2xl">
          <h2 className="text-3xl font-black text-indigo-400">Match Starting In</h2>
          <div className="text-8xl font-black text-white">
            {Math.ceil(countdownMs / 1000)}
          </div>
          <p className="text-gray-400">Get ready!</p>
        </div>
      </div>
    );
  }

  // ── Active Game ──
  const currentQuestion = battleState.questions[currentQuestionIndex];

  return (
    <div className="min-h-screen bg-[#0f1115] text-white flex flex-col items-center justify-center p-4 md:p-8 overflow-x-hidden">
      <div className="max-w-2xl w-full space-y-6">
        {/* Progress & Scores */}
        <div className="flex items-center justify-between gap-4 bg-[#16191f] p-4 rounded-2xl border border-white/5 shadow-xl">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-indigo-500/20 flex items-center justify-center border border-indigo-500/30">
              <span className="text-lg font-bold text-indigo-400">{battleState.player1Score}</span>
            </div>
            <div className="hidden sm:block">
              <p className="text-[10px] uppercase font-black tracking-widest text-indigo-400">You</p>
              <div className="flex gap-1 mt-1">
                {battleState.questions.map((_: any, i: number) => (
                  <div key={i} className={`w-3 h-1.5 rounded-full ${i < battleState.myProgress ? (battleState.myAnswers[i]?.isCorrect ? 'bg-green-500' : 'bg-red-500') : 'bg-white/10'}`} />
                ))}
              </div>
            </div>
          </div>

          <div className="flex flex-col items-center">
            <div className={`flex items-center gap-2 font-black italic ${timeRemaining <= 10 ? 'text-red-500 animate-pulse' : 'text-yellow-500'}`}>
              <Timer className="w-5 h-5" />
              <span className="text-xl">{timeRemaining}s</span>
            </div>
          </div>

          <div className="flex items-center gap-3 text-right">
            <div className="hidden sm:block">
              <p className="text-[10px] uppercase font-black tracking-widest text-rose-400">{battleState.player2?.name || 'Opponent'}</p>
              <div className="flex gap-1 mt-1 justify-end">
                {battleState.questions.map((_: any, i: number) => (
                  <div key={i} className={`w-3 h-1.5 rounded-full ${i < battleState.opponentProgress ? 'bg-rose-500/50' : 'bg-white/10'}`} />
                ))}
              </div>
            </div>
            <div className="w-10 h-10 rounded-full bg-rose-500/20 flex items-center justify-center border border-rose-500/30">
              <span className="text-lg font-bold text-rose-400">{battleState.player2Score}</span>
            </div>
          </div>
        </div>

        {/* Question Card */}
        <div className="bg-[#16191f] rounded-3xl border border-white/5 shadow-2xl overflow-hidden relative">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-rose-500" />

          <div className="p-8">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 bg-indigo-500/10 text-indigo-400 text-[10px] font-black uppercase tracking-widest rounded-full border border-indigo-500/20">
                  Question {currentQuestionIndex + 1} / 10
                </span>
                {currentQuestion.questionCode && (
                  <span className="text-[10px] font-black uppercase tracking-widest text-white/30 border border-white/10 px-2 py-1 rounded-full">
                    {currentQuestion.questionCode}
                  </span>
                )}
              </div>
              <span className="text-[10px] font-black uppercase tracking-widest text-white/40">
                {currentQuestion.subject}
              </span>
            </div>

            <div className="text-xl sm:text-2xl font-medium leading-relaxed mb-8 min-h-[4rem]">
              <MathJax>{currentQuestion.questionText}</MathJax>
            </div>

            <div className="grid grid-cols-1 gap-4">
              {currentQuestion.options.map((option: any, index: number) => {
                const isSelected = selectedOptions.includes(index);
                const isMulti = currentQuestion.type === 'multi';

                const toggleOption = () => {
                  if (submitting) return;
                  if (isMulti) {
                    setSelectedOptions(prev =>
                      prev.includes(index)
                        ? prev.filter(i => i !== index)
                        : [...prev, index]
                    );
                  } else {
                    setSelectedOptions([index]);
                  }
                };

                return (
                  <button
                    key={index}
                    onClick={toggleOption}
                    disabled={submitting}
                    className={`group relative p-5 rounded-2xl border transition-all text-left flex items-center gap-4 ${isSelected
                        ? 'bg-indigo-600 border-indigo-400 text-white shadow-lg shadow-indigo-500/20 -translate-y-1'
                        : 'bg-[#1c2128] border-white/5 text-gray-300 hover:border-white/20 hover:bg-[#252b35]'
                      }`}
                  >
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-black transition-colors ${isSelected ? 'bg-white text-indigo-600' : 'bg-white/5 text-white/40 group-hover:bg-white/10'
                      }`}>
                      {isMulti ? (
                        isSelected ? <CheckCircle2 className="w-5 h-5" /> : String.fromCharCode(65 + index)
                      ) : (
                        String.fromCharCode(65 + index)
                      )}
                    </div>
                    <span className="text-lg font-medium">
                      <MathJax>{option.text}</MathJax>
                    </span>
                    {isSelected && (
                      <Zap className="w-4 h-4 text-white absolute top-4 right-4 animate-bounce" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <button
          onClick={() => selectedOptions.length > 0 && submitAnswer()}
          disabled={selectedOptions.length === 0 || submitting}
          className={`w-full py-5 rounded-2xl font-black uppercase tracking-widest flex items-center justify-center gap-3 transition-all ${selectedOptions.length > 0 && !submitting
              ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-xl shadow-indigo-600/20 hover:scale-[1.02] active:scale-[0.98]'
              : 'bg-white/5 text-white/20 cursor-not-allowed'
            }`}
        >
          {submitting ? (
            <div className="w-6 h-6 border-2 border-white/20 border-t-white rounded-full animate-spin" />
          ) : (
            <>
              {selectedOptions.length > 0 ? (currentQuestion.type === 'multi' ? 'Confirm Answers' : 'Confirm Answer') : 'Select Option(s)'}
              <ArrowRight className="w-5 h-5" />
            </>
          )}
        </button>
      </div>
    </div>
  );
}
