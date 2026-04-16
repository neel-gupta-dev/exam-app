import React, { useState, useEffect, useRef, useCallback } from 'react';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';

/**
 * NTA-style CBT Exam Interface
 * - Left panel: question content + section tabs + action buttons
 * - Right panel: question palette + timer + candidate info
 * - Anti-cheat: warns on tab switch (3 warnings), auto-submits on 4th
 */
export default function TestEngine({ testId, user, onSubmitted }) {
  // ─── State ──────────────────────────────────────────────────
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
  const [paletteOpen, setPaletteOpen] = useState(true);

  const syncDirty = useRef(false);
  const timerRef = useRef(null);
  const syncRef = useRef(null);
  const token = user?.token || localStorage.getItem('test_token');

  // ─── API helper ─────────────────────────────────────────────
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

  // ─── Start session on mount ─────────────────────────────────
  useEffect(() => {
    const init = async () => {
      try {
        const data = await apiFetch(`/attempts/${testId}/start`, { method: 'POST' });
        setTestMeta(data.test);
        setQuestions(data.questions);
        setAnswers(data.attempt.answers);
        setAttemptId(data.attempt._id);
        setTabSwitchCount(data.attempt.tabSwitchCount || 0);

        // Calculate remaining time
        const startedAt = new Date(data.attempt.startedAt).getTime();
        const duration = data.test.durationMinutes * 60 * 1000;
        const elapsed = Date.now() - startedAt;
        const remaining = Math.max(0, Math.floor((duration - elapsed) / 1000));
        setTimeLeft(remaining);

        // Set initial section
        if (data.test.sections?.length > 0) {
          setActiveSection(data.test.sections[0].name);
        }

        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };
    init();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ─── Countdown timer ───────────────────────────────────────
  useEffect(() => {
    if (loading || submitted || timeLeft <= 0) return;
    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          handleSubmit(true); // Auto-submit on time expiry
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading, submitted]);

  // ─── Auto-sync every 30 seconds ────────────────────────────
  useEffect(() => {
    if (!attemptId || submitted) return;
    syncRef.current = setInterval(() => {
      if (syncDirty.current) {
        doSync();
      }
    }, 30000);
    return () => clearInterval(syncRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [attemptId, submitted]);

  // ─── Anti-cheat: Tab switch detection ──────────────────────
  useEffect(() => {
    if (submitted) return;
    const handler = () => {
      if (document.hidden) {
        setTabSwitchCount((prev) => {
          const newCount = prev + 1;
          if (newCount >= 4) {
            handleForceSubmit();
          } else {
            setShowWarning(true);
            setTimeout(() => setShowWarning(false), 5000);
          }
          // Sync the violation immediately
          syncDirty.current = true;
          return newCount;
        });
      }
    };
    document.addEventListener('visibilitychange', handler);
    return () => document.removeEventListener('visibilitychange', handler);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [submitted, attemptId]);

  // ─── Core actions ──────────────────────────────────────────
  const doSync = async () => {
    if (!attemptId) return;
    try {
      await apiFetch(`/attempts/${attemptId}/sync`, {
        method: 'PATCH',
        body: JSON.stringify({ answers, tabSwitchCount }),
      });
      syncDirty.current = false;
    } catch (e) {
      console.warn('[Sync] Failed:', e.message);
    }
  };

  const updateAnswer = (questionId, selectedAnswer, status) => {
    setAnswers((prev) =>
      prev.map((a) =>
        a.questionId === questionId ? { ...a, selectedAnswer, status } : a
      )
    );
    syncDirty.current = true;
  };

  const handleOptionSelect = (optionLabel) => {
    const q = questions[currentIdx];
    const current = answers.find((a) => a.questionId === q._id);
    if (!current) return;

    let newSelected;
    if (q.type === 'multiple') {
      // Toggle selection
      if (current.selectedAnswer.includes(optionLabel)) {
        newSelected = current.selectedAnswer.filter((l) => l !== optionLabel);
      } else {
        newSelected = [...current.selectedAnswer, optionLabel];
      }
    } else {
      newSelected = [optionLabel];
    }

    updateAnswer(q._id, newSelected, newSelected.length > 0 ? 'answered' : 'unanswered');
  };

  const handleIntegerInput = (value) => {
    const q = questions[currentIdx];
    updateAnswer(q._id, value ? [value] : [], value ? 'answered' : 'unanswered');
  };

  const handleSaveNext = () => {
    const q = questions[currentIdx];
    const current = answers.find((a) => a.questionId === q._id);
    if (current && current.selectedAnswer.length > 0 && current.status !== 'answered-and-marked') {
      updateAnswer(q._id, current.selectedAnswer, 'answered');
    }
    goNext();
  };

  const handleMarkForReview = () => {
    const q = questions[currentIdx];
    const current = answers.find((a) => a.questionId === q._id);
    if (!current) return;
    const newStatus = current.selectedAnswer.length > 0 ? 'answered-and-marked' : 'marked-for-review';
    updateAnswer(q._id, current.selectedAnswer, newStatus);
    goNext();
  };

  const handleClearResponse = () => {
    const q = questions[currentIdx];
    updateAnswer(q._id, [], 'unanswered');
  };

  const goNext = () => {
    const filteredQuestions = getFilteredQuestions();
    const currentFilterIdx = filteredQuestions.findIndex((q) => q._id === questions[currentIdx]._id);
    if (currentFilterIdx < filteredQuestions.length - 1) {
      const nextQ = filteredQuestions[currentFilterIdx + 1];
      const globalIdx = questions.findIndex((q) => q._id === nextQ._id);
      setCurrentIdx(globalIdx);
    }
  };

  const handleSubmit = async (isAuto = false) => {
    if (submitted) return;
    // Final sync before submit
    await doSync();
    try {
      const res = await apiFetch(`/attempts/${attemptId}/submit`, { method: 'POST' });
      setResult(res);
      setSubmitted(true);
      clearInterval(timerRef.current);
      clearInterval(syncRef.current);
    } catch (e) {
      alert('Failed to submit: ' + e.message);
    }
  };

  const handleForceSubmit = async () => {
    if (submitted) return;
    try {
      await doSync();
      const res = await apiFetch(`/attempts/${attemptId}/force-submit`, { method: 'POST' });
      setResult(res);
      setSubmitted(true);
      clearInterval(timerRef.current);
      clearInterval(syncRef.current);
    } catch (e) {
      console.error('[ForceSubmit]', e);
    }
  };

  // ─── Helpers ───────────────────────────────────────────────
  const getFilteredQuestions = () => {
    if (!activeSection) return questions;
    return questions.filter((q) => q.section === activeSection);
  };

  const formatTime = (seconds) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'answered': return '#34A853';
      case 'marked-for-review': return '#7B1FA2';
      case 'answered-and-marked': return '#7B1FA2';
      case 'unanswered': return '#E53935';
      default: return '#9E9E9E';
    }
  };

  const getStatusBg = (status) => {
    switch (status) {
      case 'answered': return 'bg-green-600 text-white';
      case 'marked-for-review': return 'bg-purple-700 text-white';
      case 'answered-and-marked': return 'bg-purple-700 text-white';
      case 'unanswered': return 'bg-red-600 text-white';
      default: return 'bg-gray-300 text-gray-700';
    }
  };

  const getSummary = () => {
    const summary = { answered: 0, unanswered: 0, markedForReview: 0, answeredAndMarked: 0, notVisited: 0 };
    for (const a of answers) {
      switch (a.status) {
        case 'answered': summary.answered++; break;
        case 'unanswered': summary.unanswered++; break;
        case 'marked-for-review': summary.markedForReview++; break;
        case 'answered-and-marked': summary.answeredAndMarked++; break;
        default: summary.notVisited++; break;
      }
    }
    return summary;
  };

  // ─── Loading / Error states ────────────────────────────────
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#E8EDF2]">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-600 font-medium">Loading your exam...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#E8EDF2]">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md text-center">
          <div className="text-red-500 text-5xl mb-4">⚠</div>
          <h2 className="text-xl font-bold text-slate-800 mb-2">Cannot Start Exam</h2>
          <p className="text-slate-600">{error}</p>
        </div>
      </div>
    );
  }

  // ─── SUBMISSION RESULT SCREEN ──────────────────────────────
  if (submitted && result) {
    return (
      <div className="min-h-screen bg-[#E8EDF2] flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-2xl p-8 max-w-lg w-full text-center">
          <div className="text-6xl mb-4">📋</div>
          <h1 className="text-2xl font-bold text-slate-800 mb-1">Test Submitted</h1>
          <p className="text-sm text-slate-500 mb-6">{testMeta.title}</p>

          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-green-50 rounded-lg p-4">
              <p className="text-3xl font-bold text-green-600">{result.totalScore}</p>
              <p className="text-xs text-green-700">Score</p>
            </div>
            <div className="bg-blue-50 rounded-lg p-4">
              <p className="text-3xl font-bold text-blue-600">{result.percentage}%</p>
              <p className="text-xs text-blue-700">Percentage</p>
            </div>
          </div>

          {result.sectionScores && (
            <div className="text-left mb-6">
              <h3 className="font-bold text-sm text-slate-700 mb-2 uppercase tracking-wider">Section Breakdown</h3>
              <div className="space-y-2">
                {Object.entries(result.sectionScores).map(([section, data]) => (
                  <div key={section} className="flex items-center justify-between bg-slate-50 rounded-lg px-4 py-2 text-sm">
                    <span className="font-medium text-slate-700">{section}</span>
                    <div className="flex gap-3 text-xs">
                      <span className="text-green-600">✓ {data.correct}</span>
                      <span className="text-red-600">✗ {data.wrong}</span>
                      <span className="text-slate-400">— {data.unattempted}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <button
            onClick={() => window.close()}
            className="bg-[#3A5C8E] text-white px-8 py-2.5 rounded-lg font-medium hover:bg-[#2E4A72] transition-colors"
          >
            Close Window
          </button>
        </div>
      </div>
    );
  }

  // ─── MAIN EXAM UI ──────────────────────────────────────────
  const currentQuestion = questions[currentIdx];
  const currentAnswer = answers.find((a) => a.questionId === currentQuestion?._id);
  const filteredQuestions = getFilteredQuestions();
  const sections = testMeta?.sections || [];
  const summary = getSummary();
  const fullName = user?.name || user?.username || 'Student';

  return (
    <div className="flex flex-col h-screen bg-[#E8EDF2] font-sans text-slate-800 select-none overflow-hidden">

      {/* ── Anti-Cheat Warning Overlay ── */}
      {showWarning && (
        <div className="fixed inset-0 z-[999] bg-red-900/90 flex items-center justify-center animate-pulse">
          <div className="text-center text-white">
            <div className="text-7xl mb-4">⚠️</div>
            <h1 className="text-3xl font-bold mb-2">Warning #{tabSwitchCount}</h1>
            <p className="text-lg opacity-90">Switching tabs during the exam is not allowed.</p>
            <p className="text-sm opacity-70 mt-2">
              {tabSwitchCount >= 3
                ? 'FINAL WARNING — Your next tab switch will auto-submit your exam!'
                : `You have ${3 - tabSwitchCount} warning(s) remaining.`}
            </p>
          </div>
        </div>
      )}

      {/* ── Submit Confirmation Modal ── */}
      {showSubmitConfirm && (
        <div className="fixed inset-0 z-[998] bg-black/50 flex items-center justify-center">
          <div className="bg-white rounded-xl shadow-2xl p-6 max-w-sm w-full">
            <h3 className="text-lg font-bold mb-2">Submit Test?</h3>
            <div className="text-sm text-slate-600 mb-4 space-y-1">
              <p>Answered: <strong className="text-green-600">{summary.answered}</strong></p>
              <p>Unanswered: <strong className="text-red-600">{summary.unanswered}</strong></p>
              <p>Marked for Review: <strong className="text-purple-600">{summary.markedForReview}</strong></p>
              <p>Not Visited: <strong className="text-gray-500">{summary.notVisited}</strong></p>
            </div>
            <p className="text-xs text-slate-500 mb-4">Once submitted, you cannot modify your answers.</p>
            <div className="flex gap-3">
              <button onClick={() => setShowSubmitConfirm(false)} className="flex-1 py-2 border border-slate-300 rounded-lg text-sm hover:bg-slate-50">
                Cancel
              </button>
              <button
                onClick={() => { setShowSubmitConfirm(false); handleSubmit(); }}
                className="flex-1 py-2 bg-[#3A5C8E] text-white rounded-lg text-sm hover:bg-[#2E4A72]"
              >
                Submit Now
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ═══════════ TOP HEADER ═══════════ */}
      <div className="bg-[#3A5C8E] text-white px-4 py-2 flex items-center justify-between flex-shrink-0">
        <h1 className="font-bold text-sm truncate flex-1">{testMeta?.title || 'Examination'}</h1>
        <div className="flex items-center gap-4 text-xs">
          <span className="opacity-80">Time Left:</span>
          <span className={`font-mono font-bold text-base ${timeLeft < 300 ? 'text-red-300 animate-pulse' : ''}`}>
            {formatTime(timeLeft)}
          </span>
        </div>
      </div>

      {/* ═══════════ SECTION TABS ═══════════ */}
      {sections.length > 0 && (
        <div className="bg-[#C4E2ED] border-b border-slate-300 flex-shrink-0">
          <div className="flex">
            {sections.map((s) => (
              <button
                key={s.name}
                onClick={() => {
                  setActiveSection(s.name);
                  const firstQ = questions.find((q) => q.section === s.name);
                  if (firstQ) setCurrentIdx(questions.indexOf(firstQ));
                }}
                className={`px-6 py-2.5 text-sm font-semibold border-r border-slate-300 transition-colors ${
                  activeSection === s.name
                    ? 'bg-white text-[#3A5C8E] border-b-2 border-b-[#3A5C8E]'
                    : 'text-slate-600 hover:bg-white/50'
                }`}
              >
                {s.name}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ═══════════ MAIN CONTENT ═══════════ */}
      <div className="flex flex-1 overflow-hidden">

        {/* ── Left: Question Area ── */}
        <div className="flex-1 flex flex-col bg-white border-r border-slate-300">

          {/* Question Header */}
          <div className="bg-slate-50 border-b border-slate-200 px-6 py-2.5 flex items-center justify-between flex-shrink-0">
            <span className="font-semibold text-sm text-slate-700">
              Question {currentIdx + 1} of {questions.length}
            </span>
            <div className="text-xs text-slate-500">
              Marks: <span className="text-green-600 font-bold">+{currentQuestion?.positiveMarks ?? testMeta?.defaultPositiveMarks}</span>
              {' / '}
              <span className="text-red-600 font-bold">-{currentQuestion?.negativeMarks ?? testMeta?.defaultNegativeMarks}</span>
            </div>
          </div>

          {/* Question Content */}
          <div className="flex-1 overflow-y-auto px-6 py-5">
            {/* Question Text */}
            <div className="mb-6">
              <p className="text-[15px] leading-relaxed whitespace-pre-wrap">{currentQuestion?.content}</p>
              {currentQuestion?.imageUrl && (
                <img src={currentQuestion.imageUrl} alt="Question" className="mt-4 max-w-full max-h-64 rounded border" />
              )}
            </div>

            {/* Options / Integer Input */}
            {currentQuestion?.type === 'integer' ? (
              <div>
                <label className="text-sm font-semibold text-slate-600 mb-2 block">Your Answer:</label>
                <input
                  type="number"
                  value={currentAnswer?.selectedAnswer?.[0] || ''}
                  onChange={(e) => handleIntegerInput(e.target.value)}
                  className="w-48 px-4 py-2.5 border-2 border-slate-300 rounded-lg text-lg font-mono focus:border-[#3A5C8E] focus:outline-none"
                  placeholder="Enter integer"
                />
              </div>
            ) : (
              <div className="space-y-3">
                {currentQuestion?.options?.map((opt) => {
                  const isSelected = currentAnswer?.selectedAnswer?.includes(opt.label);
                  return (
                    <button
                      key={opt.label}
                      onClick={() => handleOptionSelect(opt.label)}
                      className={`w-full text-left flex items-start gap-3 p-3.5 rounded-lg border-2 transition-all ${
                        isSelected
                          ? 'border-[#3A5C8E] bg-[#E8F0FE]'
                          : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                      }`}
                    >
                      <span className={`w-8 h-8 flex-shrink-0 flex items-center justify-center rounded-full border-2 font-bold text-sm ${
                        isSelected ? 'bg-[#3A5C8E] border-[#3A5C8E] text-white' : 'border-slate-300 text-slate-500'
                      }`}>
                        {opt.label}
                      </span>
                      <span className="text-[14px] leading-relaxed pt-1">{opt.content}</span>
                      {opt.imageUrl && (
                        <img src={opt.imageUrl} alt={`Option ${opt.label}`} className="mt-2 max-h-32 rounded" />
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* ── Bottom Action Bar ── */}
          <div className="border-t border-slate-200 bg-slate-50 px-6 py-3 flex items-center justify-between flex-shrink-0">
            <div className="flex gap-2">
              <button
                onClick={handleMarkForReview}
                className="px-4 py-2 text-xs font-semibold rounded border border-purple-400 text-purple-700 hover:bg-purple-50 transition-colors"
              >
                Mark for Review & Next
              </button>
              <button
                onClick={handleClearResponse}
                className="px-4 py-2 text-xs font-semibold rounded border border-slate-300 text-slate-600 hover:bg-slate-100 transition-colors"
              >
                Clear Response
              </button>
            </div>
            <div className="flex gap-2">
              {currentIdx > 0 && (
                <button
                  onClick={() => setCurrentIdx(currentIdx - 1)}
                  className="px-5 py-2 text-xs font-semibold rounded border border-slate-300 text-slate-600 hover:bg-slate-100 transition-colors"
                >
                  ← Back
                </button>
              )}
              <button
                onClick={handleSaveNext}
                className="px-5 py-2 text-xs font-semibold rounded bg-[#3A5C8E] text-white hover:bg-[#2E4A72] transition-colors"
              >
                Save & Next →
              </button>
            </div>
          </div>
        </div>

        {/* ── Right: Palette Panel ── */}
        {paletteOpen && (
          <div className="w-72 flex flex-col bg-white border-l border-slate-300 flex-shrink-0">

            {/* Candidate Info */}
            <div className="p-4 border-b border-slate-200 flex items-center gap-3">
              <div className="w-10 h-10 bg-[#3A5C8E] rounded-full flex items-center justify-center text-white font-bold text-sm">
                {fullName.charAt(0).toUpperCase()}
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-800 truncate max-w-[180px]">{fullName}</p>
                <p className="text-[10px] text-slate-400">Candidate</p>
              </div>
            </div>

            {/* Legend */}
            <div className="px-4 py-3 border-b border-slate-200 grid grid-cols-2 gap-2 text-[10px]">
              <div className="flex items-center gap-1.5">
                <span className="w-5 h-5 rounded bg-gray-300 flex items-center justify-center text-[9px] text-gray-600">1</span>
                <span>Not Visited</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-5 h-5 rounded bg-red-600 text-white flex items-center justify-center text-[9px]">1</span>
                <span>Not Answered</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-5 h-5 rounded bg-green-600 text-white flex items-center justify-center text-[9px]">1</span>
                <span>Answered</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-5 h-5 rounded bg-purple-700 text-white flex items-center justify-center text-[9px]">1</span>
                <span>Marked Review</span>
              </div>
            </div>

            {/* Question Grid */}
            <div className="flex-1 overflow-y-auto p-4">
              <h4 className="text-[10px] uppercase tracking-wider font-bold text-slate-500 mb-3">
                {activeSection || 'All Questions'}
              </h4>
              <div className="grid grid-cols-5 gap-2">
                {filteredQuestions.map((q) => {
                  const globalIdx = questions.indexOf(q);
                  const ans = answers.find((a) => a.questionId === q._id);
                  const status = ans?.status || 'not-visited';
                  const isActive = globalIdx === currentIdx;

                  return (
                    <button
                      key={q._id}
                      onClick={() => setCurrentIdx(globalIdx)}
                      className={`w-9 h-9 rounded text-xs font-bold transition-all relative ${getStatusBg(status)} ${
                        isActive ? 'ring-2 ring-[#3A5C8E] ring-offset-1 scale-110' : 'hover:scale-105'
                      }`}
                    >
                      {globalIdx + 1}
                      {status === 'answered-and-marked' && (
                        <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border border-white text-[7px] flex items-center justify-center">✓</span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Submit Button */}
            <div className="p-4 border-t border-slate-200">
              <button
                onClick={() => setShowSubmitConfirm(true)}
                className="w-full py-2.5 bg-[#5BB9E7] text-white font-semibold rounded-lg hover:bg-[#4AA8D6] transition-colors text-sm"
              >
                Submit Test
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ═══════════ BOTTOM FOOTER ═══════════ */}
      <div className="bg-[#5C7DA3] text-white text-center py-0.5 text-[10px] flex-shrink-0">
        vayl.in — Secure Examination Environment
      </div>
    </div>
  );
}
