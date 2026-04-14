import React, { useState, useEffect } from 'react';

export default function App() {
  const [isDark, setIsDark] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('theme');
      return saved ? saved === 'dark' : true; // Default to dark as requested
    }
    return true;
  });

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDark]);

  const toggleTheme = () => setIsDark(!isDark);

  return (
    <div className={`min-h-screen transition-colors duration-300 ${isDark ? 'bg-background text-on-surface' : 'bg-slate-50 text-slate-900'}`}>
      {/* SideNavBar */}
      <aside className={`fixed left-0 top-0 h-screen w-64 flex flex-col py-6 px-4 z-50 transition-colors duration-300 ${isDark ? 'bg-slate-900' : 'bg-white shadow-xl'}`}>
        <div className="mb-10 px-2">
          <h1 className="text-xl font-bold tracking-tight text-indigo-500 font-headline">The Scholar</h1>
          <p className="text-[10px] uppercase tracking-[0.2em] text-slate-500 font-medium mt-1">Productivity Suite</p>
        </div>

        <nav className="flex-1 space-y-1">
          <a className={`flex items-center px-3 py-3 transition-colors duration-200 rounded-lg group ${isDark ? 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/30' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'}`} href="#">
            <span className="material-symbols-outlined mr-3">dashboard</span>
            <span className="text-sm font-medium">Dashboard</span>
          </a>
          <a className={`flex items-center px-3 py-3 transition-colors duration-200 rounded-lg group ${isDark ? 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/30' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'}`} href="#">
            <span className="material-symbols-outlined mr-3">assignment</span>
            <span className="text-sm font-medium">Exams</span>
          </a>
          {/* Active Navigation Logic: Test Series matches current screen */}
          <a className={`flex items-center px-3 py-3 border-l-2 border-indigo-500 font-semibold transition-colors duration-200 group ${isDark ? 'bg-slate-800/50 text-indigo-400' : 'bg-indigo-50 text-indigo-600'}`} href="#">
            <span className="material-symbols-outlined mr-3">layers</span>
            <span className="text-sm">Test Series</span>
          </a>
          <a className={`flex items-center px-3 py-3 transition-colors duration-200 rounded-lg group ${isDark ? 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/30' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'}`} href="#">
            <span className="material-symbols-outlined mr-3">insights</span>
            <span className="text-sm font-medium">Analytics</span>
          </a>
          <a className={`flex items-center px-3 py-3 transition-colors duration-200 rounded-lg group ${isDark ? 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/30' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'}`} href="#">
            <span className="material-symbols-outlined mr-3">menu_book</span>
            <span className="text-sm font-medium">Resources</span>
          </a>
        </nav>

        <div className={`mt-auto pt-6 border-t space-y-1 ${isDark ? 'border-slate-800/50' : 'border-slate-200'}`}>
          <a className={`flex items-center px-3 py-3 transition-colors duration-200 rounded-lg group ${isDark ? 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/30' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'}`} href="#">
            <span className="material-symbols-outlined mr-3">settings</span>
            <span className="text-sm font-medium">Settings</span>
          </a>
          <a className={`flex items-center px-3 py-3 transition-colors duration-200 rounded-lg group ${isDark ? 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/30' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'}`} href="#">
            <span className="material-symbols-outlined mr-3">help_outline</span>
            <span className="text-sm font-medium">Support</span>
          </a>
          <div className="flex items-center mt-6 px-3">
            <img
              alt="Scholar Profile"
              className="w-8 h-8 rounded-full bg-slate-700"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuC2sE9mg57yv5PkRx3-FJoCQSbGTkkdOEGbgy-dFCkWkHoTK3s5wDEMNpkOjUJ5XydVJfnY5Jh09nZN4gkKQtk62AwoqNRw9grUdL9QtGxTYW7qYN-lHNdCxu4pnOBCxRGv7S9fyKLZIWDgcnJP9HfTZuuqli1lWINcw0WDon3zS0cBG-Gydm2HZ5YOWoWw-8bFLouwnsXxkVTPnxMVVwI2lLpZWSuJem2LUi1FcsDA_T7lIx6MHB_g4k2K1Hwlsp3rz9eUBsyj0HBH"
            />
            <div className="ml-3 overflow-hidden">
              <p className={`text-xs font-semibold truncate ${isDark ? 'text-slate-200' : 'text-slate-900'}`}>Alex Sterling</p>
              <p className="text-[10px] text-slate-500 truncate">Pro Member</p>
            </div>
          </div>
        </div>
      </aside>

      {/* TopNavBar */}
      <header className={`fixed top-0 right-0 w-[calc(100%-16rem)] h-16 backdrop-blur-xl z-40 flex justify-between items-center px-8 transition-colors duration-300 ${isDark ? 'bg-slate-950/80 shadow-[0_40px_40px_-15px_rgba(0,0,0,0.06)]' : 'bg-white/80 shadow-md'}`}>
        <div className="flex items-center w-1/2">
          <div className="relative w-full max-w-md">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-lg">search</span>
            <input
              className={`w-full border-none rounded-xl py-2 pl-10 pr-4 text-sm focus:ring-1 focus:ring-indigo-500/50 transition-all outline-none ${isDark ? 'bg-surface-bright text-on-surface placeholder:text-slate-600' : 'bg-slate-100 text-slate-900 placeholder:text-slate-400'}`}
              placeholder="Search tests, topics, or results..."
              type="text"
            />
            <div className={`absolute right-3 top-1/2 -translate-y-1/2 px-1.5 py-0.5 rounded text-[10px] font-bold ${isDark ? 'bg-secondary-container text-on-surface-variant' : 'bg-slate-200 text-slate-500'}`}>⌘ K</div>
          </div>
        </div>
        <div className="flex items-center space-x-4">
          <button className={`p-2 rounded-lg transition-colors cursor-pointer border-none bg-transparent ${isDark ? 'text-slate-400 hover:bg-slate-800/50' : 'text-slate-600 hover:bg-slate-100'}`}>
            <span className="material-symbols-outlined">notifications</span>
          </button>
          <button
            onClick={toggleTheme}
            className={`p-2 rounded-lg transition-colors cursor-pointer border-none bg-transparent ${isDark ? 'text-slate-400 hover:bg-slate-800/50' : 'text-slate-600 hover:bg-slate-100'}`}
          >
            <span className="material-symbols-outlined">{isDark ? 'dark_mode' : 'light_mode'}</span>
          </button>
          <div className={`h-8 w-px mx-2 ${isDark ? 'bg-slate-800' : 'bg-slate-200'}`}></div>
          <div className="text-right mr-3 hidden sm:block">
            <p className={`text-xs font-bold leading-none uppercase tracking-wider ${isDark ? 'text-on-surface' : 'text-slate-900'}`}>The Focused Scholar</p>
          </div>
        </div>
      </header>

      {/* Main Content Canvas */}
      <main className="ml-64 pt-24 px-10 pb-20 min-h-screen">
        {/* Header Section */}
        <header className="mb-12">
          <h2 className={`text-4xl font-extrabold font-headline tracking-tight ${isDark ? 'text-on-background' : 'text-slate-900'}`}>Test Series</h2>
          <p className={`mt-2 text-lg font-medium opacity-70 ${isDark ? 'text-on-surface-variant' : 'text-slate-600'}`}>Level up your exam readiness.</p>
        </header>

        {/* Category Tabs */}
        <div className="flex items-center space-x-1 mb-10 overflow-x-auto pb-2 scrollbar-hide">
          <button className="cursor-pointer px-6 py-2.5 rounded-full text-sm font-semibold whitespace-nowrap bg-indigo-500/10 text-indigo-400 border border-indigo-500/30">
            Full Tests
          </button>
          {[
            { id: 'part', label: 'Part Tests' },
            { id: 'chapter', label: 'Chapter-wise Tests' },
            { id: 'pyq', label: 'Previous Year Papers' },
          ].map((tab) => (
            <button key={tab.id} className={`cursor-pointer px-6 py-2.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors bg-transparent border-none ${isDark ? 'text-on-surface-variant hover:text-on-surface' : 'text-slate-500 hover:text-slate-900'}`}>
              {tab.label}
            </button>
          ))}
        </div>

        {/* Asymmetric Layout: Test Grid and Quick Stats */}
        <div className="grid grid-cols-12 gap-10">

          {/* Test List (The Core) */}
          <div className="col-span-12 lg:col-span-8 space-y-4">

            {/* Test Card 1 */}
            <div className={`transition-all duration-300 rounded-xl p-6 flex flex-col md:flex-row md:items-center justify-between group ${isDark ? 'bg-surface-container hover:bg-surface-container-high' : 'bg-white shadow-sm hover:shadow-md border border-slate-100'}`}>
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-2">
                  <span className="px-2 py-0.5 bg-indigo-500/20 text-indigo-400 text-[10px] font-bold rounded uppercase tracking-wider">Advance</span>
                  <span className={`text-xs font-medium ${isDark ? 'text-on-surface-variant' : 'text-slate-500'}`}>Physics • Chemistry • Maths</span>
                </div>
                <h3 className={`text-xl font-bold font-headline mb-4 ${isDark ? 'text-on-surface' : 'text-slate-900'}`}>JEE Full Mock 00</h3>
                <div className={`flex items-center space-x-6 text-sm ${isDark ? 'text-on-surface-variant' : 'text-slate-500'}`}>
                  <div className="flex items-center">
                    <span className="material-symbols-outlined text-sm mr-2 opacity-60">schedule</span>
                    180 mins
                  </div>
                  <div className="flex items-center">
                    <span className="material-symbols-outlined text-sm mr-2 opacity-60">grade</span>
                    300 Marks
                  </div>
                  <div className="flex items-center">
                    <span className="material-symbols-outlined text-sm mr-2 text-error opacity-60">radio_button_checked</span>
                    Not Started
                  </div>
                </div>
              </div>
              <div className="mt-6 md:mt-0 md:ml-8">
                <button className="cursor-pointer w-full md:w-auto px-8 py-3 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 font-bold rounded-lg transition-all border border-indigo-500/20 hover:border-indigo-500/40">
                  Attempt Test
                </button>
              </div>
            </div>

            {/* Test Card 2 (In Progress) */}
            <div className={`transition-all duration-300 rounded-xl p-6 flex flex-col md:flex-row md:items-center justify-between group ${isDark ? 'bg-surface-container hover:bg-surface-container-high' : 'bg-white shadow-sm hover:shadow-md border border-slate-100'}`}>
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-2">
                  <span className="px-2 py-0.5 bg-tertiary-container/20 text-tertiary text-[10px] font-bold rounded uppercase tracking-wider">Intermediate</span>
                  <span className={`text-xs font-medium ${isDark ? 'text-on-surface-variant' : 'text-slate-500'}`}>Calculus Focus</span>
                </div>
                <h3 className={`text-xl font-bold font-headline mb-4 ${isDark ? 'text-on-surface' : 'text-slate-900'}`}>Mathematics Full Mock 04</h3>
                <div className={`flex items-center space-x-6 text-sm ${isDark ? 'text-on-surface-variant' : 'text-slate-500'}`}>
                  <div className="flex items-center">
                    <span className="material-symbols-outlined text-sm mr-2 opacity-60">schedule</span>
                    90 mins
                  </div>
                  <div className="flex items-center">
                    <span className="material-symbols-outlined text-sm mr-2 opacity-60">grade</span>
                    120 Marks
                  </div>
                  <div className="flex items-center">
                    <span className={`material-symbols-outlined text-sm mr-2 opacity-60 ${isDark ? 'text-indigo-400' : 'text-indigo-600'}`}>pending</span>
                    In Progress
                  </div>
                </div>
              </div>
              <div className="mt-6 md:mt-0 md:ml-8">
                <button className="cursor-pointer border-none w-full md:w-auto px-8 py-3 bg-indigo-500 text-on-primary font-bold rounded-lg transition-all shadow-lg shadow-indigo-500/10 hover:shadow-indigo-500/20">
                  Resume Test
                </button>
              </div>
            </div>

            {/* Test Card 3 */}
            <div className={`transition-all duration-300 rounded-xl p-6 flex flex-col md:flex-row md:items-center justify-between group opacity-70 grayscale-[0.5] hover:opacity-100 hover:grayscale-0 ${isDark ? 'bg-surface-container hover:bg-surface-container-high' : 'bg-white shadow-sm hover:shadow-md border border-slate-100'}`}>
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-2">
                  <span className="px-2 py-0.5 bg-slate-800 text-slate-400 text-[10px] font-bold rounded uppercase tracking-wider">Foundation</span>
                  <span className={`text-xs font-medium ${isDark ? 'text-on-surface-variant' : 'text-slate-500'}`}>General Aptitude</span>
                </div>
                <h3 className={`text-xl font-bold font-headline mb-4 ${isDark ? 'text-on-surface' : 'text-slate-900'}`}>Logical Reasoning Mock 02</h3>
                <div className={`flex items-center space-x-6 text-sm ${isDark ? 'text-on-surface-variant' : 'text-slate-500'}`}>
                  <div className="flex items-center">
                    <span className="material-symbols-outlined text-sm mr-2 opacity-60">schedule</span>
                    60 mins
                  </div>
                  <div className="flex items-center">
                    <span className="material-symbols-outlined text-sm mr-2 opacity-60">grade</span>
                    100 Marks
                  </div>
                  <div className="flex items-center">
                    <span className="material-symbols-outlined text-sm mr-2 text-error opacity-60">radio_button_checked</span>
                    Not Started
                  </div>
                </div>
              </div>
              <div className="mt-6 md:mt-0 md:ml-8">
                <button className="cursor-pointer w-full md:w-auto px-8 py-3 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 font-bold rounded-lg transition-all border border-indigo-500/20 hover:border-indigo-500/40">
                  Attempt Test
                </button>
              </div>
            </div>

            {/* Test Card 4 */}
            <div className={`transition-all duration-300 rounded-xl p-6 flex flex-col md:flex-row md:items-center justify-between group ${isDark ? 'bg-surface-container hover:bg-surface-container-high' : 'bg-white shadow-sm hover:shadow-md border border-slate-100'}`}>
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-2">
                  <span className="px-2 py-0.5 bg-indigo-500/20 text-indigo-400 text-[10px] font-bold rounded uppercase tracking-wider">Advance</span>
                  <span className={`text-xs font-medium ${isDark ? 'text-on-surface-variant' : 'text-slate-500'}`}>Modern Physics</span>
                </div>
                <h3 className={`text-xl font-bold font-headline mb-4 ${isDark ? 'text-on-surface' : 'text-slate-900'}`}>JEE Full Mock 02</h3>
                <div className={`flex items-center space-x-6 text-sm ${isDark ? 'text-on-surface-variant' : 'text-slate-500'}`}>
                  <div className="flex items-center">
                    <span className="material-symbols-outlined text-sm mr-2 opacity-60">schedule</span>
                    180 mins
                  </div>
                  <div className="flex items-center">
                    <span className="material-symbols-outlined text-sm mr-2 opacity-60">grade</span>
                    300 Marks
                  </div>
                  <div className="flex items-center">
                    <span className="material-symbols-outlined text-sm mr-2 text-error opacity-60">radio_button_checked</span>
                    Not Started
                  </div>
                </div>
              </div>
              <div className="mt-6 md:mt-0 md:ml-8">
                <button className="cursor-pointer w-full md:w-auto px-8 py-3 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 font-bold rounded-lg transition-all border border-indigo-500/20 hover:border-indigo-500/40">
                  Attempt Test
                </button>
              </div>
            </div>

          </div>

          {/* Sidebar Widgets (Quick Stats) */}
          <div className="col-span-12 lg:col-span-4 space-y-8">

            {/* Performance Card */}
            <div className={`p-8 rounded-xl transition-colors duration-300 ${isDark ? 'bg-surface-container' : 'bg-white shadow-sm border border-slate-100'}`}>
              <h4 className="text-sm font-bold uppercase tracking-widest text-indigo-400 mb-6">Series Overview</h4>
              <div className="space-y-6">
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className={isDark ? 'text-on-surface-variant' : 'text-slate-500'}>Total Progress</span>
                    <span className={`font-bold ${isDark ? 'text-on-surface' : 'text-slate-900'}`}>12 / 40</span>
                  </div>
                  <div className={`w-full h-1 rounded-full overflow-hidden ${isDark ? 'bg-surface-variant' : 'bg-slate-100'}`}>
                    <div className="h-full bg-indigo-500 rounded-full" style={{ width: '30%' }}></div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className={`p-4 rounded-lg transition-colors ${isDark ? 'bg-surface-container-low' : 'bg-slate-50'}`}>
                    <p className="text-[10px] font-bold uppercase text-slate-500 mb-1">Avg Score</p>
                    <p className={`text-xl font-headline font-bold ${isDark ? 'text-on-surface' : 'text-slate-900'}`}>78%</p>
                  </div>
                  <div className={`p-4 rounded-lg transition-colors ${isDark ? 'bg-surface-container-low' : 'bg-slate-50'}`}>
                    <p className="text-[10px] font-bold uppercase text-slate-500 mb-1">Rank</p>
                    <p className={`text-xl font-headline font-bold ${isDark ? 'text-on-surface' : 'text-slate-900'}`}>#242</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Learning Path */}
            <div className={`p-8 rounded-xl relative overflow-hidden transition-colors duration-300 ${isDark ? 'bg-surface-container-low' : 'bg-slate-50 border border-slate-200/50'}`}>
              <div className="absolute top-0 right-0 p-4 opacity-10">
                <span className={`material-symbols-outlined text-6xl ${isDark ? '' : 'text-slate-400'}`}>school</span>
              </div>
              <h4 className="text-sm font-bold uppercase tracking-widest text-slate-400 mb-6">Recommended Next</h4>
              <div className="space-y-4">
                <div className="flex items-start">
                  <div className="w-8 h-8 rounded bg-indigo-500/20 flex items-center justify-center mr-4 mt-1">
                    <span className="material-symbols-outlined text-sm text-indigo-400">lightbulb</span>
                  </div>
                  <div>
                    <p className={`text-sm font-bold ${isDark ? 'text-on-surface' : 'text-slate-900'}`}>Focus: Organic Chemistry</p>
                    <p className={`text-xs mt-1 ${isDark ? 'text-on-surface-variant' : 'text-slate-500'}`}>You missed 4 questions on Hydrocarbons in Mock 01.</p>
                  </div>
                </div>
                <button className={`cursor-pointer border-none w-full py-2.5 mt-4 text-xs font-bold rounded uppercase tracking-widest transition-all ${isDark ? 'bg-surface-variant text-on-surface-variant hover:bg-indigo-500 hover:text-on-primary' : 'bg-slate-200 text-slate-600 hover:bg-slate-900 hover:text-white'}`}>
                  View Study Plan
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
        </div>
      </main>
    </div>
  );
}
