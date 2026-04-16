import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Info, User as UserIcon, List } from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export default function TestEngine({ testId, user, onSubmitted }) {
  // ─── State ───
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [testMeta, setTestMeta] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState([]);
  const [attemptId, setAttemptId] = useState(null);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [activeSection, setActiveSection] = useState(null);
  const [timeLeft, setTimeLeft] = useState(0);
  const [tabSwitchCount, setTabSwitchCount] = useState(0);
  const [showWarning, setShowWarning] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [result, setResult] = useState(null);
  const [showSubmitConfirm, setShowSubmitConfirm] = useState(false);

  const syncDirty = useRef(false);
  const timerRef = useRef(null);
  const syncRef = useRef(null);
  const token = user?.token || localStorage.getItem('test_token');

  // ─── API helper ───
  const apiFetch = useCallback(async (path, opts = {}) => {
    const res = await fetch(`${API_BASE}${path}`, {
      ...opts,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
        ...opts.headers,
      },
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Request failed');
    return data;
  }, [token]);

  // ─── Start session on mount ───
  useEffect(() => {
    const init = async () => {
      try {
        // We use assessment start route which is tied to /assessment if we updated the server
        const data = await apiFetch(`/assessment/${testId}/start`, { method: 'GET' });
        setTestMeta(data.test);
        setQuestions(data.questions);
        
        // Transform Object to Array if session format returned Object
        // But the previous API returned attempt.answers. Let's assume assessmentController returns data in array or map format.
        // In assessmentController I wrote: answers: {} Map of questionId -> { status, selectedOption }
        const parsedAnswers = [];
        if (data.session && data.session.answers) {
          Object.keys(data.session.answers).forEach(qId => {
             parsedAnswers.push({
               questionId: qId,
               selectedAnswer: data.session.answers[qId].selectedOption || [],
               status: data.session.answers[qId].status
             })
          })
        }
        setAnswers(parsedAnswers);

        // Calculate remaining time
        setTimeLeft(data.session ? data.session.timeLeft : data.test.durationMinutes * 60);

        // Set initial section
        if (data.test.sections?.length > 0) {
          setActiveSection(data.test.sections[0].name);
        } else if (data.questions.length > 0) {
          setActiveSection(data.questions[0].section);
        }

        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };
    init();
  }, [testId, apiFetch]);

  // Disable right-click
  useEffect(() => {
    const handleContextMenu = (e) => e.preventDefault();
    document.addEventListener("contextmenu", handleContextMenu);
    return () => document.removeEventListener("contextmenu", handleContextMenu);
  }, []);

  // ─── Countdown timer ───
  useEffect(() => {
    if (loading || submitted || timeLeft <= 0) return;
    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          handleSubmit(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, [loading, submitted]);

  // ─── Auto-sync API ───
  useEffect(() => {
    if (submitted) return;
    syncRef.current = setInterval(() => {
      if (syncDirty.current) {
        doSync();
      }
    }, 10000); // 10 seconds sync for Redis is safe
    return () => clearInterval(syncRef.current);
  }, [submitted]);

  // Anti-cheat
  useEffect(() => {
    if (submitted) return;
    const handler = () => {
      if (document.hidden) {
        setTabSwitchCount((prev) => {
          const newCount = prev + 1;
          if (newCount >= 4) {
            handleSubmit();
          } else {
            setShowWarning(true);
            setTimeout(() => setShowWarning(false), 5000);
          }
          return newCount;
        });
      }
    };
    document.addEventListener('visibilitychange', handler);
    return () => document.removeEventListener('visibilitychange', handler);
  }, [submitted]);

  const doSync = async () => {
    try {
      // Map back to Object for Redis
      const outAnswers = {};
      answers.forEach(a => {
        outAnswers[a.questionId] = {
           status: a.status,
           selectedOption: a.selectedAnswer
        };
      });
      await apiFetch(`/assessment/${testId}/sync`, {
        method: 'POST',
        body: JSON.stringify({ answers: outAnswers, timeLeft }),
      });
      syncDirty.current = false;
    } catch (e) {
      console.warn('[Sync] Failed:', e.message);
    }
  };

  const updateAnswer = (questionId, selectedAnswer, status) => {
    setAnswers((prev) => {
      const exists = prev.find(p => p.questionId === questionId);
      if (exists) {
         return prev.map(a => a.questionId === questionId ? { ...a, selectedAnswer, status } : a);
      }
      return [...prev, { questionId, selectedAnswer, status }];
    });
    syncDirty.current = true;
  };

  const currentQuestion = questions[currentIdx];
  const currentAnswer = answers.find((a) => a.questionId === currentQuestion?._id);

  const handleOptionSelect = (optionLabel) => {
    if (!currentQuestion) return;
    const current = answers.find((a) => a.questionId === currentQuestion._id) || { selectedAnswer: [] };
    
    let newSelected;
    if (currentQuestion.type === 'multiple') {
      if (current.selectedAnswer.includes(optionLabel)) {
        newSelected = current.selectedAnswer.filter((l) => l !== optionLabel);
      } else {
        newSelected = [...current.selectedAnswer, optionLabel];
      }
    } else {
      newSelected = [optionLabel];
    }

    updateAnswer(currentQuestion._id, newSelected, newSelected.length > 0 ? 'answered' : 'unanswered');
  };

  const handleSaveNext = () => {
    if (!currentQuestion) return;
    const current = answers.find((a) => a.questionId === currentQuestion._id);
    const existingStatus = current ? current.status : 'not-visited';

    if (current && current.selectedAnswer.length > 0 && existingStatus !== 'answered-and-marked') {
      updateAnswer(currentQuestion._id, current.selectedAnswer, 'answered');
    } else if (!current || current.selectedAnswer.length === 0) {
      updateAnswer(currentQuestion._id, [], 'unanswered');
    }
    goNext();
  };

  const handleMarkForReview = () => {
    if (!currentQuestion) return;
    const current = answers.find((a) => a.questionId === currentQuestion._id);
    const newStatus = current && current.selectedAnswer.length > 0 ? 'answered-and-marked' : 'marked-for-review';
    updateAnswer(currentQuestion._id, current ? current.selectedAnswer : [], newStatus);
    goNext();
  };

  const handleClearResponse = () => {
    if (!currentQuestion) return;
    updateAnswer(currentQuestion._id, [], 'unanswered');
  };

  const goNext = () => {
    const filteredQuestions = getFilteredQuestions();
    const currentFilterIdx = filteredQuestions.findIndex((q) => q._id === currentQuestion._id);
    if (currentFilterIdx >= 0 && currentFilterIdx < filteredQuestions.length - 1) {
      const nextQ = filteredQuestions[currentFilterIdx + 1];
      const globalIdx = questions.findIndex((q) => q._id === nextQ._id);
      setCurrentIdx(globalIdx);
    }
  };

  const handleSubmit = async () => {
    if (submitted) return;
    await doSync();
    try {
      const res = await apiFetch(`/assessment/${testId}/submit`, { method: 'POST' });
      setResult(res);
      setSubmitted(true);
      clearInterval(timerRef.current);
      clearInterval(syncRef.current);
    } catch (e) {
      alert('Failed to submit: ' + e.message);
    }
  };

  const getFilteredQuestions = () => {
    if (!activeSection) return questions;
    return questions.filter((q) => q.section === activeSection);
  };

  const formatTime = (seconds) => {
    if (seconds <= 0) return '00:00';
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const getSummary = () => {
    const summary = { answered: 0, unanswered: 0, markedForReview: 0, answeredAndMarked: 0, notVisited: questions.length };
    for (const a of answers) {
      if (a.status !== 'not-visited') summary.notVisited--;
      switch (a.status) {
        case 'answered': summary.answered++; break;
        case 'unanswered': summary.unanswered++; break;
        case 'marked-for-review': summary.markedForReview++; break;
        case 'answered-and-marked': summary.answeredAndMarked++; break;
      }
    }
    return summary;
  };

  if (loading) {
    return <div className="flex h-screen items-center justify-center bg-white"><div className="animate-spin text-[#3b82f6] text-4xl">↻</div></div>;
  }

  if (submitted && result) {
    return (
      <div className="flex flex-col h-screen bg-[#E8EDF2] items-center justify-center p-4">
          <div className="bg-white p-8 rounded shadow text-center max-w-sm w-full">
            <h1 className="text-2xl font-bold mb-4">Exam Completed</h1>
            <p className="mb-2">Score: {result.score}</p>
            <p className="mb-2">Correct: {result.correctCount}</p>
            <p className="mb-6">Incorrect: {result.incorrectCount}</p>
            <button onClick={() => window.close()} className="px-6 py-2 bg-blue-600 text-white rounded font-bold">Close Window</button>
          </div>
      </div>
    );
  }

  const sections = testMeta?.sections || [{ name: 'General'}];
  const summary = getSummary();
  const fullName = user?.name || 'Student';

  // Extract NTA exact logic statuses class formats
  const getButtonClass = (status) => {
     switch(status) {
        case 'answered': return 'text-white bg-[url(\'/tcs/answered.svg\')] bg-contain bg-no-repeat bg-center pb-[2px]';
        case 'unanswered': return 'text-white bg-[url(\'/tcs/not-answered.svg\')] bg-contain bg-no-repeat bg-center pb-[2px]';
        case 'not-visited': return 'text-[#333] bg-[url(\'/tcs/not-visited.svg\')] bg-contain bg-no-repeat bg-center pb-[2px]';
        case 'marked-for-review': return 'text-white bg-[url(\'/tcs/marked.svg\')] bg-contain bg-no-repeat bg-center pb-[2px]';
        case 'answered-and-marked': return 'text-white bg-[url(\'/tcs/answered-marked.svg\')] bg-contain bg-no-repeat bg-center pb-[2px]';
        default: return 'text-[#333] bg-[url(\'/tcs/not-visited.svg\')] bg-contain bg-no-repeat bg-center pb-[2px]';
     }
  };

  return (
    <div className="flex flex-col h-screen w-screen bg-white text-black font-sans overflow-hidden select-none">
      
      {showWarning && (
        <div className="fixed inset-0 z-50 bg-red-600 flex items-center justify-center text-white text-3xl font-bold p-10 text-center animate-pulse">
           Warning! Navigating away is not permitted. Final warning will submit test.
        </div>
      )}

      {/* 1. Header */}
      <div className="h-7 bg-[#212121] text-white flex items-center px-4 text-xs font-semibold">
        <span>Assessment Examination Center</span>
      </div>

      {/* 2. Subheader */}
      <div className="flex justify-between items-stretch border-b border-[#ccc] h-12">
        <div className="bg-[#4a89dc] text-white font-bold px-4 flex items-center flex-1 text-[17px]">
          {testMeta?.title || 'Mock Test'}
        </div>
        
        <div className="flex bg-[#4a89dc] items-stretch hidden md:flex">
          <button className="flex items-center gap-1 px-4 text-white hover:bg-white/10 text-sm font-semibold border-r border-white/20">
            <Info className="w-4 h-4" /> Instructions
          </button>
          <button className="flex items-center gap-1 px-4 text-white hover:bg-white/10 text-sm font-semibold border-r border-[#ccc]">
            <List className="w-4 h-4" /> Question Paper
          </button>
        </div>

        <div className="w-[200px] bg-[#f8f8f8] flex items-center px-2 py-1 gap-2 border-l border-[#ccc]">
          <div className="w-10 h-10 rounded bg-[#e0e0e0] flex items-center justify-center overflow-hidden shrink-0 border border-[#ccc]">
            <UserIcon className="w-8 h-8 text-[#999] mt-2" />
          </div>
          <span className="text-[14px] font-bold text-[#333] truncate">{fullName}</span>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Left Column Canvas */}
        <div className="flex-1 flex flex-col relative md:w-[calc(100%-250px)]">
          <div className="bg-[#f2f2f2] border-b border-[#ccc] px-2 py-[2px] flex items-center relative overflow-x-auto scroller-hide">
            <button className="bg-white border-t-2 border-t-[#3b82f6] border-x border-b border-b-transparent border-x-[#ccc] px-4 text-sm font-bold text-[#333] flex items-center gap-1 min-h-[28px] shrink-0 mt-0.5 rounded-t-sm z-10 -mb-[1.5px]">
              Paper Overview <Info className="w-3.5 h-3.5 text-[#3b82f6]" />
            </button>
          </div>

          <div className="flex justify-between items-center px-4 py-1.5 border-b border-[#ccc] bg-white">
            <span className="text-xs font-bold text-[#333]">Sections</span>
            <span className="text-[13px] font-bold text-[#333]">
              Time Left : {formatTime(timeLeft)}
            </span>
          </div>

          <div className="bg-[#e6f0fa] border-b border-[#ccc] px-2 py-1 flex items-center gap-1 relative z-0 flex-wrap">
            {sections.map(s => (
              <button 
                key={s.name} 
                onClick={() => {
                   setActiveSection(s.name);
                   const firstQ = questions.find((q) => q.section === s.name);
                   if (firstQ) setCurrentIdx(questions.indexOf(firstQ));
                }}
                className={`${activeSection === s.name ? 'bg-[#3b82f6] text-white border-[#3b82f6]' : 'bg-white border-[#ccc] text-[#333] hover:bg-[#f8f8f8]'} border px-3 py-1.5 text-xs font-bold rounded flex items-center gap-1 shrink-0`}
              >
                {s.name} <Info className={`w-3 h-3 ${activeSection === s.name ? 'text-white' : 'text-[#3b82f6]'}`} />
              </button>
            ))}
          </div>

          <div className="flex justify-between items-center px-4 py-2 border-b border-[#ccc] bg-white">
            <span className="text-sm font-bold text-[#333]">Question Type: {currentQuestion?.type}</span>
            <div className="text-xs">
              <span className="text-green-600 font-bold">Marks for correct answer: {currentQuestion?.positiveMarks ?? testMeta?.defaultPositiveMarks}</span>
              <span className="mx-1 text-[#ccc]">|</span>
              <span className="text-red-500 font-bold">Negative Marks: {currentQuestion?.negativeMarks ?? testMeta?.defaultNegativeMarks}</span>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto px-4 py-3 bg-white scroll-smooth relative mb-14">
            <h3 className="text-[15px] font-bold mb-4 text-[#333]">Question No. {currentIdx + 1}</h3>
            <div className="text-[14.5px] text-black pr-2 mb-6 font-medium whitespace-pre-wrap">
              {currentQuestion?.content}
              {currentQuestion?.imageUrl && <img src={currentQuestion.imageUrl} alt="" className="mt-4 max-w-full" />}
            </div>

            <div className="pl-2 space-y-3">
              {currentQuestion?.options?.map((opt, i) => {
                 const isSelected = currentAnswer?.selectedAnswer?.includes(opt.label);
                 return (
                   <label key={opt.label} className="flex flex-row items-start gap-2 cursor-pointer font-medium hover:bg-gray-50 rounded p-1 p-2 border-b border-gray-100">
                     <input 
                       type={currentQuestion.type === 'multiple' ? 'checkbox' : 'radio'} 
                       name={`q-${currentQuestion._id}`}
                       checked={isSelected || false}
                       onChange={() => handleOptionSelect(opt.label)}
                       className="w-4 h-4 mt-1 accent-[#3b82f6] cursor-pointer"
                     />
                     <span className="text-[14.5px]"><b className="mr-1">{opt.label}.</b> {opt.content}</span>
                     {opt.imageUrl && <img src={opt.imageUrl} alt="" className="max-h-24 ml-2" />}
                   </label>
                 )
              })}
            </div>
          </div>

          <div className="absolute bottom-0 left-0 right-0 border-t border-[#ccc] bg-white flex justify-between items-center py-2.5 px-4 shadow-[0_-2px_5px_rgba(0,0,0,0.04)] z-10">
            <div className="flex gap-2">
              <button onClick={handleMarkForReview} className="border border-[#ccc] hover:bg-[#ebf3fa] text-[#333] px-3.5 py-1.5 text-[13px] font-bold rounded shadow-sm">
                Mark for Review & Next
              </button>
              <button onClick={handleClearResponse} className="border border-[#ccc] hover:bg-[#ebf3fa] text-[#333] px-3.5 py-1.5 text-[13px] font-bold rounded shadow-sm hidden sm:block">
                Clear Response
              </button>
            </div>
            <button onClick={handleSaveNext} className="bg-[#2481c4] hover:bg-[#1a5f91] text-white px-8 py-1.5 text-[13px] font-bold rounded shadow-sm duration-150">
              Save & Next
            </button>
          </div>
        </div>

        {/* Right Column Palette */}
        <div className="w-[250px] bg-[#eef3f6] hidden sm:flex flex-col border-l border-[#ccc] shrink-0">
          <div className="p-3 bg-white border-b border-[#ccc] shrink-0">
            <div className="grid grid-cols-2 gap-y-2 gap-x-1 text-[11px] font-medium leading-tight text-[#333]">
              <div className="flex gap-1.5 items-center">
                <div className="w-8 h-7 bg-[url('/tcs/answered.svg')] bg-contain bg-no-repeat bg-center flex items-center justify-center text-white pb-[2px]">{summary.answered}</div>
                <span>Answered</span>
              </div>
              <div className="flex gap-1.5 items-center">
                <div className="w-8 h-7 bg-[url('/tcs/not-answered.svg')] bg-contain bg-no-repeat bg-center flex items-center justify-center text-white pb-[2px]">{summary.unanswered}</div>
                <span>Not<br/>Answered</span>
              </div>
              <div className="flex gap-1.5 items-center">
                <div className="w-8 h-7 bg-[url('/tcs/not-visited.svg')] bg-contain bg-no-repeat bg-center flex items-center justify-center text-[#333] pb-[2px]">{summary.notVisited}</div>
                <span>Not<br/>Visited</span>
              </div>
              <div className="flex gap-1.5 items-center">
                <div className="w-8 h-7 bg-[url('/tcs/marked.svg')] bg-contain bg-no-repeat bg-center flex items-center justify-center text-white pb-[2px]">{summary.markedForReview}</div>
                <span>Marked<br/>for Review</span>
              </div>
            </div>
            <div className="flex gap-1.5 items-center mt-2 text-[11px] font-medium text-[#333]">
               <div className="w-8 h-7 bg-[url('/tcs/answered-marked.svg')] bg-contain bg-no-repeat bg-center flex items-center justify-center text-white pb-[2px]">{summary.answeredAndMarked}</div>
               <span className="leading-tight">Answered & Marked for<br/>Review (will also be evaluated)</span>
            </div>
          </div>

          <div className="bg-[#2481c4] text-white text-[13px] font-bold px-3 py-1.5 shrink-0 flex justify-between">
            {activeSection || 'General'}
          </div>

          <div className="flex-1 overflow-y-auto p-3 bg-[#eef3f6]">
            <div className="text-[12px] font-bold mb-3 text-[#333]">Choose a Question</div>
            <div className="flex flex-wrap gap-2">
              {getFilteredQuestions().map((q) => {
                 const globalIdx = questions.indexOf(q);
                 const ans = answers.find(a => a.questionId === q._id);
                 const status = ans ? ans.status : 'not-visited';
                 return (
                   <button 
                     key={q._id} 
                     onClick={() => setCurrentIdx(globalIdx)}
                     className={`w-[34px] h-[30px] flex items-center justify-center text-[13px] font-bold ${getButtonClass(status)}`}
                   >
                     {globalIdx + 1}
                   </button>
                 )
              })}
            </div>
          </div>

          <div className="py-2.5 px-0 border-t border-[#ccc] bg-[#f2f2f2] flex items-center justify-center shadow-inner shrink-0 gap-2">
            <button onClick={() => setShowSubmitConfirm(true)} className="bg-[#4eb3a1] hover:bg-[#3d8c7e] text-white font-bold text-sm px-10 py-1.5 rounded transition shadow-sm">
              Submit
            </button>
          </div>
        </div>
      </div>

      {showSubmitConfirm && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[100] backdrop-blur-sm">
           <div className="bg-white max-w-sm w-full p-6 text-center text-black border-t-4 border-[#3b82f6] shadow-xl">
              <h2 className="text-xl font-bold mb-4">Submit Evaluation?</h2>
              <div className="grid grid-cols-2 gap-2 text-sm text-left bg-gray-100 p-4 mb-4 rounded font-medium">
                 <div>Answered:</div><div className="text-right text-green-700">{summary.answered}</div>
                 <div>Not Answered:</div><div className="text-right text-red-600">{summary.unanswered}</div>
                 <div>Marked:</div><div className="text-right text-purple-700">{summary.markedForReview}</div>
                 <div>Ans & Marked:</div><div className="text-right text-purple-700">{summary.answeredAndMarked}</div>
                 <div>Not Visited:</div><div className="text-right text-gray-600">{summary.notVisited}</div>
              </div>
              <div className="flex gap-3 mt-5">
                 <button onClick={() => setShowSubmitConfirm(false)} className="flex-1 py-2 border border-[#ccc] bg-[#f5f5f5] font-bold rounded">Cancel</button>
                 <button onClick={() => { setShowSubmitConfirm(false); handleSubmit(); }} className="flex-1 py-2 bg-[#3b82f6] text-white font-bold rounded">Yes, Submit</button>
              </div>
           </div>
        </div>
      )}

      {/* 3. Global Footer Banner */}
      <div className="h-[22px] bg-[#425d76] shrink-0 w-full flex items-center justify-center text-white text-[11px] font-semibold tracking-wider">
        Version : 17.07.00
      </div>
    </div>
  );
}
