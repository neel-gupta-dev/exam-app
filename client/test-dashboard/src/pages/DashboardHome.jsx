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
    .filter((test) => test.state === 'default' || test.state === 'in-progress' || test.state === 'upcoming')
    .slice(0, 4);
  const latestThree = completedResults.slice(0, 3);
  const trendPath = trendResults.map((result, idx) => {
    const x = trendResults.length <= 1 ? 50 : (idx / (trendResults.length - 1)) * 100;
    const y = 100 - Math.max(0, Math.min(100, Number(result.percentage) || 0));
    return `${x},${y}`;
  }).join(' ');

  return (
    <div className="mx-auto max-w-7xl space-y-8">
      <section className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm md:p-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-slate-400">CBT Dashboard</p>
            <h1 className="mt-3 text-3xl font-black tracking-tight text-slate-950 md:text-5xl">
              Welcome, {user?.name || 'Scholar'}
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-500 md:text-base">
              Track attempts, review accuracy, and continue your next mock from one clean workspace.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <button onClick={onOpenTests} className="rounded-2xl border border-slate-200 bg-slate-950 px-5 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-slate-800">
              Open Test Series
            </button>
            <button onClick={onOpenAnalytics} className="rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-bold text-slate-700 transition hover:bg-slate-50">
              View Analytics
            </button>
          </div>
        </div>
      </section>

      {loading ? (
        <div className="rounded-3xl border border-slate-200 bg-white p-10 text-center text-slate-500 shadow-sm">
          <span className="material-symbols-outlined animate-spin text-4xl text-indigo-500">sync</span>
          <p className="mt-3 font-semibold">Loading your latest test data...</p>
        </div>
      ) : (
        <>
          <section className="grid grid-cols-2 gap-4 lg:grid-cols-5">
            {[
              ['Tests Given', givenCount, 'check_circle', 'text-emerald-600', 'bg-emerald-50'],
              ['Ongoing', ongoingCount, 'pending', 'text-amber-600', 'bg-amber-50'],
              ['Upcoming', upcomingCount, 'event', 'text-sky-600', 'bg-sky-50'],
              ['Missed', missedCount, 'event_busy', 'text-rose-600', 'bg-rose-50'],
              ['Average', `${averagePercentage}%`, 'monitoring', 'text-indigo-600', 'bg-indigo-50'],
            ].map(([label, value, icon, color, bg]) => (
              <div key={label} className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className={`mb-5 flex h-11 w-11 items-center justify-center rounded-2xl ${bg} ${color}`}>
                  <span className="material-symbols-outlined">{icon}</span>
                </div>
                <p className="text-xs font-bold uppercase tracking-widest text-slate-400">{label}</p>
                <p className="mt-2 text-3xl font-black text-slate-950">{value}</p>
              </div>
            ))}
          </section>

          <section className="grid gap-6 xl:grid-cols-[1.25fr_0.75fr]">
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="mb-5 flex items-center justify-between gap-4">
                <div>
                  <p className="text-xs font-bold uppercase tracking-widest text-slate-400">Recent Performance</p>
                  <h2 className="mt-1 text-xl font-black text-slate-950">Score Trend</h2>
                </div>
                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-500">{trendResults.length} attempts</span>
              </div>
              <div className="h-60 rounded-2xl bg-slate-50 p-5">
                {trendResults.length > 1 ? (
                  <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="h-full w-full overflow-visible">
                    <polyline points={trendPath} fill="none" stroke="#4f46e5" strokeWidth="3" vectorEffect="non-scaling-stroke" />
                    {trendResults.map((result, idx) => {
                      const x = trendResults.length <= 1 ? 50 : (idx / (trendResults.length - 1)) * 100;
                      const y = 100 - Math.max(0, Math.min(100, Number(result.percentage) || 0));
                      return <circle key={result._id || idx} cx={x} cy={y} r="2.5" fill="#4f46e5" />;
                    })}
                  </svg>
                ) : (
                  <div className="flex h-full items-center justify-center text-sm font-semibold text-slate-400">
                    Submit more tests to build your trend.
                  </div>
                )}
              </div>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <p className="text-xs font-bold uppercase tracking-widest text-slate-400">Best Attempt</p>
              <h2 className="mt-1 text-xl font-black text-slate-950">{bestResult?.test?.title || 'No attempt yet'}</h2>
              <div className="mt-6 flex items-end gap-3">
                <p className="text-5xl font-black text-slate-950">{bestResult?.percentage ?? 0}%</p>
                <p className="pb-2 text-sm font-semibold text-slate-400">best score</p>
              </div>
              <div className="mt-6 rounded-2xl bg-slate-50 p-4">
                <p className="text-xs font-bold uppercase tracking-widest text-slate-400">Latest Attempt</p>
                <p className="mt-2 text-sm font-bold text-slate-700">{latestResult?.test?.title || 'No recent result'}</p>
                <p className="mt-1 text-sm text-slate-500">{latestResult ? `${latestResult.totalScore ?? 0} / ${latestResult.maxPossibleScore ?? 0}` : 'Complete a mock to see details.'}</p>
              </div>
            </div>
          </section>

          <section className="grid gap-6 xl:grid-cols-2">
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="mb-5 flex items-center justify-between">
                <h2 className="text-xl font-black text-slate-950">Continue Practice</h2>
                <button onClick={onOpenTests} className="text-sm font-bold text-indigo-600">See all</button>
              </div>
              <div className="space-y-3">
                {nextTests.length ? nextTests.map((test) => (
                  <div key={test._id} className="flex items-center justify-between gap-4 rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-bold text-slate-900">{test.title}</p>
                      <p className="text-xs text-slate-500">{test.durationMinutes} mins · {test.totalMarks} marks · {test.status || 'Available'}</p>
                    </div>
                    <span className="rounded-full bg-white px-3 py-1 text-xs font-bold text-slate-500">{test.category || 'Test'}</span>
                  </div>
                )) : (
                  <p className="rounded-2xl bg-slate-50 p-5 text-sm font-semibold text-slate-400">No available tests right now.</p>
                )}
              </div>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="text-xl font-black text-slate-950">Recent Results</h2>
              <div className="mt-5 space-y-3">
                {latestThree.length ? latestThree.map((result) => (
                  <div key={result._id} className="flex items-center justify-between rounded-2xl border border-slate-100 px-4 py-3">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-bold text-slate-900">{result.test?.title || 'Deleted Test'}</p>
                      <p className="text-xs text-slate-500">{result.answered || 0}/{result.totalQuestions || 0} answered</p>
                    </div>
                    <p className="text-lg font-black text-indigo-600">{result.percentage ?? 0}%</p>
                  </div>
                )) : (
                  <p className="rounded-2xl bg-slate-50 p-5 text-sm font-semibold text-slate-400">Your submitted tests will appear here.</p>
                )}
              </div>
            </div>
          </section>
        </>
      )}
    </div>
  );
}
