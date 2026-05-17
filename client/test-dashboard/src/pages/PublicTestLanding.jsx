import React, { useState, useEffect } from 'react';
import { API_BASE } from '../config/api';

export default function PublicTestLanding({ testId, onLogin }) {
  const [test, setTest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        const res = await fetch(`${API_BASE}/tests/${testId}/share-details`);
        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.message || 'Failed to load test details');
        }
        const data = await res.json();
        setTest(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchDetails();
  }, [testId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin"></div>
          <p className="text-slate-500 font-bold animate-pulse">Preparing your assessment...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-white border border-slate-200 p-10 rounded-[2.5rem] text-center shadow-2xl">
          <div className="w-20 h-20 bg-rose-50 text-rose-500 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-sm">
            <span className="material-symbols-outlined text-4xl">error_outline</span>
          </div>
          <h2 className="text-3xl font-black text-slate-900 mb-3">Oops!</h2>
          <p className="text-slate-500 font-medium mb-10 leading-relaxed">{error}</p>
          <a href="/" className="inline-flex items-center justify-center w-full py-4 bg-slate-900 text-white rounded-2xl font-bold hover:bg-slate-800 transition-all shadow-xl shadow-slate-900/10">
            Return Home
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fcfdff] text-slate-900 font-sans selection:bg-indigo-100">
      {/* Dynamic Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-5%] w-[45%] h-[45%] bg-indigo-200/30 blur-[100px] rounded-full animate-pulse"></div>
        <div className="absolute top-[20%] right-[-10%] w-[35%] h-[35%] bg-rose-100/40 blur-[100px] rounded-full animate-pulse delay-700"></div>
        <div className="absolute bottom-[-10%] left-[20%] w-[30%] h-[30%] bg-amber-100/30 blur-[100px] rounded-full animate-pulse delay-1000"></div>
      </div>

      <div className="relative max-w-6xl mx-auto px-6 py-4 lg:py-8">
        {/* Navigation Bar */}
        <nav className="flex items-center justify-between mb-8 lg:mb-12">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white shadow-xl shadow-indigo-500/10 flex items-center justify-center p-2 border border-slate-100">
              <img src="/vayl-logo.png" alt="Vayl" className="w-full h-full object-contain" />
            </div>
            <span className="font-black text-xl tracking-tight text-slate-900">Vayl <span className="text-indigo-600">Tests</span></span>
          </div>
          <button onClick={onLogin} className="hidden md:flex items-center gap-2 px-6 py-3 bg-white border border-slate-200 rounded-2xl font-bold text-sm text-slate-700 hover:bg-slate-50 shadow-sm transition-all">
            Sign In
          </button>
        </nav>

        <div className="grid lg:grid-cols-12 gap-16 items-center">
          {/* Main Hero Content */}
          <div className="lg:col-span-7 space-y-10">
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-600 text-xs font-black uppercase tracking-wider">
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-ping"></span>
                {test.category || 'Standard Mock Test'}
              </div>
              
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-black tracking-tight leading-tight text-slate-900">
                Master your <span className="text-indigo-600">readiness</span> today.
              </h1>
              
              <div className="flex items-center gap-4 text-2xl md:text-3xl font-bold text-slate-600">
                <span>{test.title}</span>
              </div>
              
              <p className="text-xl text-slate-500 leading-relaxed max-w-xl font-medium">
                {test.description || 'Access high-yield questions, real-time analytics, and detailed solutions to excel in your upcoming examinations.'}
              </p>
            </div>

            {/* Feature Pills */}
            <div className="flex flex-wrap gap-3">
              {['Instant Results', 'Detailed Analytics', 'Expert Solutions', 'JEE/NEET Level'].map(tag => (
                <span key={tag} className="px-4 py-2 rounded-xl bg-white border border-slate-100 shadow-sm text-sm font-bold text-slate-600">
                  {tag}
                </span>
              ))}
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div className="p-6 rounded-3xl bg-amber-50 border border-amber-100 group hover:scale-[1.02] transition-all">
                <div className="w-12 h-12 rounded-2xl bg-white text-amber-600 flex items-center justify-center mb-4 shadow-sm">
                  <span className="material-symbols-outlined text-3xl font-bold">timer</span>
                </div>
                <div className="text-3xl font-black text-amber-900">{test.durationMinutes}m</div>
                <div className="text-[10px] font-black text-amber-600 uppercase tracking-widest mt-1">Time Allotted</div>
              </div>
              
              <div className="p-6 rounded-3xl bg-emerald-50 border border-emerald-100 group hover:scale-[1.02] transition-all">
                <div className="w-12 h-12 rounded-2xl bg-white text-emerald-600 flex items-center justify-center mb-4 shadow-sm">
                  <span className="material-symbols-outlined text-3xl font-bold">military_tech</span>
                </div>
                <div className="text-3xl font-black text-emerald-900">{test.totalMarks}</div>
                <div className="text-[10px] font-black text-emerald-600 uppercase tracking-widest mt-1">Full Marks</div>
              </div>

              <div className="p-6 rounded-3xl bg-violet-50 border border-violet-100 hidden md:block group hover:scale-[1.02] transition-all">
                <div className="w-12 h-12 rounded-2xl bg-white text-violet-600 flex items-center justify-center mb-4 shadow-sm">
                  <span className="material-symbols-outlined text-3xl font-bold">quiz</span>
                </div>
                <div className="text-3xl font-black text-violet-900">{test.sections?.length || 3}</div>
                <div className="text-[10px] font-black text-violet-600 uppercase tracking-widest mt-1">Sections</div>
              </div>
            </div>
          </div>

          {/* Action Card (Glassmorphism Light) */}
          <div className="lg:col-span-5">
            <div className="p-10 md:p-12 rounded-[3.5rem] bg-white shadow-[0_50px_100px_-20px_rgba(99,102,241,0.15)] border border-slate-100 relative overflow-hidden">
              {/* Decorative Circle */}
              <div className="absolute -top-12 -right-12 w-48 h-48 bg-gradient-to-br from-indigo-500/10 to-violet-500/10 rounded-full blur-3xl"></div>
              
              <div className="relative z-10">
                <h3 className="text-3xl font-black text-slate-900 leading-tight mb-4">
                  Begin your assessment
                </h3>
                <p className="text-slate-500 font-medium mb-10 leading-relaxed">
                  Join 1,200+ students currently preparing with Vayl. Your progress is saved automatically across all devices.
                </p>

                <div className="space-y-4">
                  <button
                    onClick={onLogin}
                    className="w-full bg-slate-900 text-white rounded-3xl py-5 px-8 font-black flex items-center justify-center gap-4 hover:bg-slate-800 hover:-translate-y-1 active:scale-[0.98] transition-all shadow-2xl shadow-slate-900/20"
                  >
                    <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="" className="w-6 h-6 bg-white rounded-full p-1 shadow-sm" />
                    Continue with Google
                  </button>
                  
                  <div className="flex items-center gap-3 py-4">
                    <div className="flex-1 h-px bg-slate-100"></div>
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Verified Secure</span>
                    <div className="flex-1 h-px bg-slate-100"></div>
                  </div>
                </div>
              </div>
            </div>
            
            <p className="mt-8 text-center text-slate-400 text-xs font-bold px-12">
              By continuing, you agree to our <a href="https://vayl.in/terms" target="_blank" rel="noopener noreferrer" className="text-slate-900 underline hover:text-indigo-600 transition-colors">Terms of Service</a> & <a href="https://vayl.in/privacy-policy" target="_blank" rel="noopener noreferrer" className="text-slate-900 underline hover:text-indigo-600 transition-colors">Privacy Policy</a>.
            </p>
          </div>
        </div>
      </div>
      
      {/* Footer Branding */}
      <footer className="relative mt-24 py-12 text-center border-t border-slate-50">
        <p className="text-slate-400 text-sm font-bold uppercase tracking-[0.3em]">
          Powered by <span className="text-slate-900">Vayl Technologies</span>
        </p>
      </footer>
    </div>
  );
}
