const formatDuration = (seconds = 0) => {
  const total = Math.max(0, Math.round(Number(seconds) || 0));
  const mins = Math.floor(total / 60);
  const secs = total % 60;
  return mins ? `${mins}m ${secs}s` : `${secs}s`;
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
  latestSectionEntries = [],
  latestTopicEntries = [],
  latestTelemetryQuestions = [],
  maxQuestionTime = 1,
  onReview,
}) {
  const trendPath = trendResults.map((result, idx) => {
    const x = trendResults.length <= 1 ? 50 : (idx / (trendResults.length - 1)) * 100;
    const y = 100 - Math.max(0, Math.min(100, Number(result.percentage) || 0));
    return `${x},${y}`;
  }).join(' ');
  const totalTrackedSeconds = completedResults.reduce((sum, result) => sum + (result.telemetry?.totalTimeSpentSeconds || 0), 0);
  const totalVisits = completedResults.reduce((sum, result) => sum + (result.telemetry?.totalVisits || 0), 0);
  const totalChanges = completedResults.reduce((sum, result) => sum + (result.telemetry?.totalAnswerChanges || 0), 0);
  const highTimeQuestions = [...latestTelemetryQuestions]
    .sort((a, b) => (b.timeSpentSeconds || 0) - (a.timeSpentSeconds || 0))
    .slice(0, 6);

  if (loading) {
    return (
      <div className="rounded-3xl border border-slate-200 bg-white p-10 text-center shadow-sm">
        <span className="material-symbols-outlined animate-spin text-4xl text-indigo-500">sync</span>
        <p className="mt-3 font-semibold text-slate-500">Loading analytics...</p>
      </div>
    );
  }

  if (error) {
    return <div className="rounded-3xl border border-red-100 bg-red-50 p-6 font-semibold text-red-600">{error}</div>;
  }

  if (!results.length) {
    return (
      <div className="rounded-3xl border border-slate-200 bg-white p-12 text-center shadow-sm">
        <span className="material-symbols-outlined text-5xl text-slate-300">analytics</span>
        <h2 className="mt-3 text-2xl font-black text-slate-950">No Results Yet</h2>
        <p className="mt-2 text-slate-500">Submit a CBT test to unlock score, timing, topic, and review analytics.</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl space-y-7">
      <section className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm md:p-8">
        <p className="text-xs font-bold uppercase tracking-[0.22em] text-slate-400">Paper Analytics</p>
        <div className="mt-3 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h1 className="text-3xl font-black tracking-tight text-slate-950 md:text-5xl">Performance Review</h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-500 md:text-base">
              Use score, section, topic, timing, visits, and answer-change data to find exactly where marks are being gained or lost.
            </p>
          </div>
          <div className="grid grid-cols-3 gap-3 text-center">
            <div className="rounded-2xl bg-slate-50 px-4 py-3">
              <p className="text-xs font-bold text-slate-400">Tests</p>
              <p className="text-2xl font-black text-slate-950">{completedResults.length}</p>
            </div>
            <div className="rounded-2xl bg-slate-50 px-4 py-3">
              <p className="text-xs font-bold text-slate-400">Avg</p>
              <p className="text-2xl font-black text-slate-950">{averagePercentage}%</p>
            </div>
            <div className="rounded-2xl bg-slate-50 px-4 py-3">
              <p className="text-xs font-bold text-slate-400">Best</p>
              <p className="text-2xl font-black text-slate-950">{bestResult?.percentage ?? 0}%</p>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-5 md:grid-cols-3">
        {[
          ['Tracked Time', formatDuration(totalTrackedSeconds), 'timer'],
          ['Question Visits', totalVisits, 'visibility'],
          ['Answer Changes', totalChanges, 'swap_horiz'],
        ].map(([label, value, icon]) => (
          <div key={label} className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <span className="material-symbols-outlined rounded-2xl bg-indigo-50 p-3 text-indigo-600">{icon}</span>
            <p className="mt-5 text-xs font-bold uppercase tracking-widest text-slate-400">{label}</p>
            <p className="mt-2 text-3xl font-black text-slate-950">{value}</p>
          </div>
        ))}
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-slate-400">Score Trend</p>
              <h2 className="mt-1 text-xl font-black text-slate-950">Recent Test Performance</h2>
            </div>
            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-500">{trendResults.length} attempts</span>
          </div>
          <div className="h-64 rounded-2xl bg-slate-50 p-5">
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
              <div className="flex h-full items-center justify-center text-sm font-semibold text-slate-400">Submit more tests to build a trend.</div>
            )}
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-xs font-bold uppercase tracking-widest text-slate-400">Latest Attempt</p>
          <h2 className="mt-1 text-xl font-black text-slate-950">{latestResult?.test?.title || 'No latest result'}</h2>
          <div className="mt-6 flex items-end gap-3">
            <p className="text-5xl font-black text-indigo-600">{latestResult?.percentage ?? 0}%</p>
            <p className="pb-2 text-sm font-semibold text-slate-400">{latestResult?.totalScore ?? 0} / {latestResult?.maxPossibleScore ?? 0}</p>
          </div>
          <div className="mt-6 grid grid-cols-2 gap-3">
            <div className="rounded-2xl bg-slate-50 p-4">
              <p className="text-xs font-bold text-slate-400">Avg/Q</p>
              <p className="mt-1 text-xl font-black text-slate-950">{latestResult?.telemetry?.averageQuestionTimeSeconds || 0}s</p>
            </div>
            <div className="rounded-2xl bg-slate-50 p-4">
              <p className="text-xs font-bold text-slate-400">Visits</p>
              <p className="mt-1 text-xl font-black text-slate-950">{latestResult?.telemetry?.totalVisits || 0}</p>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-2">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-black text-slate-950">Section Breakdown</h2>
          <div className="mt-5 space-y-4">
            {latestSectionEntries.length ? latestSectionEntries.map(([section, score]) => {
              const total = (score.correct || 0) + (score.wrong || 0) + (score.unattempted || 0);
              const accuracy = total ? Math.round(((score.correct || 0) / total) * 100) : 0;
              return (
                <div key={section}>
                  <div className="mb-2 flex justify-between text-sm">
                    <span className="font-bold text-slate-800">{section}</span>
                    <span className="font-bold text-slate-500">{score.score || 0} pts · {accuracy}% accuracy</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                    <div className="h-full rounded-full bg-indigo-500" style={{ width: `${accuracy}%` }} />
                  </div>
                </div>
              );
            }) : <p className="text-sm font-semibold text-slate-400">No section data yet.</p>}
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-black text-slate-950">Topic Strength</h2>
          <div className="mt-5 space-y-4">
            {latestTopicEntries.length ? latestTopicEntries.map(([topic, perf]) => {
              const total = (perf.correct || 0) + (perf.wrong || 0) + (perf.skipped || 0);
              const accuracy = total ? Math.round(((perf.correct || 0) / total) * 100) : 0;
              return (
                <div key={topic}>
                  <div className="mb-2 flex justify-between gap-4 text-sm">
                    <span className="truncate font-bold text-slate-800">{topic}</span>
                    <span className="shrink-0 font-bold text-slate-500">{perf.correct || 0}C · {perf.wrong || 0}W · {perf.skipped || 0}S</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                    <div className={`h-full rounded-full ${accuracy >= 60 ? 'bg-emerald-500' : accuracy >= 35 ? 'bg-amber-500' : 'bg-red-500'}`} style={{ width: `${accuracy}%` }} />
                  </div>
                </div>
              );
            }) : <p className="text-sm font-semibold text-slate-400">Question tags will unlock chapter-wise analysis.</p>}
          </div>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[0.8fr_1.2fr]">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-black text-slate-950">Time Sink Questions</h2>
          <div className="mt-5 space-y-3">
            {highTimeQuestions.length ? highTimeQuestions.map((question, idx) => (
              <div key={question.questionId || idx}>
                <div className="mb-1 flex justify-between text-xs font-bold text-slate-500">
                  <span>Q{latestTelemetryQuestions.findIndex((item) => item.questionId === question.questionId) + 1 || idx + 1}</span>
                  <span>{formatDuration(question.timeSpentSeconds)} · {question.visitCount || 0} visits</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                  <div className="h-full rounded-full bg-slate-900" style={{ width: `${Math.min(100, ((question.timeSpentSeconds || 0) / maxQuestionTime) * 100)}%` }} />
                </div>
              </div>
            )) : <p className="text-sm font-semibold text-slate-400">Timing telemetry appears after a submitted test.</p>}
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-black text-slate-950">Attempt History</h2>
          <div className="mt-5 overflow-hidden rounded-2xl border border-slate-100">
            {completedResults.map((result) => (
              <div key={result._id} className="grid gap-3 border-b border-slate-100 p-4 last:border-b-0 md:grid-cols-[1fr_auto_auto] md:items-center">
                <div className="min-w-0">
                  <p className="truncate text-sm font-black text-slate-900">{result.test?.title || 'Deleted Test'}</p>
                  <p className="mt-1 text-xs text-slate-500">
                    {result.durationUsedMinutes || 0} mins · {result.answered || 0}/{result.totalQuestions || 0} answered · IP {result.ipAddress || 'not captured'}
                  </p>
                </div>
                <p className="text-xl font-black text-indigo-600">{result.percentage ?? 0}%</p>
                <button onClick={() => onReview?.(result._id)} className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-700 transition hover:bg-slate-50">
                  Review
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
