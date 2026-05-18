import React, { useState, useEffect, useRef } from 'react';
import LoginPage from './LoginPage';
import ForcePasswordChange from './ForcePasswordChange';
import TestEngineApp from './TestEngineApp';
import LatexRenderer from './components/LatexRenderer';
import PublicTestLanding from './pages/PublicTestLanding';
import { API_BASE } from './config/api';

/* ─────────────────────────────────────────────────────────────────────────────
   RenderContentTable — beautifully renders the custom question/option table
   ─────────────────────────────────────────────────────────────────────────── */
function RenderContentTable({ table }) {
  if (!table || !table.headers || table.headers.length === 0) return null;
  const thStyle = { border: '1px solid rgba(255,255,255,0.1)', padding: '6px 10px', background: 'rgba(79,70,229,0.08)', fontWeight: 600, fontSize: '12px', textAlign: 'left', color: '#94a3b8' };
  const tdStyle = { border: '1px solid rgba(255,255,255,0.05)', padding: '6px 10px', fontSize: '12px', color: '#cbd5e1' };
  return (
    <div style={{ margin: '8px 0', overflowX: 'auto', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)' }}>
      <table style={{ borderCollapse: 'collapse', minWidth: '150px', width: '100%', background: 'rgba(255,255,255,0.02)' }}>
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

export default function App() {
  const [isDark, setIsDark] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('theme');
      return saved ? saved === 'dark' : true;
    }
    return true;
  });

  const [view, setView] = useState(() => {
    if (typeof window === 'undefined') return 'dashboard';
    const postSubmitView = localStorage.getItem('post_submit_view');
    if (postSubmitView) {
      localStorage.removeItem('post_submit_view');
      return postSubmitView;
    }
    if (localStorage.getItem('shared_test_id')) return 'loading-shared';
    
    // URL-based initial view
    const path = window.location.pathname;
    if (path === '/tests') return 'test-series';
    if (path === '/pyp') return 'pyp';
    if (path === '/analytics') return 'analytics';
    if (path === '/leaderboard') return 'leaderboard';
    if (path === '/settings') return 'settings';
    if (path === '/support') return 'support';
    
    return 'dashboard';
  });

  const searchInputRef = useRef(null);
  const [osKey] = useState(() => {
    if (typeof window !== 'undefined' && navigator?.platform) {
      return navigator.platform.toUpperCase().includes('MAC') ? '⌘' : 'Ctrl';
    }
    return 'Ctrl';
  });
  const [selectedTest, setSelectedTest] = useState(null);
  const [sharedTestId, setSharedTestId] = useState(() => {
    if (typeof window === 'undefined') return null;
    const path = window.location.pathname;
    const match = path.match(/^\/t\/([a-f\d]{24})$/i);
    if (match) return match[1];
    const searchParams = new URLSearchParams(window.location.search);
    const qId = searchParams.get('shared_test_id');
    if (qId) return qId;
    return localStorage.getItem('shared_test_id');
  });
  const [tests, setTests] = useState([]);
  const [loadingTests, setLoadingTests] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('full');
  const [examFilter, setExamFilter] = useState(() => {
    if (typeof window === 'undefined') return 'jee-mains';
    const params = new URLSearchParams(window.location.search);
    return params.get('exam') || 'jee-mains';
  });

  const navigateTo = (newView) => {
    if (newView === view) return;
    
    let path = '/';
    if (newView === 'test-series') path = '/tests';
    else if (newView === 'pyp') path = '/pyp';
    else if (newView === 'analytics') path = '/analytics';
    else if (newView === 'leaderboard') path = '/leaderboard';
    else if (newView === 'settings') path = '/settings';
    else if (newView === 'support') path = '/support';
    else if (newView === 'instructions' && selectedTest) path = `/tests/${selectedTest._id}`;
    
    // Preserve current query parameters (especially ?exam=)
    const currentSearch = window.location.search;
    const finalPath = `${path}${currentSearch}`;
    
    window.history.pushState(null, '', finalPath);
    setView(newView);
    // Don't reset selectedTest if we're going to instructions
    if (newView !== 'instructions') {
      setSelectedTest(null);
    }
    setSearchQuery('');
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    const handlePopState = () => {
      const path = window.location.pathname;
      const params = new URLSearchParams(window.location.search);
      const exam = params.get('exam') || 'jee-mains';
      
      let newView = 'dashboard';
      if (path === '/tests') newView = 'test-series';
      else if (path === '/pyp') newView = 'pyp';
      else if (path === '/analytics') newView = 'analytics';
      else if (path === '/leaderboard') newView = 'leaderboard';
      else if (path === '/settings') newView = 'settings';
      else if (path === '/support') newView = 'support';
      
      setView(newView);
      setExamFilter(exam);
      setSelectedTest(null);
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (examFilter !== 'jee-mains') {
      params.set('exam', examFilter);
    } else {
      params.delete('exam');
    }
    const newSearch = params.toString();
    const newUrl = `${window.location.pathname}${newSearch ? '?' + newSearch : ''}${window.location.hash}`;
    window.history.replaceState(null, '', newUrl);
  }, [examFilter]);
  const [showExamHint, setShowExamHint] = useState(() => {
    return !localStorage.getItem('seen_exam_filter_hint');
  });
  const [results, setResults] = useState([]);
  const [loadingResults, setLoadingResults] = useState(false);
  const [resultsError, setResultsError] = useState('');
  const [resultsRefreshKey, setResultsRefreshKey] = useState(0);
  const [selectedLeaderboardTest, setSelectedLeaderboardTest] = useState(null);
  const [leaderboardData, setLeaderboardData] = useState(null);
  const [loadingLeaderboard, setLoadingLeaderboard] = useState(false);
  const [leaderboardError, setLeaderboardError] = useState('');
  const [selectedReviewAttemptId, setSelectedReviewAttemptId] = useState(null);
  const [reviewData, setReviewData] = useState(null);
  const [loadingReview, setLoadingReview] = useState(false);
  const [reviewError, setReviewError] = useState('');

  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('test_user');
      return saved ? JSON.parse(saved) : null;
    } catch { return null; }
  });

  useEffect(() => {
    if (user && (view === 'dashboard' || view === 'test-series')) {
      queueMicrotask(() => setLoadingTests(true));
      fetch(`${API_BASE}/tests`, {
        headers: { 'Authorization': `Bearer ${user.token}` }
      })
        .then(async res => {
          const text = await res.text();
          let data;
          try {
            data = text ? JSON.parse(text) : [];
          } catch {
            throw new Error(text || 'Invalid tests response');
          }
          if (!res.ok) throw new Error(data.message || 'Failed to load tests');
          if (!Array.isArray(data)) throw new Error('Invalid tests response');
          return data;
        })
        .then(data => {
          setTests(data);
          setLoadingTests(false);
        })
        .catch(err => {
          console.error(err);
          setLoadingTests(false);
        });
    }
  }, [user, view]);

  useEffect(() => {
    if (user && (view === 'analytics' || view === 'dashboard' || view === 'test-series' || view === 'leaderboard')) {
      queueMicrotask(() => {
        setLoadingResults(true);
        setResultsError('');
      });
      fetch(`${API_BASE}/assessment/results`, {
        headers: { 'Authorization': `Bearer ${user.token}` }
      })
        .then(async res => {
          const text = await res.text();
          let data;
          try {
            data = text ? JSON.parse(text) : [];
          } catch {
            throw new Error(text || 'Invalid results response');
          }
          if (!res.ok) throw new Error(data.message || 'Failed to load results');
          return Array.isArray(data) ? data : [];
        })
        .then(data => {
          setResults(data);
          setLoadingResults(false);
        })
        .catch(err => {
          setResultsError(err.message);
          setLoadingResults(false);
        });
    }
  }, [user, view, resultsRefreshKey]);
  useEffect(() => {
    if (user && view === 'leaderboard' && selectedLeaderboardTest) {
      queueMicrotask(() => {
        setLoadingLeaderboard(true);
        setLeaderboardError('');
      });
      fetch(`${API_BASE}/assessment/${selectedLeaderboardTest._id}/leaderboard`, {
        headers: { 'Authorization': `Bearer ${user.token}` }
      })
        .then(async res => {
          const text = await res.text();
          let data;
          try { data = text ? JSON.parse(text) : null; } catch { throw new Error('Invalid response'); }
          if (!res.ok) throw new Error(data?.message || 'Failed to fetch leaderboard');
          return data;
        })
        .then(data => {
          setLeaderboardData(data);
          setLoadingLeaderboard(false);
        })
        .catch(err => {
          setLeaderboardError(err.message);
          setLoadingLeaderboard(false);
        });
    }
  }, [user, view, selectedLeaderboardTest]);
  useEffect(() => {
    if (user && sharedTestId) {
      // Auto-select shared test for already logged-in users
      fetch(`${API_BASE}/tests`, {
        headers: { 'Authorization': `Bearer ${user.token}` }
      })
      .then(res => res.json())
      .then(tests => {
        if (!Array.isArray(tests)) return;
        const target = tests.find(t => t._id === sharedTestId);
        if (target) {
          setSelectedTest(target);
          navigateTo('instructions');
          localStorage.removeItem('shared_test_id');
          setSharedTestId(null);
          // URL handled by navigateTo
        }
      })
      .catch(err => console.error('Shared test auto-select error:', err));
    }
  }, [user, sharedTestId]);

  useEffect(() => {
    if (user && view === 'review' && selectedReviewAttemptId) {
      queueMicrotask(() => {
        setLoadingReview(true);
        setReviewError('');
      });
      fetch(`${API_BASE}/assessment/attempts/${selectedReviewAttemptId}/review`, {
        headers: { 'Authorization': `Bearer ${user.token}` }
      })
        .then(async res => {
          const text = await res.text();
          let data;
          try { data = text ? JSON.parse(text) : null; } catch { throw new Error('Invalid response'); }
          if (!res.ok) throw new Error(data?.message || 'Failed to fetch review data');
          return data;
        })
        .then(data => {
          setReviewData(data);
          setLoadingReview(false);
        })
        .catch(err => {
          setReviewError(err.message);
          setLoadingReview(false);
        });
    }
  }, [user, view, selectedReviewAttemptId]);

  const handleLogin = (userData) => {
    localStorage.setItem('test_user', JSON.stringify(userData));
    localStorage.setItem('test_token', userData.token);
    setUser(userData);
    
    // Auto-select shared test if applicable
    const tId = sharedTestId || localStorage.getItem('shared_test_id');
    if (tId) {
      fetch(`${API_BASE}/tests`, {
        headers: { 'Authorization': `Bearer ${userData.token}` }
      })
      .then(res => res.json())
      .then(tests => {
        const target = tests.find(t => t._id === tId);
        if (target) {
          setSelectedTest(target);
          navigateTo('instructions');
          localStorage.removeItem('shared_test_id');
          setSharedTestId(null);
          // URL handled by navigateTo
        }
      })
      .catch(err => console.error('Shared test auto-select error:', err));
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('test_user');
    localStorage.removeItem('test_token');
    setUser(null);
    setView('dashboard');
  };

  useEffect(() => {
    const openAnalytics = () => {
      setSelectedTest(null);
      setResultsRefreshKey((key) => key + 1);
      navigateTo('analytics');
    };
    const handleAttemptMessage = (event) => {
      if (event.origin !== window.location.origin) return;
      if (event.data?.type === 'cbt:submitted') openAnalytics();
    };
    const handleStorage = (event) => {
      if (event.key === 'post_submit_view' && event.newValue === 'analytics') {
        localStorage.removeItem('post_submit_view');
        openAnalytics();
      }
    };
    window.addEventListener('message', handleAttemptMessage);
    window.addEventListener('storage', handleStorage);
    return () => {
      window.removeEventListener('message', handleAttemptMessage);
      window.removeEventListener('storage', handleStorage);
    };
  }, []);

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDark]);

  // Handle OAuth Token from URL hash
  useEffect(() => {
    const hash = window.location.hash;
    if (hash.startsWith('#token=')) {
      const token = hash.split('=')[1];
      // Clean URL hash
      window.history.replaceState(null, '', window.location.pathname);

      // Fetch user profile to verify token and complete login
      fetch(`${API_BASE}/auth/me`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
        .then(res => {
          if (!res.ok) throw new Error('Token verification failed');
          return res.json();
        })
        .then(data => {
          handleLogin({ ...data, token });
        })
        .catch(err => console.error('OAuth Login Error:', err));
    }
  }, []);

  const toggleTheme = () => setIsDark(!isDark);
  const showDashboard = () => navigateTo('dashboard');
  const showTestSeries = () => navigateTo('test-series');

  const openTestAttempt = async (test) => {
    if (!test?._id) return;
    const popup = window.open('about:blank', 'TestEngine', 'width=1024,height=768,fullscreen=yes,toolbar=0,location=0,menubar=0');
    if (!popup) {
      alert('Please allow pop-ups for this site, then start the test again.');
      return;
    }
    try {
      popup.document.write('<div style="font-family:Arial,sans-serif;padding:32px">Preparing secure test session...</div>');
      const res = await fetch(`${API_BASE}/assessment/${test._id}/attempts/start`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${user.token}` },
      });
      const text = await res.text();
      let data = {};
      try { data = text ? JSON.parse(text) : {}; } catch { data = { message: text }; }
      if (!res.ok) throw new Error(data.message || 'Failed to create test attempt');

      localStorage.setItem('current_test', JSON.stringify({ ...test, state: 'in-progress' }));
      popup.location.href = `${window.location.origin}?attempt=true&attemptId=${encodeURIComponent(data.attemptId)}&attemptToken=${encodeURIComponent(data.attemptToken)}`;
      setResultsRefreshKey((key) => key + 1);
    } catch (err) {
      popup.close();
      alert(err.message || 'Could not start the test.');
    }
  };

  // Router override for the popup test engine
  const searchParams = new URL(window.location.href).searchParams;
  const isAttemptMode = searchParams.get('attempt') === 'true';
  const attemptId = searchParams.get('attemptId') || '';
  const attemptToken = searchParams.get('attemptToken') || '';

  if (isAttemptMode && user) {
    let currentTest = null;
    try {
      currentTest = JSON.parse(localStorage.getItem('current_test'));
    } catch {
      currentTest = null;
    }

    return (
      <TestEngineApp
        user={user}
        test={currentTest}
        attemptId={attemptId}
        attemptToken={attemptToken}
      />
    );
  }

  if (!user) {
    if (sharedTestId) {
      return (
        <PublicTestLanding 
          testId={sharedTestId} 
          onLogin={() => {
            if (sharedTestId) localStorage.setItem('shared_test_id', sharedTestId);
            window.location.href = `${API_BASE}/auth/google?origin=test${sharedTestId ? `&shared_test_id=${sharedTestId}` : ''}`;
          }} 
        />
      );
    }
    return <LoginPage isDark={isDark} onLogin={handleLogin} />;
  }

  if (user && user.hasChangedPassword === false) {
    return (
      <ForcePasswordChange
        isDark={isDark}
        user={user}
        onPasswordChanged={() => {
          const updatedUser = { ...user, hasChangedPassword: true };
          handleLogin(updatedUser);
        }}
        onLogout={handleLogout}
      />
    );
  }

  const normalizedSearch = searchQuery.trim().toLowerCase();
  const matchesCategory = (test) => {
    // 1. View Filter
    if (view === 'pyp') {
      if (test.testType !== 'pyp') return false;
    } else {
      if (test.testType === 'pyp') return false;
    }

    // 2. Exam Type Filter (New Dropdown)
    if (examFilter !== 'all') {
      const cat = (test.category || '').toLowerCase();
      const title = (test.title || '').toLowerCase();
      
      if (examFilter === 'jee-mains') {
        if (!cat.includes('mains') && !title.includes('mains')) return false;
      } else if (examFilter === 'jee-adv') {
        if (!cat.includes('adv') && !title.includes('adv')) return false;
      } else if (examFilter === 'neet') {
        if (!cat.includes('neet') && !title.includes('neet')) return false;
      }
    }

    // 3. Category Filter
    if (view !== 'pyp') {
      const type = test.testType || 'full';
      if (activeCategory === 'full') return type === 'full';
      if (activeCategory === 'part') return type === 'part';
    }

    return true;
  };
  const filteredTests = tests.filter((test) => {
    if (!matchesCategory(test)) return false;
    if (!normalizedSearch) return true;
    const haystack = [
      test.title,
      test.category,
      test.status,
      ...(test.sections?.map((section) => section.name) || []),
      ...(test.syllabus || []),
    ].filter(Boolean).join(' ').toLowerCase();
    return haystack.includes(normalizedSearch);
  });
  const completedResults = results.filter((result) => result.status === 'completed' || result.status === 'auto-submitted');

  const sortedResults = [...completedResults].sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt));
  const lastThreeResults = sortedResults.slice(0, 3);
  const hasThreeTests = lastThreeResults.length >= 3;
  const lastThreeAvg = hasThreeTests
    ? Math.round(lastThreeResults.reduce((sum, res) => sum + (res.percentage || 0), 0) / 3)
    : null;

  const givenCount = tests.filter(t => t.state === 'completed' || t.state === 'evaluating').length;
  const missedCount = tests.filter(t => t.state === 'missed').length;
  const ongoingCount = tests.filter(t => t.state === 'in-progress').length;
  const upcomingCount = tests.filter(t => t.state === 'upcoming').length;
  const bestResult = completedResults.reduce((best, result) => {
    if (!best) return result;
    return (result.percentage || 0) > (best.percentage || 0) ? result : best;
  }, null);
  const averagePercentage = completedResults.length
    ? Math.round(completedResults.reduce((sum, result) => sum + (result.percentage || 0), 0) / completedResults.length)
    : 0;
  const recommendedTitle = bestResult
    ? `Review ${bestResult.test?.title || 'your latest result'}`
    : tests[0]
      ? `Start ${tests[0].title}`
      : 'Start your first available test';
  const recommendedBody = bestResult
    ? 'Open Analytics to compare score, answered count, and section performance.'
    : tests[0]
      ? 'Open the test details, read the instructions, and begin when ready.'
      : 'Published tests from your admin will appear here.';
  const latestResult = sortedResults[0] || null;
  const trendResults = sortedResults.slice(0, 8).reverse();
  const trendPoints = trendResults.map((result, idx) => {
    const x = trendResults.length <= 1 ? 50 : (idx / (trendResults.length - 1)) * 100;
    const y = 100 - Math.max(0, Math.min(100, Number(result.percentage) || 0));
    return `${x},${y}`;
  }).join(' ');
  const latestSectionEntries = Object.entries(latestResult?.sectionScores || {});
  const latestTopicEntries = Object.entries(latestResult?.topicPerformance || {});
  const latestTelemetryQuestions = latestResult?.telemetry?.questions || [];
  const maxQuestionTime = Math.max(1, ...latestTelemetryQuestions.map((question) => question.timeSpentSeconds || 0));
  const totalTelemetryMinutes = latestResult?.telemetry?.totalTimeSpentSeconds
    ? Math.round(latestResult.telemetry.totalTimeSpentSeconds / 60)
    : 0;
  if (view === 'loading-shared') {
    return (
      <div className={`min-h-screen flex items-center justify-center ${isDark ? 'bg-[#0f172a]' : 'bg-slate-50'}`}>
        <div className="flex flex-col items-center gap-6">
          <div className="relative w-20 h-20">
            <div className="absolute inset-0 border-4 border-indigo-500/20 rounded-full"></div>
            <div className="absolute inset-0 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
            <div className="absolute inset-4 bg-indigo-500/10 rounded-full flex items-center justify-center">
              <span className="material-symbols-outlined text-indigo-500 animate-pulse">history_edu</span>
            </div>
          </div>
          <div className="text-center space-y-2">
            <h2 className={`text-2xl font-black tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>Preparing Assessment</h2>
            <p className={`text-sm font-bold animate-pulse ${isDark ? 'text-indigo-400' : 'text-indigo-600'} uppercase tracking-widest`}>Setting up your test environment...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen transition-colors duration-300 ${isDark ? 'bg-background text-on-surface' : 'bg-slate-50 text-slate-900'}`}>
      {/* SideNavBar */}
      <aside className={`fixed bottom-0 lg:top-0 left-0 z-50 w-full lg:w-64 h-16 lg:h-screen flex flex-row lg:flex-col px-2 lg:px-4 py-1 lg:py-6 border-t lg:border-t-0 transition-all duration-300 ${isDark ? 'bg-slate-950/95 border-slate-900 backdrop-blur-md' : 'bg-white/95 border-slate-200/80 backdrop-blur-md shadow-[0_-10px_25px_-5px_rgba(0,0,0,0.05)] lg:shadow-xl'}`}>
        <nav className="flex lg:flex-col items-center lg:items-stretch justify-around lg:justify-start w-full lg:flex-1 space-y-0 lg:space-y-1 h-full lg:h-auto">
          <button onClick={showDashboard} className={`flex-1 lg:flex-initial w-full border-none bg-transparent flex flex-col lg:flex-row items-center justify-center lg:justify-start px-1 lg:px-3 py-1 lg:py-3 transition-all duration-200 rounded-xl lg:rounded-lg group ${view === 'dashboard' ? isDark ? 'bg-slate-800/50 text-indigo-400' : 'bg-indigo-50 text-indigo-600' : isDark ? 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/30' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'}`}>
            <span className="material-symbols-outlined mb-0.5 lg:mb-0 lg:mr-3 text-[22px] lg:text-2xl flex-shrink-0">dashboard</span>
            <span className="text-[9px] lg:text-sm font-extrabold lg:font-medium tracking-tight">Dashboard</span>
          </button>
          <button onClick={showTestSeries} className={`flex-1 lg:flex-initial w-full border-none bg-transparent flex flex-col lg:flex-row items-center justify-center lg:justify-start px-1 lg:px-3 py-1 lg:py-3 transition-all duration-200 rounded-xl lg:rounded-lg group ${view === 'test-series' || view === 'instructions' ? isDark ? 'bg-slate-800/50 text-indigo-400' : 'bg-indigo-50 text-indigo-600' : isDark ? 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/30' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'}`}>
            <span className="material-symbols-outlined mb-0.5 lg:mb-0 lg:mr-3 text-[22px] lg:text-2xl flex-shrink-0">layers</span>
            <span className="text-[9px] lg:text-sm font-extrabold lg:font-medium tracking-tight">Tests</span>
          </button>
          <button onClick={() => navigateTo('pyp')} className={`flex-1 lg:flex-initial w-full border-none bg-transparent flex flex-col lg:flex-row items-center justify-center lg:justify-start px-1 lg:px-3 py-1 lg:py-3 transition-all duration-200 rounded-xl lg:rounded-lg group ${view === 'pyp' ? isDark ? 'bg-slate-800/50 text-indigo-400' : 'bg-indigo-50 text-indigo-600' : isDark ? 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/30' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'}`}>
            <span className="material-symbols-outlined mb-0.5 lg:mb-0 lg:mr-3 text-[22px] lg:text-2xl flex-shrink-0">history_edu</span>
            <span className="text-[9px] lg:text-sm font-extrabold lg:font-medium tracking-tight">PYP</span>
          </button>
          <button onClick={() => navigateTo('leaderboard')} className={`flex-1 lg:flex-initial w-full border-none bg-transparent flex flex-col lg:flex-row items-center justify-center lg:justify-start px-1 lg:px-3 py-1 lg:py-3 transition-all duration-200 rounded-xl lg:rounded-lg group ${view === 'leaderboard' ? isDark ? 'bg-slate-800/50 text-indigo-400' : 'bg-indigo-50 text-indigo-600' : isDark ? 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/30' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'}`}>
            <span className="material-symbols-outlined mb-0.5 lg:mb-0 lg:mr-3 text-[22px] lg:text-2xl flex-shrink-0">emoji_events</span>
            <span className="text-[9px] lg:text-sm font-extrabold lg:font-medium tracking-tight">Ranks</span>
          </button>
          <button onClick={() => navigateTo('analytics')} className={`flex-1 lg:flex-initial w-full border-none bg-transparent flex flex-col lg:flex-row items-center justify-center lg:justify-start px-1 lg:px-3 py-1 lg:py-3 transition-all duration-200 rounded-xl lg:rounded-lg group ${view === 'analytics' ? isDark ? 'bg-slate-800/50 text-indigo-400' : 'bg-indigo-50 text-indigo-600' : isDark ? 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/30' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'}`}>
            <span className="material-symbols-outlined mb-0.5 lg:mb-0 lg:mr-3 text-[22px] lg:text-2xl flex-shrink-0">insights</span>
            <span className="text-[9px] lg:text-sm font-extrabold lg:font-medium tracking-tight">Stats</span>
          </button>

          {/* Mobile-Only Settings button inserted into bottom nav */}
          <button onClick={() => navigateTo('settings')} className={`flex lg:hidden flex-1 w-full border-none bg-transparent flex flex-col items-center justify-center px-1 py-1 transition-all duration-200 rounded-xl group ${view === 'settings' ? isDark ? 'bg-slate-800/50 text-indigo-400' : 'bg-indigo-50 text-indigo-600' : isDark ? 'text-slate-400 hover:text-slate-200' : 'text-slate-600'}`}>
            <span className="material-symbols-outlined mb-0.5 text-[22px]">settings</span>
            <span className="text-[9px] font-extrabold tracking-tight">Settings</span>
          </button>
        </nav>

        <div className={`hidden lg:flex flex-col mt-auto pt-6 border-t space-y-1 ${isDark ? 'border-slate-800/50' : 'border-slate-200'}`}>
          <button onClick={() => navigateTo('settings')} className={`w-full border-none bg-transparent flex items-center px-3 py-3 transition-colors duration-200 rounded-lg group ${view === 'settings' ? isDark ? 'bg-slate-800/50 text-indigo-400' : 'bg-indigo-50 text-indigo-600' : isDark ? 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/30' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'}`}>
            <span className="material-symbols-outlined mr-3">settings</span>
            <span className="text-sm font-medium">Settings</span>
          </button>
          <button onClick={() => navigateTo('support')} className={`w-full border-none bg-transparent flex items-center px-3 py-3 transition-colors duration-200 rounded-lg group ${view === 'support' ? isDark ? 'bg-slate-800/50 text-indigo-400' : 'bg-indigo-50 text-indigo-600' : isDark ? 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/30' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'}`}>
            <span className="material-symbols-outlined mr-3">help_outline</span>
            <span className="text-sm font-medium">Support</span>
          </button>

          {/* XP Level Widget */}
          {user.levelData && (
            <div className={`mt-4 mx-1 p-3 rounded-xl border ${isDark ? 'bg-indigo-500/5 border-indigo-500/10' : 'bg-indigo-50/50 border-indigo-100'}`}>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-base">🔥</span>
                  <span className={`text-xs font-black ${isDark ? 'text-indigo-300' : 'text-indigo-700'}`}>
                    Level {user.levelData.currentLevel}
                  </span>
                </div>
                <span className={`text-[10px] font-bold ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                  {user.levelData.totalXP} XP
                </span>
              </div>
              <div className={`w-full h-1.5 rounded-full overflow-hidden ${isDark ? 'bg-slate-800' : 'bg-indigo-100'}`}>
                <div
                  className="h-full bg-gradient-to-r from-indigo-500 to-violet-500 rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(100, user.levelData.progressToNext || 0)}%` }}
                />
              </div>
              <p className={`text-[9px] font-bold mt-1.5 ${isDark ? 'text-slate-600' : 'text-slate-400'}`}>
                {user.levelData.xpRemaining} XP to next level
              </p>
            </div>
          )}
          <div className="flex items-center justify-between mt-6 px-3">
            <div className="flex items-center overflow-hidden">
              <div className="w-8 h-8 flex-shrink-0 rounded-full overflow-hidden bg-indigo-500/20 text-indigo-500 flex items-center justify-center font-bold text-sm">
                {user.profilePic ? (
                  <img src={user.profilePic} alt="" referrerPolicy="no-referrer" className="w-full h-full object-cover flex border-none" />
                ) : (
                  user.name?.charAt(0).toUpperCase() || 'S'
                )}
              </div>
              <div className="ml-3 overflow-hidden pr-2">
                <p className={`text-xs font-semibold truncate ${isDark ? 'text-slate-200' : 'text-slate-900'}`}>{user.name}</p>
                <p className="text-[10px] text-slate-500 truncate">{user.authMethod === 'b2b' ? (user.tenantId?.name || 'Coaching Member') : 'Regular User'}</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              title="Logout"
              className={`p-1.5 rounded-lg flex-shrink-0 transition-colors ${isDark ? 'text-slate-400 hover:text-white hover:bg-slate-800' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-200'}`}
            >
              <span className="material-symbols-outlined text-lg">logout</span>
            </button>
          </div>
        </div>
      </aside>

      {/* TopNavBar */}
      <header className={`fixed top-0 right-0 w-full lg:w-[calc(100%-16rem)] h-16 backdrop-blur-xl z-40 flex justify-between items-center px-4 lg:px-8 transition-all duration-300 border-b ${isDark ? 'bg-slate-950/80 shadow-[0_40px_40px_-15px_rgba(0,0,0,0.06)]' : 'bg-white/80 shadow-md'}`}>
        {/* Mobile-Only Brand Badge */}
        <div className="flex lg:hidden items-center gap-2 mr-2 shrink-0">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 text-white flex items-center justify-center font-black text-base shadow-md">
            V
          </div>
          <span className={`font-black font-headline text-xs tracking-wider uppercase hidden xs:block ${isDark ? 'text-white' : 'text-slate-800'}`}>Vayl</span>
        </div>
        <div className="flex items-center flex-1 max-w-xs lg:max-w-md mr-2">
          <div className={`flex items-center w-full max-w-md rounded-xl transition-all focus-within:ring-1 focus-within:ring-indigo-500/50 px-3 ${isDark ? 'bg-surface-bright' : 'bg-slate-100'}`}>
            <span className="material-symbols-outlined text-slate-500 text-xl flex-shrink-0">search</span>
            <input
              ref={searchInputRef}
              className={`flex-1 border-none py-2 px-2 text-sm transition-all outline-none bg-transparent ${isDark ? 'text-on-surface placeholder:text-slate-600' : 'text-slate-900 placeholder:text-slate-400'}`}
              placeholder="Search tests, topics, or results..."
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => {
                if (view !== 'test-series' && view !== 'pyp') {
                  showTestSeries();
                }
              }}
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className={`p-1 rounded-full flex items-center justify-center transition-colors border-none bg-transparent cursor-pointer mr-2 ${isDark ? 'text-slate-400 hover:text-slate-200' : 'text-slate-500 hover:text-slate-800'}`}
              >
                <span className="material-symbols-outlined text-[16px]">close</span>
              </button>
            )}
            <div className={`px-1.5 py-0.5 rounded text-[10px] font-bold hidden md:block flex-shrink-0 ${isDark ? 'bg-secondary-container text-on-surface-variant' : 'bg-slate-200 text-slate-500'}`}>
              {osKey} K
            </div>
          </div>
        </div>
        <div className="flex items-center space-x-4">
          <button className={`p-2 rounded-lg transition-colors cursor-pointer border-none bg-transparent ${isDark ? 'text-slate-400 hover:bg-slate-800/50' : 'text-slate-600 hover:bg-slate-100'}`}>
            <span className="material-symbols-outlined">notifications</span>
          </button>
          <button
            onClick={toggleTheme}
            className={`p-2 rounded-lg transition-colors cursor-pointer border-none bg-transparent ${isDark ? 'text-slate-400 hover:bg-slate-800/50' : 'text-slate-600 hover:bg-slate-100'}`}
          >
            <span className="material-symbols-outlined">{isDark ? 'dark_mode' : 'light_mode'}</span>
          </button>
          <div className={`h-8 w-px mx-2 ${isDark ? 'bg-slate-800' : 'bg-slate-200'}`}></div>
          <div className="text-right mr-3 hidden sm:block">
            <p className={`text-xs font-bold leading-none uppercase tracking-wider ${isDark ? 'text-on-surface' : 'text-slate-900'}`}>The Focused Scholar</p>
          </div>
        </div>
      </header>

      {/* Main Content Canvas */}
      <main className="ml-0 lg:ml-64 pt-20 lg:pt-24 px-4 md:px-10 pb-24 lg:pb-20 min-h-screen">

        {view === 'dashboard' ? (
          <div className="max-w-5xl space-y-10 animate-in fade-in duration-500">
            <header className="flex flex-col gap-2">
              <h2 className={`text-4xl font-extrabold font-headline tracking-tight ${isDark ? 'text-on-background' : 'text-slate-900'}`}>
                Dashboard
              </h2>
              <p className={`text-lg font-medium opacity-70 ${isDark ? 'text-on-surface-variant' : 'text-slate-600'}`}>
                Welcome back, {user?.name || 'Scholar'}. Here is an overview of your progress.
              </p>
            </header>

            {loadingTests || loadingResults ? (
              <div className={`p-12 text-center rounded-2xl border ${isDark ? 'bg-surface-container border-outline-variant/20' : 'bg-white border-slate-100 shadow-sm'}`}>
                <span className="material-symbols-outlined animate-spin text-indigo-500 text-4xl">sync</span>
                <p className={`mt-3 font-medium ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Calculating real-time stats...</p>
              </div>
            ) : (
              <div className="space-y-10">
                {/* Stats Cards Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div className={`p-6 rounded-2xl border flex flex-col transition-all duration-200 ${isDark ? 'bg-surface-container border-outline-variant/10 hover:bg-surface-container-high' : 'bg-white shadow-sm border-slate-100 hover:shadow-md'}`}>
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 rounded-xl bg-green-500/10 flex items-center justify-center text-green-500">
                        <span className="material-symbols-outlined text-2xl font-bold">check_circle</span>
                      </div>
                      <span className={`text-[10px] tracking-widest font-extrabold uppercase ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Tests Given</span>
                    </div>
                    <span className={`text-4xl font-black font-headline ${isDark ? 'text-white' : 'text-slate-900'}`}>{givenCount}</span>
                  </div>

                  <div className={`p-6 rounded-2xl border flex flex-col transition-all duration-200 ${isDark ? 'bg-surface-container border-outline-variant/10 hover:bg-surface-container-high' : 'bg-white shadow-sm border-slate-100 hover:shadow-md'}`}>
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-500">
                        <span className="material-symbols-outlined text-2xl font-bold">pending</span>
                      </div>
                      <span className={`text-[10px] tracking-widest font-extrabold uppercase ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Ongoing</span>
                    </div>
                    <span className={`text-4xl font-black font-headline ${isDark ? 'text-white' : 'text-slate-900'}`}>{ongoingCount}</span>
                  </div>

                  <div className={`p-6 rounded-2xl border flex flex-col transition-all duration-200 ${isDark ? 'bg-surface-container border-outline-variant/10 hover:bg-surface-container-high' : 'bg-white shadow-sm border-slate-100 hover:shadow-md'}`}>
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-500">
                        <span className="material-symbols-outlined text-2xl font-bold">event</span>
                      </div>
                      <span className={`text-[10px] tracking-widest font-extrabold uppercase ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Upcoming</span>
                    </div>
                    <span className={`text-4xl font-black font-headline ${isDark ? 'text-white' : 'text-slate-900'}`}>{upcomingCount}</span>
                  </div>

                  <div className={`p-6 rounded-2xl border flex flex-col transition-all duration-200 ${isDark ? 'bg-surface-container border-outline-variant/10 hover:bg-surface-container-high' : 'bg-white shadow-sm border-slate-100 hover:shadow-md'}`}>
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 rounded-xl bg-rose-500/10 flex items-center justify-center text-rose-500">
                        <span className="material-symbols-outlined text-2xl font-bold">cancel</span>
                      </div>
                      <span className={`text-[10px] tracking-widest font-extrabold uppercase ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Missed</span>
                    </div>
                    <span className={`text-4xl font-black font-headline ${isDark ? 'text-white' : 'text-slate-900'}`}>{missedCount}</span>
                  </div>
                </div>

                {/* Performance Average Banner */}
                <div className={`relative overflow-hidden rounded-3xl border p-8 transition-all duration-300 ${isDark ? 'bg-surface-container border-outline-variant/20 bg-gradient-to-br from-surface-container to-indigo-500/5' : 'bg-white border-slate-100 shadow-lg bg-gradient-to-br from-white to-indigo-50/30'}`}>
                  <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
                    <div className="max-w-xl flex flex-col gap-2">
                      <h3 className={`text-sm font-extrabold uppercase tracking-widest ${isDark ? 'text-indigo-400' : 'text-indigo-600'}`}>Performance Analytics</h3>
                      <h4 className={`text-2xl font-black font-headline tracking-tight leading-tight mt-1 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                        Average consistency of last 3 tests
                      </h4>
                      <p className={`text-sm mt-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                        Tracks your performance baseline based on recent evaluation data to measure overall readiness.
                      </p>
                    </div>
                    <div className="flex shrink-0 items-center justify-center">
                      {hasThreeTests ? (
                        <div className={`flex flex-col items-center justify-center w-32 h-32 rounded-full border-4 border-indigo-500 shadow-[0_0_30px_rgba(99,102,241,0.25)] ${isDark ? 'bg-indigo-500/10' : 'bg-indigo-50'}`}>
                          <span className={`text-3xl font-black font-headline ${isDark ? 'text-white' : 'text-slate-900'}`}>{lastThreeAvg}%</span>
                          <span className="text-[9px] font-black uppercase tracking-widest text-indigo-500 mt-1">Avg Score</span>
                        </div>
                      ) : (
                        <div className={`px-6 py-4 rounded-2xl flex items-center gap-3 border ${isDark ? 'bg-amber-500/10 border-amber-500/20 text-amber-400' : 'bg-amber-50 border-amber-100 text-amber-700'}`}>
                          <span className="material-symbols-outlined">info</span>
                          <span className="text-sm font-bold">you have to give atleast 3 tests to get avg %</span>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className={`absolute top-0 right-0 translate-x-1/3 -translate-y-1/3 w-96 h-96 rounded-full blur-[120px] pointer-events-none ${isDark ? 'bg-indigo-500/15' : 'bg-indigo-200/40'}`}></div>
                </div>

                {/* Score Trend Chart */}
                {trendResults.length >= 2 && (
                  <div className={`relative rounded-3xl border p-8 transition-all duration-300 ${isDark ? 'bg-surface-container border-outline-variant/20' : 'bg-white border-slate-100 shadow-lg'}`}>
                    <h3 className={`text-sm font-extrabold uppercase tracking-widest mb-2 ${isDark ? 'text-indigo-400' : 'text-indigo-600'}`}>Score Trend</h3>
                    <p className={`text-xs mb-6 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Your last {trendResults.length} tests — track your trajectory.</p>
                    <div className="relative w-full h-40">
                      <svg viewBox="-5 -5 110 110" preserveAspectRatio="none" className="w-full h-full overflow-visible">
                        {/* Grid lines */}
                        {[0, 25, 50, 75, 100].map(v => (
                          <line key={v} x1="0" y1={100 - v} x2="100" y2={100 - v} stroke={isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'} strokeWidth="0.5" />
                        ))}
                        {/* Gradient fill under line */}
                        <defs>
                          <linearGradient id="trendGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="rgb(99,102,241)" stopOpacity="0.3" />
                            <stop offset="100%" stopColor="rgb(99,102,241)" stopOpacity="0" />
                          </linearGradient>
                        </defs>
                        <polygon
                          points={`0,100 ${trendPoints} 100,100`}
                          fill="url(#trendGradient)"
                        />
                        {/* Trend line */}
                        <polyline
                          points={trendPoints}
                          fill="none"
                          stroke="rgb(99,102,241)"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                        {/* Dots */}
                        {trendResults.map((result, idx) => {
                          const x = trendResults.length <= 1 ? 50 : (idx / (trendResults.length - 1)) * 100;
                          const y = 100 - Math.max(0, Math.min(100, Number(result.percentage) || 0));
                          return (
                            <circle key={idx} cx={x} cy={y} r="2.5" fill="rgb(99,102,241)" stroke={isDark ? '#1e293b' : '#ffffff'} strokeWidth="1.5" />
                          );
                        })}
                      </svg>
                      {/* Y-axis labels */}
                      <div className="absolute left-0 top-0 h-full flex flex-col justify-between text-[9px] font-bold -ml-1 pointer-events-none" style={{ color: isDark ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.25)' }}>
                        <span>100%</span><span>50%</span><span>0%</span>
                      </div>
                    </div>
                    {/* X-axis test labels */}
                    <div className="flex justify-between mt-3">
                      {trendResults.map((result, idx) => (
                        <span key={idx} className={`text-[9px] font-bold truncate max-w-[60px] text-center ${isDark ? 'text-slate-500' : 'text-slate-400'}`} title={result.test?.title}>
                          {result.percentage}%
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* CTA: Launch Exam Engine */}
                <div className="flex pt-2">
                  <button
                    onClick={showTestSeries}
                    className="cursor-pointer border-none py-4 px-10 bg-indigo-600 text-white font-bold rounded-2xl text-lg transition-all shadow-xl shadow-indigo-500/20 hover:shadow-indigo-500/40 hover:-translate-y-0.5 active:scale-[0.98] flex items-center justify-center gap-3"
                  >
                    <span className="material-symbols-outlined text-2xl font-bold">rocket_launch</span>
                    Explore Test Series
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (view === 'test-series' || view === 'pyp') ? (
          <div className="max-w-5xl mx-auto space-y-8 lg:space-y-10 animate-in fade-in duration-500">
            {/* Header Section */}
            <header className="mb-6 lg:mb-10">
              <h2 className={`text-3xl md:text-4xl font-extrabold font-headline tracking-tight ${isDark ? 'text-on-background' : 'text-slate-900'}`}>{view === 'pyp' ? 'Previous Year Papers' : 'Test Series'}</h2>
              <p className={`mt-2 text-base md:text-lg font-medium opacity-70 ${isDark ? 'text-on-surface-variant' : 'text-slate-600'}`}>{view === 'pyp' ? 'Practice with real past exam papers.' : 'Level up your exam readiness.'}</p>
            </header>

            {/* Category Tabs & Exam Filter */}
            <div className="flex flex-wrap items-center justify-between gap-4 mb-6 lg:mb-8">
              <div className="flex items-center space-x-1 overflow-x-auto pb-1 scrollbar-hide">
                {view === 'test-series' && [
                  { id: 'full', label: 'Full Tests' },
                  { id: 'part', label: 'Part Tests' },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveCategory(tab.id)}
                    className={`cursor-pointer px-5 py-2 rounded-full text-sm whitespace-nowrap transition-colors ${activeCategory === tab.id
                      ? 'font-semibold bg-indigo-500/10 text-indigo-400 border border-indigo-500/30'
                      : `font-medium bg-transparent border-none ${isDark ? 'text-on-surface-variant hover:text-on-surface' : 'text-slate-500 hover:text-slate-900'}`
                      }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              <div className="relative">
                {showExamHint && (
                  <div className={`absolute bottom-full right-0 mb-3 w-48 p-3 rounded-xl shadow-xl z-50 animate-bounce transition-all ${isDark ? 'bg-indigo-600 text-white' : 'bg-indigo-600 text-white'}`}>
                    <div className="text-[11px] font-black uppercase tracking-widest mb-1 flex justify-between items-center">
                      <span>Pro Tip</span>
                      <button onClick={() => { setShowExamHint(false); localStorage.setItem('seen_exam_filter_hint', 'true'); }} className="bg-white/20 hover:bg-white/40 rounded-full w-4 h-4 flex items-center justify-center border-none cursor-pointer">
                        <span className="material-symbols-outlined text-[10px]">close</span>
                      </button>
                    </div>
                    <p className="text-xs font-bold leading-snug">Change your exam type here!</p>
                    <div className="absolute top-full right-6 w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[6px] border-t-indigo-600" />
                  </div>
                )}
                <select 
                  value={examFilter} 
                  onChange={(e) => {
                    setExamFilter(e.target.value);
                    if (showExamHint) {
                      setShowExamHint(false);
                      localStorage.setItem('seen_exam_filter_hint', 'true');
                    }
                  }}
                  className={`appearance-none cursor-pointer pl-4 pr-10 py-2.5 rounded-xl border-2 font-bold text-sm transition-all focus:ring-2 focus:ring-indigo-500/20 outline-none ${
                    isDark 
                      ? 'bg-slate-900 border-slate-800 text-slate-200' 
                      : 'bg-white border-slate-100 text-slate-700 shadow-sm'
                  }`}
                >
                  <option value="jee-mains">JEE Mains</option>
                  <option value="jee-adv">JEE Advanced</option>
                  <option value="neet">NEET-UG</option>
                </select>
                <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none opacity-50 text-xl">unfold_more</span>
              </div>
            </div>

            {/* Asymmetric Layout: Test Grid and Quick Stats */}
            <div className="grid grid-cols-12 gap-6 lg:gap-8">
              {/* Test List (The Core) */}
              <div className="col-span-12 lg:col-span-8 space-y-4">
                {loadingTests ? (
                  <div className={`p-8 text-center rounded-xl ${isDark ? 'bg-surface-container' : 'bg-white'}`}>
                    <span className="material-symbols-outlined animate-spin text-indigo-500 text-3xl">sync</span>
                    <p className={`mt-2 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Loading tests...</p>
                  </div>
                ) : filteredTests.length === 0 ? (
                  <div className={`p-8 text-center rounded-xl ${isDark ? 'bg-surface-container' : 'bg-white'}`}>
                    <span className={`material-symbols-outlined text-4xl mb-2 ${isDark ? 'text-slate-600' : 'text-slate-300'}`}>assignment_late</span>
                    <h3 className={`text-lg font-bold ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>{searchQuery || activeCategory !== 'full' ? 'No Matching Tests' : 'No Tests Available'}</h3>
                    <p className={`text-sm ${isDark ? 'text-slate-500' : 'text-slate-500'}`}>{searchQuery || activeCategory !== 'full' ? 'Try a different test, subject, or category.' : 'Check back later or contact your coach.'}</p>
                  </div>
                ) : filteredTests.map((test) => (
                  <div key={test._id} className={`transition-all duration-300 rounded-xl p-5 sm:p-6 flex flex-col md:flex-row md:items-center justify-between group ${isDark ? 'bg-surface-container hover:bg-surface-container-high' : 'bg-white shadow-sm hover:shadow-md border border-slate-100'}`}>
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-2">
                        <span className={`px-2 py-0.5 text-[10px] font-bold rounded uppercase tracking-wider bg-indigo-500/20 text-indigo-400`}>
                          {test.category || 'General'}
                        </span>
                        <span className={`text-xs font-medium truncate ${isDark ? 'text-on-surface-variant' : 'text-slate-500'}`}>
                          {test.sections?.map(s => s.name).join(' • ') || 'Full Exam'}
                        </span>
                      </div>
                      <h3 className={`text-xl font-bold font-headline mb-4 break-words ${isDark ? 'text-on-surface' : 'text-slate-900'}`}>{test.title}</h3>
                      <div className={`flex flex-wrap items-center gap-x-4 sm:gap-x-6 gap-y-2 text-sm ${isDark ? 'text-on-surface-variant' : 'text-slate-500'}`}>
                        <div className="flex items-center whitespace-nowrap">
                          <span className="material-symbols-outlined text-sm mr-1.5 opacity-60">schedule</span>
                          {test.durationMinutes} mins
                        </div>
                        <div className="flex items-center whitespace-nowrap">
                          <span className="material-symbols-outlined text-sm mr-1.5 opacity-60">grade</span>
                          {test.totalMarks} Marks
                        </div>
                        <div className="flex items-center whitespace-nowrap">
                          {test.state === 'in-progress' && <span className={`material-symbols-outlined text-sm mr-1.5 opacity-60 text-yellow-500`}>pending</span>}
                          {test.state === 'completed' && <span className={`material-symbols-outlined text-sm mr-1.5 opacity-60 text-green-500`}>check_circle</span>}
                          {test.state === 'evaluating' && <span className={`material-symbols-outlined text-sm mr-1.5 opacity-60 text-yellow-500`}>sync</span>}
                          {test.state === 'upcoming' && <span className={`material-symbols-outlined text-sm mr-1.5 opacity-60 text-blue-500`}>event</span>}
                          {test.state === 'missed' && <span className={`material-symbols-outlined text-sm mr-1.5 opacity-60 text-red-500`}>cancel</span>}
                          {(!test.state || test.state === 'default') && <span className={`material-symbols-outlined text-sm mr-1.5 opacity-60 text-slate-500`}>radio_button_checked</span>}
                          {test.status || 'Not Started'}
                        </div>
                      </div>
                    </div>
                    <div className="mt-6 md:mt-0 md:ml-6 flex flex-col sm:flex-row md:flex-col lg:flex-row gap-3">
                      <button
                        onClick={() => {
                          if (test.state === 'evaluating') {
                            alert("Your detailed performance report is still being generated. Please check back shortly.");
                            return;
                          }
                          if (test.state === 'upcoming') {
                            alert("This test hasn't started yet. Check scheduled start date.");
                            return;
                          }
                          if (test.state === 'missed') {
                            alert("The attempt window for this test has already ended.");
                            return;
                          }
                          if (test.state !== 'locked') {
                            setSelectedTest(test);
                            navigateTo('instructions');
                          }
                        }}
                        className={`cursor-pointer w-full md:w-auto px-6 py-2.5 font-bold rounded-lg text-sm transition-all ${test.state === 'in-progress' ? 'bg-indigo-500 text-on-primary shadow-lg shadow-indigo-500/10 hover:shadow-indigo-500/20' : (test.state === 'locked' || test.state === 'upcoming' || test.state === 'missed') ? 'bg-slate-700 text-slate-400 cursor-not-allowed' : test.state === 'evaluating' ? 'bg-yellow-500/10 text-yellow-500 border border-yellow-500/20' : test.state === 'completed' ? 'bg-green-500/10 text-green-500 border border-green-500/20 hover:bg-green-500/20' : 'bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 border border-indigo-500/20 hover:border-indigo-500/40'}`}
                      >
                        {test.state === 'in-progress' ? 'Resume Test' : test.state === 'evaluating' ? 'Evaluating' : test.state === 'completed' ? 'Attempt Again' : test.state === 'upcoming' ? 'Locked' : test.state === 'missed' ? 'Ended' : 'Attempt Test'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Sidebar Widgets (Quick Stats) */}
              <div className="col-span-12 lg:col-span-4 space-y-6 lg:space-y-8">
                {/* Performance Card */}
                <div className={`p-6 sm:p-8 rounded-xl transition-colors duration-300 ${isDark ? 'bg-surface-container' : 'bg-white shadow-sm border border-slate-100'}`}>
                  <h4 className="text-xs font-bold uppercase tracking-widest text-indigo-400 mb-6">Series Overview</h4>
                  <div className="space-y-6">
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span className={isDark ? 'text-on-surface-variant' : 'text-slate-500'}>Total Progress</span>
                        <span className={`font-bold ${isDark ? 'text-on-surface' : 'text-slate-900'}`}>{completedResults.length} / {tests.length}</span>
                      </div>
                      <div className={`w-full h-1 rounded-full overflow-hidden ${isDark ? 'bg-surface-variant' : 'bg-slate-100'}`}>
                        <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${tests.length ? Math.round((completedResults.length / tests.length) * 100) : 0}%` }}></div>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3 sm:gap-4">
                      <div className={`p-4 rounded-lg transition-colors ${isDark ? 'bg-surface-container-low' : 'bg-slate-50'}`}>
                        <p className="text-[10px] font-bold uppercase text-slate-500 mb-1">Avg Score</p>
                        <p className={`text-lg sm:text-xl font-headline font-bold ${isDark ? 'text-on-surface' : 'text-slate-900'}`}>{averagePercentage}%</p>
                      </div>
                      <div className={`p-4 rounded-lg transition-colors ${isDark ? 'bg-surface-container-low' : 'bg-slate-50'}`}>
                        <p className="text-[10px] font-bold uppercase text-slate-500 mb-1">Best</p>
                        <p className={`text-lg sm:text-xl font-headline font-bold ${isDark ? 'text-on-surface' : 'text-slate-900'}`}>{bestResult?.percentage ?? 0}%</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Learning Path */}
                <div className={`p-6 sm:p-8 rounded-xl relative overflow-hidden transition-colors duration-300 ${isDark ? 'bg-surface-container-low' : 'bg-slate-50 border border-slate-200/50'}`}>
                  <div className="absolute top-0 right-0 p-4 opacity-10">
                    <span className={`material-symbols-outlined text-6xl ${isDark ? '' : 'text-slate-400'}`}>school</span>
                  </div>
                  <h4 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-6">Recommended Next</h4>
                  <div className="space-y-4">
                    <div className="flex items-start">
                      <div className="w-8 h-8 rounded bg-indigo-500/20 flex items-center justify-center mr-4 mt-1 shrink-0">
                        <span className="material-symbols-outlined text-sm text-indigo-400">lightbulb</span>
                      </div>
                      <div>
                        <p className={`text-sm font-bold ${isDark ? 'text-on-surface' : 'text-slate-900'}`}>{recommendedTitle}</p>
                        <p className={`text-xs mt-1 ${isDark ? 'text-on-surface-variant' : 'text-slate-500'}`}>{recommendedBody}</p>
                      </div>
                    </div>
                    <button onClick={() => setView(bestResult ? 'analytics' : 'dashboard')} className={`cursor-pointer border-none w-full py-2.5 mt-4 text-[10px] sm:text-xs font-bold rounded uppercase tracking-widest transition-all ${isDark ? 'bg-surface-variant text-on-surface-variant hover:bg-indigo-500 hover:text-on-primary' : 'bg-slate-200 text-slate-600 hover:bg-slate-900 hover:text-white'}`}>
                      {bestResult ? 'View Analytics' : 'View Tests'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : view === 'review' ? (
          <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in duration-500">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <button
                onClick={() => {
                  setView('test-series');
                  setReviewData(null);
                  setSelectedReviewAttemptId(null);
                }}
                className={`p-2 px-4 rounded-xl border transition-all cursor-pointer flex items-center justify-center gap-2 ${isDark ? 'bg-surface-container border-outline-variant/20 text-white hover:bg-surface-container-high' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'}`}
              >
                <span className="material-symbols-outlined text-lg">arrow_back</span>
                <span className="text-sm font-bold">Back to Series</span>
              </button>

              {reviewData && (
                <div className="flex gap-2 flex-wrap">
                  <div className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 text-xs font-black ${isDark ? 'bg-emerald-500/10 text-emerald-400' : 'bg-emerald-50 text-emerald-700 border border-emerald-100'}`}>
                    <span className="material-symbols-outlined text-base">check_circle</span>
                    {reviewData.questions.filter(q => q.resultStatus === 'correct').length} Correct
                  </div>
                  <div className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 text-xs font-black ${isDark ? 'bg-rose-500/10 text-rose-400' : 'bg-rose-50 text-rose-700 border border-rose-100'}`}>
                    <span className="material-symbols-outlined text-base">cancel</span>
                    {reviewData.questions.filter(q => q.resultStatus === 'wrong').length} Wrong
                  </div>
                  <div className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 text-xs font-black ${isDark ? 'bg-slate-500/10 text-slate-400' : 'bg-slate-50 text-slate-600 border border-slate-100'}`}>
                    <span className="material-symbols-outlined text-base">radio_button_unchecked</span>
                    {reviewData.questions.filter(q => q.resultStatus === 'skipped').length} Skipped
                  </div>
                </div>
              )}
            </div>

            {loadingReview ? (
              <div className={`p-12 text-center rounded-2xl border ${isDark ? 'bg-surface-container border-outline-variant/20' : 'bg-white border-slate-100 shadow-sm'}`}>
                <span className="material-symbols-outlined animate-spin text-indigo-500 text-4xl">sync</span>
                <p className={`mt-3 font-medium ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Analyzing paper performance...</p>
              </div>
            ) : reviewError ? (
              <div className={`p-6 rounded-2xl border text-red-500 ${isDark ? 'bg-red-500/10 border-red-500/20' : 'bg-red-50 border-red-100'}`}>
                {reviewError}
              </div>
            ) : reviewData ? (
              <div className="space-y-8">
                <div className={`relative overflow-hidden p-8 rounded-3xl border bg-gradient-to-br ${isDark ? 'from-slate-900 to-indigo-950/30 border-indigo-500/10' : 'from-white to-indigo-50/30 border-slate-100 shadow-lg'}`}>
                  <div className="relative z-10 flex flex-col md:flex-row justify-between gap-6 items-start md:items-center">
                    <div>
                      <span className="text-xs font-black tracking-widest text-indigo-500 uppercase">Performance Analysis</span>
                      <h2 className={`text-3xl font-black tracking-tight mt-1 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                        {reviewData.attemptSummary.testTitle}
                      </h2>
                      <p className={`text-sm mt-1 opacity-60 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                        Submitted {new Date(reviewData.attemptSummary.submittedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                    <div className="flex gap-4 shrink-0 w-full md:w-auto">
                      <div className={`flex-1 md:flex-initial px-6 py-4 rounded-2xl text-center border ${isDark ? 'bg-indigo-500/5 border-indigo-500/10' : 'bg-white border-slate-100 shadow-sm'}`}>
                        <span className="text-[10px] uppercase font-black text-indigo-500 tracking-wider">Your Score</span>
                        <div className={`text-2xl font-black mt-1 ${isDark ? 'text-white' : 'text-slate-900'}`}>{reviewData.attemptSummary.totalScore} / {reviewData.attemptSummary.maxPossibleScore}</div>
                      </div>
                      <div className={`flex-1 md:flex-initial px-6 py-4 rounded-2xl text-center border ${isDark ? 'bg-emerald-500/5 border-emerald-500/10' : 'bg-white border-slate-100 shadow-sm'}`}>
                        <span className="text-[10px] uppercase font-black text-emerald-500 tracking-wider">Accuracy</span>
                        <div className={`text-2xl font-black mt-1 ${isDark ? 'text-white' : 'text-slate-900'}`}>{reviewData.attemptSummary.percentage}%</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Integrity & Telemetry Summary Bar */}
                {(reviewData.attemptSummary.tabSwitchCount > 0 || reviewData.attemptSummary.totalTimeSpentSeconds) && (
                  <div className={`flex flex-wrap gap-4 p-4 rounded-2xl border ${isDark ? 'bg-surface-container border-outline-variant/10' : 'bg-white shadow-sm border-slate-100'}`}>
                    {reviewData.attemptSummary.totalTimeSpentSeconds != null && (
                      <div className="flex items-center gap-2 text-xs font-bold">
                        <span className={`material-symbols-outlined text-sm ${isDark ? 'text-indigo-400' : 'text-indigo-600'}`}>timer</span>
                        <span className={isDark ? 'text-slate-300' : 'text-slate-600'}>Total Time: {Math.floor(reviewData.attemptSummary.totalTimeSpentSeconds / 60)}m {reviewData.attemptSummary.totalTimeSpentSeconds % 60}s</span>
                      </div>
                    )}
                    {reviewData.attemptSummary.tabSwitchCount > 0 && (
                      <div className="flex items-center gap-2 text-xs font-bold">
                        <span className="material-symbols-outlined text-sm text-amber-500">warning</span>
                        <span className={isDark ? 'text-amber-400' : 'text-amber-700'}>Tab Switches: {reviewData.attemptSummary.tabSwitchCount}</span>
                      </div>
                    )}
                  </div>
                )}

                {!reviewData.attemptSummary.solutionsUnlocked && (
                  <div className={`p-4 rounded-2xl border text-sm font-semibold ${isDark ? 'bg-amber-500/10 border-amber-500/20 text-amber-300' : 'bg-amber-50 border-amber-200 text-amber-800'}`}>
                    Solutions and answer keys are locked for this test by the admin release policy. Your score and attempt analytics remain available.
                  </div>
                )}

                <div className="space-y-6">
                  {reviewData.questions.map((q, idx) => {
                    const isCorrect = q.resultStatus === 'correct';
                    const isWrong = q.resultStatus === 'wrong';
                    const isSkipped = q.resultStatus === 'skipped';

                    return (
                      <div
                        key={q._id}
                        className={`p-6 rounded-2xl border transition-all ${isCorrect ? (isDark ? 'bg-emerald-500/5 border-emerald-500/20' : 'bg-emerald-50/20 border-emerald-100') :
                            isWrong ? (isDark ? 'bg-rose-500/5 border-rose-500/20' : 'bg-rose-50/20 border-rose-100') :
                              (isDark ? 'bg-surface-container border-outline-variant/20' : 'bg-white shadow-sm border-slate-100')
                          }`}
                      >
                        <div className="flex flex-wrap items-center justify-between gap-3 border-b pb-4 mb-5 border-dashed border-slate-500/10">
                          <div className="flex items-center gap-3">
                            <span className={`w-8 h-8 rounded-lg flex items-center justify-center font-black text-sm ${isDark ? 'bg-slate-800 text-white' : 'bg-slate-100 text-slate-700'}`}>
                              Q{idx + 1}
                            </span>
                            <span className={`px-2.5 py-1 rounded-md text-[10px] font-extrabold uppercase tracking-wider ${isDark ? 'bg-slate-800/80 text-slate-400' : 'bg-slate-100 text-slate-500'}`}>
                              {q.section || 'General'}
                            </span>
                          </div>

                          <div className="flex items-center gap-3">
                            <span className="text-xs opacity-60 font-medium flex items-center gap-1">
                              <span className="material-symbols-outlined text-sm">schedule</span>
                              {q.timeSpentSeconds >= 60 ? `${Math.floor(q.timeSpentSeconds / 60)}m ${q.timeSpentSeconds % 60}s` : `${q.timeSpentSeconds || 0}s`}
                            </span>
                            {q.visitCount > 1 && (
                              <span className={`text-xs font-bold flex items-center gap-1 ${isDark ? 'text-amber-400/80' : 'text-amber-600'}`}>
                                <span className="material-symbols-outlined text-sm">visibility</span>
                                {q.visitCount}x visited
                              </span>
                            )}
                            {q.answerChangeCount > 0 && (
                              <span className={`text-xs font-bold flex items-center gap-1 ${isDark ? 'text-violet-400/80' : 'text-violet-600'}`}>
                                <span className="material-symbols-outlined text-sm">swap_horiz</span>
                                {q.answerChangeCount}x changed
                              </span>
                            )}
                            {isCorrect ? (
                              <span className="px-3 py-1 rounded-full text-xs font-extrabold uppercase tracking-wider bg-emerald-500 text-white flex items-center gap-1">
                                <span className="material-symbols-outlined text-xs">check</span> Correct (+{q.positiveMarks})
                              </span>
                            ) : isWrong ? (
                              <span className="px-3 py-1 rounded-full text-xs font-extrabold uppercase tracking-wider bg-rose-500 text-white flex items-center gap-1">
                                <span className="material-symbols-outlined text-xs">close</span> Incorrect (-{q.negativeMarks})
                              </span>
                            ) : (
                              <span className="px-3 py-1 rounded-full text-xs font-extrabold uppercase tracking-wider bg-slate-500 text-white flex items-center gap-1">
                                <span className="material-symbols-outlined text-xs">remove</span> Skipped (0)
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="space-y-4">
                          <div className={`text-base md:text-lg font-medium leading-relaxed whitespace-pre-wrap ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
                            <LatexRenderer text={q.content} />
                          </div>
                          {q.imageUrl && (
                            <div className="my-4 p-2 rounded-xl border border-slate-500/10 max-w-xl inline-block bg-white">
                              <img src={q.imageUrl} alt={`Question ${idx + 1}`} className="max-h-64 object-contain rounded-lg" />
                            </div>
                          )}
                        </div>

                        {(q.type === 'single' || q.type === 'multiple') && q.options && (
                          <div className="grid grid-cols-1 gap-3 mt-6">
                            {q.options.map((opt, oIdx) => {
                              const optLetter = String.fromCharCode(65 + oIdx);
                              const actualLabel = opt.label || optLetter;
                              const isUserMarked = q.userAnswer?.includes(actualLabel);
                              const isCorrectAnswer = q.correctAnswer?.includes(actualLabel);

                              let optionStyleClass = isDark
                                ? 'bg-surface-container border-outline-variant/20 text-slate-300'
                                : 'bg-white border-slate-200 text-slate-700';

                              if (isUserMarked && isCorrectAnswer) {
                                optionStyleClass = isDark
                                  ? 'border-emerald-500/60 bg-emerald-500/10 text-emerald-300'
                                  : 'border-emerald-500 bg-emerald-50 text-emerald-800 font-bold shadow-sm';
                              } else if (isUserMarked && !isCorrectAnswer) {
                                optionStyleClass = isDark
                                  ? 'border-rose-500/60 bg-rose-500/10 text-rose-300'
                                  : 'border-rose-500 bg-rose-50 text-rose-800 font-bold shadow-sm';
                              } else if (!isUserMarked && isCorrectAnswer) {
                                optionStyleClass = isDark
                                  ? 'border-emerald-500/40 bg-emerald-500/5 text-emerald-300 border-dashed border-2'
                                  : 'border-emerald-500/40 bg-emerald-50/30 text-emerald-700 font-semibold border-dashed border-2';
                              }

                              return (
                                <div
                                  key={oIdx}
                                  className={`p-4 rounded-xl border-2 transition-all flex items-center justify-between gap-4 ${optionStyleClass}`}
                                >
                                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 flex-1">
                                    <div className="flex items-center gap-3">
                                      <span className={`w-6 h-6 flex items-center justify-center rounded-full text-xs font-black border-2 flex-shrink-0 ${isCorrectAnswer ? 'bg-emerald-500 text-white border-emerald-500' :
                                          isUserMarked ? 'bg-rose-500 text-white border-rose-500' :
                                            (isDark ? 'border-slate-700 bg-slate-800 text-slate-400' : 'border-slate-300 bg-slate-100 text-slate-500')
                                        }`}>
                                        {actualLabel}
                                      </span>
                                      <span className="text-sm md:text-base">
                                        <LatexRenderer text={opt.content} />
                                      </span>
                                    </div>
                                    {opt.imageUrl && (
                                      <div className="sm:ml-2 p-1 bg-white rounded border max-w-xs mt-2 sm:mt-0">
                                        <img src={opt.imageUrl} alt={`Option ${actualLabel}`} className="max-h-24 object-contain rounded" />
                                      </div>
                                    )}
                                  </div>

                                  <div className="flex gap-2 flex-shrink-0">
                                    {isUserMarked && isCorrectAnswer && (
                                      <span className="px-2 py-1 bg-emerald-500/20 text-emerald-500 text-[10px] font-black rounded uppercase tracking-wider">Your Answer & Correct</span>
                                    )}
                                    {isUserMarked && !isCorrectAnswer && (
                                      <span className="px-2 py-1 bg-rose-500/20 text-rose-500 text-[10px] font-black rounded uppercase tracking-wider">Your Incorrect Answer</span>
                                    )}
                                    {!isUserMarked && isCorrectAnswer && (
                                      <span className="px-2 py-1 bg-emerald-500/20 text-emerald-500 text-[10px] font-black rounded uppercase tracking-wider">Correct Key</span>
                                    )}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        )}

                        {q.type === 'integer' && (
                          <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {!isSkipped && (
                              <div className={`p-4 rounded-xl border-2 ${isCorrect ? (isDark ? 'border-emerald-500/40 bg-emerald-500/5' : 'border-emerald-200 bg-emerald-50/30') : (isDark ? 'border-rose-500/40 bg-rose-500/5' : 'border-rose-200 bg-rose-50/30')}`}>
                                <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500">Your Answer</span>
                                <div className={`text-xl font-black mt-1 ${isCorrect ? (isDark ? 'text-emerald-400' : 'text-emerald-700') : (isDark ? 'text-rose-400' : 'text-rose-700')}`}>
                                  {q.userAnswer?.join(', ')}
                                </div>
                              </div>
                            )}
                            <div className={`p-4 rounded-xl border-2 border-emerald-500/40 ${isDark ? 'bg-emerald-500/5' : 'bg-emerald-50/30'} ${isSkipped ? 'sm:col-span-2' : ''}`}>
                              <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-600">Correct Answer</span>
                              <div className={`text-xl font-black mt-1 ${isDark ? 'text-emerald-400' : 'text-emerald-700'}`}>
                                {q.correctAnswer?.join(', ')}
                              </div>
                            </div>
                          </div>
                        )}

                        {(q.solution || q.solutionImageUrl) && (
                          <div className={`mt-6 p-5 rounded-xl border-t-2 border-indigo-500/40 ${isDark ? 'bg-slate-900/40' : 'bg-slate-50/50'}`}>
                            <h5 className={`text-xs uppercase font-black tracking-widest flex items-center gap-1 mb-3 ${isDark ? 'text-indigo-400' : 'text-indigo-600'}`}>
                              <span className="material-symbols-outlined text-sm">lightbulb</span>
                              Step-by-Step Solution
                            </h5>
                            {q.solution && (
                              <div className={`text-sm leading-relaxed whitespace-pre-wrap ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                                <LatexRenderer text={q.solution} />
                              </div>
                            )}
                            {q.solutionImageUrl && (
                              <div className="mt-3 p-2 rounded-lg bg-white inline-block border border-slate-200 max-w-full">
                                <img src={q.solutionImageUrl} alt="Solution representation" className="max-h-64 object-contain rounded" />
                              </div>
                            )}
                          </div>
                        )}

                        {/* Raise a Doubt button */}
                        <div className="mt-5 flex justify-end">
                          <button
                            onClick={async () => {
                              try {
                                await fetch(`${API_BASE}/assessment/doubts`, {
                                  method: 'POST',
                                  headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${user.token}` },
                                  body: JSON.stringify({ questionId: q._id, testId: reviewData.attemptSummary.testId, attemptId: selectedReviewAttemptId }),
                                });
                                alert('Doubt raised successfully! Your teacher will review this question.');
                              } catch {
                                alert('Failed to raise doubt. Please try again.');
                              }
                            }}
                            className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer border ${isDark ? 'bg-amber-500/10 text-amber-400 border-amber-500/20 hover:bg-amber-500/20' : 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100'}`}
                          >
                            <span className="material-symbols-outlined text-sm">help</span>
                            Raise a Doubt
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : null}
          </div>
        ) : view === 'leaderboard' ? (
          <div className="max-w-6xl space-y-8 animate-in fade-in duration-500">
            {!selectedLeaderboardTest ? (
              <>
                <header className="flex flex-col gap-2">
                  <h2 className={`text-4xl font-extrabold font-headline tracking-tight ${isDark ? 'text-on-background' : 'text-slate-900'}`}>
                    Leaderboards
                  </h2>
                  <p className={`text-lg font-medium opacity-70 ${isDark ? 'text-on-surface-variant' : 'text-slate-600'}`}>
                    Compare your performance and rank with peers.
                  </p>
                </header>

                {loadingResults ? (
                  <div className={`p-12 text-center rounded-2xl border ${isDark ? 'bg-surface-container border-outline-variant/20' : 'bg-white border-slate-100 shadow-sm'}`}>
                    <span className="material-symbols-outlined animate-spin text-indigo-500 text-4xl">sync</span>
                    <p className={`mt-3 font-medium ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Loading your tests...</p>
                  </div>
                ) : completedResults.length === 0 ? (
                  <div className={`p-12 text-center rounded-2xl border flex flex-col items-center ${isDark ? 'bg-surface-container border-outline-variant/20' : 'bg-white border-slate-100 shadow-sm'}`}>
                    <div className="w-16 h-16 rounded-full bg-indigo-500/10 flex items-center justify-center text-indigo-500 mb-4">
                      <span className="material-symbols-outlined text-3xl">emoji_events</span>
                    </div>
                    <h3 className="text-xl font-bold">No Leaderboards Available</h3>
                    <p className={`mt-2 max-w-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>You must complete at least one test in the series to access its comparative leaderboard.</p>
                    <button onClick={showTestSeries} className="mt-6 px-6 py-2.5 bg-indigo-600 text-white font-bold rounded-xl border-none cursor-pointer hover:bg-indigo-500">
                      Take a Test Now
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {Array.from(
                      completedResults.reduce((acc, result) => {
                        const tId = result.test?._id;
                        if (tId && !acc.has(tId)) acc.set(tId, result);
                        return acc;
                      }, new Map()).values()
                    ).map((result) => (
                      <div
                        key={result._id}
                        className={`p-6 rounded-2xl border flex flex-col justify-between transition-all duration-200 ${isDark ? 'bg-surface-container border-outline-variant/10 hover:bg-surface-container-high' : 'bg-white shadow-sm border-slate-100 hover:shadow-md'}`}
                      >
                        <div>
                          <div className="flex items-center gap-2 mb-3">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${isDark ? 'bg-indigo-500/20 text-indigo-300' : 'bg-indigo-50 text-indigo-600'}`}>
                              {result.test?.category || 'Test'}
                            </span>
                          </div>
                          <h4 className={`text-lg font-extrabold tracking-tight leading-snug ${isDark ? 'text-white' : 'text-slate-900'}`}>
                            {result.test?.title}
                          </h4>
                          <p className={`text-xs mt-2 opacity-65 flex items-center gap-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                            <span className="material-symbols-outlined text-sm">event</span>
                            {result.submittedAt ? new Date(result.submittedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Date Unknown'}
                          </p>
                        </div>
                        <button
                          onClick={() => setSelectedLeaderboardTest(result.test)}
                          className="mt-6 cursor-pointer border-none py-3 px-4 bg-indigo-600 text-white font-bold rounded-xl text-sm transition-all hover:bg-indigo-500 flex items-center justify-center gap-2"
                        >
                          <span className="material-symbols-outlined text-lg">emoji_events</span>
                          View Leaderboard
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </>
            ) : (
              <>
                <div className="flex items-center gap-4 mb-6">
                  <button
                    onClick={() => {
                      setSelectedLeaderboardTest(null);
                      setLeaderboardData(null);
                    }}
                    className={`p-2 rounded-xl border transition-all cursor-pointer flex items-center justify-center ${isDark ? 'bg-surface-container border-outline-variant/20 text-white hover:bg-surface-container-high' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'}`}
                  >
                    <span className="material-symbols-outlined">arrow_back</span>
                  </button>
                  <div>
                    <h2 className={`text-3xl font-extrabold tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
                      {selectedLeaderboardTest.title}
                    </h2>
                    <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                      Live Leaderboard Rankings
                    </p>
                  </div>
                </div>

                {loadingLeaderboard ? (
                  <div className={`p-12 text-center rounded-2xl border ${isDark ? 'bg-surface-container border-outline-variant/20' : 'bg-white border-slate-100 shadow-sm'}`}>
                    <span className="material-symbols-outlined animate-spin text-indigo-500 text-4xl">sync</span>
                    <p className={`mt-3 font-medium ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Fetching rankings...</p>
                  </div>
                ) : leaderboardError ? (
                  <div className={`p-6 rounded-2xl border text-red-500 ${isDark ? 'bg-red-500/10 border-red-500/20' : 'bg-red-50 border-red-100'}`}>
                    {leaderboardError}
                  </div>
                ) : leaderboardData ? (
                  <div className="space-y-8">
                    {/* Quick Summary Widget for User Rank */}
                    {leaderboardData.myRank && (
                      <div className={`p-6 rounded-2xl border flex items-center justify-between bg-gradient-to-r from-indigo-600 to-violet-700 text-white border-none shadow-xl shadow-indigo-500/20`}>
                        <div className="flex items-center gap-4">
                          <div className="w-14 h-14 bg-white/20 backdrop-blur-md rounded-xl flex items-center justify-center text-yellow-300 font-black text-2xl shadow-inner">
                            #{leaderboardData.myRank}
                          </div>
                          <div>
                            <h4 className="font-extrabold text-xl">Your Current Rank</h4>
                            <p className="text-indigo-100 text-xs opacity-80">Position computed across {leaderboardData.leaderboard.length} completed attempts.</p>
                          </div>
                        </div>
                        <div className="hidden sm:flex flex-col text-right">
                          <span className="text-xs opacity-75 font-medium uppercase tracking-widest">Your Total Score</span>
                          <span className="text-2xl font-black">{leaderboardData.leaderboard.find(l => l.isMe)?.totalScore} / {selectedLeaderboardTest.totalMarks}</span>
                        </div>
                      </div>
                    )}

                    {/* Mobile Leaderboard Grid (Visible below 768px) */}
                    <div className="grid grid-cols-1 gap-4 md:hidden">
                      {leaderboardData.leaderboard.map((student) => {
                        const sections = leaderboardData.test?.sections?.map(s => s.name) || Object.keys(student.sectionScores);
                        return (
                          <div
                            key={student.username + student.rank}
                            className={`p-4 rounded-2xl border flex flex-col gap-4 transition-all ${student.isMe ? (isDark ? 'bg-indigo-500/10 border-indigo-500/30' : 'bg-indigo-50 border-indigo-200') : (isDark ? 'bg-surface-container border-outline-variant/10' : 'bg-white border-slate-100 shadow-sm')}`}
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-base ${student.rank === 1 ? 'bg-amber-500/20 text-amber-500' :
                                    student.rank === 2 ? 'bg-slate-400/20 text-slate-400' :
                                      student.rank === 3 ? 'bg-amber-700/20 text-amber-700' :
                                        (isDark ? 'bg-slate-800 text-slate-400' : 'bg-slate-100 text-slate-500')
                                  }`}>
                                  {student.rank === 1 ? '🥇' : student.rank === 2 ? '🥈' : student.rank === 3 ? '🥉' : `#${student.rank}`}
                                </div>
                                <div>
                                  <div className={`font-bold text-sm ${student.isMe ? 'text-indigo-500' : (isDark ? 'text-white' : 'text-slate-900')}`}>{student.name}</div>
                                  <div className="text-[10px] opacity-60">@{student.username}</div>
                                </div>
                              </div>
                              <div className="text-right flex flex-col items-end">
                                <div className={`text-lg font-black leading-none ${student.isMe ? 'text-indigo-400' : (isDark ? 'text-white' : 'text-slate-800')}`}>{student.totalScore}</div>
                                <div className="text-[9px] font-extrabold uppercase opacity-60 tracking-wider mt-1">Total Marks</div>
                              </div>
                            </div>

                            <div className={`grid grid-cols-3 gap-2 p-3 rounded-xl text-center text-xs font-bold ${isDark ? 'bg-slate-900/30' : 'bg-slate-50'}`}>
                              <div>
                                <div className="opacity-60 mb-0.5 text-[8px] uppercase tracking-wider">Percent</div>
                                <div className={isDark ? 'text-slate-200' : 'text-slate-700'}>{student.percentage}%</div>
                              </div>
                              {sections.slice(0, 2).map(sect => (
                                <div key={sect} className="border-l border-slate-500/10">
                                  <div className="opacity-60 mb-0.5 text-[8px] uppercase tracking-wider truncate px-1">{sect}</div>
                                  <div className={isDark ? 'text-slate-200' : 'text-slate-700'}>{student.sectionScores[sect] ?? '-'}</div>
                                </div>
                              ))}
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Desktop Leaderboard Table (Hidden below 768px) */}
                    <div className={`hidden md:block rounded-2xl border overflow-hidden ${isDark ? 'bg-surface-container border-outline-variant/20' : 'bg-white border-slate-100 shadow-sm'}`}>
                      <div className="overflow-x-auto">
                        <table className="w-full border-collapse">
                          <thead>
                            <tr className={`border-b text-left ${isDark ? 'border-outline-variant/10 bg-surface-container-high' : 'border-slate-100 bg-slate-50'}`}>
                              <th className={`py-4 px-6 text-xs font-black uppercase tracking-widest ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Rank</th>
                              <th className={`py-4 px-6 text-xs font-black uppercase tracking-widest ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Student</th>
                              {/* Map dynamic section headers */}
                              {(leaderboardData.test?.sections?.map(s => s.name) || (leaderboardData.leaderboard?.[0] ? Object.keys(leaderboardData.leaderboard[0].sectionScores) : [])).map(sect => (
                                <th key={sect} className={`py-4 px-6 text-xs font-black uppercase tracking-widest text-center ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{sect}</th>
                              ))}
                              <th className={`py-4 px-6 text-xs font-black uppercase tracking-widest text-center ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Total Marks</th>
                              <th className={`py-4 px-6 text-xs font-black uppercase tracking-widest text-center ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Percentage</th>
                            </tr>
                          </thead>
                          <tbody>
                            {leaderboardData.leaderboard.map((student) => {
                              const sections = leaderboardData.test?.sections?.map(s => s.name) || Object.keys(student.sectionScores);
                              return (
                                <tr
                                  key={student.username + student.rank}
                                  className={`border-b last:border-none transition-colors duration-150 ${student.isMe ? (isDark ? 'bg-indigo-500/10 hover:bg-indigo-500/15' : 'bg-indigo-50/50 hover:bg-indigo-50') : (isDark ? 'border-outline-variant/5 hover:bg-surface-container-highest' : 'border-slate-50 hover:bg-slate-50/50')}`}
                                >
                                  <td className="py-4 px-6 font-black text-lg">
                                    {student.rank === 1 ? (
                                      <span className="flex items-center justify-center w-8 h-8 rounded-full bg-amber-500/20 text-amber-500 text-base" title="1st Place">🥇</span>
                                    ) : student.rank === 2 ? (
                                      <span className="flex items-center justify-center w-8 h-8 rounded-full bg-slate-400/20 text-slate-400 text-base" title="2nd Place">🥈</span>
                                    ) : student.rank === 3 ? (
                                      <span className="flex items-center justify-center w-8 h-8 rounded-full bg-amber-700/20 text-amber-700 text-base" title="3rd Place">🥉</span>
                                    ) : (
                                      <span className={`flex items-center justify-center w-8 h-8 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>#{student.rank}</span>
                                    )}
                                  </td>
                                  <td className="py-4 px-6">
                                    <div className="flex flex-col">
                                      <span className={`font-bold ${student.isMe ? 'text-indigo-500' : (isDark ? 'text-white' : 'text-slate-900')}`}>
                                        {student.name}
                                      </span>
                                      <span className={`text-xs font-medium opacity-60 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                                        @{student.username}
                                      </span>
                                    </div>
                                  </td>
                                  {/* Subject Wise Marks */}
                                  {sections.map(sect => (
                                    <td key={sect} className="py-4 px-6 text-center font-semibold">
                                      <span className={student.sectionScores[sect]?.score >= 0 ? (isDark ? 'text-green-400' : 'text-green-600') : 'text-red-500'}>
                                        {student.sectionScores[sect] !== undefined ? student.sectionScores[sect].score : '-'}
                                      </span>
                                    </td>
                                  ))}
                                  {/* Total Marks */}
                                  <td className="py-4 px-6 text-center">
                                    <span className={`font-extrabold ${student.isMe ? 'text-indigo-500 text-lg' : (isDark ? 'text-white' : 'text-slate-900')}`}>
                                      {student.totalScore}
                                    </span>
                                    <span className="text-xs opacity-50 font-medium"> / {student.maxPossibleScore || selectedLeaderboardTest.totalMarks}</span>
                                  </td>
                                  {/* Percentage */}
                                  <td className="py-4 px-6 text-center">
                                    <span className={`px-3 py-1 rounded-full text-xs font-black ${isDark ? 'bg-emerald-500/10 text-emerald-400' : 'bg-emerald-50 text-emerald-700'}`}>
                                      {student.percentage ? student.percentage.toFixed(1) : '0.0'}%
                                    </span>
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                ) : null}
              </>
            )}
          </div>
        ) : view === 'analytics' ? (
          <div className="space-y-8">
            <header>
              <h2 className={`text-4xl font-extrabold font-headline tracking-tight ${isDark ? 'text-on-background' : 'text-slate-900'}`}>Analytics</h2>
              <p className={`mt-2 text-lg font-medium opacity-70 ${isDark ? 'text-on-surface-variant' : 'text-slate-600'}`}>Review submitted test results and section performance.</p>
            </header>
            {loadingResults ? (
              <div className={`p-8 rounded-xl ${isDark ? 'bg-surface-container' : 'bg-white shadow-sm'}`}>Loading results...</div>
            ) : resultsError ? (
              <div className="p-6 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400">{resultsError}</div>
            ) : results.length === 0 ? (
              <div className={`p-8 rounded-xl text-center ${isDark ? 'bg-surface-container' : 'bg-white shadow-sm'}`}>
                <span className="material-symbols-outlined text-5xl text-slate-500 mb-3">analytics</span>
                <h3 className="text-xl font-bold mb-2">No Results Yet</h3>
                <p className={isDark ? 'text-slate-400' : 'text-slate-500'}>Submit a test to see score, accuracy, and section breakdown here.</p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                  <div className={`p-6 rounded-xl ${isDark ? 'bg-surface-container' : 'bg-white shadow-sm border border-slate-100'}`}>
                    <p className="text-xs uppercase tracking-widest text-slate-500 font-bold">Tests Submitted</p>
                    <p className="text-3xl font-bold mt-2">{completedResults.length}</p>
                  </div>
                  <div className={`p-6 rounded-xl ${isDark ? 'bg-surface-container' : 'bg-white shadow-sm border border-slate-100'}`}>
                    <p className="text-xs uppercase tracking-widest text-slate-500 font-bold">Average Score</p>
                    <p className="text-3xl font-bold mt-2">{averagePercentage}%</p>
                  </div>
                  <div className={`p-6 rounded-xl ${isDark ? 'bg-surface-container' : 'bg-white shadow-sm border border-slate-100'}`}>
                    <p className="text-xs uppercase tracking-widest text-slate-500 font-bold">Best Score</p>
                    <p className="text-3xl font-bold mt-2">{bestResult?.percentage ?? 0}%</p>
                  </div>
                </div>
                <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
                  <div className={`xl:col-span-2 p-6 rounded-xl ${isDark ? 'bg-surface-container' : 'bg-white shadow-sm border border-slate-100'}`}>
                    <div className="flex items-center justify-between gap-4 mb-5">
                      <div>
                        <p className="text-xs uppercase tracking-widest text-slate-500 font-bold">Score Trend</p>
                        <h3 className="text-xl font-bold mt-1">Recent Test Performance</h3>
                      </div>
                      <span className="text-sm font-bold text-indigo-400">{trendResults.length} attempts</span>
                    </div>
                    <div className={`h-56 rounded-xl p-4 ${isDark ? 'bg-slate-950/30' : 'bg-slate-50'}`}>
                      {trendResults.length > 1 ? (
                        <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="h-full w-full overflow-visible">
                          <polyline points={trendPoints} fill="none" stroke="#6366f1" strokeWidth="3" vectorEffect="non-scaling-stroke" />
                          {trendResults.map((result, idx) => {
                            const x = trendResults.length <= 1 ? 50 : (idx / (trendResults.length - 1)) * 100;
                            const y = 100 - Math.max(0, Math.min(100, Number(result.percentage) || 0));
                            return <circle key={result._id} cx={x} cy={y} r="2.4" fill="#6366f1" />;
                          })}
                        </svg>
                      ) : (
                        <div className="flex h-full items-center justify-center text-sm text-slate-500">Submit more tests to build a trend.</div>
                      )}
                    </div>
                  </div>
                  <div className={`p-6 rounded-xl ${isDark ? 'bg-surface-container' : 'bg-white shadow-sm border border-slate-100'}`}>
                    <p className="text-xs uppercase tracking-widest text-slate-500 font-bold">Latest Attempt Timing</p>
                    <h3 className="text-xl font-bold mt-1">{totalTelemetryMinutes} mins tracked</h3>
                    <div className="mt-5 space-y-4">
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span className={isDark ? 'text-slate-400' : 'text-slate-500'}>Avg/question</span>
                          <span className="font-bold">{latestResult?.telemetry?.averageQuestionTimeSeconds || 0}s</span>
                        </div>
                        <div className={`h-2 rounded-full overflow-hidden ${isDark ? 'bg-slate-800' : 'bg-slate-100'}`}>
                          <div className="h-full bg-indigo-500" style={{ width: `${Math.min(100, ((latestResult?.telemetry?.averageQuestionTimeSeconds || 0) / maxQuestionTime) * 100)}%` }} />
                        </div>
                      </div>
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span className={isDark ? 'text-slate-400' : 'text-slate-500'}>Question visits</span>
                          <span className="font-bold">{latestResult?.telemetry?.totalVisits || 0}</span>
                        </div>
                        <div className={`h-2 rounded-full overflow-hidden ${isDark ? 'bg-slate-800' : 'bg-slate-100'}`}>
                          <div className="h-full bg-emerald-500" style={{ width: `${Math.min(100, ((latestResult?.telemetry?.totalVisits || 0) / Math.max(1, latestResult?.totalQuestions || 1)) * 35)}%` }} />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
                  <div className={`p-6 rounded-xl ${isDark ? 'bg-surface-container' : 'bg-white shadow-sm border border-slate-100'}`}>
                    <p className="text-xs uppercase tracking-widest text-slate-500 font-bold mb-4">Latest Section Score</p>
                    <div className="space-y-3">
                      {latestSectionEntries.length ? latestSectionEntries.map(([section, score]) => {
                        const maxSection = Math.max(...latestSectionEntries.map(([, item]) => Math.abs(item.score || 0)), 1);
                        return (
                          <div key={section}>
                            <div className="flex justify-between text-sm mb-1">
                              <span className="font-semibold truncate">{section}</span>
                              <span className={(score.score || 0) >= 0 ? 'text-emerald-500 font-bold' : 'text-red-500 font-bold'}>{score.score || 0} pts</span>
                            </div>
                            <div className={`h-2 rounded-full overflow-hidden ${isDark ? 'bg-slate-800' : 'bg-slate-100'}`}>
                              <div className={`${(score.score || 0) >= 0 ? 'bg-emerald-500' : 'bg-red-500'} h-full`} style={{ width: `${Math.min(100, (Math.abs(score.score || 0) / maxSection) * 100)}%` }} />
                            </div>
                          </div>
                        );
                      }) : <p className="text-sm text-slate-500">No section score data yet.</p>}
                    </div>
                  </div>
                  <div className={`p-6 rounded-xl ${isDark ? 'bg-surface-container' : 'bg-white shadow-sm border border-slate-100'}`}>
                    <p className="text-xs uppercase tracking-widest text-slate-500 font-bold mb-4">Chapter / Topic Strength</p>
                    <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
                      {latestTopicEntries.length ? latestTopicEntries.map(([topic, perf]) => {
                        const total = (perf.correct || 0) + (perf.wrong || 0) + (perf.skipped || 0);
                        const accuracy = total ? Math.round(((perf.correct || 0) / total) * 100) : 0;
                        return (
                          <div key={topic}>
                            <div className="flex justify-between text-xs mb-1">
                              <span className="font-bold truncate">{topic}</span>
                              <span className={isDark ? 'text-slate-400' : 'text-slate-500'}>{perf.correct || 0}C · {perf.wrong || 0}W · {perf.skipped || 0}S</span>
                            </div>
                            <div className={`h-2 rounded-full overflow-hidden ${isDark ? 'bg-slate-800' : 'bg-slate-100'}`}>
                              <div className={`${accuracy >= 60 ? 'bg-emerald-500' : accuracy >= 35 ? 'bg-amber-500' : 'bg-red-500'} h-full`} style={{ width: `${accuracy}%` }} />
                            </div>
                          </div>
                        );
                      }) : <p className="text-sm text-slate-500">Add tags to questions to unlock topic analytics.</p>}
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
                  <div className={`p-6 rounded-xl ${isDark ? 'bg-surface-container' : 'bg-white shadow-sm border border-slate-100'}`}>
                    <p className="text-xs uppercase tracking-widest text-slate-500 font-bold mb-4">Question Time Distribution</p>
                    <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
                      {latestTelemetryQuestions.length ? latestTelemetryQuestions.map((question, idx) => (
                        <div key={question.questionId || idx}>
                          <div className="flex justify-between text-xs mb-1">
                            <span className="font-bold">Q{idx + 1}</span>
                            <span className={isDark ? 'text-slate-400' : 'text-slate-500'}>{question.timeSpentSeconds || 0}s • {question.visitCount || 0} visits</span>
                          </div>
                          <div className={`h-2 rounded-full overflow-hidden ${isDark ? 'bg-slate-800' : 'bg-slate-100'}`}>
                            <div className="h-full bg-indigo-500" style={{ width: `${Math.min(100, ((question.timeSpentSeconds || 0) / maxQuestionTime) * 100)}%` }} />
                          </div>
                        </div>
                      )) : <p className="text-sm text-slate-500">Telemetry will appear after the next submitted test.</p>}
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  {results.map((result) => {
                    const sectionEntries = Object.entries(result.sectionScores || {});
                    return (
                      <div key={result._id} className={`p-6 rounded-xl ${isDark ? 'bg-surface-container' : 'bg-white shadow-sm border border-slate-100'}`}>
                        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                          <div>
                            <p className="text-xs uppercase tracking-widest text-indigo-400 font-bold">{result.test?.category || 'General'}</p>
                            <h3 className="text-xl font-bold mt-1">{result.test?.title || 'Deleted Test'}</h3>
                            <p className={`text-sm mt-2 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                              Submitted {result.submittedAt ? new Date(result.submittedAt).toLocaleString() : 'recently'} · {result.durationUsedMinutes || 0} mins · IP {result.ipAddress || 'not captured'}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-3xl font-extrabold text-indigo-400">{result.percentage ?? 0}%</p>
                            <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{result.totalScore ?? 0} / {result.maxPossibleScore ?? result.test?.totalMarks ?? 0}</p>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-5">
                          <div className={`p-3 rounded-lg ${isDark ? 'bg-surface-container-low' : 'bg-slate-50'}`}>
                            <p className="text-[10px] uppercase text-slate-500 font-bold">Answered</p>
                            <p className="font-bold">{result.answered} / {result.totalQuestions}</p>
                          </div>
                          <div className={`p-3 rounded-lg ${isDark ? 'bg-surface-container-low' : 'bg-slate-50'}`}>
                            <p className="text-[10px] uppercase text-slate-500 font-bold">Tracked Time</p>
                            <p className="font-bold">{Math.round((result.telemetry?.totalTimeSpentSeconds || 0) / 60)} mins</p>
                          </div>
                          {sectionEntries.slice(0, 3).map(([section, score]) => (
                            <div key={section} className={`p-3 rounded-lg ${isDark ? 'bg-surface-container-low' : 'bg-slate-50'}`}>
                              <p className="text-[10px] uppercase text-slate-500 font-bold truncate">{section}</p>
                              <p className="font-bold">{score.score} pts</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </>
            )}
          </div>
        ) : view === 'settings' ? (
          <div className="max-w-3xl space-y-8">
            <header>
              <h2 className={`text-4xl font-extrabold font-headline tracking-tight ${isDark ? 'text-on-background' : 'text-slate-900'}`}>Settings</h2>
              <p className={`mt-2 text-lg font-medium opacity-70 ${isDark ? 'text-on-surface-variant' : 'text-slate-600'}`}>Control dashboard preferences for your test environment.</p>
            </header>
            <section className={`p-6 rounded-xl ${isDark ? 'bg-surface-container' : 'bg-white shadow-sm border border-slate-100'}`}>
              <div className="flex items-center justify-between gap-4">
                <div>
                  <h3 className="font-bold text-lg">Theme</h3>
                  <p className={`text-sm mt-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Switch between dark and light dashboard modes.</p>
                </div>
                <button onClick={toggleTheme} className="px-5 py-2 rounded-lg bg-indigo-500 text-white font-bold border-none">
                  {isDark ? 'Use Light' : 'Use Dark'}
                </button>
              </div>
            </section>
            <section className={`p-6 rounded-xl ${isDark ? 'bg-surface-container' : 'bg-white shadow-sm border border-slate-100'}`}>
              <h3 className="font-bold text-lg mb-3">Account</h3>
              <div className={`text-sm space-y-2 ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                <p>Name: <strong>{user.name || user.username || 'Student'}</strong></p>
                <p>Login type: <strong>{user.authMethod === 'b2b' ? 'Coaching' : 'Scholar'}</strong></p>
              </div>
            </section>
          </div>
        ) : view === 'support' ? (
          <div className="max-w-4xl space-y-8">
            <header>
              <h2 className={`text-4xl font-extrabold font-headline tracking-tight ${isDark ? 'text-on-background' : 'text-slate-900'}`}>Support</h2>
              <p className={`mt-2 text-lg font-medium opacity-70 ${isDark ? 'text-on-surface-variant' : 'text-slate-600'}`}>Troubleshoot CBT issues before, during, and after tests.</p>
            </header>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {[
                ['Test did not open', 'Allow pop-ups for this site, then start the test again from Test Series.'],
                ['Answers not saving', 'Keep the test window open and connected. Submit will stop if the latest save fails.'],
                // ['Result missing', 'Open Analytics after submission. If a result is evaluating, refresh after a short wait.'],
                ['Need admin help', 'Contact your coaching admin with test title, time, and account name.'],
                ['Contact Support', (
                  <span>
                    Reach out to us directly at{' '}
                    <a href="mailto:support@vayl.in" className={`hover:underline font-bold ${isDark ? 'text-indigo-400' : 'text-indigo-600'}`}>
                      support@vayl.in
                    </a>{' '}
                    for additional assistance.
                  </span>
                )],
              ].map(([title, body]) => (
                <div key={title} className={`p-6 rounded-xl ${isDark ? 'bg-surface-container' : 'bg-white shadow-sm border border-slate-100'}`}>
                  <h3 className="font-bold text-lg">{title}</h3>
                  <p className={`text-sm mt-2 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{body}</p>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="max-w-4xl mx-auto">
            {/* Breadcrumb / Back */}
            <button
              onClick={() => navigateTo('test-series')} className={`flex items-center mb-8 text-sm font-medium transition-colors cursor-pointer border-none bg-transparent ${isDark ? 'text-slate-400 hover:text-indigo-400' : 'text-slate-500 hover:text-indigo-600'}`}
            >
              <span className="material-symbols-outlined mr-2 text-lg">arrow_back</span>
              Back to Test Series
            </button>

            {/* Instruction Hero */}
            <div className={`rounded-2xl p-8 mb-8 relative overflow-hidden transition-all duration-300 ${isDark ? 'bg-surface-container' : 'bg-white shadow-xl border border-slate-100'}`}>
              <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 relative z-10">
                <div>
                  <div className="flex items-center space-x-3 mb-4">
                    <span className="px-3 py-1 bg-indigo-500/10 text-indigo-400 text-xs font-bold rounded-full uppercase tracking-widest border border-indigo-500/20">
                      {selectedTest?.category || 'Advance'}
                    </span>
                  </div>
                  <h1 className={`text-4xl font-extrabold font-headline tracking-tight ${isDark ? 'text-on-background' : 'text-slate-900'}`}>{selectedTest?.title}</h1>
                </div>
                <div className="flex space-x-4">
                  <div className={`text-center px-6 py-3 rounded-xl ${isDark ? 'bg-surface-container-low' : 'bg-slate-50'}`}>
                    <p className="text-[10px] font-bold uppercase text-slate-500 mb-1">Duration</p>
                    <p className={`text-lg font-bold font-headline ${isDark ? 'text-on-surface' : 'text-slate-900'}`}>{selectedTest?.durationMinutes || 0} mins</p>
                  </div>
                  <div className={`text-center px-6 py-3 rounded-xl ${isDark ? 'bg-surface-container-low' : 'bg-slate-50'}`}>
                    <p className="text-[10px] font-bold uppercase text-slate-500 mb-1">Total Marks</p>
                    <p className={`text-lg font-bold font-headline ${isDark ? 'text-on-surface' : 'text-slate-900'}`}>{selectedTest?.totalMarks || 0}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Instructions Main Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="md:col-span-2 space-y-8">
                {/* Syllabus Section */}
                <section className={`p-8 rounded-2xl transition-all duration-300 ${isDark ? 'bg-surface-container' : 'bg-white shadow-lg border border-slate-100'}`}>
                  <h3 className={`text-xl font-bold font-headline mb-6 flex items-center ${isDark ? 'text-indigo-400' : 'text-indigo-600'}`}>
                    <span className="material-symbols-outlined mr-3">menu_book</span>
                    Test Syllabus
                  </h3>
                  <ul className="space-y-4">
                    {selectedTest?.syllabus?.length > 0 ? (
                      selectedTest.syllabus.map((item, idx) => (
                        <li key={idx} className="flex items-start">
                          <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-2 mr-4 flex-shrink-0"></div>
                          <span className={`text-base leading-relaxed ${isDark ? 'text-on-surface-variant' : 'text-slate-600'}`}>{item}</span>
                        </li>
                      ))
                    ) : (
                      <p className={`text-sm italic ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>No syllabus details provided for this test.</p>
                    )}
                  </ul>
                </section>

                {/* Important Instructions */}
                <section className={`p-8 rounded-2xl transition-all duration-300 ${isDark ? 'bg-surface-container' : 'bg-white shadow-lg border border-slate-100'}`}>
                  <h3 className={`text-xl font-bold font-headline mb-6 flex items-center ${isDark ? 'text-indigo-400' : 'text-indigo-600'}`}>
                    <span className="material-symbols-outlined mr-3">info</span>
                    Important Guidelines
                  </h3>
                  <div className={`space-y-4 text-sm leading-relaxed ${isDark ? 'text-on-surface-variant' : 'text-slate-600'}`}>
                    {(selectedTest?.instructions?.general?.length ? selectedTest.instructions.general : [
                      'The test will automatically conclude when the timer reaches zero.',
                      `Correct answers award +${selectedTest?.defaultPositiveMarks ?? 4} marks, while incorrect ones deduct ${selectedTest?.defaultNegativeMarks ?? 1} mark.`,
                      'No marks are deducted for unattempted questions.',
                      'Ensure a stable internet connection for the duration of the test.',
                    ]).map((instruction, idx) => (
                      <p key={idx}>• {instruction}</p>
                    ))}
                  </div>
                </section>
              </div>

              {/* Action Sidebar */}
              <div className="space-y-6">
                <div className={`p-8 rounded-2xl sticky top-32 transition-all duration-300 ${isDark ? 'bg-surface-container' : 'bg-white shadow-2xl border border-indigo-100/50'}`}>
                  <p className={`text-sm font-medium mb-6 ${isDark ? 'text-on-surface-variant' : 'text-slate-500'}`}>Ready to begin your mock exam? Take a deep breath.</p>
                  <button
                    onClick={() => openTestAttempt(selectedTest)}
                    className="cursor-pointer border-none w-full py-4 bg-indigo-500 text-on-primary font-bold rounded-xl text-lg transition-all shadow-xl shadow-indigo-500/20 hover:shadow-indigo-500/40 hover:-translate-y-0.5 active:scale-95"
                  >
                    {selectedTest?.state === 'completed' ? 'Retake Test' : 'Start Test Now'}
                  </button>

                  {selectedTest?.state !== 'completed' && (
                    <div className={`mt-5 p-3.5 rounded-xl text-xs leading-relaxed border flex gap-2.5 items-start ${isDark ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' : 'bg-amber-50 text-amber-800 border-amber-200'}`}>
                      <span className="material-symbols-outlined text-[18px] shrink-0">warning</span>
                      <span><strong>Leaderboard Note:</strong> Only your 1st attempt score will be counted for the global leaderboard ranking. Make it count!</span>
                    </div>
                  )}

                  {selectedTest?.state === 'completed' && (
                    <div className={`mt-5 p-3.5 rounded-xl text-xs leading-relaxed border flex gap-2.5 items-start ${isDark ? 'bg-indigo-500/10 text-indigo-300 border-indigo-500/20' : 'bg-indigo-50 text-indigo-700 border-indigo-200'}`}>
                      <span className="material-symbols-outlined text-[18px] shrink-0">info</span>
                      <span>You have already completed this test. New attempts will be saved for your personal analytics but will <strong>not</strong> affect the leaderboard.</span>
                    </div>
                  )}
                  {selectedTest?.state === 'completed' && selectedTest.latestAttemptId && (
                    <button
                      onClick={() => {
                        setSelectedReviewAttemptId(selectedTest.latestAttemptId);
                        setView('review');
                      }}
                      className="cursor-pointer border-none w-full py-3.5 mt-4 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl text-base transition-all flex items-center justify-center gap-2 shadow-lg shadow-indigo-500/10"
                    >
                      <span className="material-symbols-outlined text-lg">analytics</span>
                      Analyse Performance
                    </button>
                  )}
                  <p className="text-[10px] text-center mt-4 text-slate-500 uppercase tracking-widest font-bold">Good Luck, Scholar!</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
