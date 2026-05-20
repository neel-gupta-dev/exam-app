import React, { useMemo } from 'react';
import { motion } from 'framer-motion';

const formatDuration = (seconds = 0) => {
  const total = Math.max(0, Math.round(Number(seconds) || 0));
  const mins = Math.floor(total / 60);
  const secs = total % 60;
  return mins ? `${mins}m ${secs}s` : `${secs}s`;
};

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.08 } },
};
const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.35 } },
};

export default function SingleAttemptAnalytics({ attempt, onReview, onBack }) {
  const { test, telemetry, sectionScores = {}, topicPerformance = {} } = attempt;

  // Process data for charts
  const sectionEntries = Object.entries(sectionScores).sort((a, b) => b[1].score - a[1].score);
  const topicEntries = Object.entries(topicPerformance).sort((a, b) => b[1].correct - a[1].correct);
  const highTimeQuestions = [...(telemetry?.questions || [])].sort((a, b) => (b.timeSpentSeconds || 0) - (a.timeSpentSeconds || 0)).slice(0, 6);
  const maxQuestionTime = Math.max(1, ...(telemetry?.questions || []).map((q) => q.timeSpentSeconds || 0));
  const questions = telemetry?.questions || [];
  
  const avgTimeToAct = questions.length ? Math.round(questions.reduce((sum, q) => sum + (q.timeToFirstActionSeconds || 0), 0) / questions.length) : 0;
  
  return (
    <div className="mx-auto max-w-7xl space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <motion.button
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          whileHover={{ x: -3 }}
          onClick={onBack}
          className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-slate-600 shadow-sm transition hover:shadow-md"
        >
          <span className="material-symbols-outlined text-lg">arrow_back</span>
          Back to Analytics
        </motion.button>
        <motion.button
          initial={{ opacity: 0, x: 10 }}
          animate={{ opacity: 1, x: 0 }}
          whileHover={{ x: 3 }}
          onClick={() => onReview(attempt._id)}
          className="inline-flex items-center gap-2 rounded-2xl bg-indigo-600 px-5 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-indigo-700 hover:shadow-md"
        >
          <span className="material-symbols-outlined text-lg">fact_check</span>
          Review Questions
        </motion.button>
      </div>

      {/* Hero Overview */}
      <motion.section
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-3xl border border-indigo-100 bg-gradient-to-br from-indigo-50 via-white to-blue-50 p-7 shadow-sm md:p-9"
      >
        <div className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full bg-indigo-200/40 blur-3xl" />
        <div className="relative flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <span className="inline-block rounded-full bg-indigo-100 px-3 py-1 text-[10px] font-black uppercase tracking-[0.2em] text-indigo-700">{test?.title || 'Unknown Test'}</span>
            <h1 className="mt-4 text-3xl font-black tracking-tight text-slate-900 md:text-4xl font-headline">Test Performance</h1>
            <p className="mt-3 max-w-xl text-sm leading-7 text-slate-500">
              Submitted {new Date(attempt.submittedAt).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
            </p>
          </div>
          <div className="grid grid-cols-3 gap-3 shrink-0">
            {[
              ['Score', `${attempt.totalScore} / ${attempt.maxPossibleScore}`],
              ['Percent', `${attempt.percentage}%`],
              ['Tracked Time', formatDuration(telemetry?.totalTimeSpentSeconds)],
            ].map(([label, val]) => (
              <div key={label} className="rounded-2xl border border-indigo-100 bg-white/60 px-4 py-3 text-center shadow-sm backdrop-blur-md">
                <p className="text-[10px] font-bold uppercase tracking-widest text-indigo-500">{label}</p>
                <p className="mt-1 text-lg font-black text-slate-900 whitespace-nowrap">{val}</p>
              </div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* Telemetry micro-stats */}
      <motion.section variants={container} initial="hidden" animate="show" className="grid gap-4 md:grid-cols-4">
        {[
          { label: 'Avg / Question', value: formatDuration(telemetry?.averageQuestionTimeSeconds), icon: 'av_timer', color: 'text-violet-600', bg: 'bg-violet-50' },
          { label: 'Avg Time to Act', value: `${avgTimeToAct}s`, icon: 'bolt', color: 'text-emerald-600', bg: 'bg-emerald-50' },
          { label: 'Question Visits', value: telemetry?.totalVisits || 0, icon: 'visibility', color: 'text-sky-600', bg: 'bg-sky-50' },
          { label: 'Self-Doubt (Changes)', value: telemetry?.totalAnswerChanges || 0, icon: 'swap_horiz', color: 'text-amber-600', bg: 'bg-amber-50' },
        ].map(({ label, value, icon, color, bg }) => (
          <motion.div key={label} variants={fadeUp} whileHover={{ y: -2 }} className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm relative overflow-hidden">
            <div className={`flex h-11 w-11 items-center justify-center rounded-2xl ${bg}`}>
              <span className={`material-symbols-outlined ${color}`} style={{ fontVariationSettings: "'FILL' 1" }}>{icon}</span>
            </div>
            <p className="mt-4 text-[10px] font-bold uppercase tracking-widest text-slate-400">{label}</p>
            <p className="mt-1 text-2xl font-black text-slate-900">{value}</p>
            {label.includes('Self-Doubt') && (telemetry?.totalAnswerChanges || 0) > 5 && (
              <p className="mt-2 text-[10px] font-semibold text-amber-600 uppercase tracking-widest">High hesitation detected</p>
            )}
          </motion.div>
        ))}
      </motion.section>

      {/* Fatigue Curve */}
      {questions.length > 0 && (
        <motion.section initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm overflow-hidden">
          <h2 className="text-xl font-black text-slate-900">Navigation Path & Fatigue</h2>
          <p className="mt-1 text-xs text-slate-500 mb-6">Chronological timeline of your test attempt. Bubbles represent questions visited over time.</p>
          <div className="flex flex-wrap gap-2 max-h-48 overflow-y-auto pr-2 pb-2">
            {[...questions]
              .filter(q => q.firstVisitedAt)
              .sort((a,b) => new Date(a.firstVisitedAt) - new Date(b.firstVisitedAt))
              .map((q, idx) => {
                const color = q.answered ? 'bg-indigo-500' : 'bg-slate-200';
                return (
                  <div key={q.questionId} className="relative group flex flex-col items-center">
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: idx * 0.01 }}
                      className={`h-4 w-4 rounded-full ${color} shrink-0 cursor-pointer transition-transform hover:scale-125`}
                    />
                    <div className="pointer-events-none absolute bottom-6 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap bg-slate-900 text-white text-[10px] py-1 px-2 rounded-lg z-10 shadow-xl">
                      Q{idx + 1} · {q.answered ? 'Answered' : 'Skipped'} <br/>
                      Visited: {q.visitCount} times <br/>
                      Time: {formatDuration(q.timeSpentSeconds)}
                    </div>
                  </div>
                );
              })}
          </div>
        </motion.section>
      )}

      {/* Section & Topic */}
      <section className="grid gap-5 xl:grid-cols-2">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-black text-slate-900">Section Breakdown</h2>
          <div className="mt-5 space-y-4">
            {sectionEntries.length ? sectionEntries.map(([section, score]) => {
              const total = (score.correct || 0) + (score.wrong || 0) + (score.unattempted || 0);
              const accuracy = total ? Math.round(((score.correct || 0) / total) * 100) : 0;
              const roi = score.score > 0 ? formatDuration(Math.round((score.timeSpentSeconds || 0) / score.score)) : 'N/A';
              return (
                <div key={section}>
                  <div className="mb-1.5 flex justify-between text-sm">
                    <span className="font-bold text-slate-800">{section}</span>
                    <span className="font-semibold text-slate-500">{score.score || 0} pts · {accuracy}%</span>
                  </div>
                  <div className="mb-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider flex justify-between">
                    <span>Return on Time (ROI)</span>
                    <span className={score.score > 0 ? "text-indigo-600" : ""}>{roi} / pt</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                    <motion.div initial={{ width: 0 }} animate={{ width: `${accuracy}%` }} transition={{ duration: 0.7, ease: 'easeOut' }} className="h-full rounded-full bg-indigo-500" />
                  </div>
                </div>
              );
            }) : <p className="text-sm font-semibold text-slate-400">No section data found.</p>}
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-black text-slate-900">Topic Strength</h2>
          <div className="mt-5 space-y-4">
            {topicEntries.length ? topicEntries.map(([topic, perf]) => {
              const total = (perf.correct || 0) + (perf.wrong || 0) + (perf.skipped || 0);
              const accuracy = total ? Math.round(((perf.correct || 0) / total) * 100) : 0;
              const color = accuracy >= 60 ? 'bg-emerald-500' : accuracy >= 35 ? 'bg-amber-500' : 'bg-rose-500';
              const roi = perf.correct > 0 ? formatDuration(Math.round((perf.timeSpentSeconds || 0) / perf.correct)) : 'N/A';
              return (
                <div key={topic}>
                  <div className="mb-1.5 flex justify-between gap-2 text-sm">
                    <span className="truncate font-bold text-slate-800">{topic}</span>
                    <span className="shrink-0 font-semibold text-slate-500">{perf.correct || 0}C · {perf.wrong || 0}W · {perf.skipped || 0}S</span>
                  </div>
                  <div className="mb-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider flex justify-between">
                    <span>Return on Time (ROI)</span>
                    <span className={perf.correct > 0 ? "text-emerald-600" : ""}>{roi} / correct Q</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                    <motion.div initial={{ width: 0 }} animate={{ width: `${accuracy}%` }} transition={{ duration: 0.7, ease: 'easeOut' }} className={`h-full rounded-full ${color}`} />
                  </div>
                </div>
              );
            }) : <p className="text-sm font-semibold text-slate-400">No topic data found.</p>}
          </div>
        </motion.div>
      </section>

      {/* Time Sink */}
      <section className="grid gap-5">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-black text-slate-900">Time Sink Questions</h2>
          <div className="mt-5 space-y-3">
            {highTimeQuestions.length ? highTimeQuestions.map((q, idx) => (
              <div key={q.questionId || idx}>
                <div className="mb-1 flex justify-between text-xs font-bold text-slate-500">
                  <span>Q{questions.findIndex((item) => item.questionId === q.questionId) + 1 || idx + 1}</span>
                  <span>{formatDuration(q.timeSpentSeconds)} · {q.visitCount || 0} visits</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                  <motion.div initial={{ width: 0 }} animate={{ width: `${Math.min(100, ((q.timeSpentSeconds || 0) / maxQuestionTime) * 100)}%` }} transition={{ duration: 0.6, delay: idx * 0.05 }} className="h-full rounded-full bg-slate-800" />
                </div>
              </div>
            )) : <p className="text-sm font-semibold text-slate-400">Timing telemetry appears after a submitted test.</p>}
          </div>
        </motion.div>
      </section>
    </div>
  );
}
