import React from 'react';
import Link from 'next/link';

export default function LoginPage() {
  return (
    <div className="font-body text-on-surface antialiased min-h-screen flex items-center justify-center relative overflow-hidden mesh-grid">
      {/* Dynamic Background Orbs */}
      <div className="orb bg-primary w-[500px] h-[500px] -top-48 -left-24 animate-pulse"></div>
      <div className="orb bg-on-primary-fixed-variant w-[400px] h-[400px] bottom-0 -right-20" style={{ animationDelay: '2s' }}></div>
      <div className="orb bg-tertiary w-[300px] h-[300px] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-[0.05]"></div>

      {/* Login Container */}
      <main className="relative z-10 w-full max-w-[440px] px-6">
        {/* Header / Logo Area */}
        <div className="mb-12 text-center">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-primary-container to-on-primary-fixed-variant mb-6 shadow-xl shadow-primary-container/20">
            <span className="material-symbols-outlined text-3xl text-primary-fixed">auto_stories</span>
          </div>
          <h1 className="font-headline text-4xl font-extrabold tracking-tight text-white mb-3">
            Knowledge Vault
          </h1>
          <p className="text-on-surface-variant text-sm font-medium tracking-wide border-b border-transparent uppercase">
            Access your digital library
          </p>
        </div>

        {/* The Central Login Card */}
        <section className="glass-card rounded-2xl p-8 shadow-2xl relative overflow-hidden group">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary/30 to-transparent"></div>
          <h2 className="font-headline text-xl font-bold mb-8 text-on-surface">Welcome back</h2>
          <form className="space-y-6">
            {/* Email Field */}
            <div className="space-y-2">
              <label className="font-label text-xs font-bold text-on-surface-variant ml-1 uppercase tracking-widest" htmlFor="email">Email Address</label>
              <div className="relative group/input">
                <input className="w-full bg-surface-container-highest/50 border border-outline-variant/30 rounded-xl py-3.5 px-4 text-sm text-on-surface placeholder:text-outline/60 focus:ring-2 focus:ring-primary/20 focus:border-primary/50 transition-all outline-none" id="email" name="email" placeholder="scholar@vault.io" type="email" />
              </div>
            </div>
            {/* Password Field */}
            <div className="space-y-2">
              <div className="flex justify-between items-center ml-1">
                <label className="font-label text-xs font-bold text-on-surface-variant uppercase tracking-widest" htmlFor="password">Password</label>
                <Link className="text-xs font-semibold text-primary hover:text-primary-dim transition-colors" href="#">Forgot password?</Link>
              </div>
              <div className="relative group/input">
                <input className="w-full bg-surface-container-highest/50 border border-outline-variant/30 rounded-xl py-3.5 px-4 text-sm text-on-surface placeholder:text-outline/60 focus:ring-2 focus:ring-primary/20 focus:border-primary/50 transition-all outline-none" id="password" name="password" placeholder="••••••••" type="password" />
              </div>
            </div>
            {/* Remember Me */}
            <div className="flex items-center space-x-3 py-1 ml-1">
              <input className="w-4 h-4 rounded-md bg-surface-container-highest border-outline-variant/50 text-primary-container focus:ring-0 focus:ring-offset-0 cursor-pointer" id="remember" name="remember" type="checkbox" />
              <label className="text-xs font-medium text-on-surface-variant cursor-pointer select-none" htmlFor="remember">Keep session active</label>
            </div>
            {/* Primary CTA */}
            <button className="w-full bg-primary-container text-primary-fixed font-headline font-bold py-4 rounded-xl shadow-lg shadow-primary-container/20 hover:bg-on-primary-fixed-variant hover:-translate-y-0.5 active:scale-[0.98] transition-all flex justify-center items-center gap-3 group/btn" type="submit">
              Unlock Vault
              <span className="material-symbols-outlined text-xl group-hover:translate-x-1 transition-transform">key</span>
            </button>
          </form>

          {/* Divider */}
          <div className="relative my-10">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-outline-variant/10"></div>
            </div>
            <div className="relative flex justify-center text-[10px]">
              <span className="px-4 bg-[#141a20]/60 backdrop-blur-md rounded-full text-outline font-bold tracking-widest uppercase">External access</span>
            </div>
          </div>

          {/* Social Logins */}
          <div className="grid grid-cols-2 gap-4">
            <button className="flex items-center justify-center gap-3 py-3 px-4 bg-surface-container-low/40 border border-outline-variant/20 rounded-xl hover:bg-surface-bright/60 hover:border-outline-variant/40 transition-all text-on-surface text-sm font-medium">
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="currentColor"></path>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="currentColor"></path>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="currentColor"></path>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="currentColor"></path>
              </svg>
              Google
            </button>
            <button className="flex items-center justify-center gap-3 py-3 px-4 bg-surface-container-low/40 border border-outline-variant/20 rounded-xl hover:bg-surface-bright/60 hover:border-outline-variant/40 transition-all text-on-surface text-sm font-medium">
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" fill="currentColor"></path>
              </svg>
              GitHub
            </button>
          </div>
        </section>

        {/* Footer / Redirect */}
        <div className="mt-10 text-center">
          <p className="text-sm text-on-surface-variant">
            First time here?
            <Link className="text-primary font-bold hover:text-white transition-colors underline underline-offset-8 ml-1" href="/signup">Request Access</Link>
          </p>
        </div>
      </main>

      {/* Page Footer Information */}
      <footer className="fixed bottom-0 left-0 w-full py-8 px-12 flex flex-col md:flex-row justify-between items-center gap-6 z-20">
        <div className="text-[10px] font-headline font-bold text-outline uppercase tracking-[0.2em] flex items-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full bg-primary/40"></div>
          Knowledge Vault Secure Node
        </div>
        <div className="flex gap-8">
          <Link className="font-inter text-xs text-slate-500 hover:text-primary transition-colors" href="#">Privacy</Link>
          <Link className="font-inter text-xs text-slate-500 hover:text-primary transition-colors" href="#">Terms</Link>
          <Link className="font-inter text-xs text-slate-500 hover:text-primary transition-colors" href="#">Support</Link>
        </div>
        <div className="font-inter text-[10px] text-slate-600 font-medium">
          © 2024 Knowledge Vault. Encrypted Protocol.
        </div>
      </footer>
    </div>
  );
}
