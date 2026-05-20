import { motion } from 'framer-motion';

const formatDuration = (seconds = 0) => {
  const total = Math.max(0, Math.round(Number(seconds) || 0));
  const mins = Math.floor(total / 60);
  const secs = total % 60;
  return mins ? `${mins}m ${secs}s` : `${secs}s`;
};

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.08 } },
};
const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.35 } },
};

export default function AnalyticsPage({
  loading,
  error,
  results = [],
  completedResults = [],
  averagePercentage = 0,
  bestResult = null,
  latestResult = null,
  trendResults = [],
  onAnalyze,
}) {
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

  const totalTrackedSeconds = completedResults.reduce((sum, r) => sum + (r.telemetry?.totalTimeSpentSeconds || 0), 0);
  const totalVisits = completedResults.reduce((sum, r) => sum + (r.telemetry?.totalVisits || 0), 0);
  const totalChanges = completedResults.reduce((sum, r) => sum + (r.telemetry?.totalAnswerChanges || 0), 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin mx-auto" />
          <p className="mt-4 text-sm font-semibold text-slate-400">Loading analytics...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-3xl border border-red-100 bg-red-50 p-6">
        <div className="flex items-center gap-3">
          <span className="material-symbols-outlined text-red-500" style={{ fontVariationSettings: "'FILL' 1" }}>error</span>
          <p className="font-semibold text-red-700">{error}</p>
        </div>
      </div>
    );
  }

  if (!results.length) {
    return (
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="rounded-3xl border border-slate-200 bg-white p-16 text-center shadow-sm">
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-indigo-50">
          <span className="material-symbols-outlined text-4xl text-indigo-400">analytics</span>
        </div>
        <h2 className="mt-5 text-2xl font-black text-slate-900">No Results Yet</h2>
        <p className="mt-2 text-slate-500 max-w-sm mx-auto">Submit a CBT test to unlock score, timing, topic, and review analytics.</p>
      </motion.div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      {/* Hero */}
      <motion.section
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-3xl border border-rose-100 bg-gradient-to-br from-rose-50 via-white to-pink-50 p-7 shadow-sm md:p-9"
      >
        <div className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full bg-rose-200/40 blur-3xl" />
        <div className="relative flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <span className="inline-block rounded-full bg-rose-100 px-3 py-1 text-[10px] font-black uppercase tracking-[0.2em] text-rose-700">Paper Analytics</span>
            <h1 className="mt-4 text-3xl font-black tracking-tight text-slate-900 md:text-4xl font-headline">Performance Review</h1>
            <p className="mt-3 max-w-xl text-sm leading-7 text-slate-500">
              Use score, section, topic, timing, and answer-change data to find where marks are gained or lost.
            </p>
          </div>
          <div className="grid grid-cols-3 gap-3 shrink-0">
            {[
              ['Tests', completedResults.length],
              ['Average', `${averagePercentage}%`],
              ['Best', `${bestResult?.percentage ?? 0}%`],
            ].map(([label, val]) => (
              <div key={label} className="rounded-2xl border border-rose-100 bg-white/60 px-4 py-3 text-center shadow-sm backdrop-blur-md">
                <p className="text-[10px] font-bold uppercase tracking-widest text-rose-500">{label}</p>
                <p className="mt-1 text-xl font-black text-slate-900">{val}</p>
              </div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* Telemetry stats */}
      <motion.section variants={container} initial="hidden" animate="show" className="grid gap-4 md:grid-cols-3">
        {[
          { label: 'Total Tracked Time', value: formatDuration(totalTrackedSeconds), icon: 'timer', color: 'text-violet-600', bg: 'bg-violet-50' },
          { label: 'Total Question Visits', value: totalVisits, icon: 'visibility', color: 'text-sky-600', bg: 'bg-sky-50' },
          { label: 'Overall Answer Changes', value: totalChanges, icon: 'swap_horiz', color: 'text-amber-600', bg: 'bg-amber-50' },
        ].map(({ label, value, icon, color, bg }) => (
          <motion.div key={label} variants={fadeUp} whileHover={{ y: -2 }} className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm relative overflow-hidden">
            <div className={`flex h-11 w-11 items-center justify-center rounded-2xl ${bg}`}>
              <span className={`material-symbols-outlined ${color}`} style={{ fontVariationSettings: "'FILL' 1" }}>{icon}</span>
            </div>
            <p className="mt-4 text-[10px] font-bold uppercase tracking-widest text-slate-400">{label}</p>
            <p className="mt-1 text-3xl font-black text-slate-900">{value}</p>
          </motion.div>
        ))}
      </motion.section>

      {/* Trend + Latest */}
      <section className="grid gap-5 xl:grid-cols-[1.3fr_0.7fr]">
        <motion.div initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Score Trend</p>
              <h2 className="mt-0.5 text-xl font-black text-slate-900">Recent Performance</h2>
            </div>
            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-500">{trendResults.length} attempts</span>
          </div>
          <div className="h-64 rounded-2xl bg-gradient-to-b from-slate-50 to-slate-100/50 p-4">
            {trendResults.length > 1 ? (
              <svg viewBox="0 -10 100 120" preserveAspectRatio="none" className="h-full w-full overflow-visible">
                <defs>
                  <linearGradient id="trendGrad2" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#e11d48" stopOpacity="0.25" />
                    <stop offset="100%" stopColor="#e11d48" stopOpacity="0.0" />
                  </linearGradient>
                  <filter id="glow2" x="-20%" y="-20%" width="140%" height="140%">
                    <feGaussianBlur stdDeviation="2" result="blur" />
                    <feComposite in="SourceGraphic" in2="blur" operator="over" />
                  </filter>
                </defs>
                <path d={smoothPathFill} fill="url(#trendGrad2)" />
                <path d={smoothPathLine} fill="none" stroke="#e11d48" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" vectorEffect="non-scaling-stroke" filter="url(#glow2)" />
              </svg>
            ) : (
              <div className="flex h-full items-center justify-center text-sm font-semibold text-slate-400">Submit more tests to build a trend.</div>
            )}
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.15 }} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Latest Attempt</p>
          <h2 className="mt-1 text-lg font-black text-slate-900 line-clamp-2">{latestResult?.test?.title || 'No latest result'}</h2>
          <div className="mt-4 flex items-end gap-2">
            <p className="text-5xl font-black text-indigo-600">{latestResult?.percentage ?? 0}</p>
            <p className="pb-1.5 text-xl font-black text-slate-300">%</p>
          </div>
          <p className="text-sm text-slate-500">{latestResult?.totalScore ?? 0} / {latestResult?.maxPossibleScore ?? 0} marks</p>
          <div className="mt-1 h-1.5 rounded-full bg-slate-100">
            <motion.div initial={{ width: 0 }} animate={{ width: `${latestResult?.percentage ?? 0}%` }} transition={{ duration: 0.8 }} className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-violet-500" />
          </div>
          <div className="mt-5 grid grid-cols-2 gap-3">
            {[
              ['Avg/Q', `${latestResult?.telemetry?.averageQuestionTimeSeconds || 0}s`],
              ['Visits', latestResult?.telemetry?.totalVisits || 0],
            ].map(([label, val]) => (
              <div key={label} className="rounded-2xl bg-slate-50 p-3">
                <p className="text-[10px] font-bold text-slate-400">{label}</p>
                <p className="mt-1 text-xl font-black text-slate-900">{val}</p>
              </div>
            ))}
          </div>
        </motion.div>
      </section>


      {/* Attempt History */}
      <section className="grid gap-5">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-black text-slate-900">Attempt History</h2>
          <div className="mt-5 overflow-hidden rounded-2xl border border-slate-100">
            {completedResults.map((result, idx) => (
              <motion.div
                key={result._id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: idx * 0.05 }}
                className="grid gap-3 border-b border-slate-100 p-4 last:border-b-0 md:grid-cols-[1fr_auto_auto] md:items-center hover:bg-slate-50 transition"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-black text-slate-900">{result.test?.title || 'Deleted Test'}</p>
                  <p className="mt-0.5 text-xs text-slate-500">
                    {result.durationUsedMinutes || 0} mins · {result.answered || 0}/{result.totalQuestions || 0} answered
                  </p>
                </div>
                <span className={`text-xl font-black ${(result.percentage || 0) >= 60 ? 'text-emerald-600' : (result.percentage || 0) >= 35 ? 'text-amber-600' : 'text-rose-500'}`}>
                  {result.percentage ?? 0}%
                </span>
                <motion.button
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.96 }}
                  onClick={() => onAnalyze?.(result._id)}
                  className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-700 transition hover:border-indigo-300 hover:bg-indigo-50 hover:text-indigo-600"
                >
                  Analyze Test
                </motion.button>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>
    </div>
  );
}
