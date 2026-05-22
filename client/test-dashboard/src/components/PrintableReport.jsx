import React from 'react';

const formatDuration = (seconds = 0) => {
  const total = Math.max(0, Math.round(Number(seconds) || 0));
  const mins = Math.floor(total / 60);
  const secs = total % 60;
  return mins ? `${mins}m ${secs}s` : `${secs}s`;
};

export const PrintableReport = React.forwardRef(({ attempt }, ref) => {
  if (!attempt) return null;
  const { test, telemetry, sectionScores = {} } = attempt;
  const questions = telemetry?.questions || [];
  const maxQuestionTime = Math.max(1, ...questions.map((q) => q.timeSpentSeconds || 0));

  // Flatten visits for Journey Map
  const allVisits = [];
  questions.forEach((q, index) => {
    const qNum = q.questionNumber || index + 1;
    if (q.visitLog && Array.isArray(q.visitLog)) {
      q.visitLog.forEach(visit => {
        if (visit.enteredAt) {
          allVisits.push({
            qNum,
            enteredAt: new Date(visit.enteredAt),
            durationSeconds: visit.durationSeconds || 0
          });
        }
      });
    }
  });
  allVisits.sort((a, b) => a.enteredAt - b.enteredAt);

  // Time vs Score data
  const timeVsScoreData = [...questions].sort((a, b) => (b.timeSpentSeconds || 0) - (a.timeSpentSeconds || 0));

  return (
    <div ref={ref} className="bg-white text-slate-900 p-10 w-[1200px]" style={{ minHeight: '1697px', fontFamily: 'sans-serif' }}>
      {/* Header */}
      <div className="flex justify-between items-end border-b-2 border-indigo-500 pb-4 mb-8">
        <div>
          <img src="/vayl-logo.png" alt="Vayl Logo" className="h-14 mb-2" />
          <p className="text-sm font-bold text-slate-500 uppercase tracking-widest mt-1">Test Performance Report</p>
        </div>
        <div className="text-right">
          <h2 className="text-2xl font-bold text-slate-800">{test?.title || 'Unknown Test'}</h2>
          <p className="text-sm text-slate-500">{new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-4 gap-4 mb-8">
        <div className="bg-indigo-50 p-4 rounded-xl border border-indigo-100">
          <p className="text-[10px] font-black uppercase tracking-widest text-indigo-500">Total Score</p>
          <p className="text-3xl font-black text-indigo-900 mt-1">{attempt.totalScore || 0} / {test?.totalMarks || 0}</p>
        </div>
        <div className="bg-emerald-50 p-4 rounded-xl border border-emerald-100">
          <p className="text-[10px] font-black uppercase tracking-widest text-emerald-600">Percentage</p>
          <p className="text-3xl font-black text-emerald-900 mt-1">{attempt.percentage || 0}%</p>
        </div>
        <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
          <p className="text-[10px] font-black uppercase tracking-widest text-blue-600">Time Spent</p>
          <p className="text-3xl font-black text-blue-900 mt-1">{formatDuration(telemetry?.totalTimeSpentSeconds || 0)}</p>
        </div>
        <div className="bg-rose-50 p-4 rounded-xl border border-rose-100">
          <p className="text-[10px] font-black uppercase tracking-widest text-rose-600">Tab Switches</p>
          <p className="text-3xl font-black text-rose-900 mt-1">{attempt.integrity?.tabSwitchCount || 0}</p>
        </div>
      </div>

      {/* Section Performance */}
      <div className="mb-10" style={{ pageBreakInside: 'avoid' }}>
        <h3 className="text-xl font-bold mb-4 border-b pb-2 text-slate-800">Section Performance</h3>
        <div className="grid grid-cols-3 gap-4">
          {Object.entries(sectionScores).map(([sec, data]) => (
            <div key={sec} className="border border-slate-200 p-4 rounded-xl bg-slate-50">
              <p className="font-bold text-lg uppercase text-slate-700">{sec}</p>
              <div className="flex justify-between mt-2 text-sm">
                <span className="text-slate-600">Score: <strong className="text-indigo-600">{data.score}</strong></span>
                <span className="text-slate-600">Accuracy: <strong className="text-emerald-600">{data.accuracy}%</strong></span>
              </div>
            </div>
          ))}
          {Object.keys(sectionScores).length === 0 && (
            <p className="text-slate-400 italic">No section data available.</p>
          )}
        </div>
      </div>

      {/* Journey Map - Wrapped for PDF */}
      {allVisits.length > 0 && (
        <div className="mb-10 mt-10" style={{ pageBreakInside: 'avoid' }}>
          <h3 className="text-xl font-bold mb-6 border-b pb-2 text-slate-800">Chronological Test Journey</h3>
          <div className="flex flex-wrap gap-y-12 gap-x-4 items-center">
            {allVisits.map((visit, i) => (
              <div key={i} className="flex items-center shrink-0">
                <div className="relative flex flex-col items-center">
                  <div className="w-10 h-10 rounded-full bg-indigo-500 text-white flex items-center justify-center font-bold text-sm shadow-sm z-10 shrink-0">
                    Q{visit.qNum}
                  </div>
                  <div className="absolute top-11 text-[9px] font-semibold text-slate-500 whitespace-nowrap">
                    {visit.enteredAt.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false })}
                  </div>
                </div>
                {i < allVisits.length - 1 && (
                  <div className="relative w-12 h-0.5 bg-slate-300 flex items-center justify-center z-0 -ml-1 -mr-1">
                     <div className="absolute -top-5 text-[9px] font-bold text-indigo-600 bg-indigo-50 border border-indigo-100 px-1.5 py-0.5 rounded-full whitespace-nowrap">
                       {formatDuration(visit.durationSeconds)}
                     </div>
                     <div className="absolute right-0 w-1.5 h-1.5 border-t-2 border-r-2 border-slate-400 transform rotate-45 -mt-0.5" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Question Breakdown Table */}
      {questions.length > 0 && (
        <div className="mt-10 mb-10" style={{ pageBreakBefore: 'always' }}>
          <h3 className="text-xl font-bold mb-4 border-b pb-2 text-slate-800">Question-by-Question Breakdown</h3>
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-100 text-xs uppercase tracking-wider text-slate-600">
                <th className="p-3 border border-slate-200 font-bold text-center w-12">Q.No</th>
                <th className="p-3 border border-slate-200 font-bold">Topic / Section</th>
                <th className="p-3 border border-slate-200 font-bold text-center w-28">Status</th>
                <th className="p-3 border border-slate-200 font-bold text-right w-28">Time Spent</th>
                <th className="p-3 border border-slate-200 font-bold text-center w-20">Visits</th>
              </tr>
            </thead>
            <tbody>
              {[...questions].sort((a, b) => (a.questionNumber || 0) - (b.questionNumber || 0)).map((q, idx) => {
                const qNum = q.questionNumber || questions.findIndex(item => item.questionId === q.questionId) + 1;
                const isAnswered = q.answered;
                const isWrong = q.resultStatus === 'wrong' || (q.score !== undefined && q.score < 0);
                const isCorrect = q.resultStatus === 'correct' || (q.score !== undefined && q.score > 0);
                
                const statusText = isCorrect ? 'Correct' : isWrong ? 'Incorrect' : isAnswered ? 'Answered' : 'Skipped';
                const statusColor = isCorrect ? 'text-emerald-700 bg-emerald-50 font-bold' : isWrong ? 'text-rose-700 bg-rose-50 font-bold' : isAnswered ? 'text-indigo-700 bg-indigo-50' : 'text-slate-500 bg-slate-50';
                const topicText = q.topic || q.section || '-';

                return (
                  <tr key={q.questionId || idx} className="text-sm border-b border-slate-200" style={{ pageBreakInside: 'avoid' }}>
                    <td className="p-3 border-r border-slate-200 text-center font-bold text-slate-600">{qNum}</td>
                    <td className="p-3 border-r border-slate-200 text-slate-700">{topicText}</td>
                    <td className={`p-3 border-r border-slate-200 text-center ${statusColor}`}>{statusText}</td>
                    <td className="p-3 border-r border-slate-200 text-right text-slate-700">{formatDuration(q.timeSpentSeconds)}</td>
                    <td className="p-3 text-center text-slate-600">{q.visitCount || 0}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Time Vs Score */}
      {timeVsScoreData.length > 0 && (
        <div className="mt-10 mb-10" style={{ pageBreakInside: 'avoid' }}>
          <h3 className="text-xl font-bold mb-4 border-b pb-2 text-slate-800">Time vs Score Analysis (Traps)</h3>
          <div className="space-y-3">
            {timeVsScoreData.map((q, idx) => {
              const qNum = q.questionNumber || questions.findIndex(item => item.questionId === q.questionId) + 1;
              const time = q.timeSpentSeconds || 0;
              const isAnswered = q.answered;
              const isWrong = q.resultStatus === 'wrong' || (q.score !== undefined && q.score < 0);
              const isCorrect = q.resultStatus === 'correct' || (q.score !== undefined && q.score > 0);
              
              const statusText = isCorrect ? 'Correct' : isWrong ? 'Wrong' : isAnswered ? 'Answered' : 'Skipped';
              const color = isCorrect ? 'bg-emerald-500' : isWrong ? 'bg-rose-500' : isAnswered ? 'bg-indigo-500' : 'bg-slate-300';
              const isTrap = time > 120 && (isWrong || (!isAnswered));
              
              return (
                <div key={q.questionId || idx} className="flex flex-row items-center gap-3 bg-slate-50 p-2 rounded-xl border border-slate-100" style={{ pageBreakInside: 'avoid' }}>
                   <div className="flex items-center gap-3 min-w-[70px]">
                     <div className="w-7 h-7 rounded-full bg-white border border-slate-200 flex items-center justify-center text-[10px] font-black text-slate-600 shrink-0">
                       Q{qNum}
                     </div>
                     {isTrap && <span className="text-[9px] font-black bg-rose-100 text-rose-700 px-1.5 py-0.5 rounded uppercase">Trap</span>}
                   </div>
                   <div className="flex-1 h-2 bg-slate-200 rounded-full overflow-hidden relative min-w-[100px]">
                      <div className={`absolute top-0 left-0 h-full ${color}`} style={{ width: `${Math.min(100, (time / (maxQuestionTime || 120)) * 100)}%` }} />
                   </div>
                   <div className="flex items-center gap-2 w-32 justify-end shrink-0">
                     <span className="text-xs font-black text-slate-700">{formatDuration(time)}</span>
                     <span className={`w-16 text-[9px] font-bold text-center rounded px-1 py-1 uppercase tracking-widest ${isCorrect ? 'text-emerald-700 bg-emerald-100' : isWrong ? 'text-rose-700 bg-rose-100' : 'text-slate-600 bg-slate-200'}`}>
                       {statusText}
                     </span>
                   </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="mt-16 text-center text-xs text-slate-400 font-bold border-t border-slate-200 pt-6 pb-4">
        Generated by Vayl.in • Performance Analytics
      </div>
    </div>
  );
});

PrintableReport.displayName = 'PrintableReport';
