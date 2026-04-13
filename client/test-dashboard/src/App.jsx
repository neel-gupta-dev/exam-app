import { Sidebar, TopNav, TestCard, StatsPanel, CategoryTabs } from './components';

export default function App() {
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
      buttonVariant: 'outline'
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
      buttonVariant: 'primary'
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
      buttonVariant: 'outline'
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
      buttonVariant: 'outline'
    },
  ];

  return (
    <div className="app-root dark bg-surface text-on-surface">
      <Sidebar />
      <TopNav />
      
      {/* Main Content Canvas */}
      <main className="ml-64 pt-24 px-10 pb-20 min-h-screen">
        {/* Header Section */}
        <header className="mb-12">
          <h2 className="text-4xl font-extrabold font-headline tracking-tight text-on-background">Test Series</h2>
          <p className="text-on-surface-variant mt-2 text-lg font-medium opacity-70">Level up your exam readiness.</p>
        </header>
        
        {/* Category Tabs */}
        <CategoryTabs />
        
        {/* Asymmetric Layout: Test Grid and Quick Stats */}
        <div className="grid grid-cols-12 gap-10">
          {/* Test List (The Core) */}
          <div className="col-span-12 lg:col-span-8 space-y-4">
            {testData.map((test, index) => (
              <TestCard
                key={test.title}
                {...test}
              />
            ))}
          </div>
          
          {/* Sidebar Widgets (Quick Stats) */}
          <StatsPanel />
        </div>
      </main>
    </div>
  );
}
