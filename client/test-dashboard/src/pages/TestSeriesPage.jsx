import React, { useState } from 'react';
import CategoryTabs from '../components/CategoryTabs';
import TestCard from '../components/TestCard';
import StatsPanel from '../components/StatsPanel';

export default function TestSeriesPage({ tests = [], results = [], onSelectTest = () => {}, onNavigate = () => {} }) {
  const [activeCategory, setActiveCategory] = useState('full');

  const matchesCategory = (test) => {
    const category = (test.category || '').toLowerCase();
    const title = (test.title || '').toLowerCase();
    const combined = `${category} ${title}`;

    if (activeCategory === 'neet') return category.includes('neet') || title.includes('neet');
    if (activeCategory === 'full') {
      if (category.includes('neet')) return false;
      return combined.includes('full')
        || (!combined.includes('part') && !combined.includes('chapter') && !combined.includes('pyq') && !combined.includes('previous year'));
    }
    if (activeCategory === 'part') return combined.includes('part');
    if (activeCategory === 'chapter') return combined.includes('chapter');
    if (activeCategory === 'pyq') return combined.includes('pyq') || combined.includes('previous year');
    return true;
  };

  const filteredTests = tests.filter(matchesCategory);

  return (
    <div className="mx-auto max-w-7xl space-y-7">
      <section className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm md:p-8">
        <p className="text-xs font-bold uppercase tracking-[0.22em] text-slate-400">Assessment Library</p>
        <h1 className="mt-3 text-3xl font-black tracking-tight text-slate-950 md:text-5xl">Test Series</h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-500 md:text-base">Level up your exam readiness with focused mocks and analytics.</p>
      </section>

      <CategoryTabs activeCategory={activeCategory} onChange={setActiveCategory} />

      <div className="grid gap-6 xl:grid-cols-[1fr_360px]">
        <section className="space-y-4">
          {filteredTests.map((test) => (
            <TestCard
              key={test._id}
              badge={test.category || 'General'}
              subject={test.sections?.map((section) => section.name).join(' • ') || 'Full Exam'}
              title={test.title}
              duration={test.durationMinutes}
              marks={test.totalMarks}
              status={test.status || 'Not Started'}
              statusIcon={test.state === 'in-progress' ? 'pending' : test.state === 'completed' ? 'check_circle' : 'radio_button_checked'}
              buttonText={test.state === 'in-progress' ? 'Resume Test' : test.state === 'completed' ? 'Attempt Again' : 'Attempt Test'}
              state={test.state || 'default'}
              onAction={() => onSelectTest(test)}
            />
          ))}
          {filteredTests.length === 0 && (
            <div className="rounded-3xl border border-slate-200 bg-white p-10 text-center text-sm font-semibold text-slate-500 shadow-sm">
              No tests are available for this category.
            </div>
          )}
        </section>
        <StatsPanel tests={tests} results={results} onNavigate={onNavigate} />
      </div>
    </div>
  );
}
