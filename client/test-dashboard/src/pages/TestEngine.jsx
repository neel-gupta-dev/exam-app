import React, { useState, useEffect, useRef, useCallback } from 'react';
import { User as UserIcon, List, ChevronLeft, ChevronRight, X, Grid } from 'lucide-react';
import LatexRenderer from '../components/LatexRenderer';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export default function TestEngine({ testId, user, onSubmitted }) {
  // ─── State ───
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [testMeta, setTestMeta] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [activeSection, setActiveSection] = useState(null);
  const [timeLeft, setTimeLeft] = useState(0);
  const [, setTabSwitchCount] = useState(0);
  const [showWarning, setShowWarning] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState(null);
  const [showSubmitConfirm, setShowSubmitConfirm] = useState(false);
  const [publicIp, setPublicIp] = useState('');
  const [showInstructionsPanel, setShowInstructionsPanel] = useState(false);
  const [showQuestionPaper, setShowQuestionPaper] = useState(false);
  const [showGridMobile, setShowGridMobile] = useState(false);

  const syncDirty = useRef(false);
  const timerRef = useRef(null);
  const syncRef = useRef(null);
  const submitLock = useRef(false);
  const latestAnswersRef = useRef([]);
  const latestTimeLeftRef = useRef(0);
  const telemetryRef = useRef({});
  const activeVisitRef = useRef(null);
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
    const text = await res.text();
    let data = {};
    try {
      data = text ? JSON.parse(text) : {};
    } catch {
      data = { message: text || 'Invalid server response' };
    }
    if (!res.ok) throw new Error(data.message || 'Request failed');
    return data;
  }, [token]);

  // ─── Start session on mount ───
  useEffect(() => {
    const init = async () => {
      try {
        if (!testId) {
          throw new Error('Missing test session. Please start the test again from the dashboard.');
        }

        // We use assessment start route which is tied to /assessment if we updated the server
        const data = await apiFetch(`/assessment/${testId}/start`, { method: 'GET' });
        if (!data.test) {
          throw new Error('Invalid assessment response: missing test metadata.');
        }
        if (!Array.isArray(data.questions) || data.questions.length === 0) {
          throw new Error('No questions are available for this test.');
        }

        setTestMeta(data.test);
        setQuestions(data.questions);
        
        // Transform Object to Array if session format returned Object
        // But the previous API returned attempt.answers. Let's assume assessmentController returns data in array or map format.
        // In assessmentController I wrote: answers: {} Map of questionId -> { status, selectedOption }
        const parsedAnswers = [];
        const restoredTelemetry = {};
        if (data.session && data.session.answers) {
          Object.keys(data.session.answers).forEach(qId => {
             const sessionAnswer = data.session.answers[qId] || {};
             parsedAnswers.push({
               questionId: qId,
               selectedAnswer: sessionAnswer.selectedOption || [],
               status: sessionAnswer.status
             })
             restoredTelemetry[qId] = {
               timeSpentSeconds: Number(sessionAnswer.timeSpentSeconds) || 0,
               visitCount: Number(sessionAnswer.visitCount) || 0,
               firstVisitedAt: sessionAnswer.firstVisitedAt || null,
               lastVisitedAt: sessionAnswer.lastVisitedAt || null,
               visitLog: Array.isArray(sessionAnswer.visitLog) ? sessionAnswer.visitLog : [],
             };
          })
        }
        telemetryRef.current = restoredTelemetry;
        setAnswers(parsedAnswers);

        // Calculate remaining time
        setTimeLeft(data.session ? data.session.timeLeft : data.test.durationMinutes * 60);
        setPublicIp(data.session?.publicIp || '');

        // Set initial section with safety checks
        if (data.test.sections && data.test.sections.length > 0) {
          setActiveSection(data.test.sections[0].name);
        } else if (data.questions && data.questions.length > 0) {
          setActiveSection(data.questions[0].section || 'General');
        } else {
          setActiveSection('General');
        }

        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };
    init();
  }, [testId, apiFetch]);

  const currentQuestion = questions[currentIdx];
  const currentAnswer = answers.find((a) => a.questionId === currentQuestion?._id);

  const closeActiveVisit = useCallback((leftAtMs = Date.now()) => {
    const activeVisit = activeVisitRef.current;
    if (!activeVisit?.questionId) return;

    const durationSeconds = Math.max(0, Math.round((leftAtMs - activeVisit.enteredAtMs) / 1000));
    const previous = telemetryRef.current[activeVisit.questionId] || {
      timeSpentSeconds: 0,
      visitCount: 0,
      firstVisitedAt: null,
      lastVisitedAt: null,
      visitLog: [],
    };
    const enteredAt = new Date(activeVisit.enteredAtMs).toISOString();
    const leftAt = new Date(leftAtMs).toISOString();

    telemetryRef.current = {
      ...telemetryRef.current,
      [activeVisit.questionId]: {
        ...previous,
        timeSpentSeconds: (previous.timeSpentSeconds || 0) + durationSeconds,
        firstVisitedAt: previous.firstVisitedAt || enteredAt,
        lastVisitedAt: enteredAt,
        visitLog: [
          ...(previous.visitLog || []),
          { enteredAt, leftAt, durationSeconds },
        ],
      },
    };
    activeVisitRef.current = null;
    syncDirty.current = true;
  }, []);

  const openQuestionVisit = useCallback((questionId) => {
    if (!questionId) return;
    const now = Date.now();
    if (activeVisitRef.current?.questionId === questionId) return;
    closeActiveVisit(now);

    const previous = telemetryRef.current[questionId] || {
      timeSpentSeconds: 0,
      visitCount: 0,
      firstVisitedAt: null,
      lastVisitedAt: null,
      visitLog: [],
    };
    const enteredAt = new Date(now).toISOString();
    telemetryRef.current = {
      ...telemetryRef.current,
      [questionId]: {
        ...previous,
        visitCount: (previous.visitCount || 0) + 1,
        firstVisitedAt: previous.firstVisitedAt || enteredAt,
        lastVisitedAt: enteredAt,
      },
    };
    activeVisitRef.current = { questionId, enteredAtMs: now };
    syncDirty.current = true;
  }, [closeActiveVisit]);

  const getTelemetrySnapshot = useCallback(({ closeCurrent = false } = {}) => {
    if (closeCurrent) {
      closeActiveVisit(Date.now());
      return telemetryRef.current;
    }

    const snapshot = { ...telemetryRef.current };
    const activeVisit = activeVisitRef.current;
    if (activeVisit?.questionId) {
      const previous = snapshot[activeVisit.questionId] || {
        timeSpentSeconds: 0,
        visitCount: 0,
        firstVisitedAt: null,
        lastVisitedAt: null,
        visitLog: [],
      };
      const elapsedSeconds = Math.max(0, Math.round((Date.now() - activeVisit.enteredAtMs) / 1000));
      snapshot[activeVisit.questionId] = {
        ...previous,
        timeSpentSeconds: (previous.timeSpentSeconds || 0) + elapsedSeconds,
      };
    }
    return snapshot;
  }, [closeActiveVisit]);

  const closeAttemptWindow = useCallback(() => {
    localStorage.setItem('post_submit_view', 'analytics');
    if (window.opener && !window.opener.closed) {
      window.opener.postMessage({ type: 'cbt:submitted' }, window.location.origin);
    }
    if (document.fullscreenElement) {
      document.exitFullscreen().catch(() => {});
    }
    if (onSubmitted) onSubmitted();
    window.close();
  }, [onSubmitted]);

  useEffect(() => {
    latestAnswersRef.current = answers;
  }, [answers]);

  useEffect(() => {
    latestTimeLeftRef.current = timeLeft;
  }, [timeLeft]);

  useEffect(() => {
    if (!currentQuestion || submitted) return;
    openQuestionVisit(currentQuestion._id);
  }, [currentQuestion?._id, openQuestionVisit, submitted]);

  useEffect(() => {
    return () => closeActiveVisit(Date.now());
  }, [closeActiveVisit]);

  useEffect(() => {
    if (!submitted || !result) return;
    const closeTimer = setTimeout(() => closeAttemptWindow(), 900);
    return () => clearTimeout(closeTimer);
  }, [submitted, result, closeAttemptWindow]);

  // Disable right-click
  useEffect(() => {
    const handleContextMenu = (e) => e.preventDefault();
    document.addEventListener("contextmenu", handleContextMenu);
    return () => document.removeEventListener("contextmenu", handleContextMenu);
  }, []);

  // ─── Countdown timer ───
  useEffect(() => {
    if (loading || submitted) return;
    if (timeLeft <= 0) {
      handleSubmit(true);
      return;
    }
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

  // ─── Mark viewed questions as unanswered ───
  useEffect(() => {
    if (!currentQuestion || submitted) return;
    setAnswers(prev => {
      if (prev.some(a => a.questionId === currentQuestion._id)) return prev;
      syncDirty.current = true;
      return [...prev, { questionId: currentQuestion._id, selectedAnswer: [], status: 'unanswered' }];
    });
  }, [currentQuestion, submitted]);

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

  const doSync = async ({ silent = true, closeCurrent = false } = {}) => {
    try {
      // Map back to Object for Redis
      const outAnswers = {};
      const telemetrySnapshot = getTelemetrySnapshot({ closeCurrent });
      latestAnswersRef.current.forEach(a => {
        const telemetry = telemetrySnapshot[a.questionId] || {};
        outAnswers[a.questionId] = {
           status: a.status,
           selectedOption: a.selectedAnswer,
           timeSpentSeconds: telemetry.timeSpentSeconds || 0,
           visitCount: telemetry.visitCount || 0,
           firstVisitedAt: telemetry.firstVisitedAt || null,
           lastVisitedAt: telemetry.lastVisitedAt || null,
           visitLog: telemetry.visitLog || [],
        };
      });
      Object.entries(telemetrySnapshot).forEach(([questionId, telemetry]) => {
        if (outAnswers[questionId]) return;
        outAnswers[questionId] = {
          status: 'unanswered',
          selectedOption: [],
          timeSpentSeconds: telemetry.timeSpentSeconds || 0,
          visitCount: telemetry.visitCount || 0,
          firstVisitedAt: telemetry.firstVisitedAt || null,
          lastVisitedAt: telemetry.lastVisitedAt || null,
          visitLog: telemetry.visitLog || [],
        };
      });
      await apiFetch(`/assessment/${testId}/sync`, {
        method: 'POST',
        body: JSON.stringify({ answers: outAnswers, timeLeft: latestTimeLeftRef.current }),
      });
      syncDirty.current = false;
      return true;
    } catch (e) {
      console.warn('[Sync] Failed:', e.message);
      if (!silent) throw e;
      return false;
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

  const handleIntegerSelect = (val) => {
    if (!currentQuestion) return;
    const cleanVal = val.trim();
    const newSelected = cleanVal ? [cleanVal] : [];
    updateAnswer(currentQuestion._id, newSelected, newSelected.length > 0 ? 'answered' : 'unanswered');
  };

  const handleSaveNext = () => {
    if (!currentQuestion) return;
    const current = answers.find((a) => a.questionId === currentQuestion._id);
    const existingStatus = current ? current.status : 'not-visited';

    if (current && current.selectedAnswer.length > 0 && existingStatus !== 'answered-and-marked') {
      updateAnswer(currentQuestion._id, current.selectedAnswer, 'answered');
    } else if (!current || current.selectedAnswer.length === 0) {
      const newStatus = existingStatus === 'marked-for-review' ? 'marked-for-review' : 'unanswered';
      updateAnswer(currentQuestion._id, [], newStatus);
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
    if (!currentQuestion) return;
    const filteredQuestions = getFilteredQuestions();
    const currentFilterIdx = filteredQuestions.findIndex((q) => q._id === currentQuestion._id);
    if (currentFilterIdx >= 0 && currentFilterIdx < filteredQuestions.length - 1) {
      const nextQ = filteredQuestions[currentFilterIdx + 1];
      const globalIdx = questions.findIndex((q) => q._id === nextQ._id);
      setCurrentIdx(globalIdx);
    } else if (currentFilterIdx === filteredQuestions.length - 1) {
      const currSectionIdx = sections.findIndex(s => s.name === activeSection);
      if (currSectionIdx >= 0 && currSectionIdx < sections.length - 1) {
        for (let i = currSectionIdx + 1; i < sections.length; i++) {
           const nextSection = sections[i].name;
           const firstQ = questions.find(q => q.section === nextSection);
           if (firstQ) {
               setActiveSection(nextSection);
               setCurrentIdx(questions.indexOf(firstQ));
               break;
           }
        }
      }
    }
  };

  const handleSubmit = async (isAutoSubmit = false) => {
    if (submitted || submitLock.current) return;
    submitLock.current = true;
    setIsSubmitting(true);
    try {
      await doSync({ silent: isAutoSubmit, closeCurrent: true });
    } catch (e) {
      if (currentQuestion) openQuestionVisit(currentQuestion._id);
      alert('Failed to save your latest answers: ' + e.message);
      setIsSubmitting(false);
      submitLock.current = false;
      return;
    }
    
    let success = false;
    let attempts = 0;
    const maxAttempts = isAutoSubmit ? 20 : 1;
    while (!success && attempts < maxAttempts) {
      attempts += 1;
      try {
        const res = await apiFetch(`/assessment/${testId}/submit`, { method: 'POST' });
        setResult(res);
        setSubmitted(true);
        success = true;
        clearInterval(timerRef.current);
        clearInterval(syncRef.current);
      } catch (e) {
        if (!isAutoSubmit) {
          if (currentQuestion) openQuestionVisit(currentQuestion._id);
          alert('Failed to submit: ' + e.message);
          setIsSubmitting(false);
          submitLock.current = false;
          return;
        } else {
          await new Promise((resolve) => setTimeout(resolve, 3000));
        }
      }
    }
    if (!success) {
      setError('Auto-submit could not reach the server. Please reconnect and try submitting again.');
    }
    setIsSubmitting(false);
    submitLock.current = false;
  };

  const getFilteredQuestions = () => {
    if (!activeSection) return questions;
    return questions.filter((q) => q.section === activeSection);
  };

  const goPrevious = () => {
    if (!currentQuestion) return;
    const filteredQuestions = getFilteredQuestions();
    const currentFilterIdx = filteredQuestions.findIndex((q) => q._id === currentQuestion._id);
    if (currentFilterIdx > 0) {
      const previousQ = filteredQuestions[currentFilterIdx - 1];
      const globalIdx = questions.findIndex((q) => q._id === previousQ._id);
      setCurrentIdx(globalIdx);
      return;
    }

    const currSectionIdx = sections.findIndex(s => s.name === activeSection);
    if (currSectionIdx > 0) {
      for (let i = currSectionIdx - 1; i >= 0; i--) {
        const previousSection = sections[i].name;
        const previousQuestions = questions.filter(q => q.section === previousSection);
        if (previousQuestions.length) {
          setActiveSection(previousSection);
          setCurrentIdx(questions.indexOf(previousQuestions[previousQuestions.length - 1]));
          break;
        }
      }
    }
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
    return (
      <div className="flex flex-col h-screen items-center justify-center bg-white">
        <div className="animate-spin text-[#3b82f6] text-4xl mb-4">↻</div>
        <p className="text-slate-500 font-medium animate-pulse">Loading examination content...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col h-screen items-center justify-center bg-white p-6 text-center">
        <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mb-4">
          <span className="material-symbols-outlined text-3xl">error</span>
        </div>
        <h2 className="text-xl font-bold text-slate-800 mb-2">Failed to Start Test</h2>
        <p className="text-slate-600 mb-6 max-w-md">{error}</p>
        <button 
          onClick={() => window.location.reload()}
          className="px-6 py-2 bg-indigo-600 text-white rounded-lg font-bold shadow-lg hover:bg-indigo-700 transition-all"
        >
          Try Again
        </button>
      </div>
    );
  }

  if (isSubmitting) {
    return (
      <div className="flex flex-col h-screen bg-[#E8EDF2] items-center justify-center p-4">
         <div className="bg-white p-8 rounded shadow text-center max-w-sm w-full border-t-4 border-[#e67e22]">
           <div className="animate-spin text-[#e67e22] text-4xl mb-4 flex justify-center">↻</div>
           <h2 className="text-xl font-bold mb-2 text-[#333]">Submitting Test...</h2>
           <p className="text-slate-600 font-medium text-sm">Please do not close this window. We are securely uploading your responses.</p>
         </div>
      </div>
    );
  }

  if (submitted && result) {
    return (
      <div className="flex flex-col h-screen bg-[#E8EDF2] items-center justify-center p-4">
          <div className="bg-white p-8 rounded shadow text-center max-w-lg w-full border-t-4 border-[#3b82f6]">
            <h1 className="text-2xl font-bold mb-4 text-[#3a5c8e]">Evaluation Submitted</h1>
            <p className="mb-6 text-slate-600 font-medium">Your test has been successfully submitted. This attempt window will close automatically.</p>
            <div className="flex justify-center mt-6">
              <button onClick={closeAttemptWindow} className="px-8 py-2.5 bg-[#3b82f6] hover:bg-[#2563eb] text-white rounded font-bold shadow-sm transition">
                Close Window
              </button>
            </div>
          </div>
      </div>
    );
  }

  const sections = testMeta?.sections?.length ? testMeta.sections : [{ name: 'General'}];
  const summary = getSummary();
  const fullName = user?.name || user?.username || user?.email || 'Student';
  const watermarkText = `${fullName}${publicIp ? `       ·       ${publicIp}` : ''}`;
  const activeSectionQuestions = getFilteredQuestions();
  const currentLocalIdx = Math.max(0, activeSectionQuestions.findIndex((q) => q._id === currentQuestion?._id));
  const questionTypeLabels = {
    single: 'Single Correct Question',
    multiple: 'Multiple Select Question',
    integer: 'Numerical Answer Question',
    subjective: 'Subjective Question',
  };
  const questionTypeLabel = questionTypeLabels[currentQuestion?.type] || currentQuestion?.type || 'Question';
  const liveInstructions = testMeta?.instructions?.general?.length
    ? testMeta.instructions.general
    : ['Read each question carefully before selecting an answer.', 'Use Save & Next to preserve your current response.'];
  const paperTabs = testMeta?.parts?.length
    ? testMeta.parts
    : [
        { name: `${testMeta?.category || 'Paper'} A` },
        { name: `${testMeta?.category || 'Paper'} B` },
      ];

  const TcsIcon = ({ status, text, large = false }) => {
    const size = large ? 'w-[68px] h-[54px] text-[21px]' : 'w-[38px] h-[34px] text-[16px]';
    const base = `${size} flex items-center justify-center font-bold shrink-0 leading-none`;
    switch(status) {
      case 'not-visited':
        return (
          <div
            className={`${base} text-[#111] rounded-[3px] border border-[#9d9d9d] bg-gradient-to-b from-white to-[#dfdfdf]`}
            style={{ boxShadow: 'inset 0 -7px 8px -5px rgba(0,0,0,0.25), 0 1px 1px rgba(0,0,0,0.2)' }}
          >
            {text}
          </div>
        );
      case 'answered':
        return (
          <div
            className={`${base} text-white bg-gradient-to-b from-[#8ad734] to-[#3f8f0d]`}
            style={{ clipPath: 'polygon(15% 0%, 85% 0%, 100% 28%, 100% 100%, 0% 100%, 0% 28%)', textShadow: '0 1px 1px rgba(0,0,0,0.55)' }}
          >
            {text}
          </div>
        );
      case 'unanswered':
        return (
          <div
            className={`${base} text-white bg-gradient-to-b from-[#ff6b17] to-[#c62902]`}
            style={{ clipPath: 'polygon(0% 0%, 100% 0%, 100% 68%, 70% 100%, 30% 100%, 0% 68%)', textShadow: '0 1px 1px rgba(0,0,0,0.55)' }}
          >
            {text}
          </div>
        );
      case 'marked-for-review':
        return (
          <div className={`${base} rounded-full text-white bg-gradient-to-b from-[#8e62b5] to-[#56317d]`} style={{ textShadow: '0 1px 1px rgba(0,0,0,0.55)' }}>
            {text}
          </div>
        );
      case 'answered-and-marked':
        return (
          <div className={`${base} relative rounded-full text-white bg-gradient-to-b from-[#8e62b5] to-[#56317d]`} style={{ textShadow: '0 1px 1px rgba(0,0,0,0.55)' }}>
            {text}
            <div className="absolute -bottom-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-[3px] border border-white bg-[#70b72b]">
              <div className="h-2 w-2 rounded-[1px] bg-white" />
            </div>
          </div>
        );
      default:
        return (
          <div className={`${base} text-[#111] rounded-[3px] border border-[#9d9d9d] bg-gradient-to-b from-white to-[#dfdfdf]`}>
            {text}
          </div>
        );
    }
  };

  return (
    <div className="flex h-screen w-screen flex-col overflow-hidden bg-white font-sans text-black select-none">
      {showWarning && (
        <div className="fixed inset-0 z-50 bg-red-600 flex items-center justify-center text-white text-3xl font-bold p-10 text-center animate-pulse">
           Warning! Navigating away is not permitted. Final warning will submit test.
        </div>
      )}

      <div className="flex h-[42px] shrink-0 items-center justify-between bg-[#333] pl-[14px] text-white">
        <div className="min-w-0 truncate text-[16px] font-normal text-[#ffff00]">
          {testMeta?.title || 'Mock Test'}
        </div>
        <div className="flex h-full items-center text-[16px] font-bold">
          <button onClick={() => setShowInstructionsPanel(true)} className="flex h-full items-center gap-2 px-4 text-white hover:bg-[#3f3f3f]">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#4aaee8] text-[18px] italic leading-none text-white shadow-inner">i</span>
            Instructions
          </button>
          <button onClick={() => setShowQuestionPaper(true)} className="flex h-full items-center gap-2 px-4 text-white hover:bg-[#3f3f3f]">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#39b873] text-white shadow-inner">
              <List className="h-4 w-4" />
            </span>
            Question Paper
          </button>
        </div>
      </div>

      <div className="flex min-h-0 flex-1 overflow-hidden">
        <div className="relative flex min-w-0 flex-1 flex-col border-l border-[#c4c4c4]">
          <div className="flex h-[60px] shrink-0 items-center gap-1 border-b border-[#ddd] bg-[#e9e9e9] px-6 overflow-x-auto scrollbar-none" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
            <ChevronLeft className="absolute left-1 h-5 w-5 text-[#b8c0c8]" />
            {paperTabs.map((part, idx) => (
              <button
                key={part.name || idx}
                className={`relative h-[39px] min-w-[102px] border px-3 text-[16px] shadow-sm ${
                  idx === 0
                    ? 'border-[#1988be] bg-[#1b86b9] text-white'
                    : 'border-[#c7c7c7] bg-white text-[#333]'
                }`}
              >
                <span className="flex items-center justify-center gap-2">
                  <span className="truncate">{part.name}</span>
                  <span className={`flex h-6 w-6 items-center justify-center rounded-full text-[16px] italic text-white ${idx === 0 ? 'bg-[#67c8fa]' : 'bg-[#79cafa]'}`}>i</span>
                </span>
                {idx === 0 && <span className="absolute left-1/2 top-full -translate-x-1/2 border-x-[8px] border-t-[8px] border-x-transparent border-t-[#1b86b9]" />}
              </button>
            ))}
          </div>

          <div className="flex h-[41px] shrink-0 items-center justify-between border-b border-[#c7c7c7] bg-white pl-4 pr-3">
            <span className="text-[16px] font-bold text-[#2b4259]">Sections</span>
            <span className="text-[21px] font-semibold text-[#111]">Time Left : {formatTime(timeLeft)}</span>
          </div>

          <div className="relative flex h-[55px] shrink-0 items-center gap-[6px] border-b border-[#c7c7c7] bg-white px-6 overflow-x-auto scrollbar-none" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
            <ChevronLeft className="absolute left-1 h-5 w-5 text-[#b8c0c8]" />
            {sections.map(s => {
              const isActive = activeSection === s.name;
              return (
                <button
                  key={s.name}
                  onClick={() => {
                    setActiveSection(s.name);
                    const firstQ = questions.find((q) => q.section === s.name);
                    if (firstQ) setCurrentIdx(questions.indexOf(firstQ));
                  }}
                  className={`h-[43px] border px-3 text-[16px] font-bold ${
                    isActive
                      ? 'border-[#1682b5] bg-[#1b86b9] text-white'
                      : 'border-[#c9c9c9] bg-white text-[#0069a7]'
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <span className="max-w-[190px] truncate">{s.name}</span>
                    <span className={`flex h-6 w-6 items-center justify-center rounded-full text-[16px] italic text-white ${isActive ? 'bg-[#67c8fa]' : 'bg-[#80cfff]'}`}>i</span>
                  </span>
                </button>
              );
            })}
            <ChevronRight className="absolute right-1 h-5 w-5 text-[#b8c0c8]" />
          </div>

          <div className="flex h-[43px] shrink-0 items-center justify-between border-b border-[#cfcfcf] bg-white px-4 text-[16px]">
            <span className="font-bold">Question Type: {questionTypeLabel}</span>
            <div className="pr-2 text-[16px]">
              <span>Marks for correct answer: <span className="text-[#0080a5]">{currentQuestion?.positiveMarks ?? testMeta?.defaultPositiveMarks}</span></span>
              <span className="mx-2 text-[#555]">|</span>
              <span>Negative Marks: <span className="text-[#b01818]">{currentQuestion?.negativeMarks ?? testMeta?.defaultNegativeMarks}</span></span>
            </div>
          </div>

          <div className="relative min-h-0 flex-1 overflow-y-auto border-b border-[#cfcfcf] bg-white">
            <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden opacity-[0.03]">
              <div className="grid h-full w-full grid-cols-2 gap-20 -rotate-12 place-items-center text-[34px] font-bold uppercase tracking-wider text-[#111]">
                {Array.from({ length: 12 }).map((_, idx) => (
                  <span key={idx} className="whitespace-nowrap">{watermarkText}</span>
                ))}
              </div>
            </div>
            <div className="relative z-10">
            <div className="border-b border-[#ddd] px-[6px] py-[7px]">
              <h3 className="text-[21px] font-bold">Question No. {currentLocalIdx + 1}</h3>
            </div>
            <div className="px-[18px] py-[14px] text-[21px] leading-[1.45]">
              <div className="mb-7 min-h-[34px] whitespace-pre-wrap text-black">
                <LatexRenderer text={currentQuestion?.content} />
                {currentQuestion?.imageUrl && <img src={currentQuestion.imageUrl} alt="" className="mt-4 max-w-full" />}
              </div>
              {currentQuestion?.type !== 'integer' && currentQuestion?.options?.map((opt, i) => {
                const isSelected = currentAnswer?.selectedAnswer?.includes(opt.label);
                return (
                  <label key={opt.label || i} className="mb-[16px] flex cursor-pointer items-start gap-[8px] text-[21px] leading-[1.35]">
                    <input
                      type={currentQuestion.type === 'multiple' ? 'checkbox' : 'radio'}
                      name={`q-${currentQuestion._id}`}
                      checked={isSelected || false}
                      onChange={() => handleOptionSelect(opt.label)}
                      className="mt-[6px] h-[18px] w-[18px] shrink-0 accent-[#1b86b9]"
                    />
                    <span className="flex-1">
                      <LatexRenderer text={opt.content} />
                    </span>
                    {opt.imageUrl && <img src={opt.imageUrl} alt="" className="max-h-28 ml-2" />}
                  </label>
                );
              })}
              {currentQuestion?.type === 'integer' && (
                <div className="mt-4 max-w-sm border border-[#c7c7c7] bg-[#f7f7f7] p-4">
                  <label className="mb-2 block text-[16px] font-bold text-[#333]">Numerical Answer</label>
                  <input
                    type="number"
                    step="any"
                    value={currentAnswer?.selectedAnswer?.[0] || ''}
                    onChange={(e) => handleIntegerSelect(e.target.value)}
                    placeholder="Enter value"
                    className="w-full border border-[#aaa] bg-white px-3 py-2 text-[18px] focus:border-[#1b86b9] focus:outline-none"
                  />
                </div>
              )}
            </div>
            </div>
          </div>

          <div className="flex h-auto sm:h-[70px] shrink-0 flex-col sm:flex-row items-stretch sm:items-center justify-between border-b border-[#c7c7c7] bg-white p-2 sm:px-[10px] gap-2 sm:gap-0">
            <div className="flex flex-1 gap-2 sm:gap-[25px]">
              <button onClick={handleMarkForReview} className="h-[44px] sm:h-[53px] flex-1 sm:min-w-[260px] border border-[#c7c7c7] bg-white px-2 sm:px-6 text-[14px] sm:text-[20px] text-[#333] hover:bg-[#f5f5f5] flex items-center justify-center text-center truncate">
                Mark Review & Next
              </button>
              <button onClick={handleClearResponse} className="h-[44px] sm:h-[53px] flex-1 sm:min-w-[195px] border border-[#c7c7c7] bg-white px-2 sm:px-6 text-[14px] sm:text-[20px] text-[#333] hover:bg-[#f5f5f5] flex items-center justify-center text-center">
                Clear
              </button>
            </div>
            <div className="flex flex-1 gap-2 sm:gap-[20px]">
              <button onClick={goPrevious} className="h-[44px] sm:h-[53px] flex-1 sm:min-w-[132px] border border-[#c7c7c7] bg-white px-2 sm:px-6 text-[14px] sm:text-[20px] text-[#333] hover:bg-[#f5f5f5] flex items-center justify-center text-center">
                Previous
              </button>
              <button onClick={handleSaveNext} className="h-[44px] sm:h-[53px] flex-1 sm:min-w-[164px] border border-[#0e6d9b] bg-[#1b86b9] px-2 sm:px-7 text-[14px] sm:text-[20px] font-bold text-white hover:bg-[#126f99] flex items-center justify-center text-center">
                Save & Next
              </button>
            </div>
          </div>
        </div>

        <div className="hidden w-[335px] shrink-0 flex-col border-l border-[#c7c7c7] bg-[#dff4fc] sm:flex">
          <div className="flex h-[155px] shrink-0 items-start gap-[12px] border-b border-[#c7c7c7] bg-[#f3f7fb] px-[3px] pt-[2px]">
            <div className="flex h-[135px] w-[120px] items-center justify-center border border-[#c7c7c7] bg-white">
              <div className="flex h-[118px] w-[102px] items-center justify-center rounded-full border border-[#9ba9b4] bg-gradient-to-b from-[#d5ebf4] via-[#eef7fb] to-[#8ca2b2]">
                <UserIcon className="h-[92px] w-[92px] text-[#233848]" strokeWidth={1.4} />
              </div>
            </div>
            <div className="min-w-0 pt-[8px] text-[25px] font-normal leading-tight text-[#111]">
              <span className="block truncate">{fullName}</span>
            </div>
          </div>

          <div className="shrink-0 border-b border-[#c7c7c7] bg-white px-[14px] py-[13px]">
            <div className="grid grid-cols-2 gap-x-[16px] gap-y-[18px] text-[16px] leading-tight text-[#111]">
              <div className="flex items-center gap-[12px]">
                <TcsIcon status="answered" text={summary.answered} />
                <span>Answered</span>
              </div>
              <div className="flex items-center gap-[12px]">
                <TcsIcon status="unanswered" text={summary.unanswered} />
                <span>Not<br/>Answered</span>
              </div>
              <div className="flex items-center gap-[12px]">
                <TcsIcon status="not-visited" text={summary.notVisited} />
                <span>Not<br/>Visited</span>
              </div>
              <div className="flex items-center gap-[12px]">
                <TcsIcon status="marked-for-review" text={summary.markedForReview} />
                <span>Marked<br/>for Review</span>
              </div>
            </div>
            <div className="mt-[14px] flex items-start gap-[12px] text-[16px] leading-tight text-[#111]">
              <TcsIcon status="answered-and-marked" text={summary.answeredAndMarked} />
              <span>Answered & Marked for Review (will also be evaluated)</span>
            </div>
          </div>

          <div className="flex h-[44px] shrink-0 items-center bg-[#1b86b9] px-[18px] text-[24px] font-bold text-white">
            {activeSection || 'General'}
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto bg-[#dff4fc] px-[13px] py-[9px]">
            <div className="mb-[20px] text-[16px] font-bold text-[#111]">Choose a Question</div>
            <div className="flex flex-wrap gap-x-[4px] gap-y-[14px]">
              {activeSectionQuestions.map((q, idx) => {
                const globalIdx = questions.indexOf(q);
                const ans = answers.find(a => a.questionId === q._id);
                const status = ans ? ans.status : 'not-visited';
                return (
                  <button
                    key={q._id}
                    onClick={() => setCurrentIdx(globalIdx)}
                    className={`${globalIdx === currentIdx ? 'scale-[1.04]' : ''} focus:outline-none`}
                  >
                    <TcsIcon status={status} text={idx + 1} large />
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex h-[70px] shrink-0 items-center justify-center border-t border-[#c7c7c7] bg-[#dff4fc]">
            <button onClick={() => setShowSubmitConfirm(true)} className="h-[53px] min-w-[118px] rounded-[2px] bg-[#66afd0] px-7 text-[18px] font-bold text-white hover:bg-[#4d9bbd]">
              Submit
            </button>
          </div>
        </div>
      
      {/* Mobile Floating Grid Button */}
      <button 
        onClick={() => setShowGridMobile(true)} 
        className="fixed bottom-28 right-4 z-40 flex sm:hidden h-14 w-14 items-center justify-center rounded-full bg-[#1b86b9] text-white shadow-lg shadow-blue-500/30 border-2 border-white active:scale-95 transition-transform"
        aria-label="Open Palette"
      >
        <Grid className="h-6 w-6" />
      </button>

      {/* Mobile Sliding Bottom Sheet (Sidebar Alternative) */}
      {showGridMobile && (
        <div className="fixed inset-0 z-50 flex sm:hidden flex-col justify-end bg-black/50 backdrop-blur-sm">
          <div className="absolute inset-0" onClick={() => setShowGridMobile(false)} />
          <div className="relative z-10 flex max-h-[85vh] w-full flex-col rounded-t-2xl bg-[#dff4fc] shadow-2xl overflow-hidden animate-in slide-in-from-bottom duration-300">
            {/* Header Area */}
            <div className="flex items-center justify-between border-b border-slate-300/50 bg-[#f3f7fb] px-4 py-4">
              <div className="flex items-center gap-2 font-bold text-[18px] text-[#111]">
                <Grid className="h-5 w-5 text-[#1b86b9]" />
                <span>Question Palette</span>
              </div>
              <button onClick={() => setShowGridMobile(false)} className="rounded-full bg-slate-200 p-2 hover:bg-slate-300 active:scale-90 transition-transform">
                <X className="h-5 w-5 text-[#333]" />
              </button>
            </div>

            {/* Stats Widget */}
            <div className="shrink-0 border-b border-[#c7c7c7] bg-white px-4 py-4">
              <div className="grid grid-cols-2 gap-x-4 gap-y-4 text-[14px] leading-tight text-[#111]">
                <div className="flex items-center gap-2">
                  <TcsIcon status="answered" text={summary.answered} />
                  <span>Answered</span>
                </div>
                <div className="flex items-center gap-2">
                  <TcsIcon status="unanswered" text={summary.unanswered} />
                  <span>Not Answered</span>
                </div>
                <div className="flex items-center gap-2">
                  <TcsIcon status="not-visited" text={summary.notVisited} />
                  <span>Not Visited</span>
                </div>
                <div className="flex items-center gap-2">
                  <TcsIcon status="marked-for-review" text={summary.markedForReview} />
                  <span>Marked for Review</span>
                </div>
              </div>
            </div>

            {/* Scrollable Palette Grid */}
            <div className="min-h-0 flex-1 overflow-y-auto bg-[#dff4fc] px-4 py-4">
              <div className="mb-4 text-[16px] font-bold text-[#111]">{activeSection || 'General'} - Choose Question</div>
              <div className="flex flex-wrap gap-3 pb-4 justify-start">
                {activeSectionQuestions.map((q, idx) => {
                  const globalIdx = questions.indexOf(q);
                  const ans = answers.find(a => a.questionId === q._id);
                  const status = ans ? ans.status : 'not-visited';
                  return (
                    <button
                      key={q._id}
                      onClick={() => {
                        setCurrentIdx(globalIdx);
                        setShowGridMobile(false);
                      }}
                      className="active:scale-95 transition-transform"
                    >
                      <TcsIcon status={status} text={idx + 1} large />
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Bottom Action Area for Mobile Submit */}
            <div className="flex h-[80px] shrink-0 items-center justify-center border-t border-[#c7c7c7] bg-white px-4">
              <button 
                onClick={() => {
                  setShowGridMobile(false);
                  setShowSubmitConfirm(true);
                }} 
                className="h-[50px] w-full rounded-lg bg-[#1b86b9] text-[18px] font-bold text-white shadow-md hover:bg-[#126f99] active:scale-[0.98] transition-transform flex items-center justify-center gap-2"
              >
                <span>Final Submit Test</span>
              </button>
            </div>
          </div>
        </div>
      )}

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

      {showInstructionsPanel && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-6">
          <div className="max-h-[80vh] w-full max-w-2xl overflow-y-auto bg-white p-6 text-black shadow-xl">
            <div className="mb-4 flex items-center justify-between border-b border-[#ddd] pb-3">
              <h2 className="text-xl font-bold">Instructions</h2>
              <button onClick={() => setShowInstructionsPanel(false)} className="border border-[#ccc] px-3 py-1">Close</button>
            </div>
            <ol className="list-decimal space-y-3 pl-5 text-[15px] leading-relaxed">
              {liveInstructions.map((instruction, idx) => (
                <li key={idx}>{instruction}</li>
              ))}
            </ol>
          </div>
        </div>
      )}

      {showQuestionPaper && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-6">
          <div className="max-h-[84vh] w-full max-w-4xl overflow-y-auto bg-white p-6 text-black shadow-xl">
            <div className="mb-4 flex items-center justify-between border-b border-[#ddd] pb-3">
              <h2 className="text-xl font-bold">Question Paper</h2>
              <button onClick={() => setShowQuestionPaper(false)} className="border border-[#ccc] px-3 py-1">Close</button>
            </div>
            <div className="space-y-5">
              {questions.map((question, idx) => (
                <div key={question._id} className="border-b border-[#e5e5e5] pb-4">
                  <div className="mb-2 flex items-center justify-between gap-4">
                    <h3 className="font-bold">Question {idx + 1}</h3>
                    <span className="text-sm text-[#555]">{question.section || 'General'} · {questionTypeLabels[question.type] || question.type}</span>
                  </div>
                  <div className="text-sm leading-relaxed">
                    <LatexRenderer text={question.content} />
                    {question.options?.map((option) => (
                      <div key={option.label} className="mt-2 flex gap-2">
                        <span className="font-bold">{option.label}.</span>
                        <LatexRenderer text={option.content} />
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
