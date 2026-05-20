import React from 'react';

export default function StatsPanel({ tests = [], results = [], onNavigate }) {
  const completedResults = results.filter((result) => result.status === 'completed' || result.status === 'auto-submitted');
  const averagePercentage = completedResults.length
    ? Math.round(completedResults.reduce((sum, result) => sum + (result.percentage || 0), 0) / completedResults.length)
    : 0;
  const bestResult = completedResults.reduce((best, result) => {
    if (!best) return result;
    return (result.percentage || 0) > (best.percentage || 0) ? result : best;
  }, null);
  const progress = tests.length ? Math.round((completedResults.length / tests.length) * 100) : 0;

  return (
    <aside className="space-y-5">
      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-xs font-black uppercase tracking-widest text-slate-400">Series Overview</p>
        <div className="mt-5 flex items-end gap-2">
          <span className="text-5xl font-black text-slate-950">{progress}%</span>
          <span className="pb-2 text-sm font-bold text-slate-400">done</span>
        </div>
        <div className="mt-5 h-2 overflow-hidden rounded-full bg-slate-100">
          <div className="h-full rounded-full bg-indigo-600" style={{ width: `${progress}%` }} />
        </div>
        <div className="mt-5 grid grid-cols-2 gap-3">
          <div className="rounded-2xl bg-indigo-50 p-4">
            <p className="text-xs font-bold text-indigo-500">Average</p>
            <p className="mt-1 text-2xl font-black text-indigo-700">{averagePercentage}%</p>
          </div>
          <div className="rounded-2xl bg-emerald-50 p-4">
            <p className="text-xs font-bold text-emerald-600">Best</p>
            <p className="mt-1 text-2xl font-black text-emerald-700">{bestResult?.percentage ?? 0}%</p>
          </div>
        </div>
      </section>

      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-xs font-black uppercase tracking-widest text-slate-400">Recommended Next</p>
        <h3 className="mt-3 text-lg font-black text-slate-950">
          {bestResult ? `Review ${bestResult.test?.title || 'latest result'}` : 'Start your next test'}
        </h3>
        <p className="mt-2 text-sm leading-6 text-slate-500">
          {bestResult ? 'Open Analytics for score and section performance.' : 'Choose a published test and read the instructions before starting.'}
        </p>
        <button onClick={() => onNavigate?.(bestResult ? 'analytics' : 'test-series')} className="mt-5 w-full rounded-2xl border border-slate-950 bg-slate-950 px-4 py-3 text-sm font-black text-white transition hover:bg-slate-800">
          {bestResult ? 'View Analytics' : 'View Tests'}
        </button>
      </section>
    </aside>
  );
}
