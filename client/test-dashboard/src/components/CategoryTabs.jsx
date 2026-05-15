import React from 'react';

export default function CategoryTabs({ activeCategory = 'full', onChange = () => {} }) {
  const tabs = [
    { id: 'full', label: 'Full JEE', color: 'indigo' },
    { id: 'neet', label: 'NEET', color: 'emerald' },
    { id: 'part', label: 'Part Tests', color: 'slate' },
    { id: 'chapter', label: 'Chapter-wise', color: 'slate' },
    { id: 'pyq', label: 'PYPs', color: 'slate' },
  ];

  return (
    <div className="flex items-center space-x-1 mb-10 overflow-x-auto pb-2 scrollbar-hide">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onChange(tab.id)}
          className={`cursor-pointer px-6 py-2.5 rounded-full text-sm font-bold whitespace-nowrap transition-all border ${
            activeCategory === tab.id
              ? tab.color === 'emerald' 
                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30 shadow-lg shadow-emerald-500/5'
                : 'bg-indigo-500/10 text-indigo-400 border-indigo-500/30 shadow-lg shadow-indigo-500/5'
              : 'text-slate-500 hover:text-slate-200 border-transparent bg-transparent'
          }`}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
