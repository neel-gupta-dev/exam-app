import React, { useState, useEffect, useRef, useCallback } from 'react';
import { List, ChevronLeft, ChevronRight, X, Grid } from 'lucide-react';
import LatexRenderer from '../components/LatexRenderer';
import { API_BASE } from '../config/api';

/* ─────────────────────────────────────────────────────────────────────────────
   RenderContentTable — beautifully renders the custom question/option table
   ─────────────────────────────────────────────────────────────────────────── */
function RenderContentTable({ table }) {
  if (!table || !table.headers || table.headers.length === 0) return null;
  const thStyle = { border: '1px solid rgba(226,232,240,0.2)', padding: '6px 10px', background: 'rgba(79,70,229,0.08)', fontWeight: 600, fontSize: '12px', textAlign: 'left', color: '#475569' };
  const tdStyle = { border: '1px solid rgba(226,232,240,0.15)', padding: '6px 10px', fontSize: '12px', color: '#1e293b' };
  return (
    <div style={{ margin: '8px 0', overflowX: 'auto', borderRadius: '8px', border: '1px solid rgba(226,232,240,0.15)' }}>
      <table style={{ borderCollapse: 'collapse', minWidth: '150px', width: '100%', background: 'rgba(255,255,255,0.6)' }}>
        <thead>
          <tr>
            {table.headers.map((h, i) => (
              <th key={i} style={thStyle}><LatexRenderer text={h || ''} /></th>
            ))}
          </tr>
        </thead>
        <tbody>
          {(table.rows || []).map((row, ri) => (
            <tr key={ri}>
              {row.map((cell, ci) => (
                <td key={ci} style={tdStyle}><LatexRenderer text={cell || ''} /></td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function TestEngine({ testId, user, attemptId, attemptToken, onSubmitted }) {
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
  const [tooltipData, setTooltipData] = useState(null);
  const [showProfilePopup, setShowProfilePopup] = useState(false);

  const syncDirty = useRef(false);
  const timerRef = useRef(null);
  const syncRef = useRef(null);
  const submitLock = useRef(false);
  const doSyncRef = useRef(null);
  const handleSubmitRef = useRef(null);
  const latestAnswersRef = useRef([]);
  const latestTimeLeftRef = useRef(0);
  const telemetryRef = useRef({});
  const activeVisitRef = useRef(null);
  const answerChangeCountRef = useRef({});
  const idleSecondsRef = useRef({});
  const firstActionTimeRef = useRef({});
  const paletteScrollRef = useRef(null);
  const questionScrollRef = useRef(null);
  const token = user?.token || localStorage.getItem('test_token');
  const attemptQuery = `${attemptId || ''}${attemptToken ? `&attemptToken=${encodeURIComponent(attemptToken)}` : ''}`;

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
    if (!res.ok) {
      const err = new Error(data.message || 'Request failed');
      err.status = res.status;
      throw err;
    }
    return data;
  }, [token]);

  // ─── Start session on mount ───
  useEffect(() => {
    sessionStorage.setItem('cbt_tab_switch_count', '0');
    const init = async () => {
      try {
        if (!testId) {
          throw new Error('Missing test session. Please start the test again from the dashboard.');
        }

        // We use assessment start route which is tied to /assessment if we updated the server
        const data = await apiFetch(`/assessment/${testId}/start?attemptId=${attemptQuery}`, { method: 'GET' });
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

        // Set initial section and index with safety checks
        let initialSection = 'General';
        if (data.test.sections && data.test.sections.length > 0) {
          initialSection = data.test.sections[0].name;
        } else if (data.questions && data.questions.length > 0) {
          const firstValidSection = data.questions.find(q => q.section)?.section;
          initialSection = firstValidSection || data.questions[0].section || 'General';
        }
        setActiveSection(initialSection);

        if (data.questions && data.questions.length > 0) {
          const firstQIndex = data.questions.findIndex((q) => q.section === initialSection);
          if (firstQIndex !== -1) {
            setCurrentIdx(firstQIndex);
            
            // Mark the first question as unanswered so it shows up as red immediately
            const firstQId = data.questions[firstQIndex]._id;
            if (!parsedAnswers.some(a => a.questionId === firstQId)) {
              parsedAnswers.push({ questionId: firstQId, selectedAnswer: [], status: 'unanswered' });
            }
          }
        }

        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };
    init();

    // Capture device info once and send to server
    const captureDeviceInfo = async () => {
      try {
        const info = {
          userAgent: navigator.userAgent || '',
          screenResolution: `${screen.width}x${screen.height}`,
          deviceMemory: navigator.deviceMemory || null,
          connectionType: navigator.connection?.effectiveType || '',
          isMobile: /Mobi|Android/i.test(navigator.userAgent),
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || '',
        };
        await apiFetch(`/assessment/${testId}/sync?attemptId=${attemptQuery}`, {
          method: 'POST',
          body: JSON.stringify({ deviceInfo: info }),
        });
      } catch { /* non-critical */ }
    };
    if (testId) captureDeviceInfo();
  }, [testId, attemptQuery, apiFetch]);

  const currentQuestion = questions[currentIdx];
  const currentQuestionId = currentQuestion?._id;
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
    if (!currentQuestionId || submitted) return;
    openQuestionVisit(currentQuestionId);
  }, [currentQuestionId, openQuestionVisit, submitted]);

  useEffect(() => {
    if (questionScrollRef.current) {
      questionScrollRef.current.scrollTop = 0;
    }
  }, [currentIdx]);

  useEffect(() => {
    return () => closeActiveVisit(Date.now());
  }, [closeActiveVisit]);

  useEffect(() => {
    if (!submitted || !result) return;
    const closeTimer = setTimeout(() => closeAttemptWindow(), 900);
    return () => clearTimeout(closeTimer);
  }, [submitted, result, closeAttemptWindow]);

  // Disable right-click, clipboard, and physical keyboard input during CBT.
  useEffect(() => {
    const handleContextMenu = (e) => e.preventDefault();
    const blockInput = (e) => {
      if (e.key === 'F11') return; // Allow F11 for fullscreen
      e.preventDefault();
      e.stopPropagation();
      return false;
    };
    document.addEventListener("contextmenu", handleContextMenu);
    document.addEventListener("auxclick", handleContextMenu);
    document.addEventListener("keydown", blockInput, true);
    document.addEventListener("keypress", blockInput, true);
    document.addEventListener("keyup", blockInput, true);
    document.addEventListener("beforeinput", blockInput, true);
    document.addEventListener("copy", blockInput, true);
    document.addEventListener("cut", blockInput, true);
    document.addEventListener("paste", blockInput, true);
    return () => {
      document.removeEventListener("contextmenu", handleContextMenu);
      document.removeEventListener("auxclick", handleContextMenu);
      document.removeEventListener("keydown", blockInput, true);
      document.removeEventListener("keypress", blockInput, true);
      document.removeEventListener("keyup", blockInput, true);
      document.removeEventListener("beforeinput", blockInput, true);
      document.removeEventListener("copy", blockInput, true);
      document.removeEventListener("cut", blockInput, true);
      document.removeEventListener("paste", blockInput, true);
    };
  }, []);

  // ─── Countdown timer ───
  useEffect(() => {
    if (loading || submitted) return;
    if (timeLeft <= 0) {
      handleSubmitRef.current?.(true);
      return;
    }
    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          handleSubmitRef.current?.(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, [loading, submitted, timeLeft]);

  // ─── Mark viewed questions as unanswered ───
  useEffect(() => {
    if (!currentQuestionId || submitted) return;
    setAnswers(prev => {
      if (prev.some(a => a.questionId === currentQuestionId)) return prev;
      syncDirty.current = true;
      return [...prev, { questionId: currentQuestionId, selectedAnswer: [], status: 'unanswered' }];
    });
  }, [currentQuestionId, submitted]);

  // ─── Auto-sync API ───
  useEffect(() => {
    if (submitted) return;
    syncRef.current = setInterval(() => {
      if (syncDirty.current) {
        doSyncRef.current?.();
      }
    }, 10000); // 10 seconds sync for Redis is safe
    return () => clearInterval(syncRef.current);
  }, [submitted, apiFetch, testId, attemptQuery]);

  // Anti-cheat
  useEffect(() => {
    if (submitted) return;
    const handler = () => {
      if (document.hidden) {
        setTabSwitchCount((prev) => {
          const newCount = prev + 1;
          sessionStorage.setItem('cbt_tab_switch_count', String(newCount));
          apiFetch(`/assessment/${testId}/sync?attemptId=${attemptQuery}`, {
            method: 'POST',
            body: JSON.stringify({
              tabSwitchCount: newCount,
              warnings: [{ type: 'tab-switch', timestamp: new Date().toISOString() }],
            }),
          }).catch(() => {});
          if (newCount >= 4) {
            handleSubmitRef.current?.();
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
  }, [submitted, apiFetch, testId, attemptQuery]);

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
           answerChangeCount: answerChangeCountRef.current[a.questionId] || 0,
           idleSeconds: idleSecondsRef.current[a.questionId] || 0,
           timeToFirstActionSeconds: firstActionTimeRef.current[a.questionId] || 0,
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
          answerChangeCount: answerChangeCountRef.current[questionId] || 0,
          idleSeconds: idleSecondsRef.current[questionId] || 0,
          timeToFirstActionSeconds: firstActionTimeRef.current[questionId] || 0,
        };
      });
      await apiFetch(`/assessment/${testId}/sync?attemptId=${attemptQuery}`, {
        method: 'POST',
        body: JSON.stringify({
          answers: outAnswers,
          timeLeft: latestTimeLeftRef.current,
          tabSwitchCount: Number(sessionStorage.getItem('cbt_tab_switch_count') || 0),
        }),
      });
      syncDirty.current = false;
      return true;
    } catch (e) {
      if (e.message.includes('No matching document') || e.message.includes('VersionError')) {
        console.warn('Sync version collision ignored:', e.message);
        syncDirty.current = false;
        return true;
      }
      console.warn('[Sync] Failed:', e.message);
      if (!silent) throw e;
      return false;
    }
  };
  doSyncRef.current = doSync;

  // ─── Idle time detection ───
  useEffect(() => {
    if (submitted || loading) return;
    const IDLE_THRESHOLD_MS = 30000; // 30 seconds
    let lastActivity = Date.now();

    const resetIdle = () => { lastActivity = Date.now(); };
    const checkIdle = setInterval(() => {
      const qId = activeVisitRef.current?.questionId;
      if (qId && (Date.now() - lastActivity) >= IDLE_THRESHOLD_MS) {
        idleSecondsRef.current[qId] = (idleSecondsRef.current[qId] || 0) + 30;
        lastActivity = Date.now(); // reset so we count next 30s block
      }
    }, IDLE_THRESHOLD_MS);

    window.addEventListener('mousemove', resetIdle);
    window.addEventListener('touchstart', resetIdle);
    window.addEventListener('click', resetIdle);
    return () => {
      clearInterval(checkIdle);
      window.removeEventListener('mousemove', resetIdle);
      window.removeEventListener('touchstart', resetIdle);
      window.removeEventListener('click', resetIdle);
    };
  }, [submitted, loading]);

  const updateAnswer = (questionId, selectedAnswer, status) => {
    // ─── NEET / Capped Section Logic ───
    const q = questions.find(qu => qu._id === questionId);
    const sectionName = q?.section || 'General';
    const sectionConfig = testMeta?.sections?.find(s => s.name === sectionName);
    
    // If the section is capped and the user is trying to answer (selectedAnswer.length > 0)
    if (sectionConfig?.maxAttemptable && selectedAnswer.length > 0) {
      const existingAnswer = answers.find(a => a.questionId === questionId);
      const isWasAlreadyAnswered = existingAnswer && existingAnswer.selectedAnswer.length > 0;
      
      // If this is a new answer (not just changing an existing one)
      if (!isWasAlreadyAnswered) {
        // Count how many questions are already answered in THIS section
        const answeredInSection = answers.filter(a => {
          const qu = questions.find(qObj => qObj._id === a.questionId);
          return qu?.section === sectionName && a.selectedAnswer.length > 0;
        }).length;

        if (answeredInSection >= sectionConfig.maxAttemptable) {
          alert(`You have already answered the maximum allowed questions (${sectionConfig.maxAttemptable}) for ${sectionName}. Please clear a response to answer this question.`);
          return;
        }
      }
    }

    setAnswers((prev) => {
      const exists = prev.find(p => p.questionId === questionId);
      if (exists) {
         return prev.map(a => a.questionId === questionId ? { ...a, selectedAnswer, status } : a);
      }
      return [...prev, { questionId, selectedAnswer, status }];
    });
    syncDirty.current = true;
  };

  const recordFirstAction = (qId) => {
    if (!firstActionTimeRef.current[qId]) {
      const qTelemetry = telemetryRef.current[qId];
      if (qTelemetry && qTelemetry.firstVisitedAt) {
        firstActionTimeRef.current[qId] = Math.max(0, Math.round((Date.now() - new Date(qTelemetry.firstVisitedAt).getTime()) / 1000));
      }
    }
  };

  const handleOptionSelect = (optionLabel) => {
    if (!currentQuestion) return;
    const current = answers.find((a) => a.questionId === currentQuestion._id) || { selectedAnswer: [] };
    
    // Track answer changes (hesitation metric)
    if (current.selectedAnswer.length > 0) {
      answerChangeCountRef.current[currentQuestion._id] = (answerChangeCountRef.current[currentQuestion._id] || 0) + 1;
    }
    
    recordFirstAction(currentQuestion._id);

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
    recordFirstAction(currentQuestion._id);
    const cleanVal = val.trim();
    const newSelected = cleanVal ? [cleanVal] : [];
    updateAnswer(currentQuestion._id, newSelected, newSelected.length > 0 ? 'answered' : 'unanswered');
  };

  const handleNumpadPress = (key) => {
    if (!currentQuestion || currentQuestion.type !== 'integer') return;
    const currentValue = currentAnswer?.selectedAnswer?.[0] || '';
    let nextValue = currentValue;

    if (key === 'backspace') {
      nextValue = currentValue.slice(0, -1);
    } else if (key === 'clear') {
      nextValue = '';
    } else if (key === '-') {
      nextValue = currentValue.startsWith('-') ? currentValue.slice(1) : `-${currentValue}`;
    } else if (key === '.') {
      if (!currentValue.includes('.')) nextValue = `${currentValue}.`;
    } else if (/^\d$/.test(key)) {
      nextValue = `${currentValue}${key}`;
    }

    handleIntegerSelect(nextValue);
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
        const res = await apiFetch(`/assessment/${testId}/submit?attemptId=${attemptQuery}`, { method: 'POST' });
        setResult(res);
        setSubmitted(true);
        success = true;
        clearInterval(timerRef.current);
        clearInterval(syncRef.current);
      } catch (e) {
        if (!isAutoSubmit || (e.status >= 400 && e.status < 500)) {
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
  handleSubmitRef.current = handleSubmit;

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

  const getSectionSummary = (sectionName) => {
    const sectionQuestions = questions.filter(q => (q.section || 'General') === (sectionName || 'General'));
    const summary = { answered: 0, unanswered: 0, markedForReview: 0, answeredAndMarked: 0, notVisited: sectionQuestions.length };
    for (const q of sectionQuestions) {
      const ans = answers.find(a => a.questionId === q._id);
      const status = ans ? ans.status : 'not-visited';
      if (status !== 'not-visited') summary.notVisited--;
      switch (status) {
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

  const sections = testMeta?.sections?.length 
    ? testMeta.sections 
    : [...new Set(questions.map(q => q.section || 'General'))].map(name => ({ name }));
  const summary = getSummary();
  const sectionSummary = getSectionSummary(activeSection || sections[0]?.name);
  const fullName = user?.name || user?.username || user?.email || 'Student';
  const watermarkName = fullName;
  const watermarkIp = publicIp || 'IP not captured';
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
  const paperTabs = testMeta?.parts?.length ? testMeta.parts : [];

  const TcsIcon = ({ status, text, large = false }) => {
    // Standard TCS palette icon coordinate configuration from questions-sprite.png (Row 2)
    const config = {
      'answered': { pos: '-7px -56px', color: 'text-white' },
      'unanswered': { pos: '-42px -56px', color: 'text-white' },
      'marked-for-review': { pos: '-75px -56px', color: 'text-white' },
      'not-visited': { pos: '-107px -56px', color: 'text-[#333]' },
      'answered-and-marked': { pos: '-172px -56px', color: 'text-white' },
    };

    const icon = config[status] || config['not-visited'];
    
    // Real exams use native resolutions. We preserve original container dimensions to protect 
    // the surrounding layout grid, while cropping the interior sprite element tightly.
    const containerStyle = large 
      ? { width: '50px', height: '46px', transform: 'scale(1.42)', transformOrigin: 'center' }
      : { width: '36px', height: '34px' };

    return (
      <div className="flex shrink-0 items-center justify-center font-bold select-none overflow-hidden" style={containerStyle}>
        {/* 
          CRITICAL INNER CROP (w-[30px] h-[28px]): 
          Locks the viewport tightly around the icon glyph, masking out all neighboring sprite assets
          and completely preventing subpixel bleeding on all screen resolutions.
        */}
        <div 
          className={`flex h-[28px] w-[30px] items-center justify-center bg-no-repeat text-[12px] font-bold leading-none ${icon.color}`}
          style={{
            backgroundImage: "url('/images/questions-sprite.png')",
            backgroundPosition: icon.pos,
          }}
        >
          <span className="pt-[1px] pl-[0.5px]">{text}</span>
        </div>
      </div>
    );
  };

  return (
    <div className="flex h-screen w-screen flex-col overflow-hidden bg-white font-opensans text-black select-none">
      {showWarning && (
        <div className="fixed inset-0 z-50 bg-red-600 flex items-center justify-center text-white text-3xl font-bold p-10 text-center animate-pulse">
           Warning! Navigating away is not permitted. Final warning will submit test.
        </div>
      )}

      <div className="flex h-[38px] shrink-0 items-center justify-between bg-[#333] pl-[14px] text-white">
        <div className="min-w-0 truncate text-[15px] font-normal text-[#ffff00]">
          {testMeta?.title || 'Mock Test'}
        </div>
        <div className="flex h-full items-center text-[14px] font-bold">
          <button onClick={() => setShowInstructionsPanel(true)} className="flex h-full items-center gap-2 px-4 text-white hover:bg-[#3f3f3f] transition-all">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#4aaee8] text-[18px] italic leading-none text-white shadow-inner">i</span>
            Instructions
          </button>
          <button onClick={() => setShowQuestionPaper(true)} className="flex h-full items-center gap-2 px-4 text-white hover:bg-[#3f3f3f] transition-all">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#39b873] text-white shadow-inner">
              <List className="h-4 w-4" />
            </span>
            Question Paper
          </button>
        </div>
      </div>

      <div className="flex min-h-0 flex-1 overflow-hidden">
        <div className="relative flex min-w-0 flex-1 flex-col border-l border-[#c4c4c4]">
          {tooltipData && (
            <div 
              className="absolute z-50 w-[275px] border border-[#abc8d8] bg-[#f1fafe] text-black shadow-lg select-none pointer-events-none animate-in fade-in duration-150"
              style={{ left: `${tooltipData.left}px`, top: `${tooltipData.top}px` }}
            >
              {/* Tooltip Title Header */}
              <div className="px-3 py-2 bg-[#e4f4fc] border-b border-[#bce1f7] text-[15px] font-bold text-black leading-tight">
                {tooltipData.name}
              </div>
              {/* Tooltip Dynamic Stats */}
              <div className="py-2 px-1 flex flex-col gap-[2px]">
                {(() => {
                  const stats = getSectionSummary(tooltipData.name);
                  return (
                    <>
                      <div className="flex items-center px-4 py-1 gap-[16px]">
                        <TcsIcon status="answered" text={stats.answered} />
                        <span className="text-[14px] font-medium text-[#111] pt-[1px]">Answered</span>
                      </div>
                      <div className="flex items-center px-4 py-1 gap-[16px]">
                        <TcsIcon status="unanswered" text={stats.unanswered} />
                        <span className="text-[14px] font-medium text-[#111] pt-[1px]">Not Answered</span>
                      </div>
                      <div className="flex items-center px-4 py-1 gap-[16px]">
                        <TcsIcon status="not-visited" text={stats.notVisited} />
                        <span className="text-[14px] font-medium text-[#111] pt-[1px]">Not Visited</span>
                      </div>
                      <div className="flex items-center px-4 py-1 gap-[16px]">
                        <TcsIcon status="marked-for-review" text={stats.markedForReview} />
                        <span className="text-[14px] font-medium text-[#111] pt-[1px]">Marked for Review</span>
                      </div>
                      <div className="flex items-center px-4 py-1 gap-[16px]">
                        <TcsIcon status="answered-and-marked" text={stats.answeredAndMarked} />
                        <span className="text-[14px] font-medium text-[#111] pt-[1px] truncate">Answered & Marked for ...</span>
                      </div>
                    </>
                  );
                })()}
              </div>
            </div>
          )}
          {paperTabs.length > 0 && (
            <div className="relative flex h-[52px] shrink-0 items-center gap-1 border-b border-[#ddd] bg-[#e9e9e9] px-6 overflow-x-auto scrollbar-thin" style={{ scrollbarWidth: 'thin' }}>
              <ChevronLeft className="absolute left-1 h-5 w-5 text-[#b8c0c8] cursor-pointer" />
              {paperTabs.map((part, idx) => (
                <button
                  key={part.name || idx}
                  className={`relative h-[36px] min-w-[96px] border px-3 text-[15px] font-bold shadow-sm transition-all ${
                    idx === 0
                      ? 'border-[#1988be] bg-[#1b86b9] text-white'
                      : 'border-[#c7c7c7] bg-white text-[#0069a7]'
                  }`}
                >
                  <span className="flex items-center justify-center gap-2">
                    <span className="truncate uppercase font-bold">{part.name}</span>
                    <span className={`flex h-6 w-6 items-center justify-center rounded-full text-[16px] italic text-white shadow-inner select-none ${idx === 0 ? 'bg-[#67c8fa]' : 'bg-[#79cafa]'}`}>i</span>
                  </span>
                  {idx === 0 && <span className="absolute left-1/2 top-full -translate-x-1/2 border-x-[8px] border-t-[8px] border-x-transparent border-t-[#1b86b9] z-10" />}
                </button>
              ))}
              <ChevronRight className="absolute right-1 h-5 w-5 text-[#b8c0c8] cursor-pointer" />
            </div>
          )}

          <div className="flex h-[34px] shrink-0 items-center justify-between border-b border-[#c7c7c7] bg-white pl-4 pr-[15px]">
            <span className="text-[14px] font-normal text-[#222]">Sections</span>
            <span className="text-[16px] font-bold text-[#111]">Time Left : {formatTime(timeLeft)}</span>
          </div>

          <div className="relative flex h-[46px] shrink-0 items-center gap-[6px] border-b border-[#c7c7c7] bg-white px-6 overflow-x-auto scrollbar-thin" style={{ scrollbarWidth: 'thin' }}>
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
                  className={`h-[34px] border px-3 text-[14px] font-bold transition-all flex items-center justify-center ${
                    isActive
                      ? 'border-[#1682b5] bg-[#1b86b9] text-white'
                      : 'border-[#c9c9c9] bg-white text-[#0069a7]'
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <span className="max-w-[190px] truncate">{s.name}</span>
                    <span 
                      className={`flex h-6 w-6 items-center justify-center rounded-full text-[16px] italic text-white cursor-pointer hover:opacity-90 shadow-inner select-none ${isActive ? 'bg-[#67c8fa]' : 'bg-[#80cfff]'}`}
                      onMouseEnter={(e) => {
                        const rect = e.currentTarget.getBoundingClientRect();
                        const parentContainer = e.currentTarget.closest('.relative.flex.min-w-0.flex-1.flex-col');
                        const parentRect = parentContainer ? parentContainer.getBoundingClientRect() : { left: 0, top: 0 };
                        
                        setTooltipData({
                          name: s.name,
                          left: Math.max(10, (rect.left - parentRect.left) - 40), // Adjust shift for central alignment
                          top: (rect.top - parentRect.top) + rect.height + 6
                        });
                      }}
                      onMouseLeave={() => setTooltipData(null)}
                    >
                      i
                    </span>
                  </span>
                </button>
              );
            })}
            <ChevronRight className="absolute right-1 h-5 w-5 text-[#b8c0c8]" />
          </div>

          <div className="flex h-[36px] shrink-0 items-center justify-between border-b border-[#cfcfcf] bg-white px-4 text-[14px]">
            <span className="font-bold text-[#111]">Question Type: {questionTypeLabel}</span>
            <div className="pr-1 font-normal text-[#444]">
              <span>Marks for correct answer: <span className="font-bold text-[#0080a5]">{currentQuestion?.positiveMarks ?? testMeta?.defaultPositiveMarks}</span></span>
              <span className="mx-2 text-[#888]">|</span>
              <span>Negative Marks: <span className="font-bold text-[#b01818]">{currentQuestion?.negativeMarks ?? testMeta?.defaultNegativeMarks}</span></span>
            </div>
          </div>

          <div className="flex h-[38px] shrink-0 items-center justify-between border-b border-[#cfcfcf] bg-white px-4">
            <h3 className="text-[17px] font-bold text-[#111]">Question No. {currentLocalIdx + 1}</h3>
            <div className="flex items-center justify-center h-[26px] w-[26px] rounded-full bg-[#1b86b9] text-white cursor-pointer shadow-inner hover:bg-[#156c95] active:scale-95 transition-all select-none">
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </div>
          </div>

          <div className="relative min-h-0 flex-1 border-b border-[#cfcfcf] bg-white">
            <div ref={questionScrollRef} className="w-full h-full overflow-y-auto relative">
              <div className="relative min-h-full w-full">
                <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden opacity-[0.085]">
                  <div className="grid w-full grid-cols-3 sm:grid-cols-4 gap-x-14 gap-y-24 pt-12 -rotate-12 place-items-center text-[16px] font-bold uppercase tracking-wide text-[#111]">
                    {Array.from({ length: 200 }).map((_, idx) => (
                      <span key={idx} className="flex max-w-[240px] flex-col items-center gap-1 text-center leading-tight">
                        <span className="max-w-full whitespace-nowrap">{watermarkName}</span>
                        <span className="max-w-full whitespace-nowrap text-[12px]">{watermarkIp}</span>
                      </span>
                    ))}
                  </div>
                </div>
                <div className="relative z-10">
              {/* Fixed Header Extract */}
              <div className="px-[18px] py-[14px] text-[18px] leading-[1.42]">
                <div className="mb-7 min-h-[34px] whitespace-pre-wrap text-black">
                  <LatexRenderer text={currentQuestion?.content} />
                  {currentQuestion?.imageUrl && <img src={currentQuestion.imageUrl} alt="" className="mt-4 max-w-full" />}
                  {currentQuestion?.contentTable && <RenderContentTable table={currentQuestion.contentTable} />}
                </div>
                {currentQuestion?.type !== 'integer' && currentQuestion?.options?.map((opt, i) => {
                  const isSelected = currentAnswer?.selectedAnswer?.includes(opt.label);
                  const isMultiple = currentQuestion.type === 'multiple';
                  
                  return (
                    <label key={opt.label || i} className="group mb-[15px] flex cursor-pointer items-start gap-[12px] text-[18px] leading-[1.32] select-none">
                      <div className="relative flex items-center justify-center mt-[4.5px] shrink-0">
                        <input
                          type={isMultiple ? 'checkbox' : 'radio'}
                          name={`q-${currentQuestion._id}`}
                          checked={isSelected || false}
                          onChange={() => handleOptionSelect(opt.label)}
                          className="peer sr-only"
                        />
                        
                        {isMultiple ? (
                          // Custom Square Button for Multi-Correct (Matches Image 2)
                          <div className={`h-[16px] w-[16px] rounded-[3px] border flex items-center justify-center transition-all shadow-sm ${
                            isSelected ? 'bg-[#0075ff] border-[#0075ff]' : 'border-[#767676] bg-white'
                          }`}>
                            {isSelected && (
                              <svg className="w-[11px] h-[11px] text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4.5" strokeLinecap="round" strokeLinejoin="round">
                                <polyline points="20 6 9 17 4 12" />
                              </svg>
                            )}
                          </div>
                        ) : (
                          // Custom Round Button for Single Correct (Matches Image 1)
                          <div className={`h-[16px] w-[16px] rounded-full border flex items-center justify-center transition-all shadow-sm ${
                            isSelected ? 'border-[#0075ff] bg-white' : 'border-[#767676] bg-white'
                          }`}>
                            {isSelected && (
                              <div className="h-[8px] w-[8px] rounded-full bg-[#0075ff]" />
                            )}
                          </div>
                        )}
                      </div>
                      <span className="flex-1 font-sans text-[#222]">
                        <LatexRenderer text={opt.content} />
                      </span>
                      {opt.imageUrl && <img src={opt.imageUrl} alt="" className="max-h-28 ml-2" />}
                      {opt.contentTable && <RenderContentTable table={opt.contentTable} />}
                    </label>
                  );
                })}
                {['integer', 'float', 'numerical'].includes(currentQuestion?.type) && (
                  <div className="mt-4 flex max-w-[260px] flex-col items-center bg-[#f3f3f3] p-3">
                    <input
                      type="text"
                      readOnly
                      value={currentAnswer?.selectedAnswer?.[0] || ''}
                      className="mb-3 h-[28px] w-[224px] border border-[#777] bg-white px-2 text-[18px] text-black outline-none"
                      aria-label="Numerical answer"
                    />
                    <div className="flex flex-col items-center gap-[6px]">
                      <button onClick={() => handleNumpadPress('backspace')} className="rounded-[7px] border border-[#8d8d8d] bg-[#e8e6ee] px-4 py-2 text-[17px] font-bold shadow-sm">
                        Backspace
                      </button>
                      <div className="grid grid-cols-3 gap-[6px]">
                        {['7', '8', '9', '4', '5', '6', '1', '2', '3', '0', '.', '-'].map((key) => (
                          <button
                            key={key}
                            onClick={() => handleNumpadPress(key)}
                            className="h-[36px] w-[36px] rounded-[7px] border border-[#8d8d8d] bg-[#f3f3f3] text-[18px] font-bold shadow-sm hover:bg-white active:scale-95"
                          >
                            {key}
                          </button>
                        ))}
                      </div>
                      <div className="grid grid-cols-2 gap-[6px]">
                        <button className="h-[36px] w-[42px] rounded-[7px] border border-[#8d8d8d] bg-[#e8e6ee] text-[18px] shadow-sm" type="button">←</button>
                        <button className="h-[36px] w-[42px] rounded-[7px] border border-[#8d8d8d] bg-[#e8e6ee] text-[18px] shadow-sm" type="button">→</button>
                      </div>
                      <button onClick={() => handleNumpadPress('clear')} className="rounded-[7px] border border-[#8d8d8d] bg-[#e8e6ee] px-4 py-2 text-[17px] font-bold shadow-sm">
                        Clear All
                      </button>
                    </div>
                  </div>
                )}
              </div>
              </div>
              </div>
            </div>
          </div>

          <div className="flex h-auto min-h-[56px] shrink-0 items-center justify-between border-t border-[#c7c7c7] bg-white px-3 py-2 sm:py-0 gap-3 flex-wrap sm:flex-nowrap">
            <div className="flex items-center gap-2 sm:gap-[12px]">
              <button 
                onClick={handleMarkForReview} 
                className="h-[38px] border border-[#bcbcbc] bg-white px-4 text-[14px] sm:text-[15px] text-[#111] font-normal shadow-sm hover:bg-[#fcfcfc] transition-all flex items-center justify-center rounded-[1px] min-w-[150px] sm:min-w-[180px]"
              >
                Mark for Review & Next
              </button>
              <button 
                onClick={handleClearResponse} 
                className="h-[38px] border border-[#bcbcbc] bg-white px-4 text-[14px] sm:text-[15px] text-[#111] font-normal shadow-sm hover:bg-[#fcfcfc] transition-all flex items-center justify-center rounded-[1px] min-w-[120px] sm:min-w-[140px]"
              >
                Clear Response
              </button>
            </div>
            <div className="flex items-center">
              <button
                onClick={goPrevious}
                className="mr-3 h-[38px] min-w-[105px] border border-[#bcbcbc] bg-white px-5 text-[14px] sm:text-[15px] text-[#111] font-normal shadow-sm hover:bg-[#fcfcfc] transition-all rounded-[1px]"
              >
                Previous
              </button>
              <button 
                onClick={handleSaveNext} 
                className="h-[40px] border border-[#0c5d85] bg-[#1678a9] px-6 text-[15px] sm:text-[16px] font-bold text-white shadow-sm hover:bg-[#126894] active:scale-[0.98] transition-all flex items-center justify-center rounded-[1px] min-w-[120px] sm:min-w-[130px]"
              >
                Save & Next
              </button>
            </div>
          </div>
        </div>

        <div className="hidden w-[300px] shrink-0 flex-col border-l border-[#c7c7c7] bg-[#dff4fc] sm:flex">
          <div className="relative flex h-[128px] shrink-0 items-start gap-[10px] border-b border-[#c7c7c7] bg-[#f3f7fb] px-[3px] pt-[2px]">
            {showProfilePopup && (
              <div className="absolute right-[110px] top-[10px] z-[100] w-[265px] border border-black bg-white p-5 shadow-2xl animate-in fade-in slide-in-from-right-2 duration-200">
                <button 
                  onClick={() => setShowProfilePopup(false)}
                  className="absolute right-1 top-1 flex h-6 w-6 items-center justify-center text-[#555] hover:bg-slate-100 hover:text-black transition-all"
                >
                  <X className="h-5 w-5" strokeWidth={1.5} />
                </button>
                
                <div className="flex flex-col gap-5 pt-3">
                  <div className="text-[18px] leading-none text-black">
                    <span className="font-normal">{user?.authMethod === 'b2b' ? 'Roll Number' : 'Vault ID'} : </span>
                    <span className="font-bold">{user?.authMethod === 'b2b' ? (user?.username || 'N/A') : (user?.vaultId || 'N/A')}</span>
                  </div>
                  <div className="text-[18px] leading-none text-black">
                    <span className="font-normal">Name : </span>
                    <span className="font-bold uppercase">{fullName}</span>
                  </div>
                </div>
                
                {/* Arrow Pointer Triangle */}
                <div className="absolute -right-[11px] top-[40px] h-0 w-0 border-y-[10px] border-y-transparent border-l-[11px] border-l-black">
                  <div className="absolute -left-[10.5px] -top-[10px] h-0 w-0 border-y-[10px] border-y-transparent border-l-[11px] border-l-white"></div>
                </div>
              </div>
            )}

            <div 
              onClick={() => setShowProfilePopup(!showProfilePopup)}
              className="flex h-[112px] w-[98px] shrink-0 cursor-pointer items-center justify-center border border-[#c7c7c7] bg-white overflow-hidden hover:opacity-95 active:scale-[0.98] transition-all"
            >
              <img src="/images/NewCandidateImage.jpg" alt="Candidate" className="w-full h-full object-cover" />
            </div>
            <div className="min-w-0 pt-[8px] text-[20px] font-normal leading-tight text-[#111]">
              <span className="block truncate">{fullName}</span>
            </div>
          </div>

          <div className="shrink-0 border-b border-[#c7c7c7] bg-white px-[12px] py-[10px]">
            <div className="grid grid-cols-2 gap-x-[12px] gap-y-[13px] text-[14px] leading-tight text-[#111]">
              <div className="flex items-center gap-[8px]">
                <TcsIcon status="answered" text={sectionSummary.answered} />
                <span>Answered</span>
              </div>
              <div className="flex items-center gap-[8px]">
                <TcsIcon status="unanswered" text={sectionSummary.unanswered} />
                <span>Not<br/>Answered</span>
              </div>
              <div className="flex items-center gap-[8px]">
                <TcsIcon status="not-visited" text={sectionSummary.notVisited} />
                <span>Not<br/>Visited</span>
              </div>
              <div className="flex items-center gap-[8px]">
                <TcsIcon status="marked-for-review" text={sectionSummary.markedForReview} />
                <span>Marked<br/>for Review</span>
              </div>
            </div>
            <div className="mt-[12px] flex items-start gap-[8px] text-[14px] leading-tight text-[#111]">
              <TcsIcon status="answered-and-marked" text={sectionSummary.answeredAndMarked} />
              <span>Answered & Marked for Review (will also be evaluated)</span>
            </div>
          </div>

          <div className="flex h-[38px] shrink-0 items-center bg-[#1b86b9] px-[16px] text-[20px] font-bold text-white">
            {activeSection || 'Subject'}
          </div>



          {/* Palette Scrollable Area (Hiding scrollbar for real TCS look) */}
          <div 
            ref={paletteScrollRef}
            className="min-h-0 flex-1 overflow-y-scroll bg-[#dff4fc] px-[13px] py-[4px] scrollbar-none"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {/* NEET Capped Counter */}
            {testMeta?.sections?.find(s => s.name === activeSection)?.maxAttemptable && (
              <div className="mb-3 mt-1.5 p-2.5 rounded-lg border border-[#1b86b9]/20 bg-white/80 shadow-sm flex items-center justify-between">
                <div className="flex flex-col">
                  <span className="text-[10px] font-black uppercase text-[#1b86b9] tracking-widest leading-none mb-1">Attempt Limit</span>
                  <span className="text-[12px] font-bold text-slate-600">Capped Section</span>
                </div>
                <div className="flex flex-col items-end">
                  <span className={`text-[15px] font-black leading-none ${sectionSummary.answered >= (testMeta.sections.find(s => s.name === activeSection).maxAttemptable) ? 'text-amber-600' : 'text-indigo-600'}`}>
                    {sectionSummary.answered} / {testMeta.sections.find(s => s.name === activeSection).maxAttemptable}
                  </span>
                  <span className="text-[9px] font-bold text-slate-400 uppercase mt-0.5">Answered</span>
                </div>
              </div>
            )}

            <div className="mb-[12px] mt-[4px] text-[15px] font-bold text-[#111]">Choose a Question</div>
            <div className="flex flex-wrap gap-x-[5px] gap-y-[9px]">
              {activeSectionQuestions.map((q, idx) => {
                const globalIdx = questions.indexOf(q);
                const ans = answers.find(a => a.questionId === q._id);
                const status = ans ? ans.status : 'not-visited';
                return (
                  <button
                    key={q._id}
                    onClick={() => setCurrentIdx(globalIdx)}
                    className="focus:outline-none transition-all select-none cursor-pointer"
                  >
                    <TcsIcon status={status} text={idx + 1} large />
                  </button>
                );
              })}
            </div>
          </div>



          <div className="flex h-[58px] shrink-0 items-center justify-end border-t border-[#c7c7c7] bg-[#dff4fc] pr-3">
            <button 
              onClick={() => setShowSubmitConfirm(true)} 
              className="h-[38px] min-w-[105px] rounded-[2px] border border-[#539ec4] bg-[#66afd0] px-6 text-[16px] font-bold text-white hover:bg-[#55a1c8] active:scale-[0.97] transition-all flex items-center justify-center"
            >
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
                  <TcsIcon status="answered" text={sectionSummary.answered} />
                  <span>Answered</span>
                </div>
                <div className="flex items-center gap-2">
                  <TcsIcon status="unanswered" text={sectionSummary.unanswered} />
                  <span>Not Answered</span>
                </div>
                <div className="flex items-center gap-2">
                  <TcsIcon status="not-visited" text={sectionSummary.notVisited} />
                  <span>Not Visited</span>
                </div>
                <div className="flex items-center gap-2">
                  <TcsIcon status="marked-for-review" text={sectionSummary.markedForReview} />
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
                    <span className="text-sm text-[#555]">{question.section || 'Subject'} · {questionTypeLabels[question.type] || question.type}</span>
                  </div>
                  <div className="text-sm leading-relaxed">
                    <LatexRenderer text={question.content} />
                    {question.contentTable && <RenderContentTable table={question.contentTable} />}
                    {question.options?.map((option) => (
                      <div key={option.label} className="mt-2 flex gap-2">
                        <span className="font-bold">{option.label}.</span>
                        <LatexRenderer text={option.content} />
                        {option.contentTable && <RenderContentTable table={option.contentTable} />}
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
