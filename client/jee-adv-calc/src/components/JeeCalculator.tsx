"use client";

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, Link as LinkIcon, CheckCircle2, XCircle, MinusCircle, AlertCircle, RefreshCcw, FileCode } from 'lucide-react';
import api from '../lib/api';

export default function JeeCalculator() {
  const [paper1Url, setPaper1Url] = useState('');
  const [paper2Url, setPaper2Url] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [results, setResults] = useState<any>(null);

  const handleCalculate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const { data } = await api.post('/jee-calculator/calculate', { paper1Url, paper2Url });
      setResults(data);
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setResults(null);
    setPaper1Url('');
    setPaper2Url('');
    setError('');
  };

  return (
    <div className="max-w-6xl mx-auto w-full">
      <AnimatePresence mode="wait">
        {!results ? (
          <motion.div
            key="input-section"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="flex flex-col items-center justify-center min-h-[70vh]"
          >
            <div className="text-center mb-10">
              <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight mb-4">
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400">
                  JEE Advanced
                </span>
                <br /> Marks Calculator
              </h1>
              <p className="text-slate-400 text-lg max-w-2xl mx-auto">
                Paste your official response sheet URL or raw HTML source to instantly calculate your marks, get detailed section-wise insights, and verify your answers.
              </p>
            </div>

            <div className="glass p-8 rounded-3xl w-full max-w-2xl shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-emerald-500" />
              
              <form onSubmit={handleCalculate} className="space-y-4">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Paper 1 Response Sheet URL</label>
                    <input 
                      type="url" 
                      value={paper1Url}
                      onChange={(e) => setPaper1Url(e.target.value)}
                      placeholder="https://cdn3.digialm.com/..." 
                      className="w-full bg-slate-900/50 border border-slate-650 rounded-xl px-4 py-3 text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Paper 2 Response Sheet URL</label>
                    <input 
                      type="url" 
                      value={paper2Url}
                      onChange={(e) => setPaper2Url(e.target.value)}
                      placeholder="https://cdn3.digialm.com/..." 
                      className="w-full bg-slate-900/50 border border-slate-650 rounded-xl px-4 py-3 text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm"
                    />
                  </div>
                </div>

                {error && (
                  <div className="flex items-center gap-2 text-red-400 bg-red-400/10 p-3 rounded-lg text-sm border border-red-500/20">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <p>{error}</p>
                  </div>
                )}

                <button 
                  disabled={loading || !paper1Url || !paper2Url}
                  type="submit" 
                  className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-3 px-6 rounded-xl transition-all shadow-lg hover:shadow-blue-500/25 flex items-center justify-center gap-2 cursor-pointer text-sm"
                >
                  {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Calculate Score'}
                </button>
              </form>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="results-section"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="py-10"
          >
            {/* Header / Meta */}
            <div className="flex flex-wrap items-center justify-between gap-6 mb-8 pb-8 border-b border-slate-800">
              <div>
                <h2 className="text-3xl font-bold text-white mb-3">{results.candidateInfo?.examTitle || 'JEE Advanced Results'}</h2>
                <div className="flex flex-wrap gap-x-6 gap-y-2 text-slate-400 text-sm">
                  <div>
                    <span className="text-slate-500 font-medium">Candidate Name:</span>{' '}
                    <span className="text-slate-200 font-semibold">
                      {results.candidateInfo?.['Candidate Name'] || results.candidateInfo?.['Participant Name'] || results.candidateInfo?.candidateName || 'N/A'}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 font-medium">Candidate ID:</span>{' '}
                    <span className="text-slate-200 font-semibold font-mono">
                      {results.candidateInfo?.['Candidate ID'] || results.candidateInfo?.['Participant ID'] || results.candidateInfo?.candidateId || 'N/A'}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 font-medium">Subject:</span>{' '}
                    <span className="text-slate-200 font-semibold">
                      {results.candidateInfo?.['Subject'] || results.candidateInfo?.Subject || 'N/A'}
                    </span>
                  </div>
                </div>
              </div>
              <button onClick={reset} className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 transition-colors border border-slate-700/50 text-sm font-medium shadow-md">
                <RefreshCcw className="w-4 h-4" /> Try Another
              </button>
            </div>

            {/* Dynamic calculations for paper-wise scores */}
            {(() => {
              const paper1Questions = results.questions.filter((q: any) => q.paper === 1);
              const paper2Questions = results.questions.filter((q: any) => q.paper === 2);
              
              const hasPaper1 = paper1Questions.length > 0;
              const hasPaper2 = paper2Questions.length > 0;
              
              const paper1Score = hasPaper1 ? paper1Questions.reduce((sum: number, q: any) => sum + q.marks, 0) : results.totalScore;
              const paper2Score = hasPaper2 ? paper2Questions.reduce((sum: number, q: any) => sum + q.marks, 0) : 0;
              
              const paper1Attempted = paper1Questions.filter((q: any) => q.isAttempted).length;
              const paper2Attempted = paper2Questions.filter((q: any) => q.isAttempted).length;

              return (
                <>
                  {/* Top Stats */}
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                    <div className="md:col-span-1 glass rounded-2xl p-6 flex flex-col justify-center items-center relative overflow-hidden group">
                      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-emerald-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                      <p className="text-slate-400 font-medium mb-2 z-10">Total Score</p>
                      <div className="flex items-baseline gap-2 z-10">
                        <span className="text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400">
                          {results.totalScore}
                        </span>
                        <span className="text-slate-500 font-bold">/ {results.maxScore}</span>
                      </div>
                    </div>

                    <div className="md:col-span-3 grid grid-cols-2 md:grid-cols-4 gap-4">
                      <StatCard label="Attempted" value={`${results.totalAttempted}/${results.questions.length}`} icon={<FileCode className="text-blue-400 w-5 h-5"/>} />
                      <StatCard label="Correct" value={results.totalCorrect} icon={<CheckCircle2 className="text-emerald-400 w-5 h-5"/>} />
                      <StatCard label="Positive Marks" value={`+${results.positiveMarks}`} icon={<span className="text-emerald-400 font-bold">+</span>} />
                      <StatCard label="Negative Marks" value={results.negativeMarks} icon={<span className="text-red-400 font-bold">-</span>} />
                    </div>
                  </div>

                  {/* Individual Paper Scores */}
                  {hasPaper2 && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8 animate-in fade-in duration-500">
                      <div className="bg-slate-800/35 border border-slate-700/50 rounded-2xl p-5 flex items-center justify-between">
                        <div>
                          <h4 className="text-slate-400 text-sm font-semibold uppercase tracking-wider mb-1">Paper 1 Score</h4>
                          <p className="text-xs text-slate-500">Attempted: {paper1Attempted} / {paper1Questions.length} Qs</p>
                        </div>
                        <div className="text-right">
                          <span className="text-3xl font-black text-blue-400">{paper1Score}</span>
                          <span className="text-slate-500 font-semibold text-sm"> / 168</span>
                        </div>
                      </div>
                      <div className="bg-slate-800/35 border border-slate-700/50 rounded-2xl p-5 flex items-center justify-between">
                        <div>
                          <h4 className="text-slate-400 text-sm font-semibold uppercase tracking-wider mb-1">Paper 2 Score</h4>
                          <p className="text-xs text-slate-500">Attempted: {paper2Attempted} / {paper2Questions.length} Qs</p>
                        </div>
                        <div className="text-right">
                          <span className="text-3xl font-black text-emerald-400">{paper2Score}</span>
                          <span className="text-slate-500 font-semibold text-sm"> / 168</span>
                        </div>
                      </div>
                    </div>
                  )}
                </>
              );
            })()}

            {/* Subject Breakdown */}
            <h3 className="text-xl font-bold text-slate-200 mb-4">Subject-wise Breakdown</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              {Object.entries(results.subjectWise).map(([subject, stats]: [string, any]) => (
                <div key={subject} className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-5">
                  <div className="flex justify-between items-center mb-4">
                    <h4 className="font-bold text-lg">{subject}</h4>
                    <span className="font-mono bg-slate-900 px-3 py-1 rounded-full text-sm">
                      <span className="text-white">{stats.score}</span>
                      <span className="text-slate-500">/{stats.max}</span>
                    </span>
                  </div>
                  
                  {/* Progress Bar */}
                  <div className="h-2 w-full bg-slate-900 rounded-full mb-4 overflow-hidden flex">
                    <div className="bg-emerald-500 h-full" style={{ width: `${(stats.correct / 16) * 100}%` }} />
                    <div className="bg-red-500 h-full" style={{ width: `${(stats.wrong / 16) * 100}%` }} />
                    <div className="bg-slate-700 h-full" style={{ width: `${(stats.unattempted / 16) * 100}%` }} />
                  </div>

                  <div className="grid grid-cols-3 gap-2 text-center text-xs">
                    <div className="bg-emerald-500/10 text-emerald-400 py-2 rounded-lg">
                      <span className="block font-bold text-lg">{stats.correct}</span> Correct
                    </div>
                    <div className="bg-red-500/10 text-red-400 py-2 rounded-lg">
                      <span className="block font-bold text-lg">{stats.wrong}</span> Wrong
                    </div>
                    <div className="bg-slate-700/30 text-slate-400 py-2 rounded-lg">
                      <span className="block font-bold text-lg">{stats.unattempted}</span> Skip
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Detailed Question Table */}
            <h3 className="text-xl font-bold text-slate-200 mb-4">Detailed Question Analysis</h3>
            <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-800/80 border-b border-slate-700 text-slate-400 text-sm">
                      <th className="p-4 font-medium">Paper</th>
                      <th className="p-4 font-medium">Q.ID</th>
                      <th className="p-4 font-medium">Subject</th>
                      <th className="p-4 font-medium">Section</th>
                      <th className="p-4 font-medium text-center">Your Answer</th>
                      <th className="p-4 font-medium text-center">Correct Key</th>
                      <th className="p-4 font-medium text-center">Marks</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/50">
                    {results.questions.map((q: any) => (
                      <tr key={`${q.paper || 1}_${q.questionId}`} className="hover:bg-slate-800/30 transition-colors">
                        <td className="p-4 text-sm font-semibold text-blue-400">Paper {q.paper || 1}</td>
                        <td className="p-4 font-mono text-sm text-slate-300">{q.questionId}</td>
                        <td className="p-4 text-sm">{q.subject}</td>
                        <td className="p-4 text-sm text-slate-400">{q.section}</td>
                        <td className="p-4 text-center">
                          {q.isAttempted ? (
                            <span className="font-mono bg-slate-800 px-2 py-1 rounded text-white">{q.chosenOption || q.givenAnswer}</span>
                          ) : (
                            <span className="text-slate-500">-</span>
                          )}
                        </td>
                        <td className="p-4 text-center">
                          {q.correctAnswer ? (
                            <span className="font-mono bg-emerald-500/20 text-emerald-400 px-2 py-1 rounded">{q.correctAnswer}</span>
                          ) : (
                            <span className="text-slate-500 text-xs italic">Unknown</span>
                          )}
                        </td>
                        <td className="p-4 text-center">
                          <StatusBadge status={q.evalStatus} marks={q.marks} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function StatCard({ label, value, icon }: { label: string, value: string | number, icon: React.ReactNode }) {
  return (
    <div className="bg-slate-800/40 border border-slate-700/50 rounded-2xl p-4 flex items-center gap-4">
      <div className="w-12 h-12 rounded-xl bg-slate-900/80 flex items-center justify-center border border-slate-700/50">
        {icon}
      </div>
      <div>
        <p className="text-slate-400 text-sm mb-1">{label}</p>
        <p className="text-2xl font-bold text-white">{value}</p>
      </div>
    </div>
  );
}

function StatusBadge({ status, marks }: { status: string, marks: number }) {
  if (status === 'correct') {
    return <span className="inline-flex items-center gap-1 text-emerald-400 bg-emerald-400/10 px-2 py-1 rounded-md font-bold text-sm"><CheckCircle2 className="w-4 h-4"/> +{marks}</span>;
  }
  if (status === 'wrong') {
    return <span className="inline-flex items-center gap-1 text-red-400 bg-red-400/10 px-2 py-1 rounded-md font-bold text-sm"><XCircle className="w-4 h-4"/> {marks}</span>;
  }
  if (status === 'partial') {
    return <span className="inline-flex items-center gap-1 text-blue-400 bg-blue-400/10 px-2 py-1 rounded-md font-bold text-sm"><CheckCircle2 className="w-4 h-4"/> +{marks}</span>;
  }
  if (status === 'unattempted') {
    return <span className="inline-flex items-center gap-1 text-slate-500 bg-slate-800 px-2 py-1 rounded-md font-medium text-sm"><MinusCircle className="w-4 h-4"/> 0</span>;
  }
  return <span className="text-slate-500 text-xs">Pending</span>;
}
