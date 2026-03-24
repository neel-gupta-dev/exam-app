import React from 'react';
import Link from 'next/link';

export default function SignupPage() {
  return (
    <div className="font-body selection:bg-primary/30 selection:text-primary min-h-screen flex flex-col items-center justify-center relative overflow-hidden">
      {/* Ambient Background Elements */}
      <div className="orb bg-indigo-600 w-[500px] h-[500px] -top-48 -left-48"></div>
      <div className="orb bg-primary w-[400px] h-[400px] -bottom-32 -right-32"></div>
      <div className="orb bg-indigo-900 w-[300px] h-[300px] top-1/2 left-1/4 -translate-y-1/2 opacity-10"></div>
      <div className="absolute inset-0 grid-pattern pointer-events-none opacity-40"></div>
      
      {/* Header / Brand */}
      <header className="fixed top-0 w-full z-50 flex justify-between items-center px-8 h-16">
        <div className="flex items-center gap-2 text-xl font-headline font-bold tracking-tight text-white">
          <span className="material-symbols-outlined text-indigo-500 text-2xl">account_balance_wallet</span>
          Knowledge Vault
        </div>
      </header>
      
      <main className="w-full max-w-[480px] px-6 py-20 z-10">
        {/* Signup Card */}
        <div className="bg-surface-container/60 backdrop-blur-2xl rounded-2xl p-8 md:p-10 shadow-2xl relative border border-white/5">
          <div className="mb-8 text-center">
            <h1 className="font-headline text-3xl font-extrabold tracking-tight text-on-surface mb-2">Create your vault</h1>
            <p className="text-on-surface-variant text-sm">Secure your knowledge in the digital age.</p>
          </div>
          <form className="space-y-5">
            {/* Name Field */}
            <div className="space-y-1.5">
              <label className="font-label text-xs font-semibold uppercase tracking-wider text-on-surface-variant" htmlFor="full_name">Full Name</label>
              <input className="w-full bg-surface-container-highest/50 border border-white/5 text-on-surface placeholder:text-outline/50 p-3.5 rounded-xl focus:ring-2 focus:ring-indigo-500/50 transition-all outline-none text-sm" id="full_name" placeholder="John Doe" type="text"/>
            </div>
            {/* Email Field */}
            <div className="space-y-1.5">
              <label className="font-label text-xs font-semibold uppercase tracking-wider text-on-surface-variant" htmlFor="email">Email Address</label>
              <input className="w-full bg-surface-container-highest/50 border border-white/5 text-on-surface placeholder:text-outline/50 p-3.5 rounded-xl focus:ring-2 focus:ring-indigo-500/50 transition-all outline-none text-sm" id="email" placeholder="john@example.com" type="email"/>
            </div>
            {/* Password Field */}
            <div className="space-y-1.5">
              <label className="font-label text-xs font-semibold uppercase tracking-wider text-on-surface-variant" htmlFor="password">Password</label>
              <input className="w-full bg-surface-container-highest/50 border border-white/5 text-on-surface placeholder:text-outline/50 p-3.5 rounded-xl focus:ring-2 focus:ring-indigo-500/50 transition-all outline-none text-sm" id="password" placeholder="••••••••" type="password"/>
            </div>
            {/* Confirm Password Field */}
            <div className="space-y-1.5">
              <label className="font-label text-xs font-semibold uppercase tracking-wider text-on-surface-variant" htmlFor="confirm_password">Confirm Password</label>
              <input className="w-full bg-surface-container-highest/50 border border-white/5 text-on-surface placeholder:text-outline/50 p-3.5 rounded-xl focus:ring-2 focus:ring-indigo-500/50 transition-all outline-none text-sm" id="confirm_password" placeholder="••••••••" type="password"/>
            </div>
            {/* Action Button */}
            <button className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-headline font-bold py-4 rounded-xl transition-all transform active:scale-[0.98] shadow-xl shadow-indigo-600/20 mt-4" type="submit">
              Unlock Access
            </button>
            
            {/* Divider */}
            <div className="relative py-4">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full h-px bg-white/10"></div>
              </div>
              <div className="relative flex justify-center">
                <span className="bg-[#141a20] px-4 text-[10px] font-label text-outline uppercase tracking-[0.2em] rounded-full">Social Integration</span>
              </div>
            </div>
            
            {/* Social Options */}
            <div className="grid grid-cols-2 gap-4">
              <button className="flex items-center justify-center gap-2.5 bg-white/5 hover:bg-white/10 transition-colors py-3 rounded-xl border border-white/5" type="button">
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"></path>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"></path>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"></path>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"></path>
                </svg>
                <span className="font-label text-xs font-medium">Google</span>
              </button>
              <button className="flex items-center justify-center gap-2.5 bg-white/5 hover:bg-white/10 transition-colors py-3 rounded-xl border border-white/5" type="button">
                <span className="material-symbols-outlined text-[18px]">terminal</span>
                <span className="font-label text-xs font-medium">GitHub</span>
              </button>
            </div>
          </form>
          
          {/* Footer Link */}
          <div className="mt-8 text-center border-t border-white/5 pt-6">
            <p className="text-on-surface-variant text-sm">
              Already part of the network? 
              <Link className="text-indigo-400 hover:text-indigo-300 font-semibold transition-colors ml-1" href="/login">Login here</Link>
            </p>
          </div>
        </div>
        
        {/* System Message */}
        <div className="mt-8 p-4 rounded-xl bg-indigo-500/5 border border-indigo-500/10 flex gap-3 items-center">
          <span className="material-symbols-outlined text-indigo-400 text-sm">verified_user</span>
          <p className="text-[10px] font-label text-on-surface-variant uppercase tracking-wider">
            End-to-end encrypted protocol active
          </p>
        </div>
      </main>
      
      {/* Footer */}
      <footer className="mt-auto w-full py-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center px-12 gap-4 z-10">
        <div className="text-xs font-headline font-bold text-slate-500 uppercase tracking-widest">
          © 2024 Knowledge Vault Systems.
        </div>
        <div className="flex gap-8">
          <Link className="font-inter text-[10px] uppercase tracking-widest text-slate-600 hover:text-indigo-400 transition-colors" href="#">Terms</Link>
          <Link className="font-inter text-[10px] uppercase tracking-widest text-slate-600 hover:text-indigo-400 transition-colors" href="#">Privacy</Link>
          <Link className="font-inter text-[10px] uppercase tracking-widest text-slate-600 hover:text-indigo-400 transition-colors" href="#">Support</Link>
        </div>
      </footer>
    </div>
  );
}
