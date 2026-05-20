import LatexRenderer from '../components/LatexRenderer';
import { API_BASE } from '../config/api';

const formatDuration = (seconds = 0) => {
  const total = Math.max(0, Math.round(Number(seconds) || 0));
  const mins = Math.floor(total / 60);
  const secs = total % 60;
  return mins ? `${mins}m ${secs}s` : `${secs}s`;
};

function ContentTable({ table }) {
  if (!table?.headers?.length) return null;
  return (
    <div className="my-4 overflow-x-auto rounded-2xl border border-slate-200">
      <table className="w-full min-w-[360px] border-collapse bg-white">
        <thead className="bg-slate-50">
          <tr>
            {table.headers.map((header, index) => (
              <th key={index} className="border-b border-slate-200 px-4 py-3 text-left text-xs font-black uppercase tracking-widest text-slate-500">
                <LatexRenderer text={header || ''} />
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {(table.rows || []).map((row, rowIndex) => (
            <tr key={rowIndex} className="border-b border-slate-100 last:border-b-0">
              {row.map((cell, cellIndex) => (
                <td key={cellIndex} className="px-4 py-3 text-sm text-slate-700">
                  <LatexRenderer text={cell || ''} />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function ReviewPage({
  user,
  attemptId,
  loading = false,
  error = '',
  reviewData = null,
  onBack,
}) {
  const summary = reviewData?.attemptSummary;
  const questions = reviewData?.questions || [];
  const correct = questions.filter((q) => q.resultStatus === 'correct').length;
  const wrong = questions.filter((q) => q.resultStatus === 'wrong').length;
  const skipped = questions.filter((q) => q.resultStatus === 'skipped').length;

  const raiseDoubt = async (questionId) => {
    try {
      await fetch(`${API_BASE}/assessment/doubts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user.token}`,
        },
        body: JSON.stringify({
          questionId,
          testId: summary?.testId,
          attemptId,
        }),
      });
      alert('Doubt raised successfully. Your teacher will review this question.');
    } catch {
      alert('Failed to raise doubt. Please try again.');
    }
  };

  return (
    <div className="mx-auto max-w-6xl space-y-7">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <button onClick={onBack} className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-slate-600 shadow-sm transition hover:bg-slate-50">
          <span className="material-symbols-outlined text-lg">arrow_back</span>
          Back to Tests
        </button>
        {reviewData && (
          <div className="flex flex-wrap gap-2">
            <span className="rounded-full border border-emerald-100 bg-emerald-50 px-3 py-1 text-xs font-black text-emerald-700">{correct} Correct</span>
            <span className="rounded-full border border-rose-100 bg-rose-50 px-3 py-1 text-xs font-black text-rose-700">{wrong} Wrong</span>
            <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-black text-slate-600">{skipped} Skipped</span>
          </div>
        )}
      </div>

      {loading ? (
        <div className="rounded-3xl border border-slate-200 bg-white p-10 text-center shadow-sm">
          <span className="material-symbols-outlined animate-spin text-4xl text-indigo-500">sync</span>
          <p className="mt-3 font-semibold text-slate-500">Loading review...</p>
        </div>
      ) : error ? (
        <div className="rounded-3xl border border-red-100 bg-red-50 p-6 font-semibold text-red-600">{error}</div>
      ) : reviewData ? (
        <div className="space-y-6">
          <section className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm md:p-8">
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-slate-400">Attempt Review</p>
            <div className="mt-3 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <h1 className="text-3xl font-black tracking-tight text-slate-950 md:text-5xl">{summary.testTitle}</h1>
                <p className="mt-3 text-sm font-semibold text-slate-500">
                  Submitted {summary.submittedAt ? new Date(summary.submittedAt).toLocaleString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'recently'}
                </p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-2xl bg-indigo-50 px-5 py-4 text-center">
                  <p className="text-xs font-bold uppercase tracking-widest text-indigo-500">Score</p>
                  <p className="mt-1 text-xl font-black text-indigo-700">{summary.totalScore} / {summary.maxPossibleScore}</p>
                </div>
                <div className="rounded-2xl bg-emerald-50 px-5 py-4 text-center">
                  <p className="text-xs font-bold uppercase tracking-widest text-emerald-600">Percent</p>
                  <p className="mt-1 text-xl font-black text-emerald-700">{summary.percentage}%</p>
                </div>
              </div>
            </div>
          </section>

          {(summary.totalTimeSpentSeconds != null || summary.tabSwitchCount > 0) && (
            <section className="grid gap-3 md:grid-cols-2">
              <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
                <p className="text-xs font-black uppercase tracking-widest text-slate-400">Tracked Time</p>
                <p className="mt-2 text-2xl font-black text-slate-950">{formatDuration(summary.totalTimeSpentSeconds)}</p>
              </div>
              <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
                <p className="text-xs font-black uppercase tracking-widest text-slate-400">Tab Switches</p>
                <p className="mt-2 text-2xl font-black text-slate-950">{summary.tabSwitchCount || 0}</p>
              </div>
            </section>
          )}

          {!summary.solutionsUnlocked && (
            <div className="rounded-3xl border border-amber-200 bg-amber-50 p-5 text-sm font-semibold leading-6 text-amber-800">
              Solutions and answer keys are locked by the admin release policy. Score and attempt analytics remain available.
            </div>
          )}

          <section className="space-y-5">
            {questions.map((question, index) => {
              const isCorrect = question.resultStatus === 'correct';
              const isWrong = question.resultStatus === 'wrong';
              const isSkipped = question.resultStatus === 'skipped';
              const statusClass = isCorrect
                ? 'border-emerald-200 bg-emerald-50/30'
                : isWrong
                  ? 'border-rose-200 bg-rose-50/30'
                  : 'border-slate-200 bg-white';

              return (
                <article key={question._id || index} className={`rounded-3xl border p-5 shadow-sm ${statusClass}`}>
                  <div className="mb-5 flex flex-wrap items-center justify-between gap-3 border-b border-slate-200/70 pb-4">
                    <div className="flex items-center gap-3">
                      <span className="flex h-9 w-9 items-center justify-center rounded-2xl bg-slate-950 text-sm font-black text-white">Q{index + 1}</span>
                      <span className="rounded-full bg-white px-3 py-1 text-xs font-black uppercase tracking-wider text-slate-500">{question.section || 'General'}</span>
                    </div>
                    <div className="flex flex-wrap gap-2 text-xs font-bold">
                      <span className="rounded-full bg-white px-3 py-1 text-slate-600">{formatDuration(question.timeSpentSeconds)}</span>
                      <span className="rounded-full bg-white px-3 py-1 text-slate-600">{question.visitCount || 0} visits</span>
                      <span className="rounded-full bg-white px-3 py-1 text-slate-600">{question.answerChangeCount || 0} changes</span>
                      <span className={`rounded-full px-3 py-1 text-white ${isCorrect ? 'bg-emerald-600' : isWrong ? 'bg-rose-600' : 'bg-slate-500'}`}>
                        {isCorrect ? `Correct (+${question.positiveMarks})` : isWrong ? `Incorrect (-${question.negativeMarks})` : 'Skipped'}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="whitespace-pre-wrap text-base font-medium leading-7 text-slate-800">
                      <LatexRenderer text={question.content} />
                    </div>
                    <ContentTable table={question.contentTable || question.table} />
                    {question.imageUrl && (
                      <div className="inline-block max-w-full rounded-2xl border border-slate-200 bg-white p-2">
                        <img src={question.imageUrl} alt={`Question ${index + 1}`} className="max-h-72 rounded-xl object-contain" />
                      </div>
                    )}
                  </div>

                  {(question.type === 'single' || question.type === 'multiple') && question.options && (
                    <div className="mt-6 grid gap-3">
                      {question.options.map((option, optionIndex) => {
                        const optionLetter = String.fromCharCode(65 + optionIndex);
                        const label = option.label || optionLetter;
                        const userMarked = question.userAnswer?.includes(label);
                        const correctAnswer = question.correctAnswer?.includes(label);
                        const optionClass = userMarked && correctAnswer
                          ? 'border-emerald-400 bg-emerald-50 text-emerald-800'
                          : userMarked && !correctAnswer
                            ? 'border-rose-400 bg-rose-50 text-rose-800'
                            : correctAnswer
                              ? 'border-emerald-300 bg-white text-emerald-800'
                              : 'border-slate-200 bg-white text-slate-700';

                        return (
                          <div key={optionIndex} className={`rounded-2xl border-2 p-4 ${optionClass}`}>
                            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                              <div className="flex gap-3">
                                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border bg-white text-xs font-black">{label}</span>
                                <div className="text-sm leading-6">
                                  <LatexRenderer text={option.content} />
                                  {option.imageUrl && (
                                    <img src={option.imageUrl} alt={`Option ${label}`} className="mt-3 max-h-32 rounded-xl border border-slate-200 bg-white object-contain p-1" />
                                  )}
                                </div>
                              </div>
                              {(userMarked || correctAnswer) && (
                                <span className="shrink-0 rounded-full bg-white px-3 py-1 text-[10px] font-black uppercase tracking-wider">
                                  {userMarked && correctAnswer ? 'Your Answer & Correct' : userMarked ? 'Your Answer' : 'Correct Key'}
                                </span>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {question.type === 'integer' && (
                    <div className="mt-6 grid gap-3 sm:grid-cols-2">
                      {!isSkipped && (
                        <div className={`rounded-2xl border p-4 ${isCorrect ? 'border-emerald-200 bg-emerald-50' : 'border-rose-200 bg-rose-50'}`}>
                          <p className="text-xs font-black uppercase tracking-widest text-slate-500">Your Answer</p>
                          <p className="mt-1 text-xl font-black text-slate-950">{question.userAnswer?.join(', ') || '-'}</p>
                        </div>
                      )}
                      <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
                        <p className="text-xs font-black uppercase tracking-widest text-emerald-700">Correct Answer</p>
                        <p className="mt-1 text-xl font-black text-emerald-800">{question.correctAnswer?.join(', ') || '-'}</p>
                      </div>
                    </div>
                  )}

                  {(question.solution || question.solutionImageUrl) && (
                    <div className="mt-6 rounded-2xl border border-indigo-100 bg-indigo-50/50 p-5">
                      <h3 className="mb-3 flex items-center gap-2 text-xs font-black uppercase tracking-widest text-indigo-700">
                        <span className="material-symbols-outlined text-base">lightbulb</span>
                        Solution
                      </h3>
                      {question.solution && (
                        <div className="whitespace-pre-wrap text-sm leading-6 text-slate-700">
                          <LatexRenderer text={question.solution} />
                        </div>
                      )}
                      {question.solutionImageUrl && (
                        <img src={question.solutionImageUrl} alt="Solution" className="mt-3 max-h-72 rounded-xl border border-slate-200 bg-white object-contain p-2" />
                      )}
                    </div>
                  )}

                  <div className="mt-5 flex justify-end">
                    <button onClick={() => raiseDoubt(question._id)} className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-2 text-xs font-black text-amber-700 transition hover:bg-amber-100">
                      Raise a Doubt
                    </button>
                  </div>
                </article>
              );
            })}
          </section>
        </div>
      ) : null}
    </div>
  );
}
