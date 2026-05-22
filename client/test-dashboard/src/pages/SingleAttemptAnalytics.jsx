import React, { useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import { PrintableReport } from '../components/PrintableReport';

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

const JourneyMap = ({ questions }) => {
  const allVisits = [];
  if (questions) {
    questions.forEach((q, index) => {
      const qNum = q.questionNumber || index + 1;
      if (q.visitLog && Array.isArray(q.visitLog)) {
        q.visitLog.forEach(visit => {
          if (visit.enteredAt) {
            allVisits.push({
              qNum,
              questionId: q.questionId,
              enteredAt: new Date(visit.enteredAt),
              leftAt: visit.leftAt ? new Date(visit.leftAt) : null,
              durationSeconds: visit.durationSeconds || 0
            });
          }
        });
      }
    });
  }
  allVisits.sort((a, b) => a.enteredAt - b.enteredAt);

  if (allVisits.length === 0) {
    return <p className="text-sm font-semibold text-slate-400 mt-2">No chronological journey data available.</p>;
  }

  return (
    <div className="flex overflow-x-auto py-10 px-4 items-center" style={{ scrollbarWidth: 'thin' }}>
      {allVisits.map((visit, i) => (
        <div key={i} className="flex items-center shrink-0">
          <div className="relative flex flex-col items-center">
            <div className="w-12 h-12 rounded-full bg-indigo-500 text-white flex items-center justify-center font-bold shadow-md z-10 shrink-0">
              Q{visit.qNum}
            </div>
            <div className="absolute top-14 text-[10px] font-semibold text-slate-500 whitespace-nowrap">
              {visit.enteredAt.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false })}
            </div>
          </div>
          {i < allVisits.length - 1 && (
            <div className="relative w-20 h-0.5 bg-slate-300 flex items-center justify-center z-0 -ml-1 -mr-1">
               <div className="absolute -top-6 text-[10px] font-bold text-indigo-600 bg-indigo-50 border border-indigo-100 px-2 py-0.5 rounded-full whitespace-nowrap shadow-sm">
                 {formatDuration(visit.durationSeconds)}
               </div>
               <div className="absolute right-0 w-2 h-2 border-t-2 border-r-2 border-slate-400 transform rotate-45 -mt-1" />
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default function SingleAttemptAnalytics({ attempt, onReview, onBack }) {
  const { test, telemetry, sectionScores = {}, topicPerformance = {} } = attempt;
  const printRef = useRef(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const handleDownloadPDF = async () => {
    if (!printRef.current) return;
    setIsGenerating(true);
    try {
      // Create canvas from the hidden printable report component
      const canvas = await html2canvas(printRef.current, { scale: 2, useCORS: true });
      const imgData = canvas.toDataURL('image/png');
      
      // Calculate A4 dimensions
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      
      let position = 0;
      let heightLeft = pdfHeight;
      const pageHeight = pdf.internal.pageSize.getHeight();

      // First page
      pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, pdfHeight);
      heightLeft -= pageHeight;

      // Add subsequent pages if content overflows
      while (heightLeft >= 0) {
        position = heightLeft - pdfHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, pdfHeight);
        heightLeft -= pageHeight;
      }

      pdf.save(`Vayl_Report_${test?.title?.replace(/\s+/g, '_') || 'Attempt'}.pdf`);
    } catch (err) {
      console.error('Error generating PDF:', err);
      alert('Failed to generate PDF report.');
    } finally {
      setIsGenerating(false);
    }
  };

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
        <div className="flex gap-2">
          <motion.button
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleDownloadPDF}
            disabled={isGenerating}
            className="inline-flex items-center gap-2 rounded-2xl bg-indigo-50 px-4 py-2 text-sm font-bold text-indigo-700 shadow-sm transition hover:bg-indigo-100 disabled:opacity-50"
          >
            {isGenerating ? (
              <div className="h-4 w-4 border-2 border-indigo-200 border-t-indigo-700 rounded-full animate-spin" />
            ) : (
              <span className="material-symbols-outlined text-lg">download</span>
            )}
            {isGenerating ? 'Generating...' : 'Download PDF'}
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

      {/* Journey Map */}
      {questions.length > 0 && (
        <motion.section initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm overflow-hidden">
          <h2 className="text-xl font-black text-slate-900">Test Journey</h2>
          <p className="mt-1 text-xs text-slate-500">Your exact path through the paper. See where you spent time and how you navigated.</p>
          <JourneyMap questions={questions} />
        </motion.section>
      )}

      {/* Time vs Score Analysis */}
      {questions.length > 0 && (
        <motion.section initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.22 }} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm overflow-hidden">
          <h2 className="text-xl font-black text-slate-900">Time vs Score Analysis</h2>
          <p className="mt-1 text-xs text-slate-500 mb-6">Identify time sinks. Red bars show high time spent on incorrect/skipped questions.</p>
          <div className="space-y-4 max-h-96 overflow-y-auto pr-2" style={{ scrollbarWidth: 'thin' }}>
            {[...questions].sort((a, b) => (b.timeSpentSeconds || 0) - (a.timeSpentSeconds || 0)).map((q, idx) => {
              const qNum = q.questionNumber || questions.findIndex(item => item.questionId === q.questionId) + 1;
              const time = q.timeSpentSeconds || 0;
              const isAnswered = q.answered;
              const isWrong = q.resultStatus === 'wrong' || (q.score !== undefined && q.score < 0);
              const isCorrect = q.resultStatus === 'correct' || (q.score !== undefined && q.score > 0);
              
              const statusText = isCorrect ? 'Correct' : isWrong ? 'Wrong' : isAnswered ? 'Answered' : 'Skipped';
              const color = isCorrect ? 'bg-emerald-500' : isWrong ? 'bg-rose-500' : isAnswered ? 'bg-indigo-500' : 'bg-slate-300';
              const isTrap = time > 120 && (isWrong || (!isAnswered)); // Traps = more than 2 mins and wrong/skipped
              
              return (
                <div key={q.questionId || idx} className="flex flex-col sm:flex-row sm:items-center gap-3 bg-slate-50 p-3 rounded-2xl border border-slate-100">
                   <div className="flex items-center gap-3 min-w-[80px]">
                     <div className="w-8 h-8 rounded-full bg-white border border-slate-200 flex items-center justify-center text-xs font-black text-slate-600 shadow-sm shrink-0">
                       Q{qNum}
                     </div>
                     {isTrap && <span className="text-[10px] font-black bg-rose-100 text-rose-700 px-2 py-0.5 rounded uppercase tracking-wider">Trap</span>}
                   </div>
                   <div className="flex-1 h-2.5 bg-slate-200 rounded-full overflow-hidden relative min-w-[100px]">
                      <motion.div 
                        initial={{ width: 0 }} 
                        animate={{ width: `${Math.min(100, (time / (maxQuestionTime || 120)) * 100)}%` }} 
                        transition={{ duration: 0.8 }}
                        className={`absolute top-0 left-0 h-full ${color}`} 
                      />
                   </div>
                   <div className="flex items-center gap-3 sm:w-48 justify-end shrink-0">
                     <span className="text-sm font-black text-slate-700">{formatDuration(time)}</span>
                     <span className={`w-20 text-[10px] font-bold text-center rounded-lg px-2 py-1 uppercase tracking-widest ${isCorrect ? 'text-emerald-700 bg-emerald-100' : isWrong ? 'text-rose-700 bg-rose-100' : 'text-slate-600 bg-slate-200'}`}>
                       {statusText}
                     </span>
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

      {/* Hidden Printable Report */}
      <div className="overflow-hidden h-0 w-0 absolute left-[-9999px]">
        <PrintableReport ref={printRef} attempt={attempt} />
      </div>
    </div>
  );
}
