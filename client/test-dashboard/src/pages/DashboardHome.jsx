import { motion } from 'framer-motion';

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.07 } },
};
const item = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.35, ease: 'easeOut' } },
};

export default function DashboardHome({
  user,
  loading,
  tests = [],
  completedResults = [],
  givenCount = 0,
  ongoingCount = 0,
  upcomingCount = 0,
  missedCount = 0,
  averagePercentage = 0,
  bestResult = null,
  latestResult = null,
  trendResults = [],
  onOpenTests,
  onOpenAnalytics,
}) {
  const nextTests = tests
    .filter((t) => t.state === 'default' || t.state === 'in-progress' || t.state === 'upcoming')
    .slice(0, 4);
  const latestThree = completedResults.slice(0, 3);

  const trendPoints = trendResults.map((r, idx) => {
    const x = trendResults.length <= 1 ? 50 : (idx / (trendResults.length - 1)) * 100;
    const y = 100 - Math.max(0, Math.min(100, Number(r.percentage) || 0));
    return [x, y];
  });

  const generateSmoothPath = (pts) => {
    if (pts.length === 0) return '';
    if (pts.length === 1) return `M ${pts[0][0]},${pts[0][1]}`;
    let d = `M ${pts[0][0]},${pts[0][1]}`;
    for (let i = 0; i < pts.length - 1; i++) {
      const p1 = pts[i];
      const p2 = pts[i + 1];
      const cp1x = p1[0] + (p2[0] - p1[0]) / 2;
      const cp2x = p1[0] + (p2[0] - p1[0]) / 2;
      d += ` C ${cp1x},${p1[1]} ${cp2x},${p2[1]} ${p2[0]},${p2[1]}`;
    }
    return d;
  };

  const smoothPathLine = generateSmoothPath(trendPoints);
  const smoothPathFill = `${smoothPathLine} L 100,100 L 0,100 Z`;

  const stats = [
    { label: 'Tests Given', value: givenCount, icon: 'check_circle', color: 'text-emerald-600', bg: 'bg-emerald-50', fill: '#10b981' },
    { label: 'Ongoing', value: ongoingCount, icon: 'pending', color: 'text-amber-600', bg: 'bg-amber-50', fill: '#f59e0b' },
    { label: 'Upcoming', value: upcomingCount, icon: 'event', color: 'text-sky-600', bg: 'bg-sky-50', fill: '#0ea5e9' },
    { label: 'Missed', value: missedCount, icon: 'event_busy', color: 'text-rose-600', bg: 'bg-rose-50', fill: '#f43f5e' },
    { label: 'Average', value: `${averagePercentage}%`, icon: 'monitoring', color: 'text-indigo-600', bg: 'bg-indigo-50', fill: '#6366f1' },
  ];

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      {/* Hero */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="relative overflow-hidden rounded-3xl border border-indigo-100 bg-gradient-to-br from-indigo-50 via-white to-blue-50 p-7 md:p-10 shadow-sm"
      >
        {/* Background decoration */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-indigo-200/40 blur-3xl" />
          <div className="absolute -bottom-10 left-10 h-48 w-48 rounded-full bg-blue-200/30 blur-3xl" />
        </div>
        <div className="relative flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <span className="inline-block rounded-full bg-indigo-100 px-3 py-1 text-[10px] font-black uppercase tracking-[0.2em] text-indigo-700">CBT Dashboard</span>
            <h1 className="mt-4 text-3xl font-black tracking-tight text-slate-900 md:text-5xl font-headline">
              Welcome, {user?.name?.split(' ')[0] || 'Scholar'} 👋
            </h1>
            <p className="mt-3 max-w-xl text-sm leading-7 text-slate-500 md:text-base">
              Track attempts, review accuracy, and continue your next mock from one clean workspace.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <motion.button
              whileHover={{ scale: 1.03, y: -1 }}
              whileTap={{ scale: 0.97 }}
              onClick={onOpenTests}
              className="rounded-2xl bg-indigo-600 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-indigo-200 transition hover:bg-indigo-700 hover:shadow-xl"
            >
              Open Tests
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.03, y: -1 }}
              whileTap={{ scale: 0.97 }}
              onClick={onOpenAnalytics}
              className="rounded-2xl border border-slate-200 bg-white px-6 py-3 text-sm font-bold text-slate-700 shadow-sm transition hover:border-slate-300 hover:bg-slate-50"
            >
              View Analytics
            </motion.button>
          </div>
        </div>
      </motion.section>

      {loading ? (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="rounded-3xl bg-white border border-slate-200 p-12 text-center shadow-sm">
          <div className="w-12 h-12 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin mx-auto" />
          <p className="mt-4 font-semibold text-slate-400">Loading your data...</p>
        </motion.div>
      ) : (
        <>
          {/* Stat cards */}
          <motion.section variants={container} initial="hidden" animate="show" className="grid grid-cols-2 gap-4 lg:grid-cols-5">
            {stats.map(({ label, value, icon, color, bg }) => (
              <motion.div key={label} variants={item} whileHover={{ y: -3, boxShadow: '0 12px 32px -8px rgba(99,102,241,0.12)' }} className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm transition cursor-default">
                <div className={`mb-4 flex h-11 w-11 items-center justify-center rounded-2xl ${bg}`}>
                  <span className={`material-symbols-outlined ${color}`} style={{ fontVariationSettings: "'FILL' 1" }}>{icon}</span>
                </div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">{label}</p>
                <p className="mt-1.5 text-3xl font-black text-slate-900">{value}</p>
              </motion.div>
            ))}
          </motion.section>

          {/* Score trend + Best attempt */}
          <section className="grid gap-5 xl:grid-cols-[1.3fr_0.7fr]">
            <motion.div initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.15 }} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="mb-5 flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Recent Performance</p>
                  <h2 className="mt-0.5 text-xl font-black text-slate-900">Score Trend</h2>
                </div>
                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-500">{trendResults.length} attempts</span>
              </div>
              <div className="h-56 rounded-2xl bg-gradient-to-b from-slate-50 to-slate-100/50 p-4 relative overflow-hidden">
                {trendResults.length > 1 ? (
                  <svg viewBox="0 -10 100 120" preserveAspectRatio="none" className="h-full w-full overflow-visible">
                    <defs>
                      <linearGradient id="trendGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#4f46e5" stopOpacity="0.25" />
                        <stop offset="100%" stopColor="#4f46e5" stopOpacity="0.0" />
                      </linearGradient>
                      <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                        <feGaussianBlur stdDeviation="2" result="blur" />
                        <feComposite in="SourceGraphic" in2="blur" operator="over" />
                      </filter>
                    </defs>
                    <path d={smoothPathFill} fill="url(#trendGrad)" />
                    <path d={smoothPathLine} fill="none" stroke="#4f46e5" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" vectorEffect="non-scaling-stroke" filter="url(#glow)" />
                  </svg>
                ) : (
                  <div className="flex h-full items-center justify-center text-sm font-semibold text-slate-400">Submit more tests to build your trend.</div>
                )}
              </div>
            </motion.div>

            <motion.div initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Best Attempt</p>
              <h2 className="mt-1 text-lg font-black text-slate-900 line-clamp-2">{bestResult?.test?.title || 'No attempt yet'}</h2>
              <div className="mt-5 flex items-end gap-2">
                <p className="text-5xl font-black text-slate-900">{bestResult?.percentage ?? 0}</p>
                <p className="pb-1.5 text-xl font-black text-slate-400">%</p>
              </div>
              <div className="mt-1">
                <div className="h-1.5 rounded-full bg-slate-100">
                  <motion.div initial={{ width: 0 }} animate={{ width: `${bestResult?.percentage ?? 0}%` }} transition={{ duration: 0.8, delay: 0.3 }} className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-violet-500" />
                </div>
              </div>

              <div className="mt-5 rounded-2xl bg-slate-50 p-4">
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Latest Attempt</p>
                <p className="mt-1.5 text-sm font-bold text-slate-800">{latestResult?.test?.title || 'No recent result'}</p>
                <p className="mt-0.5 text-sm text-slate-500">{latestResult ? `${latestResult.totalScore ?? 0} / ${latestResult.maxPossibleScore ?? 0}` : 'Complete a mock to see details.'}</p>
              </div>
            </motion.div>
          </section>

          {/* Continue Practice + Recent Results */}
          <motion.section variants={container} initial="hidden" animate="show" className="grid gap-5 xl:grid-cols-2">
            <motion.div variants={item} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="mb-5 flex items-center justify-between">
                <h2 className="text-xl font-black text-slate-900">Continue Practice</h2>
                <button onClick={onOpenTests} className="text-sm font-bold text-indigo-600 hover:text-indigo-700 transition">See all →</button>
              </div>
              <div className="space-y-3">
                {nextTests.length ? nextTests.map((test) => (
                  <motion.div key={test._id} whileHover={{ x: 3 }} className="flex items-center justify-between gap-3 rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3.5 cursor-default">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-bold text-slate-900">{test.title}</p>
                      <p className="text-[11px] text-slate-500 mt-0.5">{test.durationMinutes}m · {test.totalMarks} marks</p>
                    </div>
                    <span className="shrink-0 rounded-full bg-white border border-slate-200 px-3 py-1 text-xs font-bold text-slate-600">{test.category || 'Test'}</span>
                  </motion.div>
                )) : (
                  <p className="rounded-2xl bg-slate-50 p-5 text-sm font-semibold text-slate-400 text-center">No available tests right now.</p>
                )}
              </div>
            </motion.div>

            <motion.div variants={item} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="mb-5 text-xl font-black text-slate-900">Recent Results</h2>
              <div className="space-y-3">
                {latestThree.length ? latestThree.map((result, idx) => (
                  <motion.div key={result._id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.08 }} className="flex items-center justify-between rounded-2xl border border-slate-100 px-4 py-3.5">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-bold text-slate-900">{result.test?.title || 'Deleted Test'}</p>
                      <p className="text-[11px] text-slate-500 mt-0.5">{result.answered || 0}/{result.totalQuestions || 0} answered</p>
                    </div>
                    <div className="shrink-0 text-right">
                      <p className="text-xl font-black text-indigo-600">{result.percentage ?? 0}%</p>
                    </div>
                  </motion.div>
                )) : (
                  <p className="rounded-2xl bg-slate-50 p-5 text-sm font-semibold text-slate-400 text-center">Your submitted tests will appear here.</p>
                )}
              </div>
            </motion.div>
          </motion.section>
        </>
      )}
    </div>
  );
}
