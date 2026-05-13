import React from 'react';

export default function CategoryTabs({ activeCategory = 'full', onChange = () => {} }) {
  const tabs = [
    { id: 'full', label: 'Full Tests' },
    { id: 'part', label: 'Part Tests' },
    { id: 'chapter', label: 'Chapter-wise Tests' },
    { id: 'pyq', label: 'Previous Year Papers' },
  ];

  return (
    <div className="flex items-center space-x-1 mb-10 overflow-x-auto pb-2 scrollbar-hide">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onChange(tab.id)}
          className={`cursor-pointer px-6 py-2.5 rounded-full text-sm whitespace-nowrap transition-colors ${
            activeCategory === tab.id
              ? 'font-semibold bg-indigo-500/10 text-indigo-400 border border-indigo-500/30'
              : 'font-medium text-on-surface-variant hover:text-on-surface border-none bg-transparent'
          }`}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
