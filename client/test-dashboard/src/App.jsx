import React, { useCallback, useEffect, useRef, useState } from 'react';
import LoginPage from './LoginPage';
import ForcePasswordChange from './ForcePasswordChange';
import TestEngineApp from './TestEngineApp';
import PublicTestLanding from './pages/PublicTestLanding';
import DashboardHome from './pages/DashboardHome';
import AnalyticsPage from './pages/AnalyticsPage';
import TestsPage from './pages/TestsPage';
import InstructionsPage from './pages/InstructionsPage';
import ReviewPage from './pages/ReviewPage';
import LeaderboardPage from './pages/LeaderboardPage';
import SettingsPage from './pages/SettingsPage';
import SupportPage from './pages/SupportPage';
import { API_BASE } from './config/api';

const getInitialView = () => {
  if (typeof window === 'undefined') return 'dashboard';
  const postSubmitView = localStorage.getItem('post_submit_view');
  if (postSubmitView) {
    localStorage.removeItem('post_submit_view');
    return postSubmitView;
  }
  if (localStorage.getItem('shared_test_id')) return 'loading-shared';

  const path = window.location.pathname;
  if (/^\/tests\/[^/]+$/i.test(path)) return 'instructions';
  if (path === '/tests') return 'test-series';
  if (path === '/pyp') return 'pyp';
  if (path === '/analytics') return 'analytics';
  if (path === '/leaderboard') return 'leaderboard';
  if (path === '/settings') return 'settings';
  if (path === '/support') return 'support';
  return 'dashboard';
};

const getPathForView = (view, test) => {
  if (view === 'test-series') return '/tests';
  if (view === 'pyp') return '/pyp';
  if (view === 'analytics') return '/analytics';
  if (view === 'leaderboard') return '/leaderboard';
  if (view === 'settings') return '/settings';
  if (view === 'support') return '/support';
  if (view === 'instructions' && test?._id) return `/tests/${test._id}`;
  return '/';
};

const getExamFromUrl = () => {
  if (typeof window === 'undefined') return 'jee-mains';
  return new URLSearchParams(window.location.search).get('exam') || 'jee-mains';
};

export default function App() {
  const searchInputRef = useRef(null);
  const [osKey] = useState(() => {
    if (typeof window !== 'undefined' && navigator?.platform) {
      return navigator.platform.toUpperCase().includes('MAC') ? '⌘' : 'Ctrl';
    }
    return 'Ctrl';
  });
  const [view, setView] = useState(getInitialView);
  const [selectedTest, setSelectedTest] = useState(null);
  const [sharedTestId, setSharedTestId] = useState(() => {
    if (typeof window === 'undefined') return null;
    const pathMatch = window.location.pathname.match(/^\/t\/([^/]+)$/i);
    if (pathMatch) return pathMatch[1];
    const queryId = new URLSearchParams(window.location.search).get('shared_test_id');
    return queryId || localStorage.getItem('shared_test_id');
  });
  const [tests, setTests] = useState([]);
  const [loadingTests, setLoadingTests] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('full');
  const [examFilter, setExamFilter] = useState(getExamFromUrl);
  const [showExamHint, setShowExamHint] = useState(() => !localStorage.getItem('seen_exam_filter_hint'));
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
    } catch {
      return null;
    }
  });

  const navigateTo = useCallback((nextView, options = {}) => {
    const nextPath = getPathForView(nextView, options.test);
    const params = new URLSearchParams(window.location.search);
    if (examFilter !== 'jee-mains') params.set('exam', examFilter);
    else params.delete('exam');
    const search = params.toString();
    window.history.pushState(null, '', `${nextPath}${search ? `?${search}` : ''}`);

    setView(nextView);
    if (nextView !== 'instructions') setSelectedTest(null);
    if (nextView !== 'leaderboard') {
      setSelectedLeaderboardTest(null);
      setLeaderboardData(null);
    }
    if (nextView !== 'review') {
      setReviewData(null);
      setSelectedReviewAttemptId(null);
    }
    setSearchQuery('');
  }, [examFilter]);

  const showDashboard = () => navigateTo('dashboard');
  const showTestSeries = () => navigateTo('test-series');

  useEffect(() => {
    document.documentElement.classList.remove('dark');
    localStorage.setItem('theme', 'light');
  }, []);

  useEffect(() => {
    const handleKeyDown = (event) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    const handlePopState = () => {
      const path = window.location.pathname;
      const nextExam = getExamFromUrl();
      let nextView = 'dashboard';
      if (/^\/tests\/[^/]+$/i.test(path)) nextView = 'instructions';
      else if (path === '/tests') nextView = 'test-series';
      else if (path === '/pyp') nextView = 'pyp';
      else if (path === '/analytics') nextView = 'analytics';
      else if (path === '/leaderboard') nextView = 'leaderboard';
      else if (path === '/settings') nextView = 'settings';
      else if (path === '/support') nextView = 'support';

      setExamFilter(nextExam);
      setView(nextView);
      if (nextView !== 'instructions') setSelectedTest(null);
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (examFilter !== 'jee-mains') params.set('exam', examFilter);
    else params.delete('exam');
    const search = params.toString();
    window.history.replaceState(null, '', `${window.location.pathname}${search ? `?${search}` : ''}${window.location.hash}`);
  }, [examFilter]);

  useEffect(() => {
    const shouldLoadTests = user && ['dashboard', 'test-series', 'pyp', 'instructions', 'leaderboard'].includes(view);
    if (!shouldLoadTests) return;

    setLoadingTests(true);
    fetch(`${API_BASE}/tests`, {
      headers: { Authorization: `Bearer ${user.token}` },
    })
      .then(async (res) => {
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
      .then((data) => setTests(data))
      .catch((err) => console.error(err))
      .finally(() => setLoadingTests(false));
  }, [user, view]);

  useEffect(() => {
    if (view !== 'instructions' || selectedTest || tests.length === 0) return;
    const match = window.location.pathname.match(/^\/tests\/([^/]+)$/i);
    if (!match) return;
    const test = tests.find((item) => item._id === match[1]);
    if (test) setSelectedTest(test);
  }, [view, selectedTest, tests]);

  useEffect(() => {
    const shouldLoadResults = user && ['analytics', 'dashboard', 'test-series', 'pyp', 'leaderboard'].includes(view);
    if (!shouldLoadResults) return;

    setLoadingResults(true);
    setResultsError('');
    fetch(`${API_BASE}/assessment/results`, {
      headers: { Authorization: `Bearer ${user.token}` },
    })
      .then(async (res) => {
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
      .then((data) => setResults(data))
      .catch((err) => setResultsError(err.message))
      .finally(() => setLoadingResults(false));
  }, [user, view, resultsRefreshKey]);

  useEffect(() => {
    if (!user || view !== 'leaderboard' || !selectedLeaderboardTest?._id) return;

    setLoadingLeaderboard(true);
    setLeaderboardError('');
    fetch(`${API_BASE}/assessment/${selectedLeaderboardTest._id}/leaderboard`, {
      headers: { Authorization: `Bearer ${user.token}` },
    })
      .then(async (res) => {
        const text = await res.text();
        let data;
        try {
          data = text ? JSON.parse(text) : null;
        } catch {
          throw new Error('Invalid response');
        }
        if (!res.ok) throw new Error(data?.message || 'Failed to fetch leaderboard');
        return data;
      })
      .then((data) => setLeaderboardData(data))
      .catch((err) => setLeaderboardError(err.message))
      .finally(() => setLoadingLeaderboard(false));
  }, [user, view, selectedLeaderboardTest]);

  useEffect(() => {
    if (!user || !sharedTestId) return;

    fetch(`${API_BASE}/tests`, {
      headers: { Authorization: `Bearer ${user.token}` },
    })
      .then((res) => res.json())
      .then((data) => {
        if (!Array.isArray(data)) return;
        const target = data.find((test) => test._id === sharedTestId);
        if (!target) return;
        setSelectedTest(target);
        localStorage.removeItem('shared_test_id');
        setSharedTestId(null);
        navigateTo('instructions', { test: target });
      })
      .catch((err) => console.error('Shared test auto-select error:', err));
  }, [user, sharedTestId, navigateTo]);

  useEffect(() => {
    if (!user || view !== 'review' || !selectedReviewAttemptId) return;

    setLoadingReview(true);
    setReviewError('');
    fetch(`${API_BASE}/assessment/attempts/${selectedReviewAttemptId}/review`, {
      headers: { Authorization: `Bearer ${user.token}` },
    })
      .then(async (res) => {
        const text = await res.text();
        let data;
        try {
          data = text ? JSON.parse(text) : null;
        } catch {
          throw new Error('Invalid response');
        }
        if (!res.ok) throw new Error(data?.message || 'Failed to fetch review data');
        return data;
      })
      .then((data) => setReviewData(data))
      .catch((err) => setReviewError(err.message))
      .finally(() => setLoadingReview(false));
  }, [user, view, selectedReviewAttemptId]);

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
  }, [navigateTo]);

  useEffect(() => {
    const hash = window.location.hash;
    if (!hash.startsWith('#token=')) return;
    const token = hash.split('=')[1];
    window.history.replaceState(null, '', window.location.pathname);

    fetch(`${API_BASE}/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => {
        if (!res.ok) throw new Error('Token verification failed');
        return res.json();
      })
      .then((data) => handleLogin({ ...data, token }))
      .catch((err) => console.error('OAuth Login Error:', err));
  }, []);

  const handleLogin = (userData) => {
    localStorage.setItem('test_user', JSON.stringify(userData));
    localStorage.setItem('test_token', userData.token);
    setUser(userData);
  };

  const handleLogout = () => {
    localStorage.removeItem('test_user');
    localStorage.removeItem('test_token');
    setUser(null);
    setView('dashboard');
    window.history.pushState(null, '', '/');
  };

  const openTestDetails = (test) => {
    setSelectedTest(test);
    navigateTo('instructions', { test });
  };

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
      try {
        data = text ? JSON.parse(text) : {};
      } catch {
        data = { message: text };
      }
      if (!res.ok) throw new Error(data.message || 'Failed to create test attempt');

      localStorage.setItem('current_test', JSON.stringify({ ...test, state: 'in-progress' }));
      popup.location.href = `${window.location.origin}?attempt=true&attemptId=${encodeURIComponent(data.attemptId)}&attemptToken=${encodeURIComponent(data.attemptToken)}`;
      setResultsRefreshKey((key) => key + 1);
    } catch (err) {
      popup.close();
      alert(err.message || 'Could not start the test.');
    }
  };

  const openReview = (attemptId) => {
    setSelectedReviewAttemptId(attemptId);
    setView('review');
    window.history.pushState(null, '', '/analytics');
  };

  const dismissExamHint = () => {
    setShowExamHint(false);
    localStorage.setItem('seen_exam_filter_hint', 'true');
  };

  const handleExamFilterChange = (value) => {
    setExamFilter(value);
    if (showExamHint) dismissExamHint();
  };

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
    return <LoginPage onLogin={handleLogin} />;
  }

  if (user.hasChangedPassword === false) {
    return (
      <ForcePasswordChange
        user={user}
        onPasswordChanged={() => handleLogin({ ...user, hasChangedPassword: true })}
        onLogout={handleLogout}
      />
    );
  }

  const normalizedSearch = searchQuery.trim().toLowerCase();
  const matchesCategory = (test) => {
    if (view === 'pyp') {
      if (test.testType !== 'pyp') return false;
    } else if (test.testType === 'pyp') {
      return false;
    }

    if (examFilter !== 'all') {
      const category = (test.category || '').toLowerCase();
      const title = (test.title || '').toLowerCase();
      if (examFilter === 'jee-mains' && !category.includes('mains') && !title.includes('mains')) return false;
      if (examFilter === 'jee-adv' && !category.includes('adv') && !title.includes('adv')) return false;
      if (examFilter === 'neet' && !category.includes('neet') && !title.includes('neet')) return false;
    }

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
  const givenCount = tests.filter((test) => test.state === 'completed' || test.state === 'evaluating').length;
  const missedCount = tests.filter((test) => test.state === 'missed').length;
  const ongoingCount = tests.filter((test) => test.state === 'in-progress').length;
  const upcomingCount = tests.filter((test) => test.state === 'upcoming').length;
  const bestResult = completedResults.reduce((best, result) => {
    if (!best) return result;
    return (result.percentage || 0) > (best.percentage || 0) ? result : best;
  }, null);
  const averagePercentage = completedResults.length
    ? Math.round(completedResults.reduce((sum, result) => sum + (result.percentage || 0), 0) / completedResults.length)
    : 0;
  const latestResult = sortedResults[0] || null;
  const trendResults = sortedResults.slice(0, 8).reverse();
  const latestSectionEntries = Object.entries(latestResult?.sectionScores || {});
  const latestTopicEntries = Object.entries(latestResult?.topicPerformance || {});
  const latestTelemetryQuestions = latestResult?.telemetry?.questions || [];
  const maxQuestionTime = Math.max(1, ...latestTelemetryQuestions.map((question) => question.timeSpentSeconds || 0));

  const navItems = [
    ['dashboard', 'dashboard', 'Dashboard', showDashboard],
    ['test-series', 'layers', 'Tests', showTestSeries],
    ['pyp', 'history_edu', 'PYP', () => navigateTo('pyp')],
    ['leaderboard', 'emoji_events', 'Ranks', () => navigateTo('leaderboard')],
    ['analytics', 'insights', 'Analytics', () => navigateTo('analytics')],
  ];

  const renderContent = () => {
    if (view === 'dashboard') {
      return (
        <DashboardHome
          user={user}
          loading={loadingTests || loadingResults}
          tests={tests}
          completedResults={completedResults}
          givenCount={givenCount}
          ongoingCount={ongoingCount}
          upcomingCount={upcomingCount}
          missedCount={missedCount}
          averagePercentage={averagePercentage}
          bestResult={bestResult}
          latestResult={latestResult}
          trendResults={trendResults}
          onOpenTests={showTestSeries}
          onOpenAnalytics={() => navigateTo('analytics')}
        />
      );
    }

    if (view === 'test-series' || view === 'pyp') {
      return (
        <TestsPage
          mode={view === 'pyp' ? 'pyp' : 'tests'}
          tests={filteredTests}
          loading={loadingTests}
          searchQuery={searchQuery}
          activeCategory={activeCategory}
          onCategoryChange={setActiveCategory}
          examFilter={examFilter}
          onExamFilterChange={handleExamFilterChange}
          showExamHint={showExamHint}
          onDismissExamHint={dismissExamHint}
          completedResults={completedResults}
          averagePercentage={averagePercentage}
          bestResult={bestResult}
          onSelectTest={openTestDetails}
          onOpenAnalytics={() => navigateTo('analytics')}
        />
      );
    }

    if (view === 'instructions') {
      if (!selectedTest) {
        return (
          <div className="rounded-3xl border border-slate-200 bg-white p-10 text-center shadow-sm">
            <span className="material-symbols-outlined animate-spin text-4xl text-indigo-500">sync</span>
            <p className="mt-3 font-semibold text-slate-500">Loading test instructions...</p>
          </div>
        );
      }
      return (
        <InstructionsPage
          test={selectedTest}
          onBack={showTestSeries}
          onStart={() => openTestAttempt(selectedTest)}
          onReview={() => openReview(selectedTest.latestAttemptId)}
        />
      );
    }

    if (view === 'review') {
      return (
        <ReviewPage
          user={user}
          attemptId={selectedReviewAttemptId}
          loading={loadingReview}
          error={reviewError}
          reviewData={reviewData}
          onBack={() => {
            setReviewData(null);
            setSelectedReviewAttemptId(null);
            navigateTo('test-series');
          }}
        />
      );
    }

    if (view === 'leaderboard') {
      return (
        <LeaderboardPage
          completedResults={completedResults}
          loadingResults={loadingResults}
          selectedTest={selectedLeaderboardTest}
          leaderboardData={leaderboardData}
          loadingLeaderboard={loadingLeaderboard}
          leaderboardError={leaderboardError}
          onSelectTest={(test) => {
            setSelectedLeaderboardTest(test);
            setLeaderboardData(null);
          }}
          onBack={() => {
            setSelectedLeaderboardTest(null);
            setLeaderboardData(null);
          }}
          onOpenTests={showTestSeries}
        />
      );
    }

    if (view === 'analytics') {
      return (
        <AnalyticsPage
          loading={loadingResults}
          error={resultsError}
          results={results}
          completedResults={completedResults}
          averagePercentage={averagePercentage}
          bestResult={bestResult}
          latestResult={latestResult}
          trendResults={trendResults}
          latestSectionEntries={latestSectionEntries}
          latestTopicEntries={latestTopicEntries}
          latestTelemetryQuestions={latestTelemetryQuestions}
          maxQuestionTime={maxQuestionTime}
          onReview={openReview}
        />
      );
    }

    if (view === 'settings') return <SettingsPage user={user} onLogout={handleLogout} />;
    if (view === 'support') return <SupportPage />;
    return null;
  };

  if (view === 'loading-shared') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="rounded-3xl border border-slate-200 bg-white p-10 text-center shadow-sm">
          <span className="material-symbols-outlined animate-spin text-4xl text-indigo-500">sync</span>
          <h1 className="mt-3 text-2xl font-black text-slate-950">Preparing Assessment</h1>
          <p className="mt-2 text-sm font-bold uppercase tracking-widest text-indigo-600">Setting up your test environment...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <aside className="fixed bottom-0 left-0 z-50 flex h-16 w-full flex-row border-t border-slate-200 bg-white/95 px-2 py-1 shadow-[0_-10px_25px_-5px_rgba(0,0,0,0.05)] backdrop-blur-md lg:top-0 lg:h-screen lg:w-64 lg:flex-col lg:border-r lg:border-t-0 lg:px-4 lg:py-6 lg:shadow-sm">
        <div className="mb-8 hidden px-3 lg:block">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-950 text-sm font-black text-white">V</div>
            <div>
              <p className="text-sm font-black uppercase tracking-widest text-slate-950">Vayl</p>
              <p className="text-xs font-bold text-slate-400">CBT Platform</p>
            </div>
          </div>
        </div>

        <nav className="flex h-full w-full items-center justify-around gap-1 lg:h-auto lg:flex-1 lg:flex-col lg:items-stretch lg:justify-start">
          {navItems.map(([itemView, icon, label, action]) => {
            const active = view === itemView || (itemView === 'test-series' && view === 'instructions');
            return (
              <button
                key={itemView}
                onClick={action}
                className={`flex flex-1 flex-col items-center justify-center rounded-xl border-none bg-transparent px-1 py-1 transition lg:flex-initial lg:flex-row lg:justify-start lg:px-3 lg:py-3 ${
                  active ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-950'
                }`}
              >
                <span className="material-symbols-outlined mb-0.5 text-[22px] lg:mb-0 lg:mr-3 lg:text-2xl">{icon}</span>
                <span className="text-[9px] font-extrabold tracking-tight lg:text-sm lg:font-bold">{label}</span>
              </button>
            );
          })}
        </nav>

        <div className="hidden space-y-1 border-t border-slate-200 pt-5 lg:block">
          {[
            ['settings', 'settings', 'Settings'],
            ['support', 'help_outline', 'Support'],
          ].map(([itemView, icon, label]) => (
            <button
              key={itemView}
              onClick={() => navigateTo(itemView)}
              className={`flex w-full items-center rounded-xl border-none bg-transparent px-3 py-3 transition ${
                view === itemView ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-950'
              }`}
            >
              <span className="material-symbols-outlined mr-3">{icon}</span>
              <span className="text-sm font-bold">{label}</span>
            </button>
          ))}

          {user.levelData && (
            <div className="mt-4 rounded-2xl border border-indigo-100 bg-indigo-50 p-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-indigo-700">Level {user.levelData.currentLevel}</span>
                <span className="text-xs font-bold text-indigo-500">{user.levelData.totalXP} XP</span>
              </div>
              <div className="mt-3 h-2 overflow-hidden rounded-full bg-indigo-100">
                <div className="h-full rounded-full bg-indigo-600" style={{ width: `${Math.min(100, user.levelData.progressToNext || 0)}%` }} />
              </div>
            </div>
          )}

          <div className="mt-5 flex items-center justify-between px-2">
            <div className="flex min-w-0 items-center">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full bg-indigo-50 text-sm font-black text-indigo-700">
                {user.profilePic ? <img src={user.profilePic} alt="" referrerPolicy="no-referrer" className="h-full w-full object-cover" /> : user.name?.charAt(0).toUpperCase() || 'S'}
              </div>
              <div className="ml-3 min-w-0">
                <p className="truncate text-xs font-black text-slate-900">{user.name || user.username}</p>
                <p className="truncate text-[10px] font-semibold text-slate-400">{user.authMethod === 'b2b' ? user.tenantId?.name || 'Coaching Member' : 'Student'}</p>
              </div>
            </div>
            <button onClick={handleLogout} title="Logout" className="rounded-xl border-none bg-transparent p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-950">
              <span className="material-symbols-outlined text-lg">logout</span>
            </button>
          </div>
        </div>
      </aside>

      <header className="fixed right-0 top-0 z-40 flex h-16 w-full items-center justify-between border-b border-slate-200 bg-white/90 px-4 backdrop-blur-xl lg:w-[calc(100%-16rem)] lg:px-8">
        <div className="mr-2 flex shrink-0 items-center gap-2 lg:hidden">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-slate-950 text-xs font-black text-white">V</div>
        </div>
        <div className="mr-2 flex max-w-md flex-1 items-center rounded-2xl bg-slate-100 px-3 transition focus-within:ring-4 focus-within:ring-indigo-100">
          <span className="material-symbols-outlined shrink-0 text-xl text-slate-500">search</span>
          <input
            ref={searchInputRef}
            className="flex-1 border-none bg-transparent px-2 py-2 text-sm text-slate-900 outline-none placeholder:text-slate-400"
            placeholder="Search tests, topics, or results..."
            type="text"
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            onFocus={() => {
              if (view !== 'test-series' && view !== 'pyp') showTestSeries();
            }}
          />
          {searchQuery && (
            <button onClick={() => setSearchQuery('')} className="mr-1 rounded-full border-none bg-transparent p-1 text-slate-500 hover:text-slate-800">
              <span className="material-symbols-outlined text-base">close</span>
            </button>
          )}
          <span className="hidden rounded bg-white px-1.5 py-0.5 text-[10px] font-black text-slate-400 md:block">{osKey} K</span>
        </div>
        <div className="hidden text-right sm:block">
          <p className="text-xs font-black uppercase tracking-wider text-slate-900">The Focused Scholar</p>
        </div>
      </header>

      <main className="min-h-screen px-4 pb-24 pt-20 md:px-8 lg:ml-64 lg:px-10 lg:pb-16 lg:pt-24">
        {renderContent()}
      </main>
    </div>
  );
}
