"use client";

import JeeCalculator from "../components/JeeCalculator";
import { useAuth } from "../components/AuthProvider";
import { Loader2 } from "lucide-react";

export default function Home() {
  const { user, loading, loginWithGoogle, logout } = useAuth();

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="glass p-10 rounded-3xl max-w-md w-full text-center shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-indigo-500" />
          <h1 className="text-3xl font-bold mb-4 text-white">Login Required</h1>
          <p className="text-slate-400 mb-8">
            Please sign in with Google to use the JEE Advanced Marks Calculator and save your attempts.
          </p>
          <button 
            onClick={loginWithGoogle}
            className="w-full bg-white text-slate-900 font-bold py-3 px-6 rounded-xl hover:bg-slate-100 transition-colors flex items-center justify-center gap-3"
          >
            <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            Sign in with Google
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col p-4 md:p-8">
      {/* Top Navbar */}
      <header className="flex justify-between items-center mb-8 bg-slate-800/40 rounded-full py-3 px-6 border border-slate-700/50 backdrop-blur-md">
        <div className="font-bold text-white flex items-center gap-2">
          <span className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center text-sm shadow-lg">V</span>
          <span className="hidden sm:inline">Vaylin</span>
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
