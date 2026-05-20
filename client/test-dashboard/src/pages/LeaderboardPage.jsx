import { motion, AnimatePresence } from 'framer-motion';

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.07 } },
};
const cardItem = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.35 } },
};

export default function LeaderboardPage({
  completedResults = [],
  loadingResults = false,
  selectedTest = null,
  leaderboardData = null,
  loadingLeaderboard = false,
  leaderboardError = '',
  onSelectTest,
  onBack,
  onOpenTests,
}) {
  const uniqueTests = Array.from(
    completedResults.reduce((acc, result) => {
      const testId = result.test?._id;
      if (testId && !acc.has(testId)) acc.set(testId, result);
      return acc;
    }, new Map()).values()
  );

  if (!selectedTest) {
    return (
      <div className="mx-auto max-w-7xl space-y-6">
        {/* Hero */}
        <motion.section
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden rounded-3xl border border-amber-100 bg-gradient-to-br from-amber-50 via-white to-orange-50 p-7 shadow-sm md:p-9"
        >
          <div className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full bg-amber-200/40 blur-3xl" />
          <div className="relative">
            <span className="inline-block rounded-full bg-amber-100 px-3 py-1 text-[10px] font-black uppercase tracking-[0.2em] text-amber-700">Peer Comparison</span>
            <h1 className="mt-4 text-3xl font-black tracking-tight text-slate-900 md:text-4xl font-headline">Leaderboards</h1>
            <p className="mt-3 max-w-xl text-sm leading-7 text-slate-500">
              Compare rank, total score, percentage, and section-wise performance for tests you have attempted.
            </p>
          </div>
        </motion.section>

        {loadingResults ? (
          <div className="flex items-center justify-center min-h-48">
            <div className="text-center">
              <div className="w-12 h-12 border-4 border-violet-100 border-t-violet-600 rounded-full animate-spin mx-auto" />
              <p className="mt-3 text-sm font-semibold text-slate-400">Loading your leaderboards...</p>
            </div>
          </div>
        ) : uniqueTests.length === 0 ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="rounded-3xl border border-slate-200 bg-white p-16 text-center shadow-sm">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-amber-50">
              <span className="material-symbols-outlined text-4xl text-amber-400" style={{ fontVariationSettings: "'FILL' 1" }}>emoji_events</span>
            </div>
            <h2 className="mt-5 text-2xl font-black text-slate-900">No Leaderboards Yet</h2>
            <p className="mt-2 text-slate-500">Complete a test to unlock comparative ranking.</p>
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={onOpenTests}
              className="mt-6 rounded-2xl bg-gradient-to-r from-indigo-600 to-violet-600 px-6 py-3 text-sm font-black text-white shadow-lg shadow-indigo-200"
            >
              Take a Test
            </motion.button>
          </motion.div>
        ) : (
          <motion.div variants={container} initial="hidden" animate="show" className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {uniqueTests.map((result) => (
              <motion.article
                key={result._id}
                variants={cardItem}
                whileHover={{ y: -3, boxShadow: '0 12px 32px -8px rgba(99,102,241,0.15)' }}
                className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition"
              >
                <span className="inline-flex items-center rounded-full bg-indigo-50 px-3 py-1 text-xs font-black uppercase tracking-wider text-indigo-600">
                  {result.test?.category || 'Test'}
                </span>
                <h2 className="mt-4 line-clamp-2 text-xl font-black text-slate-900">{result.test?.title || 'Deleted Test'}</h2>
                <p className="mt-2 text-xs font-semibold text-slate-400">
                  Last attempt: {result.submittedAt
                    ? new Date(result.submittedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
                    : 'Unknown'}
                </p>
                <div className="mt-4 flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-3">
                  <div>
                    <p className="text-[10px] font-bold text-slate-400">Your Score</p>
                    <p className="text-lg font-black text-slate-900">{result.percentage?.toFixed(1) ?? 0}%</p>
                  </div>
                  <span className="material-symbols-outlined text-3xl text-amber-400" style={{ fontVariationSettings: "'FILL' 1" }}>emoji_events</span>
                </div>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => onSelectTest?.(result.test)}
                  className="mt-4 w-full rounded-2xl bg-indigo-600 px-5 py-3 text-sm font-black text-white shadow-md shadow-indigo-200 transition hover:bg-indigo-700 hover:shadow-lg"
                >
                  View Leaderboard
                </motion.button>
              </motion.article>
            ))}
          </motion.div>
        )}
      </div>
    );
  }

  const sectionNames = leaderboardData?.test?.sections?.map((s) => s.name)
    || (leaderboardData?.leaderboard?.[0] ? Object.keys(leaderboardData.leaderboard[0].sectionScores || {}) : []);
  const myRow = leaderboardData?.leaderboard?.find((s) => s.isMe);

  const medalColors = ['text-yellow-500', 'text-slate-400', 'text-amber-600'];
  const medalIcons = ['emoji_events', 'emoji_events', 'emoji_events'];

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <motion.button
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        whileHover={{ x: -3 }}
        onClick={onBack}
        className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-slate-600 shadow-sm transition hover:shadow-md"
      >
        <span className="material-symbols-outlined text-lg">arrow_back</span>
        Back to Leaderboards
      </motion.button>

      {/* Hero */}
      <motion.section
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-3xl border border-amber-100 bg-gradient-to-br from-amber-50 via-white to-orange-50 p-7 shadow-sm md:p-9"
      >
        <div className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full bg-amber-200/40 blur-3xl" />
        <div className="relative">
          <span className="inline-block rounded-full bg-amber-100 px-3 py-1 text-[10px] font-black uppercase tracking-[0.2em] text-amber-700">Live Ranking</span>
          <h1 className="mt-4 text-2xl font-black tracking-tight text-slate-900 md:text-3xl font-headline line-clamp-2">{selectedTest.title}</h1>
          <p className="mt-2 text-sm font-semibold text-slate-500">First attempt leaderboard ranking.</p>
        </div>
      </motion.section>

      {loadingLeaderboard ? (
        <div className="flex items-center justify-center min-h-48">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-violet-100 border-t-violet-600 rounded-full animate-spin mx-auto" />
            <p className="mt-3 text-sm font-semibold text-slate-400">Fetching rankings...</p>
          </div>
        </div>
      ) : leaderboardError ? (
        <div className="rounded-3xl border border-red-100 bg-red-50 p-6">
          <p className="font-semibold text-red-700">{leaderboardError}</p>
        </div>
      ) : leaderboardData ? (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-5">
          {/* My rank banner */}
          {leaderboardData.myRank && (
            <motion.section
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 }}
              className="rounded-3xl border border-indigo-100 bg-gradient-to-br from-indigo-50 via-white to-blue-50 p-6 shadow-sm"
            >
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div className="flex items-center gap-5">
                  <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-100/50 backdrop-blur-sm">
                    <span className="material-symbols-outlined text-3xl text-yellow-500" style={{ fontVariationSettings: "'FILL' 1" }}>emoji_events</span>
                  </div>
                  <div>
                    <p className="text-xs font-black uppercase tracking-widest text-indigo-400">Your Rank</p>
                    <p className="mt-1 text-5xl font-black text-slate-900">#{leaderboardData.myRank}</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-2xl border border-indigo-50 bg-white/60 px-5 py-4 text-center shadow-sm backdrop-blur-sm">
                    <p className="text-xs font-bold uppercase tracking-widest text-indigo-400">Score</p>
                    <p className="mt-1 text-2xl font-black text-slate-900">{myRow?.totalScore ?? 0}</p>
                    <p className="text-xs font-bold text-slate-400">/ {selectedTest.totalMarks}</p>
                  </div>
                  <div className="rounded-2xl border border-indigo-50 bg-white/60 px-5 py-4 text-center shadow-sm backdrop-blur-sm">
                    <p className="text-xs font-bold uppercase tracking-widest text-indigo-400">Percent</p>
                    <p className="mt-1 text-2xl font-black text-slate-900">{myRow?.percentage?.toFixed(1) ?? 0}%</p>
                  </div>
                </div>
              </div>
            </motion.section>
          )}

          {/* Leaderboard table */}
          <motion.section
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm"
          >
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50 text-left">
                    <th className="px-5 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Rank</th>
                    <th className="px-5 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Student</th>
                    {sectionNames.map((s) => (
                      <th key={s} className="px-4 py-4 text-center text-[10px] font-black uppercase tracking-widest text-slate-400">{s}</th>
                    ))}
                    <th className="px-5 py-4 text-center text-[10px] font-black uppercase tracking-widest text-slate-400">Total</th>
                    <th className="px-5 py-4 text-center text-[10px] font-black uppercase tracking-widest text-slate-400">%</th>
                  </tr>
                </thead>
                <tbody>
                  {leaderboardData.leaderboard.map((student, idx) => (
                    <motion.tr
                      key={`${student.username}-${student.rank}`}
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.04 }}
                      className={`border-b border-slate-100 last:border-b-0 transition ${student.isMe ? 'bg-indigo-50' : 'hover:bg-slate-50'}`}
                    >
                      <td className="px-5 py-4">
                        {student.rank <= 3 ? (
                          <span className={`material-symbols-outlined text-xl ${medalColors[student.rank - 1]}`} style={{ fontVariationSettings: "'FILL' 1" }}>
                            {medalIcons[student.rank - 1]}
                          </span>
                        ) : (
                          <span className="text-sm font-black text-slate-500">#{student.rank}</span>
                        )}
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2.5">
                          <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-black ${student.isMe ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600'}`}>
                            {student.name?.charAt(0).toUpperCase() || 'S'}
                          </div>
                          <div>
                            <p className={`text-sm font-black ${student.isMe ? 'text-indigo-700' : 'text-slate-900'}`}>{student.name}</p>
                            <p className="text-xs text-slate-400">@{student.username}</p>
                          </div>
                        </div>
                      </td>
                      {sectionNames.map((s) => (
                        <td key={s} className="px-4 py-4 text-center text-sm font-bold text-slate-700">
                          {student.sectionScores?.[s]?.score ?? student.sectionScores?.[s] ?? '-'}
                        </td>
                      ))}
                      <td className="px-5 py-4 text-center text-sm font-black text-slate-900">{student.totalScore}</td>
                      <td className="px-5 py-4 text-center">
                        <span className={`rounded-full px-3 py-1 text-xs font-black ${(student.percentage || 0) >= 60 ? 'bg-emerald-50 text-emerald-700' : (student.percentage || 0) >= 35 ? 'bg-amber-50 text-amber-700' : 'bg-rose-50 text-rose-700'}`}>
                          {student.percentage ? student.percentage.toFixed(1) : '0.0'}%
                        </span>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.section>
        </motion.div>
      ) : null}
    </div>
  );
}
