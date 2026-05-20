import React from 'react';

export default function Sidebar({ user, currentView = 'dashboard', onNavigate = () => {} }) {
  const navItems = [
    ['dashboard', 'dashboard', 'Dashboard'],
    ['test-series', 'layers', 'Tests'],
    ['pyp', 'history_edu', 'PYP'],
    ['leaderboard', 'emoji_events', 'Ranks'],
    ['analytics', 'insights', 'Analytics'],
    ['settings', 'settings', 'Settings'],
    ['support', 'help_outline', 'Support'],
  ];
  const name = user?.name || user?.username || 'Student';

  return (
    <aside className="fixed left-0 top-0 z-50 flex h-screen w-64 flex-col border-r border-slate-200 bg-white px-4 py-6 shadow-sm">
      <div className="mb-8 flex items-center gap-3 px-2">
        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-950 text-sm font-black text-white">V</div>
        <div>
          <p className="text-sm font-black uppercase tracking-widest text-slate-950">Vayl</p>
          <p className="text-xs font-bold text-slate-400">CBT Platform</p>
        </div>
      </div>

      <nav className="flex-1 space-y-1">
        {navItems.map(([view, icon, label]) => {
          const active = currentView === view || (view === 'test-series' && currentView === 'instructions');
          return (
            <button
              key={view}
              onClick={() => onNavigate(view)}
              className={`flex w-full items-center rounded-xl border-none bg-transparent px-3 py-3 transition ${
                active ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-950'
              }`}
            >
              <span className="material-symbols-outlined mr-3">{icon}</span>
              <span className="text-sm font-bold">{label}</span>
            </button>
          );
        })}
      </nav>

      <div className="border-t border-slate-200 pt-5">
        <div className="flex items-center px-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-indigo-50 text-sm font-black text-indigo-700">
            {name.charAt(0).toUpperCase()}
          </div>
          <div className="ml-3 min-w-0">
            <p className="truncate text-xs font-black text-slate-900">{name}</p>
            <p className="truncate text-[10px] font-semibold text-slate-400">{user?.authMethod === 'b2b' ? 'Coaching Scholar' : 'Student'}</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
