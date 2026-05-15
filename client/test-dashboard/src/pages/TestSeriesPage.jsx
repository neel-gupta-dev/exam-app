import React, { useState } from 'react';
import CategoryTabs from '../components/CategoryTabs';
import TestCard from '../components/TestCard';
import StatsPanel from '../components/StatsPanel';

export default function TestSeriesPage({ tests = [], results = [], onSelectTest = () => {}, onNavigate = () => {} }) {
  const [activeCategory, setActiveCategory] = useState('full');

  const matchesCategory = (test) => {
    const categoryField = (test.category || '').toLowerCase();
    const titleText = (test.title || '').toLowerCase();
    const combined = `${categoryField} ${titleText}`;

    if (activeCategory === 'neet') {
      return categoryField.includes('neet') || titleText.includes('neet');
    }

    if (activeCategory === 'full') {
      // Show everything that is NOT NEET, NOT part, NOT chapter, NOT pyq
      // OR explicitly marked as JEE Advance/Main
      if (categoryField.includes('neet')) return false;
      return combined.includes('full')
        || (!combined.includes('part')
          && !combined.includes('chapter')
          && !combined.includes('pyq')
          && !combined.includes('previous year'));
    }

    if (activeCategory === 'part') return combined.includes('part');
    if (activeCategory === 'chapter') return combined.includes('chapter');
    if (activeCategory === 'pyq') return combined.includes('pyq') || combined.includes('previous year');
    return true;
  };
  const filteredTests = tests.filter(matchesCategory);

  return (
    <>
      <header className="mb-12">
        <h2 className="text-4xl font-extrabold font-headline tracking-tight text-on-background">Test Series</h2>
        <p className="text-on-surface-variant mt-2 text-lg font-medium opacity-70">Level up your exam readiness.</p>
      </header>
      
      <CategoryTabs activeCategory={activeCategory} onChange={setActiveCategory} />
      
      <div className="grid grid-cols-12 gap-10">
        <div className="col-span-12 lg:col-span-8 space-y-4">
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
            <div className="bg-surface-container rounded-xl p-8 text-center text-on-surface-variant">
              No tests are available for this category.
            </div>
          )}
        </div>
        <StatsPanel tests={tests} results={results} onNavigate={onNavigate} />
      </div>
    </>
  );
}
