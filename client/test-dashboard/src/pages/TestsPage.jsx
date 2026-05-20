const stateMeta = {
  'in-progress': ['Resume Test', 'pending', 'bg-amber-50 text-amber-700 border-amber-200'],
  completed: ['Attempt Again', 'check_circle', 'bg-emerald-50 text-emerald-700 border-emerald-200'],
  evaluating: ['Evaluating', 'sync', 'bg-yellow-50 text-yellow-700 border-yellow-200'],
  upcoming: ['Locked', 'event', 'bg-sky-50 text-sky-700 border-sky-200'],
  missed: ['Ended', 'cancel', 'bg-rose-50 text-rose-700 border-rose-200'],
  locked: ['Locked', 'lock', 'bg-slate-100 text-slate-500 border-slate-200'],
  default: ['Attempt Test', 'radio_button_checked', 'bg-indigo-50 text-indigo-700 border-indigo-200'],
};

export default function TestsPage({
  mode = 'tests',
  tests = [],
  loading = false,
  searchQuery = '',
  activeCategory = 'full',
  onCategoryChange,
  examFilter = 'jee-mains',
  onExamFilterChange,
  showExamHint = false,
  onDismissExamHint,
  completedResults = [],
  averagePercentage = 0,
  bestResult = null,
  onSelectTest,
  onOpenAnalytics,
}) {
  const isPyp = mode === 'pyp';
  const completedCount = completedResults.length;
  const progress = tests.length ? Math.round((completedCount / tests.length) * 100) : 0;

  const handleAction = (test) => {
    if (test.state === 'evaluating') {
      alert('Your detailed performance report is still being generated. Please check back shortly.');
      return;
    }
    if (test.state === 'upcoming') {
      alert("This test hasn't started yet. Check the scheduled start date.");
      return;
    }
    if (test.state === 'missed') {
      alert('The attempt window for this test has already ended.');
      return;
    }
    if (test.state === 'locked') return;
    onSelectTest?.(test);
  };

  return (
    <div className="mx-auto max-w-7xl space-y-7">
      <section className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm md:p-8">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-slate-400">
              {isPyp ? 'Previous Year Practice' : 'Assessment Library'}
            </p>
            <h1 className="mt-3 text-3xl font-black tracking-tight text-slate-950 md:text-5xl">
              {isPyp ? 'Previous Year Papers' : 'Tests'}
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-500 md:text-base">
              {isPyp
                ? 'Practice past papers with the same account, result, review, and analytics flow.'
                : 'Find live, scheduled, completed, and missed tests without leaving the student workspace.'}
            </p>
          </div>

          <div className="relative">
            {showExamHint && (
              <div className="absolute bottom-full right-0 z-20 mb-3 w-56 rounded-2xl border border-indigo-100 bg-white p-4 text-sm shadow-xl">
                <div className="mb-1 flex items-center justify-between">
                  <span className="text-xs font-black uppercase tracking-widest text-indigo-600">Exam Filter</span>
                  <button onClick={onDismissExamHint} className="rounded-lg border border-slate-200 bg-white p-1 text-slate-500 hover:bg-slate-50">
                    <span className="material-symbols-outlined text-sm">close</span>
                  </button>
                </div>
                <p className="text-xs font-semibold leading-5 text-slate-500">Switch exam streams here.</p>
              </div>
            )}
            <select
              value={examFilter}
              onChange={(event) => onExamFilterChange?.(event.target.value)}
              className="h-11 appearance-none rounded-2xl border border-slate-200 bg-white px-4 pr-10 text-sm font-bold text-slate-700 shadow-sm outline-none transition focus:border-indigo-300 focus:ring-4 focus:ring-indigo-100"
            >
              <option value="jee-mains">JEE Mains</option>
              <option value="jee-adv">JEE Advanced</option>
              <option value="neet">NEET-UG</option>
            </select>
            <span className="material-symbols-outlined pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-lg text-slate-400">unfold_more</span>
          </div>
        </div>
      </section>

      {!isPyp && (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {[
            ['full', 'Full Tests'],
            ['part', 'Part Tests'],
          ].map(([id, label]) => (
            <button
              key={id}
              onClick={() => onCategoryChange?.(id)}
              className={`whitespace-nowrap rounded-2xl border px-4 py-2 text-sm font-bold transition ${
                activeCategory === id
                  ? 'border-slate-950 bg-slate-950 text-white'
                  : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      )}

      <div className="grid gap-6 xl:grid-cols-[1fr_360px]">
        <section className="space-y-4">
          {loading ? (
            <div className="rounded-3xl border border-slate-200 bg-white p-10 text-center shadow-sm">
              <span className="material-symbols-outlined animate-spin text-4xl text-indigo-500">sync</span>
              <p className="mt-3 font-semibold text-slate-500">Loading tests...</p>
            </div>
          ) : tests.length === 0 ? (
            <div className="rounded-3xl border border-slate-200 bg-white p-10 text-center shadow-sm">
              <span className="material-symbols-outlined text-5xl text-slate-300">assignment_late</span>
              <h2 className="mt-3 text-xl font-black text-slate-950">{searchQuery ? 'No Matching Tests' : 'No Tests Available'}</h2>
              <p className="mt-2 text-sm font-semibold text-slate-500">
                {searchQuery ? 'Try a different test, subject, or category.' : 'Published tests from your admin will appear here.'}
              </p>
            </div>
          ) : (
            tests.map((test) => {
              const state = test.state || 'default';
              const [buttonText, icon, badgeClass] = stateMeta[state] || stateMeta.default;
              return (
                <article key={test._id} className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-slate-300 hover:shadow-md">
                  <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
                    <div className="min-w-0">
                      <div className="mb-3 flex flex-wrap items-center gap-2">
                        <span className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-black uppercase tracking-wider text-indigo-700">
                          {test.category || 'General'}
                        </span>
                        <span className={`inline-flex items-center gap-1 rounded-full border px-3 py-1 text-xs font-bold ${badgeClass}`}>
                          <span className="material-symbols-outlined text-sm">{icon}</span>
                          {test.status || state}
                        </span>
                      </div>
                      <h2 className="truncate text-xl font-black text-slate-950">{test.title}</h2>
                      <p className="mt-2 text-sm font-medium text-slate-500">
                        {test.sections?.map((section) => section.name).join(' • ') || 'Full Exam'}
                      </p>
                      <div className="mt-4 flex flex-wrap gap-3 text-sm font-semibold text-slate-600">
                        <span className="inline-flex items-center gap-1.5">
                          <span className="material-symbols-outlined text-base text-slate-400">schedule</span>
                          {test.durationMinutes || 0} mins
                        </span>
                        <span className="inline-flex items-center gap-1.5">
                          <span className="material-symbols-outlined text-base text-slate-400">grade</span>
                          {test.totalMarks || 0} marks
                        </span>
                        <span className="inline-flex items-center gap-1.5">
                          <span className="material-symbols-outlined text-base text-slate-400">splitscreen</span>
                          {test.sections?.length || 1} sections
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={() => handleAction(test)}
                      disabled={state === 'locked'}
                      className={`rounded-2xl px-5 py-3 text-sm font-black transition ${
                        state === 'locked' || state === 'upcoming' || state === 'missed'
                          ? 'border border-slate-200 bg-slate-100 text-slate-500'
                          : 'border border-slate-950 bg-slate-950 text-white hover:bg-slate-800'
                      }`}
                    >
                      {buttonText}
                    </button>
                  </div>
                </article>
              );
            })
          )}
        </section>

        <aside className="space-y-5">
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-xs font-black uppercase tracking-widest text-slate-400">Progress</p>
            <div className="mt-4 flex items-end gap-2">
              <span className="text-5xl font-black text-slate-950">{progress}%</span>
              <span className="pb-2 text-sm font-bold text-slate-400">series done</span>
            </div>
            <div className="mt-5 h-2 overflow-hidden rounded-full bg-slate-100">
              <div className="h-full rounded-full bg-indigo-600" style={{ width: `${progress}%` }} />
            </div>
            <div className="mt-5 grid grid-cols-2 gap-3">
              <div className="rounded-2xl bg-slate-50 p-4">
                <p className="text-xs font-bold text-slate-400">Completed</p>
                <p className="mt-1 text-2xl font-black text-slate-950">{completedCount}</p>
              </div>
              <div className="rounded-2xl bg-slate-50 p-4">
                <p className="text-xs font-bold text-slate-400">Available</p>
                <p className="mt-1 text-2xl font-black text-slate-950">{tests.length}</p>
              </div>
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-xs font-black uppercase tracking-widest text-slate-400">Performance</p>
            <div className="mt-5 grid grid-cols-2 gap-3">
              <div className="rounded-2xl bg-indigo-50 p-4">
                <p className="text-xs font-bold text-indigo-500">Average</p>
                <p className="mt-1 text-2xl font-black text-indigo-700">{averagePercentage}%</p>
              </div>
              <div className="rounded-2xl bg-emerald-50 p-4">
                <p className="text-xs font-bold text-emerald-600">Best</p>
                <p className="mt-1 text-2xl font-black text-emerald-700">{bestResult?.percentage ?? 0}%</p>
              </div>
            </div>
            <button onClick={onOpenAnalytics} className="mt-5 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-black text-slate-700 transition hover:bg-slate-50">
              Open Analytics
            </button>
          </div>
        </aside>
      </div>
    </div>
  );
}
