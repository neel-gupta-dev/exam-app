"use client";

import { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';

export default function BattleRoom({ params }: { params: Promise<{ roomId: string }> }) {
  const router = useRouter();
  const { roomId } = use(params);
  const [token, setToken] = useState<string | null>(null);
  const [battleState, setBattleState] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Game UI State
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(60); // 60 seconds per question

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
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://api.vayl.in';
      const res = await fetch(`${apiUrl}/battle/${roomId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to fetch battle state');
      
      setBattleState(data);
      
      // If active, sync current question index based on myProgress
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

  // Initial fetch and 5-second polling loop
  useEffect(() => {
    if (!token) return;
    fetchState();
    const interval = setInterval(fetchState, 5000);
    return () => clearInterval(interval);
  }, [token, roomId]);

  // Timer countdown
  useEffect(() => {
    if (battleState?.status !== 'active' || currentQuestionIndex >= battleState?.questions?.length) return;
    
    // Reset timer when question changes
    setTimeRemaining(60);
    const timerInterval = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 1) {
          // Time up! Auto-submit wrong answer (index -1)
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
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://api.vayl.in';
      const res = await fetch(`${apiUrl}/battle/submit`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          roomId,
          questionId,
          selectedOptionIndex: optionIndex,
          timeTakenSeconds: timeTaken
        })
      });
      
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      
      // Move to next question immediately
      setSelectedOption(null);
      setCurrentQuestionIndex(prev => prev + 1);
      
      // Instantly trigger a state fetch to sync backend changes
      await fetchState();
      
    } catch (err: any) {
      console.error(err);
      alert(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="min-h-screen bg-[#0f1115] flex items-center justify-center text-white"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div></div>;
  if (error) return <div className="min-h-screen bg-[#0f1115] flex items-center justify-center text-red-500">{error}</div>;
  if (!battleState) return null;

  if (battleState.status === 'waiting') {
    return (
      <div className="min-h-screen bg-[#0f1115] text-white flex flex-col items-center justify-center">
        <div className="animate-pulse space-y-4 text-center">
          <div className="text-6xl mb-4">⚔️</div>
          <h2 className="text-2xl font-bold">Waiting for opponent...</h2>
          <p className="text-gray-400">Share room ID: <span className="font-mono bg-white/10 px-2 py-1 rounded">{roomId}</span></p>
        </div>
      </div>
    );
  }

  if (battleState.status === 'finished') {
    const isWinner = battleState.winner && battleState.winner === battleState.player1?._id ? true : false; 
    // Wait, the API doesn't tell us who 'we' are directly. We know our token.
    // The API sends player1, player2. Let's just compare scores.
    let myScore = battleState.player1Score;
    let oppScore = battleState.player2Score;
    let myName = battleState.player1?.name;
    let oppName = battleState.player2?.name;

    // We can infer who we are based on myProgress match, or just use myScore/oppScore directly from API if we updated the API. 
    // Actually the API returns myAnswers. length.
    
    return (
      <div className="min-h-screen bg-[#0f1115] text-white flex flex-col items-center justify-center p-4">
        <div className="max-w-lg w-full bg-[#16191f] rounded-2xl border border-white/5 p-8 text-center space-y-8 shadow-2xl">
          <h1 className="text-5xl font-black mb-2">
             Match Finished!
          </h1>
          
          <div className="flex justify-between items-center bg-black/30 p-6 rounded-xl">
             <div className="text-center">
               <div className="text-sm text-gray-400 mb-1">{battleState.player1?.name || 'Player 1'}</div>
               <div className="text-3xl font-bold text-indigo-400">{battleState.player1Score}</div>
             </div>
             <div className="text-2xl font-bold text-gray-600">VS</div>
             <div className="text-center">
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

  // Active Game UI
  const totalQuestions = battleState.questions.length;
  
  if (currentQuestionIndex >= totalQuestions) {
    return (
      <div className="min-h-screen bg-[#0f1115] text-white flex flex-col items-center justify-center">
        <div className="text-center space-y-4">
          <h2 className="text-2xl font-bold">Waiting for opponent to finish...</h2>
          <p className="text-gray-400">You completed all questions! We'll show results once they finish.</p>
        </div>
      </div>
    );
  }

  const currentQuestion = battleState.questions[currentQuestionIndex];

  return (
    <div className="min-h-screen bg-[#0f1115] text-white flex flex-col items-center p-4 md:p-8">
      {/* Header */}
      <div className="w-full max-w-4xl flex justify-between items-center mb-8 bg-[#16191f] p-4 rounded-xl border border-white/5">
        <div className="flex gap-4 items-center">
           <div>
             <div className="text-xs text-gray-400 uppercase tracking-wider">Opponent Progress</div>
             <div className="font-bold">{battleState.opponentProgress} / {totalQuestions}</div>
           </div>
        </div>
        
        <div className="text-center">
          <div className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-orange-500">
            {timeRemaining}s
          </div>
        </div>

        <div className="flex gap-4 items-center text-right">
           <div>
             <div className="text-xs text-gray-400 uppercase tracking-wider">Your Progress</div>
             <div className="font-bold text-indigo-400">{currentQuestionIndex + 1} / {totalQuestions}</div>
           </div>
        </div>
      </div>

      {/* Question Card */}
      <div className="w-full max-w-4xl bg-[#16191f] rounded-2xl border border-white/5 p-6 md:p-10 shadow-2xl">
        <div className="inline-block px-3 py-1 bg-indigo-500/20 text-indigo-400 rounded-lg text-sm font-bold mb-6">
          {currentQuestion.subject}
        </div>
        
        <h2 className="text-2xl md:text-3xl font-medium leading-relaxed mb-8">
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
              className={`text-left p-6 rounded-xl border transition-all duration-200
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
                <span className="text-lg">{opt.text}</span>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
