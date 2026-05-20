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
      <div className="mx-auto max-w-7xl space-y-7">
        <section className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm md:p-8">
          <p className="text-xs font-bold uppercase tracking-[0.22em] text-slate-400">Peer Comparison</p>
          <h1 className="mt-3 text-3xl font-black tracking-tight text-slate-950 md:text-5xl">Leaderboards</h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-500 md:text-base">
            Compare rank, total score, percentage, and section-wise performance for tests you have attempted.
          </p>
        </section>

        {loadingResults ? (
          <div className="rounded-3xl border border-slate-200 bg-white p-10 text-center shadow-sm">
            <span className="material-symbols-outlined animate-spin text-4xl text-indigo-500">sync</span>
            <p className="mt-3 font-semibold text-slate-500">Loading your leaderboards...</p>
          </div>
        ) : uniqueTests.length === 0 ? (
          <div className="rounded-3xl border border-slate-200 bg-white p-10 text-center shadow-sm">
            <span className="material-symbols-outlined text-5xl text-slate-300">emoji_events</span>
            <h2 className="mt-3 text-xl font-black text-slate-950">No Leaderboards Yet</h2>
            <p className="mt-2 text-sm font-semibold text-slate-500">Complete a test to unlock comparative ranking.</p>
            <button onClick={onOpenTests} className="mt-6 rounded-2xl border border-slate-950 bg-slate-950 px-5 py-3 text-sm font-black text-white transition hover:bg-slate-800">
              Take a Test
            </button>
          </div>
        ) : (
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {uniqueTests.map((result) => (
              <article key={result._id} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition hover:border-slate-300 hover:shadow-md">
                <span className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-black uppercase tracking-wider text-indigo-700">
                  {result.test?.category || 'Test'}
                </span>
                <h2 className="mt-4 line-clamp-2 text-xl font-black text-slate-950">{result.test?.title || 'Deleted Test'}</h2>
                <p className="mt-2 text-xs font-semibold text-slate-500">
                  Last attempt: {result.submittedAt ? new Date(result.submittedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Unknown'}
                </p>
                <button onClick={() => onSelectTest?.(result.test)} className="mt-6 w-full rounded-2xl border border-slate-950 bg-slate-950 px-5 py-3 text-sm font-black text-white transition hover:bg-slate-800">
                  View Leaderboard
                </button>
              </article>
            ))}
          </div>
        )}
      </div>
    );
  }

  const sectionNames = leaderboardData?.test?.sections?.map((section) => section.name)
    || (leaderboardData?.leaderboard?.[0] ? Object.keys(leaderboardData.leaderboard[0].sectionScores || {}) : []);
  const myRow = leaderboardData?.leaderboard?.find((student) => student.isMe);

  return (
    <div className="mx-auto max-w-7xl space-y-7">
      <button onClick={onBack} className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-slate-600 shadow-sm transition hover:bg-slate-50">
        <span className="material-symbols-outlined text-lg">arrow_back</span>
        Back to Leaderboards
      </button>

      <section className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm md:p-8">
        <p className="text-xs font-bold uppercase tracking-[0.22em] text-slate-400">Live Ranking</p>
        <h1 className="mt-3 text-3xl font-black tracking-tight text-slate-950 md:text-5xl">{selectedTest.title}</h1>
        <p className="mt-3 text-sm font-semibold text-slate-500">First attempt leaderboard ranking.</p>
      </section>

      {loadingLeaderboard ? (
        <div className="rounded-3xl border border-slate-200 bg-white p-10 text-center shadow-sm">
          <span className="material-symbols-outlined animate-spin text-4xl text-indigo-500">sync</span>
          <p className="mt-3 font-semibold text-slate-500">Fetching rankings...</p>
        </div>
      ) : leaderboardError ? (
        <div className="rounded-3xl border border-red-100 bg-red-50 p-6 font-semibold text-red-600">{leaderboardError}</div>
      ) : leaderboardData ? (
        <div className="space-y-6">
          {leaderboardData.myRank && (
            <section className="rounded-3xl border border-indigo-100 bg-indigo-600 p-6 text-white shadow-sm">
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                  <p className="text-xs font-black uppercase tracking-widest text-indigo-100">Your Rank</p>
                  <p className="mt-2 text-5xl font-black">#{leaderboardData.myRank}</p>
                </div>
                <div className="rounded-2xl bg-white/10 px-5 py-4">
                  <p className="text-xs font-bold uppercase tracking-widest text-indigo-100">Your Score</p>
                  <p className="mt-1 text-2xl font-black">{myRow?.totalScore ?? 0} / {selectedTest.totalMarks}</p>
                </div>
              </div>
            </section>
          )}

          <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50 text-left">
                    <th className="px-5 py-4 text-xs font-black uppercase tracking-widest text-slate-500">Rank</th>
                    <th className="px-5 py-4 text-xs font-black uppercase tracking-widest text-slate-500">Student</th>
                    {sectionNames.map((section) => (
                      <th key={section} className="px-5 py-4 text-center text-xs font-black uppercase tracking-widest text-slate-500">{section}</th>
                    ))}
                    <th className="px-5 py-4 text-center text-xs font-black uppercase tracking-widest text-slate-500">Total</th>
                    <th className="px-5 py-4 text-center text-xs font-black uppercase tracking-widest text-slate-500">Percent</th>
                  </tr>
                </thead>
                <tbody>
                  {leaderboardData.leaderboard.map((student) => (
                    <tr key={`${student.username}-${student.rank}`} className={`border-b border-slate-100 last:border-b-0 ${student.isMe ? 'bg-indigo-50' : 'bg-white'}`}>
                      <td className="px-5 py-4 text-sm font-black text-slate-700">#{student.rank}</td>
                      <td className="px-5 py-4">
                        <p className={`text-sm font-black ${student.isMe ? 'text-indigo-700' : 'text-slate-900'}`}>{student.name}</p>
                        <p className="text-xs font-semibold text-slate-400">@{student.username}</p>
                      </td>
                      {sectionNames.map((section) => (
                        <td key={section} className="px-5 py-4 text-center text-sm font-bold text-slate-700">
                          {student.sectionScores?.[section]?.score ?? student.sectionScores?.[section] ?? '-'}
                        </td>
                      ))}
                      <td className="px-5 py-4 text-center text-sm font-black text-slate-950">{student.totalScore}</td>
                      <td className="px-5 py-4 text-center">
                        <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-black text-emerald-700">
                          {student.percentage ? student.percentage.toFixed(1) : '0.0'}%
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </div>
      ) : null}
    </div>
  );
}
