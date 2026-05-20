export default function InstructionsPage({
  test,
  onBack,
  onStart,
  onReview,
}) {
  const generalInstructions = test?.instructions?.general?.length
    ? test.instructions.general
    : [
        'The test will automatically conclude when the timer reaches zero.',
        `Correct answers award +${test?.defaultPositiveMarks ?? 4} marks, while incorrect answers deduct ${test?.defaultNegativeMarks ?? 1} mark.`,
        'No marks are deducted for unattempted questions.',
        'Keep your internet connection stable until the final submission is complete.',
      ];

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <button onClick={onBack} className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-slate-600 shadow-sm transition hover:bg-slate-50">
        <span className="material-symbols-outlined text-lg">arrow_back</span>
        Back to Tests
      </button>

      <section className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm md:p-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <span className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-black uppercase tracking-wider text-indigo-700">
              {test?.category || 'Assessment'}
            </span>
            <h1 className="mt-4 text-3xl font-black tracking-tight text-slate-950 md:text-5xl">{test?.title || 'Test Instructions'}</h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-500 md:text-base">
              Read the instructions carefully before opening the secure CBT window.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-2xl bg-slate-50 px-5 py-4 text-center">
              <p className="text-xs font-bold uppercase tracking-widest text-slate-400">Duration</p>
              <p className="mt-1 text-xl font-black text-slate-950">{test?.durationMinutes || 0} mins</p>
            </div>
            <div className="rounded-2xl bg-slate-50 px-5 py-4 text-center">
              <p className="text-xs font-bold uppercase tracking-widest text-slate-400">Marks</p>
              <p className="mt-1 text-xl font-black text-slate-950">{test?.totalMarks || 0}</p>
            </div>
          </div>
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
        <div className="space-y-6">
          <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-5 flex items-center gap-3">
              <span className="material-symbols-outlined rounded-2xl bg-indigo-50 p-3 text-indigo-600">menu_book</span>
              <h2 className="text-xl font-black text-slate-950">Syllabus</h2>
            </div>
            {test?.syllabus?.length ? (
              <div className="grid gap-3 md:grid-cols-2">
                {test.syllabus.map((item, index) => (
                  <div key={`${item}-${index}`} className="rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-600">
                    {item}
                  </div>
                ))}
              </div>
            ) : (
              <p className="rounded-2xl bg-slate-50 p-5 text-sm font-semibold text-slate-400">No syllabus details provided for this test.</p>
            )}
          </section>

          <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-5 flex items-center gap-3">
              <span className="material-symbols-outlined rounded-2xl bg-amber-50 p-3 text-amber-600">info</span>
              <h2 className="text-xl font-black text-slate-950">Important Guidelines</h2>
            </div>
            <div className="space-y-3">
              {generalInstructions.map((instruction, index) => (
                <div key={`${instruction}-${index}`} className="flex gap-3 rounded-2xl border border-slate-100 bg-white p-4">
                  <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-slate-950 text-xs font-black text-white">{index + 1}</span>
                  <p className="text-sm leading-6 text-slate-600">{instruction}</p>
                </div>
              ))}
            </div>
          </section>
        </div>

        <aside className="space-y-5">
          <div className="sticky top-24 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-sm font-semibold leading-6 text-slate-500">
              Your first submitted attempt is used for leaderboard ranking. Later attempts are saved for personal analytics.
            </p>
            <button onClick={onStart} className="mt-6 w-full rounded-2xl border border-slate-950 bg-slate-950 px-5 py-4 text-base font-black text-white transition hover:bg-slate-800">
              {test?.state === 'completed' ? 'Retake Test' : 'Start Test Now'}
            </button>
            {test?.state === 'completed' && test?.latestAttemptId && (
              <button onClick={onReview} className="mt-3 w-full rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-black text-slate-700 transition hover:bg-slate-50">
                Analyse Previous Attempt
              </button>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}
