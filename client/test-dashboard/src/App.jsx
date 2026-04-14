import React, { useState, useEffect } from 'react';
import LoginPage from './LoginPage';
import ForcePasswordChange from './ForcePasswordChange';

export default function App() {
  const [isDark, setIsDark] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('theme');
      return saved ? saved === 'dark' : true; // Default to dark as requested
    }
    return true;
  });

  const [view, setView] = useState('dashboard'); // New state for navigation
  const [selectedTest, setSelectedTest] = useState(null); // Store active test data

  // Auth state
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('test_user');
      return saved ? JSON.parse(saved) : null;
    } catch { return null; }
  });

  const handleLogin = (userData) => {
    localStorage.setItem('test_user', JSON.stringify(userData));
    localStorage.setItem('test_token', userData.token);
    setUser(userData);
  };

  const handleLogout = () => {
    localStorage.removeItem('test_user');
    localStorage.removeItem('test_token');
    setUser(null);
    setView('dashboard');
  };

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDark]);

  const toggleTheme = () => setIsDark(!isDark);

  if (!user) {
    return <LoginPage isDark={isDark} onLogin={handleLogin} />;
  }

  return (
    <div className={`min-h-screen transition-colors duration-300 ${isDark ? 'bg-background text-on-surface' : 'bg-slate-50 text-slate-900'}`}>
      {/* SideNavBar */}
      <aside className={`fixed left-0 top-0 h-screen w-64 flex flex-col py-6 px-4 z-50 transition-colors duration-300 ${isDark ? 'bg-slate-900' : 'bg-white shadow-xl'}`}>
        <div className="mb-10 px-2">
          <h1 className="text-xl font-bold tracking-tight text-indigo-500 font-headline">The Scholar</h1>
          <p className="text-[10px] uppercase tracking-[0.2em] text-slate-500 font-medium mt-1">Productivity Suite</p>
        </div>

        <nav className="flex-1 space-y-1">
          <a className={`flex items-center px-3 py-3 transition-colors duration-200 rounded-lg group ${isDark ? 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/30' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'}`} href="#">
            <span className="material-symbols-outlined mr-3">dashboard</span>
            <span className="text-sm font-medium">Dashboard</span>
          </a>
          <a className={`flex items-center px-3 py-3 transition-colors duration-200 rounded-lg group ${isDark ? 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/30' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'}`} href="#">
            <span className="material-symbols-outlined mr-3">assignment</span>
            <span className="text-sm font-medium">Exams</span>
          </a>
          {/* Active Navigation Logic: Test Series matches current screen */}
          <a className={`flex items-center px-3 py-3 border-l-2 border-indigo-500 font-semibold transition-colors duration-200 group ${isDark ? 'bg-slate-800/50 text-indigo-400' : 'bg-indigo-50 text-indigo-600'}`} href="#">
            <span className="material-symbols-outlined mr-3">layers</span>
            <span className="text-sm">Test Series</span>
          </a>
          <a className={`flex items-center px-3 py-3 transition-colors duration-200 rounded-lg group ${isDark ? 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/30' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'}`} href="#">
            <span className="material-symbols-outlined mr-3">insights</span>
            <span className="text-sm font-medium">Analytics</span>
          </a>
          <a className={`flex items-center px-3 py-3 transition-colors duration-200 rounded-lg group ${isDark ? 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/30' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'}`} href="#">
            <span className="material-symbols-outlined mr-3">menu_book</span>
            <span className="text-sm font-medium">Resources</span>
          </a>
        </nav>

        <div className={`mt-auto pt-6 border-t space-y-1 ${isDark ? 'border-slate-800/50' : 'border-slate-200'}`}>
          <a className={`flex items-center px-3 py-3 transition-colors duration-200 rounded-lg group ${isDark ? 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/30' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'}`} href="#">
            <span className="material-symbols-outlined mr-3">settings</span>
            <span className="text-sm font-medium">Settings</span>
          </a>
          <a className={`flex items-center px-3 py-3 transition-colors duration-200 rounded-lg group ${isDark ? 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/30' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'}`} href="#">
            <span className="material-symbols-outlined mr-3">help_outline</span>
            <span className="text-sm font-medium">Support</span>
          </a>
          <div className="flex items-center justify-between mt-6 px-3">
            <div className="flex items-center overflow-hidden">
              <div className="w-8 h-8 flex-shrink-0 rounded-full bg-indigo-500/20 text-indigo-500 flex items-center justify-center font-bold text-sm">
                {user.name?.charAt(0).toUpperCase() || 'S'}
              </div>
              <div className="ml-3 overflow-hidden pr-2">
                <p className={`text-xs font-semibold truncate ${isDark ? 'text-slate-200' : 'text-slate-900'}`}>{user.name}</p>
                <p className="text-[10px] text-slate-500 truncate">{user.authMethod === 'b2b' ? 'Coaching Scholar' : 'Pro Member'}</p>
              </div>
            </div>
            <button 
              onClick={handleLogout}
              title="Logout"
              className={`p-1.5 rounded-lg flex-shrink-0 transition-colors ${isDark ? 'text-slate-400 hover:text-white hover:bg-slate-800' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-200'}`}
            >
              <span className="material-symbols-outlined text-lg">logout</span>
            </button>
          </div>
        </div>
      </aside>

      {/* TopNavBar */}
      <header className={`fixed top-0 right-0 w-[calc(100%-16rem)] h-16 backdrop-blur-xl z-40 flex justify-between items-center px-8 transition-colors duration-300 ${isDark ? 'bg-slate-950/80 shadow-[0_40px_40px_-15px_rgba(0,0,0,0.06)]' : 'bg-white/80 shadow-md'}`}>
        <div className="flex items-center w-1/2">
          <div className="relative w-full max-w-md">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-lg">search</span>
            <input
              className={`w-full border-none rounded-xl py-2 pl-10 pr-4 text-sm focus:ring-1 focus:ring-indigo-500/50 transition-all outline-none ${isDark ? 'bg-surface-bright text-on-surface placeholder:text-slate-600' : 'bg-slate-100 text-slate-900 placeholder:text-slate-400'}`}
              placeholder="Search tests, topics, or results..."
              type="text"
            />
            <div className={`absolute right-3 top-1/2 -translate-y-1/2 px-1.5 py-0.5 rounded text-[10px] font-bold ${isDark ? 'bg-secondary-container text-on-surface-variant' : 'bg-slate-200 text-slate-500'}`}>⌘ K</div>
          </div>
        </div>
        <div className="flex items-center space-x-4">
          <button className={`p-2 rounded-lg transition-colors cursor-pointer border-none bg-transparent ${isDark ? 'text-slate-400 hover:bg-slate-800/50' : 'text-slate-600 hover:bg-slate-100'}`}>
            <span className="material-symbols-outlined">notifications</span>
          </button>
          <button
            onClick={toggleTheme}
            className={`p-2 rounded-lg transition-colors cursor-pointer border-none bg-transparent ${isDark ? 'text-slate-400 hover:bg-slate-800/50' : 'text-slate-600 hover:bg-slate-100'}`}
          >
            <span className="material-symbols-outlined">{isDark ? 'dark_mode' : 'light_mode'}</span>
          </button>
          <div className={`h-8 w-px mx-2 ${isDark ? 'bg-slate-800' : 'bg-slate-200'}`}></div>
          <div className="text-right mr-3 hidden sm:block">
            <p className={`text-xs font-bold leading-none uppercase tracking-wider ${isDark ? 'text-on-surface' : 'text-slate-900'}`}>The Focused Scholar</p>
          </div>
        </div>
      </header>

      {/* Main Content Canvas */}
      <main className="ml-64 pt-24 px-10 pb-20 min-h-screen">
        
        {view === 'dashboard' ? (
          <>
            {/* Header Section */}
            <header className="mb-12">
              <h2 className={`text-4xl font-extrabold font-headline tracking-tight ${isDark ? 'text-on-background' : 'text-slate-900'}`}>Test Series</h2>
              <p className={`mt-2 text-lg font-medium opacity-70 ${isDark ? 'text-on-surface-variant' : 'text-slate-600'}`}>Level up your exam readiness.</p>
            </header>

            {/* Category Tabs */}
            <div className="flex items-center space-x-1 mb-10 overflow-x-auto pb-2 scrollbar-hide">
              <button className="cursor-pointer px-6 py-2.5 rounded-full text-sm font-semibold whitespace-nowrap bg-indigo-500/10 text-indigo-400 border border-indigo-500/30">
                Full Tests
              </button>
              {[
                { id: 'part', label: 'Part Tests' },
                { id: 'chapter', label: 'Chapter-wise Tests' },
                { id: 'pyq', label: 'Previous Year Papers' },
              ].map((tab) => (
                <button key={tab.id} className={`cursor-pointer px-6 py-2.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors bg-transparent border-none ${isDark ? 'text-on-surface-variant hover:text-on-surface' : 'text-slate-500 hover:text-slate-900'}`}>
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Asymmetric Layout: Test Grid and Quick Stats */}
            <div className="grid grid-cols-12 gap-10">
              {/* Test List (The Core) */}
              <div className="col-span-12 lg:col-span-8 space-y-4">
                {[
                  { id: 1, badge: 'Advance', subject: 'Physics • Chemistry • Maths', title: 'JEE Full Mock 01', duration: '180 mins', marks: '300 Marks', status: 'Not Started', icon: 'radio_button_checked', statusColor: 'text-error', state: 'default', syllabus: ['Mechanics & Heat', 'Inorganic Chemistry', 'Algebra & Vector'] },
                  { id: 2, badge: 'Intermediate', subject: 'Calculus Focus', title: 'Mathematics Full Mock 04', duration: '90 mins', marks: '120 Marks', status: 'In Progress', icon: 'pending', statusColor: 'text-indigo-400', state: 'in-progress', syllabus: ['Calculus', 'Limits & Continuity', 'Integration'] },
                  { id: 3, badge: 'Foundation', subject: 'General Aptitude', title: 'Logical Reasoning Mock 02', duration: '60 mins', marks: '100 Marks', status: 'Not Started', icon: 'radio_button_checked', statusColor: 'text-error', state: 'locked', syllabus: ['Puzzles', 'Number Series', 'Blood Relations'] },
                  { id: 4, badge: 'Advance', subject: 'Modern Physics', title: 'JEE Full Mock 02', duration: '180 mins', marks: '300 Marks', status: 'Not Started', icon: 'radio_button_checked', statusColor: 'text-error', state: 'default', syllabus: ['Atoms & Nuclei', 'Dual Nature of Matter', 'Semiconductors'] },
                ].map((test) => (
                  <div key={test.id} className={`transition-all duration-300 rounded-xl p-6 flex flex-col md:flex-row md:items-center justify-between group ${test.state === 'locked' ? 'opacity-70 grayscale-[0.5] hover:opacity-100 hover:grayscale-0' : ''} ${isDark ? 'bg-surface-container hover:bg-surface-container-high' : 'bg-white shadow-sm hover:shadow-md border border-slate-100'}`}>
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <span className={`px-2 py-0.5 text-[10px] font-bold rounded uppercase tracking-wider ${test.state === 'in-progress' ? 'bg-tertiary-container/20 text-tertiary' : test.state === 'locked' ? 'bg-slate-800 text-slate-400' : 'bg-indigo-500/20 text-indigo-400'}`}>
                          {test.badge}
                        </span>
                        <span className={`text-xs font-medium ${isDark ? 'text-on-surface-variant' : 'text-slate-500'}`}>{test.subject}</span>
                      </div>
                      <h3 className={`text-xl font-bold font-headline mb-4 ${isDark ? 'text-on-surface' : 'text-slate-900'}`}>{test.title}</h3>
                      <div className={`flex items-center space-x-6 text-sm ${isDark ? 'text-on-surface-variant' : 'text-slate-500'}`}>
                        <div className="flex items-center">
                          <span className="material-symbols-outlined text-sm mr-2 opacity-60">schedule</span>
                          {test.duration}
                        </div>
                        <div className="flex items-center">
                          <span className="material-symbols-outlined text-sm mr-2 opacity-60">grade</span>
                          {test.marks}
                        </div>
                        <div className="flex items-center">
                          <span className={`material-symbols-outlined text-sm mr-2 opacity-60 ${test.statusColor}`}>{test.icon}</span>
                          {test.status}
                        </div>
                      </div>
                    </div>
                    <div className="mt-6 md:mt-0 md:ml-8">
                      <button 
                        onClick={() => {
                          if (test.state !== 'locked') {
                            setSelectedTest(test);
                            setView('instructions');
                          }
                        }}
                        className={`cursor-pointer w-full md:w-auto px-8 py-3 font-bold rounded-lg transition-all ${test.state === 'in-progress' ? 'bg-indigo-500 text-on-primary shadow-lg shadow-indigo-500/10 hover:shadow-indigo-500/20' : test.state === 'locked' ? 'bg-slate-700 text-slate-400 cursor-not-allowed' : 'bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 border border-indigo-500/20 hover:border-indigo-500/40'}`}
                      >
                        {test.state === 'in-progress' ? 'Resume Test' : 'Attempt Test'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Sidebar Widgets (Quick Stats) */}
              <div className="col-span-12 lg:col-span-4 space-y-8">
                {/* Performance Card */}
                <div className={`p-8 rounded-xl transition-colors duration-300 ${isDark ? 'bg-surface-container' : 'bg-white shadow-sm border border-slate-100'}`}>
                  <h4 className="text-sm font-bold uppercase tracking-widest text-indigo-400 mb-6">Series Overview</h4>
                  <div className="space-y-6">
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span className={isDark ? 'text-on-surface-variant' : 'text-slate-500'}>Total Progress</span>
                        <span className={`font-bold ${isDark ? 'text-on-surface' : 'text-slate-900'}`}>12 / 40</span>
                      </div>
                      <div className={`w-full h-1 rounded-full overflow-hidden ${isDark ? 'bg-surface-variant' : 'bg-slate-100'}`}>
                        <div className="h-full bg-indigo-500 rounded-full" style={{ width: '30%' }}></div>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className={`p-4 rounded-lg transition-colors ${isDark ? 'bg-surface-container-low' : 'bg-slate-50'}`}>
                        <p className="text-[10px] font-bold uppercase text-slate-500 mb-1">Avg Score</p>
                        <p className={`text-xl font-headline font-bold ${isDark ? 'text-on-surface' : 'text-slate-900'}`}>78%</p>
                      </div>
                      <div className={`p-4 rounded-lg transition-colors ${isDark ? 'bg-surface-container-low' : 'bg-slate-50'}`}>
                        <p className="text-[10px] font-bold uppercase text-slate-500 mb-1">Rank</p>
                        <p className={`text-xl font-headline font-bold ${isDark ? 'text-on-surface' : 'text-slate-900'}`}>#242</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Learning Path */}
                <div className={`p-8 rounded-xl relative overflow-hidden transition-colors duration-300 ${isDark ? 'bg-surface-container-low' : 'bg-slate-50 border border-slate-200/50'}`}>
                  <div className="absolute top-0 right-0 p-4 opacity-10">
                    <span className={`material-symbols-outlined text-6xl ${isDark ? '' : 'text-slate-400'}`}>school</span>
                  </div>
                  <h4 className="text-sm font-bold uppercase tracking-widest text-slate-400 mb-6">Recommended Next</h4>
                  <div className="space-y-4">
                    <div className="flex items-start">
                      <div className="w-8 h-8 rounded bg-indigo-500/20 flex items-center justify-center mr-4 mt-1">
                        <span className="material-symbols-outlined text-sm text-indigo-400">lightbulb</span>
                      </div>
                      <div>
                        <p className={`text-sm font-bold ${isDark ? 'text-on-surface' : 'text-slate-900'}`}>Focus: Organic Chemistry</p>
                        <p className={`text-xs mt-1 ${isDark ? 'text-on-surface-variant' : 'text-slate-500'}`}>You missed 4 questions on Hydrocarbons in Mock 01.</p>
                      </div>
                    </div>
                    <button className={`cursor-pointer border-none w-full py-2.5 mt-4 text-xs font-bold rounded uppercase tracking-widest transition-all ${isDark ? 'bg-surface-variant text-on-surface-variant hover:bg-indigo-500 hover:text-on-primary' : 'bg-slate-200 text-slate-600 hover:bg-slate-900 hover:text-white'}`}>
                      View Study Plan
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="max-w-4xl mx-auto">
            {/* Breadcrumb / Back */}
            <button 
              onClick={() => setView('dashboard')}
              className={`flex items-center mb-8 text-sm font-medium transition-colors cursor-pointer border-none bg-transparent ${isDark ? 'text-slate-400 hover:text-indigo-400' : 'text-slate-500 hover:text-indigo-600'}`}
            >
              <span className="material-symbols-outlined mr-2 text-lg">arrow_back</span>
              Back to Test Series
            </button>

            {/* Instruction Hero */}
            <div className={`rounded-2xl p-8 mb-8 relative overflow-hidden transition-all duration-300 ${isDark ? 'bg-surface-container' : 'bg-white shadow-xl border border-slate-100'}`}>
              <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 relative z-10">
                <div>
                  <div className="flex items-center space-x-3 mb-4">
                    <span className="px-3 py-1 bg-indigo-500/10 text-indigo-400 text-xs font-bold rounded-full uppercase tracking-widest border border-indigo-500/20">
                      {selectedTest?.badge || 'Advance'}
                    </span>
                    <span className={`text-sm font-medium ${isDark ? 'text-on-surface-variant' : 'text-slate-500'}`}>{selectedTest?.subject}</span>
                  </div>
                  <h1 className={`text-4xl font-extrabold font-headline tracking-tight ${isDark ? 'text-on-background' : 'text-slate-900'}`}>{selectedTest?.title}</h1>
                </div>
                <div className="flex space-x-4">
                  <div className={`text-center px-6 py-3 rounded-xl ${isDark ? 'bg-surface-container-low' : 'bg-slate-50'}`}>
                    <p className="text-[10px] font-bold uppercase text-slate-500 mb-1">Duration</p>
                    <p className={`text-lg font-bold font-headline ${isDark ? 'text-on-surface' : 'text-slate-900'}`}>{selectedTest?.duration}</p>
                  </div>
                  <div className={`text-center px-6 py-3 rounded-xl ${isDark ? 'bg-surface-container-low' : 'bg-slate-50'}`}>
                    <p className="text-[10px] font-bold uppercase text-slate-500 mb-1">Total Marks</p>
                    <p className={`text-lg font-bold font-headline ${isDark ? 'text-on-surface' : 'text-slate-900'}`}>{selectedTest?.marks}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Instructions Main Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="md:col-span-2 space-y-8">
                {/* Syllabus Section */}
                <section className={`p-8 rounded-2xl transition-all duration-300 ${isDark ? 'bg-surface-container' : 'bg-white shadow-lg border border-slate-100'}`}>
                  <h3 className={`text-xl font-bold font-headline mb-6 flex items-center ${isDark ? 'text-indigo-400' : 'text-indigo-600'}`}>
                    <span className="material-symbols-outlined mr-3">menu_book</span>
                    Test Syllabus
                  </h3>
                  <ul className="space-y-4">
                    {selectedTest?.syllabus?.map((item, idx) => (
                      <li key={idx} className="flex items-start">
                        <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-2 mr-4 flex-shrink-0"></div>
                        <span className={`text-base leading-relaxed ${isDark ? 'text-on-surface-variant' : 'text-slate-600'}`}>{item}</span>
                      </li>
                    ))}
                  </ul>
                </section>

                {/* Important Instructions */}
                <section className={`p-8 rounded-2xl transition-all duration-300 ${isDark ? 'bg-surface-container' : 'bg-white shadow-lg border border-slate-100'}`}>
                  <h3 className={`text-xl font-bold font-headline mb-6 flex items-center ${isDark ? 'text-indigo-400' : 'text-indigo-600'}`}>
                    <span className="material-symbols-outlined mr-3">info</span>
                    Important Guidelines
                  </h3>
                  <div className={`space-y-4 text-sm leading-relaxed ${isDark ? 'text-on-surface-variant' : 'text-slate-600'}`}>
                    <p>• The test will automatically conclude when the timer reaches zero.</p>
                    <p>• Correct answers award **+4 marks**, while incorrect ones deduct **-1 mark**.</p>
                    <p>• No marks are deducted for unattempted questions.</p>
                    <p>• Ensure a stable internet connection for the duration of the test.</p>
                  </div>
                </section>
              </div>

              {/* Action Sidebar */}
              <div className="space-y-6">
                <div className={`p-8 rounded-2xl sticky top-32 transition-all duration-300 ${isDark ? 'bg-surface-container' : 'bg-white shadow-2xl border border-indigo-100/50'}`}>
                  <p className={`text-sm font-medium mb-6 ${isDark ? 'text-on-surface-variant' : 'text-slate-500'}`}>Ready to begin your mock exam? Take a deep breath.</p>
                  <button className="cursor-pointer border-none w-full py-4 bg-indigo-500 text-on-primary font-bold rounded-xl text-lg transition-all shadow-xl shadow-indigo-500/20 hover:shadow-indigo-500/40 hover:-translate-y-0.5 active:scale-95">
                    Start Test Now
                  </button>
                  <p className="text-[10px] text-center mt-4 text-slate-500 uppercase tracking-widest font-bold">Good Luck, Scholar!</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
