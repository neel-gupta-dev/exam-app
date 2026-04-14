import React from 'react';

export default function Sidebar() {
  return (
    <aside className="fixed left-0 top-0 h-screen w-64 bg-slate-900 flex flex-col py-6 px-4 z-50">
      <div className="mb-10 px-2">
        <h1 className="text-xl font-bold tracking-tight text-indigo-500 font-headline">The Scholar</h1>
        <p className="text-[10px] uppercase tracking-[0.2em] text-slate-500 font-medium mt-1">Productivity Suite</p>
      </div>

      <nav className="flex-1 space-y-1">
        <a className="flex items-center px-3 py-3 text-slate-400 hover:text-slate-200 hover:bg-slate-800/30 transition-colors duration-200 rounded-lg group" href="#">
          <span className="material-symbols-outlined mr-3">dashboard</span>
          <span className="text-sm font-medium">Dashboard</span>
        </a>
        <a className="flex items-center px-3 py-3 text-slate-400 hover:text-slate-200 hover:bg-slate-800/30 transition-colors duration-200 rounded-lg group" href="#">
          <span className="material-symbols-outlined mr-3">assignment</span>
          <span className="text-sm font-medium">Exams</span>
        </a>
        {/* Active Navigation Logic: Test Series matches current screen */}
        <a className="flex items-center px-3 py-3 border-l-2 border-indigo-500 bg-slate-800/50 text-indigo-400 font-semibold transition-colors duration-200 group" href="#">
          <span className="material-symbols-outlined mr-3">layers</span>
          <span className="text-sm">Test Series</span>
        </a>
        <a className="flex items-center px-3 py-3 text-slate-400 hover:text-slate-200 hover:bg-slate-800/30 transition-colors duration-200 rounded-lg group" href="#">
          <span className="material-symbols-outlined mr-3">insights</span>
          <span className="text-sm font-medium">Analytics</span>
        </a>
        <a className="flex items-center px-3 py-3 text-slate-400 hover:text-slate-200 hover:bg-slate-800/30 transition-colors duration-200 rounded-lg group" href="#">
          <span className="material-symbols-outlined mr-3">menu_book</span>
          <span className="text-sm font-medium">Resources</span>
        </a>
      </nav>

      <div className="mt-auto pt-6 border-t border-slate-800/50 space-y-1">
        <a className="flex items-center px-3 py-3 text-slate-400 hover:text-slate-200 hover:bg-slate-800/30 transition-colors duration-200 rounded-lg group" href="#">
          <span className="material-symbols-outlined mr-3">settings</span>
          <span className="text-sm font-medium">Settings</span>
        </a>
        <a className="flex items-center px-3 py-3 text-slate-400 hover:text-slate-200 hover:bg-slate-800/30 transition-colors duration-200 rounded-lg group" href="#">
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
            <p className="text-xs font-semibold text-slate-200 truncate">Alex Sterling</p>
            <p className="text-[10px] text-slate-500 truncate">Pro Member</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
