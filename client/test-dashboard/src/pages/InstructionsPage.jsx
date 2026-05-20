import { motion } from 'framer-motion';

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.08 } },
};
const item = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.35 } },
};

export default function InstructionsPage({ test, onBack, onStart, onReview }) {
  const generalInstructions = test?.instructions?.general?.length
    ? test.instructions.general
    : [
        'The test will automatically conclude when the timer reaches zero.',
        `Correct answers award +${test?.defaultPositiveMarks ?? 4} marks; incorrect answers deduct ${test?.defaultNegativeMarks ?? 1} mark.`,
        'No marks are deducted for unattempted questions.',
        'Keep your internet connection stable until the final submission is complete.',
        'Do not close or refresh the test window during the exam.',
      ];

  const hasCompleted = test?.state === 'completed';

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <motion.button
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        whileHover={{ x: -3 }}
        onClick={onBack}
        className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-slate-600 shadow-sm transition hover:shadow-md"
      >
        <span className="material-symbols-outlined text-lg">arrow_back</span>
        Back to Tests
      </motion.button>

      {/* Hero */}
      <motion.section
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 to-indigo-950 p-6 shadow-xl md:p-8"
      >
        <div className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full bg-indigo-500/20 blur-3xl" />
        <div className="relative flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex-1">
            <span className="inline-flex items-center rounded-full bg-white/10 px-3 py-1 text-xs font-black uppercase tracking-wider text-indigo-200">
              {test?.category || 'Assessment'}
            </span>
            <h1 className="mt-4 text-2xl font-black tracking-tight text-white md:text-4xl font-headline">{test?.title || 'Test Instructions'}</h1>
            <p className="mt-2 text-sm leading-7 text-slate-300">Read the instructions carefully before opening the secure CBT window.</p>
          </div>
          <div className="grid grid-cols-2 gap-3 shrink-0 lg:w-64">
            {[
              ['Duration', `${test?.durationMinutes || 0} mins`, 'schedule'],
              ['Total Marks', `${test?.totalMarks || 0}`, 'grade'],
              ['Sections', `${test?.sections?.length || 1}`, 'splitscreen'],
              ['Questions', `${test?.totalQuestions || '—'}`, 'quiz'],
            ].map(([label, val, icon]) => (
              <div key={label} className="rounded-2xl bg-white/10 px-4 py-3 text-center backdrop-blur-sm">
                <span className="material-symbols-outlined text-base text-indigo-300">{icon}</span>
                <p className="text-[10px] font-bold uppercase tracking-widest text-indigo-200 mt-0.5">{label}</p>
                <p className="text-base font-black text-white">{val}</p>
              </div>
            ))}
          </div>
        </div>
      </motion.section>

      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <motion.div variants={container} initial="hidden" animate="show" className="space-y-5">
          {/* Syllabus */}
          <motion.section variants={item} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-5 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-indigo-50">
                <span className="material-symbols-outlined text-indigo-600" style={{ fontVariationSettings: "'FILL' 1" }}>menu_book</span>
              </div>
              <h2 className="text-lg font-black text-slate-900">Syllabus</h2>
            </div>
            {test?.syllabus?.length ? (
              <div className="grid gap-2 md:grid-cols-2">
                {test.syllabus.map((s, i) => (
                  <motion.div key={`${s}-${i}`} whileHover={{ x: 3 }} className="flex items-center gap-2.5 rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-700">
                    <span className="material-symbols-outlined text-sm text-indigo-400">check_circle</span>
                    {s}
                  </motion.div>
                ))}
              </div>
            ) : (
              <p className="rounded-2xl bg-slate-50 p-4 text-sm font-semibold text-slate-400">No syllabus details provided for this test.</p>
            )}
          </motion.section>

          {/* Instructions */}
          <motion.section variants={item} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-5 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-amber-50">
                <span className="material-symbols-outlined text-amber-600" style={{ fontVariationSettings: "'FILL' 1" }}>warning</span>
              </div>
              <h2 className="text-lg font-black text-slate-900">Important Guidelines</h2>
            </div>
            <div className="space-y-3">
              {generalInstructions.map((instruction, i) => (
                <motion.div key={i} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.07 }} className="flex gap-3 rounded-2xl border border-slate-100 bg-white p-4">
                  <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-indigo-600 to-violet-600 text-xs font-black text-white">{i + 1}</span>
                  <p className="text-sm leading-6 text-slate-600">{instruction}</p>
                </motion.div>
              ))}
            </div>
          </motion.section>
        </motion.div>

        {/* CTA sidebar */}
        <motion.aside initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}>
          <div className="sticky top-24 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
            <div className="rounded-2xl bg-amber-50 border border-amber-100 p-4">
              <div className="flex items-start gap-2">
                <span className="material-symbols-outlined text-amber-600 text-base mt-0.5" style={{ fontVariationSettings: "'FILL' 1" }}>info</span>
                <p className="text-xs leading-5 text-amber-800 font-semibold">
                  Your first submitted attempt is used for leaderboard ranking. Later attempts are saved for personal analytics only.
                </p>
              </div>
            </div>

            <motion.button
              whileHover={{ scale: 1.02, y: -1 }}
              whileTap={{ scale: 0.97 }}
              onClick={onStart}
              className="w-full rounded-2xl bg-gradient-to-r from-indigo-600 to-violet-600 px-5 py-4 text-base font-black text-white shadow-lg shadow-indigo-200 transition hover:shadow-xl hover:shadow-indigo-300"
            >
              <span className="flex items-center justify-center gap-2">
                <span className="material-symbols-outlined text-xl" style={{ fontVariationSettings: "'FILL' 1" }}>play_circle</span>
                {hasCompleted ? 'Retake Test' : 'Start Test Now'}
              </span>
            </motion.button>

            {hasCompleted && test?.latestAttemptId && (
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
                onClick={onReview}
                className="w-full rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-bold text-slate-700 transition hover:bg-slate-50"
              >
                <span className="flex items-center justify-center gap-2">
                  <span className="material-symbols-outlined text-base">analytics</span>
                  Analyse Previous Attempt
                </span>
              </motion.button>
            )}

            {/* Marking scheme */}
            <div className="rounded-2xl bg-slate-50 p-4">
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3">Marking Scheme</p>
              <div className="space-y-2">
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-emerald-700">✓ Correct</span>
                  <span className="text-emerald-700">+{test?.defaultPositiveMarks ?? 4}</span>
                </div>
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-rose-600">✗ Incorrect</span>
                  <span className="text-rose-600">−{test?.defaultNegativeMarks ?? 1}</span>
                </div>
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-slate-500">– Skipped</span>
                  <span className="text-slate-500">0</span>
                </div>
              </div>
            </div>
          </div>
        </motion.aside>
      </div>
    </div>
  );
}
