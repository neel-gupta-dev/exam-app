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
    <div className="col-span-12 lg:col-span-4 space-y-8">
      {/* Performance Card */}
      <div className="bg-surface-container p-8 rounded-xl">
        <h4 className="text-sm font-bold uppercase tracking-widest text-indigo-400 mb-6">Series Overview</h4>
        <div className="space-y-6">
          <div>
            <div className="flex justify-between text-sm mb-2">
              <span className="text-on-surface-variant">Total Progress</span>
              <span className="text-on-surface font-bold">{completedResults.length} / {tests.length}</span>
            </div>
            <div className="w-full h-1 bg-surface-variant rounded-full overflow-hidden">
              <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${progress}%` }}></div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-surface-container-low rounded-lg">
              <p className="text-[10px] font-bold uppercase text-slate-500 mb-1">Avg Score</p>
              <p className="text-xl font-headline font-bold text-on-surface">{averagePercentage}%</p>
            </div>
            <div className="p-4 bg-surface-container-low rounded-lg">
              <p className="text-[10px] font-bold uppercase text-slate-500 mb-1">Best</p>
              <p className="text-xl font-headline font-bold text-on-surface">{bestResult?.percentage ?? 0}%</p>
            </div>
          </div>
        </div>
      </div>

      {/* Learning Path */}
      <div className="bg-surface-container-low p-8 rounded-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 p-4 opacity-10">
          <span className="material-symbols-outlined text-6xl">school</span>
        </div>
        <h4 className="text-sm font-bold uppercase tracking-widest text-slate-400 mb-6">Recommended Next</h4>
        <div className="space-y-4">
          <div className="flex items-start">
            <div className="w-8 h-8 rounded bg-indigo-500/20 flex items-center justify-center mr-4 mt-1">
              <span className="material-symbols-outlined text-sm text-indigo-400">lightbulb</span>
            </div>
            <div>
              <p className="text-sm font-bold text-on-surface">{bestResult ? `Review ${bestResult.test?.title || 'latest result'}` : 'Start your next test'}</p>
              <p className="text-xs text-on-surface-variant mt-1">{bestResult ? 'Open Analytics for score and section performance.' : 'Choose a published test and read the instructions before starting.'}</p>
            </div>
          </div>
          <button onClick={() => onNavigate?.(bestResult ? 'analytics' : 'dashboard')} className="cursor-pointer border-none w-full py-2.5 mt-4 bg-surface-variant text-on-surface-variant text-xs font-bold rounded uppercase tracking-widest hover:bg-indigo-500 hover:text-on-primary transition-all">
            {bestResult ? 'View Analytics' : 'View Tests'}
          </button>
        </div>
      </div>

      {/* Bento Ad / Feature */}
      {/* <div className="h-48 bg-indigo-900/20 rounded-xl relative overflow-hidden group">
        <img
          alt="Premium Prep"
          className="absolute inset-0 w-full h-full object-cover opacity-40 group-hover:scale-105 transition-transform duration-700"
          src="https://lh3.googleusercontent.com/aida-public/AB6AXuCzWZp3AJPQDwBrSUcwHPfBgk9GLT97L__2TSL94JALtaNDVjWg-bHc4rUFC2MOu70-4PP-_yaov2F-wj_brt9Ot1bd18teo8GJrPByGCMyV6LzlM9NdoURz_vWKJu28TdecOCQdV_cYJH4njVv6yeTSDb93_PEk6-2Jk7gZ-ZLfTR6RcFFskBq18mR4rlzlFYTHTh-QcG23dxRcwmLCKeh1WsQVAE7mlfIAqgPAJe5WgqFTNWntR57eTDy__qo6UYh7Y-R3eB71BQH"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 to-transparent p-6 flex flex-col justify-end">
          <h5 className="text-sm font-bold text-white mb-1">Scholar Elite</h5>
          <p className="text-xs text-slate-300">Unlock expert video solutions for all mocks.</p>
        </div>
      </div> */}
    </div>
  );
}
