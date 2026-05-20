import React from 'react';

export default function TopNav({ searchQuery = '', onSearchChange = () => {} }) {
  return (
    <header className="fixed right-0 top-0 z-40 flex h-16 w-[calc(100%-16rem)] items-center justify-between border-b border-slate-200 bg-white/90 px-8 backdrop-blur-xl">
      <div className="flex w-full max-w-md items-center rounded-2xl bg-slate-100 px-3 transition focus-within:ring-4 focus-within:ring-indigo-100">
        <span className="material-symbols-outlined shrink-0 text-xl text-slate-500">search</span>
        <input
          className="flex-1 border-none bg-transparent px-2 py-2 text-sm text-slate-900 outline-none placeholder:text-slate-400"
          placeholder="Search tests, topics, or results..."
          type="text"
          value={searchQuery}
          onChange={(event) => onSearchChange(event.target.value)}
        />
        <span className="rounded bg-white px-1.5 py-0.5 text-[10px] font-black text-slate-400">Ctrl K</span>
      </div>

      <p className="text-xs font-black uppercase tracking-wider text-slate-900">The Focused Scholar</p>
    </header>
  );
}
