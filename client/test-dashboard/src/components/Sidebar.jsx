import React from 'react';

export default function Sidebar({ user, currentView = 'dashboard', onNavigate = () => {} }) {
  const navItems = [
    ['dashboard', 'dashboard', 'Dashboard'],
    ['dashboard', 'assignment', 'Exams'],
    ['dashboard', 'layers', 'Test Series'],
    ['analytics', 'insights', 'Analytics'],
    ['support', 'menu_book', 'Support'],
  ];
  const bottomItems = [
    ['settings', 'settings', 'Settings'],
    ['support', 'help_outline', 'Support'],
  ];
  const name = user?.name || user?.username || 'Student';

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 bg-slate-900 flex flex-col py-6 px-4 z-50">
      <div className="mb-10 px-2">
        <h1 className="text-xl font-bold tracking-tight text-indigo-500 font-headline">The Scholar</h1>
        <p className="text-[10px] uppercase tracking-[0.2em] text-slate-500 font-medium mt-1">Productivity Suite</p>
      </div>

      <nav className="flex-1 space-y-1">
        {navItems.map(([view, icon, label]) => {
          const active = currentView === view || (label === 'Test Series' && currentView === 'instructions');
          return (
            <button key={`${label}-${icon}`} onClick={() => onNavigate(view)} className={`w-full border-none bg-transparent flex items-center px-3 py-3 transition-colors duration-200 rounded-lg group ${active ? 'border-l-2 border-indigo-500 bg-slate-800/50 text-indigo-400 font-semibold' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/30'}`}>
              <span className="material-symbols-outlined mr-3">{icon}</span>
              <span className="text-sm font-medium">{label}</span>
            </button>
          );
        })}
      </nav>

      <div className="mt-auto pt-6 border-t border-slate-800/50 space-y-1">
        {bottomItems.map(([view, icon, label]) => (
          <button key={label} onClick={() => onNavigate(view)} className={`w-full border-none bg-transparent flex items-center px-3 py-3 transition-colors duration-200 rounded-lg group ${currentView === view ? 'bg-slate-800/50 text-indigo-400 font-semibold' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/30'}`}>
            <span className="material-symbols-outlined mr-3">{icon}</span>
            <span className="text-sm font-medium">{label}</span>
          </button>
        ))}
        
        <div className="flex items-center mt-6 px-3">
          <div className="w-8 h-8 rounded-full bg-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold text-sm">{name.charAt(0).toUpperCase()}</div>
          <div className="ml-3 overflow-hidden">
            <p className="text-xs font-semibold text-slate-200 truncate">{name}</p>
            <p className="text-[10px] text-slate-500 truncate">{user?.authMethod === 'b2b' ? 'Coaching Scholar' : 'Pro Member'}</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
