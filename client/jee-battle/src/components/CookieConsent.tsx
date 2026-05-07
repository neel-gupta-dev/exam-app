"use client";

import React, { useState, useEffect } from "react";
import { Cookie, X, Check } from "lucide-react";

export default function CookieConsent() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem("battle_cookie_consent");
    if (!consent) {
      const timer = setTimeout(() => setShow(true), 2000);
      return () => clearTimeout(timer);
    }
  }, []);

  const accept = () => {
    localStorage.setItem("battle_cookie_consent", "accepted");
    setShow(false);
  };

  const decline = () => {
    localStorage.setItem("battle_cookie_consent", "declined");
    setShow(false);
  };

  if (!show) return null;

  return (
    <div className="fixed bottom-6 left-6 right-6 md:left-auto md:max-w-md z-[100] animate-in fade-in slide-in-from-bottom-10 duration-700">
      <div className="bg-[#16191f]/90 backdrop-blur-xl border border-white/10 rounded-3xl p-6 shadow-2xl shadow-black/50">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-2xl bg-indigo-500/20 flex items-center justify-center text-indigo-400 border border-indigo-500/30 shrink-0">
            <Cookie className="w-6 h-6" />
          </div>
          <div className="space-y-2">
            <h4 className="text-lg font-bold text-white tracking-tight">Cookie Protocol</h4>
            <p className="text-sm text-white/60 leading-relaxed">
              We use cookies to synchronize your battle sessions and track your climb to the top of the leaderboard. 
              <span className="block mt-2 font-medium text-white/40 italic text-xs">By entering the arena, you accept our rules.</span>
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 mt-6">
          <button
            onClick={decline}
            className="py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest text-white/40 hover:bg-white/5 transition-colors border border-white/5"
          >
            Necessary Only
          </button>
          <button
            onClick={accept}
            className="py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest bg-indigo-600 text-white shadow-lg shadow-indigo-600/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2"
          >
            <Check className="w-4 h-4" />
            Accept All
          </button>
        </div>
      </div>
    </div>
  );
}
