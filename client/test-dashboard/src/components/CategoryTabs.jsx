import React from 'react';

export default function CategoryTabs() {
  return (
    <div className="flex items-center space-x-1 mb-10 overflow-x-auto pb-2 scrollbar-hide">
      <button className="cursor-pointer px-6 py-2.5 rounded-full text-sm font-semibold whitespace-nowrap bg-indigo-500/10 text-indigo-400 border border-indigo-500/30">
        Full Tests
      </button>
      <button className="cursor-pointer px-6 py-2.5 rounded-full text-sm font-medium whitespace-nowrap text-on-surface-variant hover:text-on-surface transition-colors border-none bg-transparent">
        Part Tests
      </button>
      <button className="cursor-pointer px-6 py-2.5 rounded-full text-sm font-medium whitespace-nowrap text-on-surface-variant hover:text-on-surface transition-colors border-none bg-transparent">
        Chapter-wise Tests
      </button>
      <button className="cursor-pointer px-6 py-2.5 rounded-full text-sm font-medium whitespace-nowrap text-on-surface-variant hover:text-on-surface transition-colors border-none bg-transparent">
        Previous Year Papers
      </button>
    </div>
  );
}
