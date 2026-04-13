import React from 'react';

export const TopNav = () => {
  return (
    <header className="fixed top-0 right-0 w-[calc(100%-16rem)] h-16 bg-slate-950/80 backdrop-blur-xl z-40 flex justify-between items-center px-8 shadow-[0_40px_40px_-15px_rgba(0,0,0,0.06)]">
      <div className="flex items-center w-1/2">
        <div className="relative w-full max-w-md">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-lg">search</span>
          <input 
            className="w-full bg-surface-bright border-none rounded-xl py-2 pl-10 pr-4 text-sm text-on-surface placeholder:text-slate-600 focus:ring-1 focus:ring-indigo-500/50 transition-all" 
            placeholder="Search tests, topics, or results..." 
            type="text"
          />
          <div className="absolute right-3 top-1/2 -translate-y-1/2 px-1.5 py-0.5 bg-secondary-container rounded text-[10px] font-bold text-on-surface-variant">⌘ K</div>
        </div>
      </div>
      
      <div className="flex items-center space-x-4">
        <button className="p-2 text-slate-400 hover:bg-slate-800/50 rounded-lg transition-colors">
          <span className="material-symbols-outlined">notifications</span>
        </button>
        <button className="p-2 text-slate-400 hover:bg-slate-800/50 rounded-lg transition-colors">
          <span className="material-symbols-outlined">dark_mode</span>
        </button>
        <div className="h-8 w-px bg-slate-800 mx-2"></div>
        <div className="text-right mr-3 hidden sm:block">
          <p className="text-xs font-bold text-on-surface leading-none uppercase tracking-wider">The Focused Scholar</p>
        </div>
      </div>
    </header>
  );
};
