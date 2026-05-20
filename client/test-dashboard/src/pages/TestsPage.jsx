import { motion, AnimatePresence } from 'framer-motion';

const stateMeta = {
  'in-progress': { label: 'Resume Test', icon: 'pending', badge: 'bg-amber-50 text-amber-700 border-amber-200', btn: 'bg-amber-600 text-white hover:bg-amber-700' },
  completed:     { label: 'Attempt Again', icon: 'check_circle', badge: 'bg-emerald-50 text-emerald-700 border-emerald-200', btn: 'bg-indigo-600 text-white hover:bg-indigo-700' },
  evaluating:    { label: 'Evaluating', icon: 'sync', badge: 'bg-yellow-50 text-yellow-700 border-yellow-200', btn: 'bg-slate-200 text-slate-500 cursor-not-allowed' },
  upcoming:      { label: 'Locked', icon: 'event', badge: 'bg-sky-50 text-sky-700 border-sky-200', btn: 'bg-slate-100 text-slate-400 cursor-not-allowed' },
  missed:        { label: 'Ended', icon: 'cancel', badge: 'bg-rose-50 text-rose-700 border-rose-200', btn: 'bg-slate-100 text-slate-400 cursor-not-allowed' },
  locked:        { label: 'Locked', icon: 'lock', badge: 'bg-slate-100 text-slate-500 border-slate-200', btn: 'bg-slate-100 text-slate-400 cursor-not-allowed' },
  default:       { label: 'Attempt Test', icon: 'play_arrow', badge: 'bg-indigo-50 text-indigo-700 border-indigo-200', btn: 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-md shadow-indigo-200' },
};

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.06 } },
};
const cardItem = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.35, ease: 'easeOut' } },
};

export default function TestsPage({
  mode = 'tests',
  tests = [],
  loading = false,
  searchQuery = '',
  activeCategory = 'full',
  onCategoryChange,
  examFilter = 'jee-mains',
  onExamFilterChange,
  showExamHint = false,
  onDismissExamHint,
  completedResults = [],
  averagePercentage = 0,
  bestResult = null,
  onSelectTest,
  onOpenAnalytics,
}) {
  const isPyp = mode === 'pyp';
  const completedCount = completedResults.length;
  const progress = tests.length ? Math.round((completedCount / tests.length) * 100) : 0;

  const handleAction = (test) => {
    if (test.state === 'evaluating') { alert('Your performance report is still being generated. Please check back shortly.'); return; }
    if (test.state === 'upcoming') { alert("This test hasn't started yet. Check the scheduled start date."); return; }
    if (test.state === 'missed') { alert('The attempt window for this test has already ended.'); return; }
    if (test.state === 'locked') return;
    onSelectTest?.(test);
  };

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      {/* Hero */}
      <motion.section
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-3xl border border-slate-200 bg-white p-6 shadow-sm md:p-8"
      >
        <div className="pointer-events-none absolute right-0 top-0 h-48 w-48 rounded-full bg-emerald-50 blur-3xl opacity-60" />
        <div className="relative">
          <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-slate-400">
            {isPyp ? 'Previous Year Practice' : 'Assessment Library'}
          </p>
          <h1 className="mt-2 text-3xl font-black tracking-tight text-slate-900 md:text-4xl font-headline">
            {isPyp ? 'Previous Year Papers' : 'Test Series'}
          </h1>
          <p className="mt-2 max-w-xl text-sm leading-7 text-slate-500">
            {isPyp ? 'Practice past papers with full result, review, and analytics flow.' : 'Find live, scheduled, completed, and missed tests.'}
          </p>
        </div>
      </motion.section>

      {/* Filter row: exam selector left, category tabs right */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Exam selector */}
        <div className="relative">
          <AnimatePresence>
            {showExamHint && (
              <motion.div
                initial={{ opacity: 0, y: 6, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 6, scale: 0.95 }}
                className="absolute bottom-full left-0 z-20 mb-3 w-52 rounded-2xl border border-emerald-100 bg-white p-4 text-sm shadow-xl"
              >
                <div className="mb-1 flex items-center justify-between">
                  <span className="text-xs font-black uppercase tracking-widest text-emerald-600">Exam Filter</span>
                  <button onClick={onDismissExamHint} className="rounded-lg border border-slate-200 p-0.5 text-slate-400 hover:text-slate-700 transition">
                    <span className="material-symbols-outlined text-sm">close</span>
                  </button>
                </div>
                <p className="text-xs leading-5 text-slate-500">Switch between exam streams here.</p>
              </motion.div>
            )}
          </AnimatePresence>
          <div className="relative">
            <select
              value={examFilter}
              onChange={(e) => { onExamFilterChange?.(e.target.value); if (showExamHint) onDismissExamHint?.(); }}
              className="h-11 appearance-none rounded-2xl border border-slate-200 bg-white pl-4 pr-9 text-sm font-bold text-slate-700 shadow-sm outline-none transition focus:border-emerald-300 focus:ring-2 focus:ring-emerald-100 cursor-pointer"
            >
              <option value="jee-mains">JEE Mains</option>
              <option value="jee-adv">JEE Advanced</option>
              <option value="neet">NEET-UG</option>
            </select>
            <svg className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>

        {/* Separator */}
        <div className="h-7 w-px bg-slate-200" />

        {/* Category tabs */}
        {!isPyp && (
          <>
            {[['full', 'Full Tests'], ['part', 'Part Tests']].map(([id, label]) => (
              <motion.button
                key={id}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => onCategoryChange?.(id)}
                className={`rounded-2xl border px-5 py-2.5 text-sm font-bold transition ${
                  activeCategory === id
                    ? 'border-emerald-600 bg-emerald-600 text-white shadow-md shadow-emerald-200'
                    : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
                }`}
              >
                {label}
              </motion.button>
            ))}
          </>
        )}
      </div>

      <div className="grid gap-6 xl:grid-cols-[1fr_340px]">
        {/* Test list */}
        <section>
          {loading ? (
            <div className="flex items-center justify-center min-h-48">
              <div className="text-center">
                <div className="w-12 h-12 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin mx-auto" />
                <p className="mt-3 text-sm font-semibold text-slate-400">Loading tests...</p>
              </div>
            </div>
          ) : tests.length === 0 ? (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="rounded-3xl border border-slate-200 bg-white p-12 text-center shadow-sm">
              <span className="material-symbols-outlined text-5xl text-slate-300">assignment_late</span>
              <h2 className="mt-3 text-xl font-black text-slate-900">{searchQuery ? 'No Matching Tests' : 'No Tests Available'}</h2>
              <p className="mt-2 text-sm text-slate-500">{searchQuery ? 'Try a different search.' : 'Published tests from your admin will appear here.'}</p>
            </motion.div>
          ) : (
            <motion.div variants={container} initial="hidden" animate="show" className="space-y-4">
              {tests.map((test) => {
                const state = test.state || 'default';
                const meta = stateMeta[state] || stateMeta.default;
                const isActionable = !['locked', 'upcoming', 'missed', 'evaluating'].includes(state);
                return (
                  <motion.article
                    key={test._id}
                    variants={cardItem}
                    whileHover={{ y: -2, boxShadow: '0 8px 30px -8px rgba(99,102,241,0.12)' }}
                    className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm transition"
                  >
                    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                      <div className="min-w-0 flex-1">
                        <div className="mb-3 flex flex-wrap items-center gap-2">
                          <span className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-black uppercase tracking-wider text-indigo-600">
                            {test.category || 'General'}
                          </span>
                          <span className={`inline-flex items-center gap-1 rounded-full border px-3 py-1 text-xs font-bold ${meta.badge}`}>
                            <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>{meta.icon}</span>
                            {test.status || state}
                          </span>
                        </div>
                        <h2 className="text-lg font-black text-slate-900">{test.title}</h2>
                        <p className="mt-1 text-sm text-slate-500">
                          {test.sections?.map((s) => s.name).join(' · ') || 'Full Exam'}
                        </p>
                        <div className="mt-3 flex flex-wrap gap-4 text-xs font-semibold text-slate-500">
                          <span className="inline-flex items-center gap-1.5">
                            <span className="material-symbols-outlined text-sm text-slate-400">schedule</span>
                            {test.durationMinutes || 0} mins
                          </span>
                          <span className="inline-flex items-center gap-1.5">
                            <span className="material-symbols-outlined text-sm text-slate-400">grade</span>
                            {test.totalMarks || 0} marks
                          </span>
                          <span className="inline-flex items-center gap-1.5">
                            <span className="material-symbols-outlined text-sm text-slate-400">splitscreen</span>
                            {test.sections?.length || 1} sections
                          </span>
                        </div>
                      </div>
                      <motion.button
                        whileHover={isActionable ? { scale: 1.04 } : {}}
                        whileTap={isActionable ? { scale: 0.96 } : {}}
                        onClick={() => handleAction(test)}
                        disabled={!isActionable}
                        className={`shrink-0 rounded-2xl px-5 py-3 text-sm font-black transition ${meta.btn}`}
                      >
                        {meta.label}
                      </motion.button>
                    </div>
                  </motion.article>
                );
              })}
            </motion.div>
          )}
        </section>

        {/* Sidebar */}
        <aside className="space-y-5">
          {/* Progress */}
          <motion.div initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.15 }} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Series Progress</p>
            <div className="mt-4 flex items-end gap-1">
              <span className="text-5xl font-black text-slate-900">{progress}</span>
              <span className="pb-1.5 text-2xl font-black text-slate-300">%</span>
            </div>
            <p className="text-xs font-semibold text-slate-400 mb-3">of series completed</p>
            <div className="h-2 overflow-hidden rounded-full bg-slate-100">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.8, ease: 'easeOut', delay: 0.2 }}
                className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-violet-500"
              />
            </div>
            <div className="mt-5 grid grid-cols-2 gap-3">
              {[['Completed', completedCount, 'bg-emerald-50 text-emerald-700'], ['Available', tests.length, 'bg-slate-50 text-slate-700']].map(([label, val, cls]) => (
                <div key={label} className={`rounded-2xl ${cls} p-4`}>
                  <p className="text-xs font-bold opacity-70">{label}</p>
                  <p className="mt-1 text-2xl font-black">{val}</p>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Performance */}
          <motion.div initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Performance</p>
            <div className="mt-4 grid grid-cols-2 gap-3">
              <div className="rounded-2xl bg-indigo-50 p-4">
                <p className="text-xs font-bold text-indigo-500">Average</p>
                <p className="mt-1 text-2xl font-black text-indigo-700">{averagePercentage}%</p>
              </div>
              <div className="rounded-2xl bg-emerald-50 p-4">
                <p className="text-xs font-bold text-emerald-600">Best</p>
                <p className="mt-1 text-2xl font-black text-emerald-700">{bestResult?.percentage ?? 0}%</p>
              </div>
            </div>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              onClick={onOpenAnalytics}
              className="mt-5 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-bold text-slate-700 transition hover:bg-slate-100"
            >
              Open Analytics →
            </motion.button>
          </motion.div>
        </aside>
      </div>
    </div>
  );
}
