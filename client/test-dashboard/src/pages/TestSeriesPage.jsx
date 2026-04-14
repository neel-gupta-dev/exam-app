import React from 'react';
import CategoryTabs from '../components/CategoryTabs';
import TestCard from '../components/TestCard';
import StatsPanel from '../components/StatsPanel';

export default function TestSeriesPage() {
  const testData = [
    {
      badge: 'Advance',
      subject: 'Physics • Chemistry • Maths',
      title: 'JEE Full Mock 01',
      duration: 180,
      marks: 300,
      status: 'Not Started',
      statusIcon: 'radio_button_checked',
      buttonText: 'Attempt Test',
      state: 'default'
    },
    {
      badge: 'Intermediate',
      subject: 'Calculus Focus',
      title: 'Mathematics Full Mock 04',
      duration: 90,
      marks: 120,
      status: 'In Progress',
      statusIcon: 'pending',
      buttonText: 'Resume Test',
      state: 'in-progress'
    },
    {
      badge: 'Foundation',
      subject: 'General Aptitude',
      title: 'Logical Reasoning Mock 02',
      duration: 60,
      marks: 100,
      status: 'Not Started',
      statusIcon: 'radio_button_checked',
      buttonText: 'Attempt Test',
      state: 'locked'
    },
    {
      badge: 'Advance',
      subject: 'Modern Physics',
      title: 'JEE Full Mock 02',
      duration: 180,
      marks: 300,
      status: 'Not Started',
      statusIcon: 'radio_button_checked',
      buttonText: 'Attempt Test',
      state: 'default'
    },
  ];

  return (
    <>
      <header className="mb-12">
        <h2 className="text-4xl font-extrabold font-headline tracking-tight text-on-background">Test Series</h2>
        <p className="text-on-surface-variant mt-2 text-lg font-medium opacity-70">Level up your exam readiness.</p>
      </header>
      
      <CategoryTabs />
      
      <div className="grid grid-cols-12 gap-10">
        <div className="col-span-12 lg:col-span-8 space-y-4">
          {testData.map((test, index) => (
            <TestCard key={index} {...test} />
          ))}
        </div>
        <StatsPanel />
      </div>
    </>
  );
}
