import React, { useState } from 'react';

export const CategoryTabs = () => {
  const [activeTab, setActiveTab] = useState('full');

  const tabs = [
    { id: 'full', label: 'Full Tests' },
    { id: 'part', label: 'Part Tests' },
    { id: 'chapter', label: 'Chapter-wise Tests' },
    { id: 'previous', label: 'Previous Year Papers' },
  ];

  return (
    <div className="flex items-center gap-3 mb-10 overflow-x-auto pb-2 scrollbar-hide">
      {tabs.map(tab => (
        <button
          key={tab.id}
          onClick={() => setActiveTab(tab.id)}
          className={`px-6 py-2.5 rounded-full text-sm font-semibold whitespace-nowrap transition-all ${
              activeTab === tab.id
                  ? 'bg-surface-container-low text-primary border border-primary-container'
                  : 'text-on-surface-variant hover:text-on-surface'
            }`}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
};
