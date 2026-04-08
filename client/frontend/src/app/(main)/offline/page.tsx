"use client";

import React from "react";
import Link from "next/link";
import { WifiOff, RefreshCcw, Brain } from "lucide-react";
import { motion } from "framer-motion";

/**
 * Offline Fallback Page
 * This page is served by the Service Worker when the user has no internet connection
 * and tries to navigate to a new route. It maintains the Vayl brand aesthetic
 * while providing a clear path forward.
 */
export default function OfflinePage() {
  const handleRetry = () => {
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-surface flex flex-col items-center justify-center p-6 text-center">
      <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
        <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-primary/5 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[400px] h-[400px] bg-tertiary/5 blur-[100px] rounded-full" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-md w-full glass-card p-10 rounded-[2.5rem] border-outline-variant/10 shadow-2xl relative overflow-hidden"
      >
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary/20 via-primary to-primary/20" />
        
        <div className="w-20 h-20 bg-primary/10 rounded-3xl flex items-center justify-center mx-auto mb-8 relative">
          <motion.div
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
          >
            <WifiOff className="w-10 h-10 text-primary" />
          </motion.div>
          <div className="absolute -top-1 -right-1 w-4 h-4 bg-error rounded-full border-4 border-surface" />
        </div>

        <h1 className="text-3xl font-heading font-black text-on-surface mb-4 tracking-tight">
          Protocol <span className="text-primary italic">Interrupted.</span>
        </h1>
        
        <p className="text-on-surface-variant leading-relaxed mb-10 opacity-80 font-medium font-interface italic text-sm">
          Aspirant, your connection to the Vault has been severed. Extreme focus can continue locally, but data synchronization requires a signal.
        </p>

        <div className="space-y-4">
          <button
            onClick={handleRetry}
            className="w-full py-4 bg-primary text-on-primary rounded-2xl font-black uppercase tracking-widest text-xs flex items-center justify-center gap-3 hover:scale-[1.02] active:scale-95 transition-all shadow-xl shadow-primary/20"
          >
            <RefreshCcw className="w-4 h-4" />
            Reconnect to Signal
          </button>
          
          <Link
            href="/focus-room"
            className="w-full py-4 bg-surface-container-low border border-outline-variant/10 text-on-surface rounded-2xl font-black uppercase tracking-widest text-xs flex items-center justify-center gap-3 hover:bg-surface-bright transition-all font-interface"
          >
            <Brain className="w-4 h-4 text-tertiary" />
            Enter Local Focus Room
          </Link>
        </div>

        <p className="mt-10 text-[10px] font-black uppercase tracking-[0.2em] text-on-surface-variant opacity-40">
          The Silent Architect remains standing.
        </p>
      </motion.div>
    </div>
  );
}
