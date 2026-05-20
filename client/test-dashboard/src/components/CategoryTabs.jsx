import React from 'react';

export default function CategoryTabs({ activeCategory = 'full', onChange = () => {} }) {
  const tabs = [
    { id: 'full', label: 'Full Tests' },
    { id: 'neet', label: 'NEET' },
    { id: 'part', label: 'Part Tests' },
    { id: 'chapter', label: 'Chapter-wise' },
    { id: 'pyq', label: 'PYPs' },
  ];

  return (
    <div className="mb-7 flex gap-2 overflow-x-auto pb-1">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onChange(tab.id)}
          className={`whitespace-nowrap rounded-2xl border px-4 py-2 text-sm font-bold transition ${
            activeCategory === tab.id
              ? 'border-slate-950 bg-slate-950 text-white'
              : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
          }`}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
