"use client";

import { useState } from "react";
import JeeCalculator from "../components/JeeCalculator";
import { useAuth } from "../components/AuthProvider";
import { Loader2 } from "lucide-react";
import Image from "next/image";

export default function Home() {
  const { user, loading, loginWithGoogle, logout, loginWithCredentials } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [authError, setAuthError] = useState("");
  const [authLoading, setAuthLoading] = useState(false);

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
      </div>
    );
  }

  const handleCredentialsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError("");
    setAuthLoading(true);
    try {
      if (loginWithCredentials) {
        await loginWithCredentials(email, password);
      }
    } catch (err: any) {
      setAuthError(err.response?.data?.message || err.message || "Failed to login. Please check your credentials.");
    } finally {
      setAuthLoading(false);
    }
  };

  if (!user) {
    const isProduction = process.env.NODE_ENV === 'production';
    
    return (
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="glass p-10 rounded-3xl max-w-md w-full shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-indigo-500" />
          
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold mb-2 text-white">Login Required</h1>
            <p className="text-slate-400 text-sm">
              {isProduction 
                ? "Please sign in with Google to use the JEE Advanced Marks Calculator."
                : "Sign in to use the JEE Advanced Marks Calculator."}
            </p>
          </div>

          {isProduction ? (
            <button 
              onClick={loginWithGoogle}
              className="w-full bg-white text-slate-900 font-bold py-3 px-6 rounded-xl hover:bg-slate-100 transition-colors flex items-center justify-center gap-3 cursor-pointer"
            >
              <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              Sign in with Google
            </button>
          ) : (
            <form onSubmit={handleCredentialsSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">Email Address</label>
                <input 
                  type="email" 
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com" 
                  className="w-full bg-slate-900/50 border border-slate-700/50 rounded-xl px-4 py-3 text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">Password</label>
                <input 
                  type="password" 
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••" 
                  className="w-full bg-slate-900/50 border border-slate-700/50 rounded-xl px-4 py-3 text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />
              </div>

              {authError && (
                <div className="text-red-400 text-xs bg-red-500/10 border border-red-500/20 rounded-lg p-3">
                  {authError}
                </div>
              )}

              <button 
                type="submit" 
                disabled={authLoading}
                className="w-full bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-bold py-3 px-6 rounded-xl transition-all shadow-lg hover:shadow-blue-500/25 flex items-center justify-center gap-2 cursor-pointer text-sm"
              >
                {authLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Sign In"}
              </button>

              <div className="relative flex py-2 items-center">
                <div className="flex-grow border-t border-slate-700/50"></div>
                <span className="flex-shrink mx-4 text-slate-500 text-xs">or</span>
                <div className="flex-grow border-t border-slate-700/50"></div>
              </div>

              <button 
                type="button"
                onClick={loginWithGoogle}
                className="w-full bg-slate-800 hover:bg-slate-700/80 border border-slate-700/50 text-white font-bold py-3 px-6 rounded-xl transition-all flex items-center justify-center gap-3 cursor-pointer text-sm"
              >
                <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
                Continue with Google
              </button>
            </form>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col p-4 md:p-8">
      {/* Top Navbar */}
      <header className="flex justify-between items-center mb-8 bg-slate-800/40 rounded-full py-3 px-6 border border-slate-700/50 backdrop-blur-md">
        <div className="flex items-center gap-8">
          <div className="font-bold text-white flex items-center gap-3">
            <div className="w-8 h-8 relative rounded-full overflow-hidden shadow-lg bg-white/10 flex items-center justify-center p-1">
              <Image 
                src="/vayl-logo.png" 
                alt="Vayl Logo" 
                fill
                className="object-contain"
              />
            </div>
            <span className="hidden sm:inline">Vayl</span>
          </div>
          
          <nav className="hidden md:flex items-center gap-6">
            <a href="https://tests.vayl.in" target="_blank" rel="noopener noreferrer" className="text-sm text-slate-400 hover:text-white transition-colors font-medium">
              Mock Tests
            </a>
            <a href="https://battle.vayl.in" target="_blank" rel="noopener noreferrer" className="text-sm text-slate-400 hover:text-white transition-colors font-medium">
              JEE Battle
            </a>
          </nav>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-sm text-slate-300">
            {user.name}
          </div>
          <button 
            onClick={logout}
            className="text-xs bg-slate-700 hover:bg-slate-600 text-white px-3 py-1.5 rounded-full transition-colors"
          >
            Sign Out
          </button>
        </div>
      </header>

      <JeeCalculator />
    </div>
  );
}
