import React from 'react';

const overviewData = {
  totalProgress: {
    completed: 12,
    total: 40,
  },
  avgScore: '78%',
  rank: '#242',
};

const recommendationData = {
  focus: 'Organic Chemistry',
  reason: 'You missed 4 questions on Hydrocarbons in Mock 01.',
  icon: 'lightbulb',
};

const premiumFeatureData = {
    title: 'Scholar Elite',
    description: 'Unlock expert video solutions for all mocks.',
    imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCzWZp3AJPQDwBrSUcwHPfBgk9GLT97L__2TSL94JALtaNDVjWg-bHc4rUFC2MOu70-4PP-_yaov2F-wj_brt9Ot1bd18teo8GJrPByGCMyV6LzlM9NdoURz_vWKJu28TdecOCQdV_cYJH4njVv6yeTSDb93_PEk6-2Jk7gZ-ZLfTR6RcFFskBq18mR4rlzlFYTHTh-QcG23dxRcwmLCKeh1WsQVAE7mlfIAqgPAJe5WgqFTNWntR57eTDy__qo6UYh7Y-R3eB71BQH'
};

export const StatsPanel = () => {
  const progressPercentage = (overviewData.totalProgress.completed / overviewData.totalProgress.total) * 100;

  return (
    <div className="col-span-12 lg:col-span-4 space-y-8">
      {/* Performance Card */}
      <div className="bg-surface-container p-8 rounded-xl">
        <h4 className="text-sm font-bold uppercase tracking-widest text-primary mb-6">Series Overview</h4>
        <div className="space-y-6">
          <div>
            <div className="flex justify-between text-sm mb-2">
              <span className="text-on-surface-variant">Total Progress</span>
              <span className="text-on-surface font-bold">{overviewData.totalProgress.completed} / {overviewData.totalProgress.total}</span>
            </div>
            <div className="w-full h-1 bg-surface-variant rounded-full overflow-hidden">
              <div className="h-full bg-primary rounded-full" style={{ width: `${progressPercentage}%` }}></div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-surface-container-low rounded-lg">
              <p className="text-[10px] font-bold uppercase text-on-surface-variant mb-1">Avg Score</p>
              <p className="text-xl font-headline font-bold text-on-surface">{overviewData.avgScore}</p>
            </div>
            <div className="p-4 bg-surface-container-low rounded-lg">
              <p className="text-[10px] font-bold uppercase text-on-surface-variant mb-1">Rank</p>
              <p className="text-xl font-headline font-bold text-on-surface">{overviewData.rank}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Learning Path */}
      <div className="bg-surface-container-low p-8 rounded-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 p-4 opacity-10">
          <span className="material-symbols-outlined text-6xl">school</span>
        </div>
        <h4 className="text-sm font-bold uppercase tracking-widest text-on-surface-variant mb-6">Recommended Next</h4>
        <div className="space-y-4">
          <div className="flex items-start">
            <div className="w-8 h-8 rounded bg-surface-container-low flex items-center justify-center mr-4 mt-1">
              <span className="material-symbols-outlined text-sm text-primary">{recommendationData.icon}</span>
            </div>
            <div>
              <p className="text-sm font-bold text-on-surface">Focus: {recommendationData.focus}</p>
              <p className="text-xs text-on-surface-variant mt-1">{recommendationData.reason}</p>
            </div>
          </div>
          <button className="w-full py-2.5 mt-4 btn-ghost text-xs font-bold uppercase tracking-widest">
            View Study Plan
          </button>
        </div>
      </div>

      {/* Premium Feature Card */}
      <div className="h-48 bg-surface-container-low rounded-xl relative overflow-hidden group">
        <img 
          alt="Premium Prep" 
          className="absolute inset-0 w-full h-full object-cover opacity-40 group-hover:scale-105 transition-transform duration-700" 
          src={premiumFeatureData.imageUrl}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-surface to-transparent p-6 flex flex-col justify-end">
          <h5 className="text-sm font-bold text-on-surface mb-1">{premiumFeatureData.title}</h5>
          <p className="text-xs text-on-surface-variant">{premiumFeatureData.description}</p>
        </div>
      </div>
    </div>
  );
};
