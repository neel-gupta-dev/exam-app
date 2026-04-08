"use client";

import Link from "next/link";
import { Home, ArrowLeft } from "lucide-react";

/**
 * Custom 404 Page (Not Found)
 * Provides a high-fidelity, brand-aligned error state for the Vayl platform.
 */
export default function NotFound() {
  return (
    <div className="min-h-screen bg-surface flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Background Orbs to match the Vayl aesthetic */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
        <div className="orb w-[600px] h-[600px] bg-primary/10 top-[-15%] right-[-10%] blur-[120px]" />
        <div className="orb w-[500px] h-[500px] bg-tertiary/5 bottom-[-10%] left-[-5%] blur-[100px] rotate-12" />
        <div className="mesh-grid absolute inset-0 opacity-15" />
      </div>

      <div className="max-w-md w-full text-center relative z-10">
        {/* Visual 404 with Glassmorphism */}
        <div className="mb-12 relative inline-block">
          <h1 className="text-[12rem] font-heading font-black leading-none tracking-tighter bg-gradient-to-br from-on-surface/20 to-primary/20 bg-clip-text text-transparent">
            404
          </h1>
          <div className="absolute inset-0 flex items-center justify-center">
             <div className="glass-card px-8 py-4 rounded-2xl border border-primary/20 shadow-2xl backdrop-blur-xl">
               <span className="text-3xl font-heading font-bold text-primary tracking-widest uppercase">Lost.</span>
             </div>
          </div>
        </div>

        <h2 className="text-4xl font-heading font-black text-on-surface mb-6 tracking-tight">
          Lost in the Vault?
        </h2>
        <p className="text-on-surface-variant mb-12 text-lg leading-relaxed opacity-80">
          The knowledge you seek hasn't been archived here yet, or the link has expired into digital silence.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href="/"
            className="flex items-center gap-3 px-8 py-4 bg-primary text-on-primary font-black rounded-2xl shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all text-sm uppercase tracking-widest group"
          >
            <Home className="w-5 h-5 group-hover:-translate-y-0.5 transition-transform" />
            Back to Dashboard
          </Link>
          <button
            onClick={() => window.history.back()}
            className="flex items-center gap-3 px-8 py-4 glass-card text-on-surface font-black rounded-2xl border border-outline-variant/10 hover:bg-surface-container-high transition-all text-sm uppercase tracking-widest group"
          >
            <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
            Go Back
          </button>
        </div>

        <footer className="mt-24">
          <div className="inline-flex items-center gap-2 opacity-30 grayscale hover:grayscale-0 transition-all cursor-default">
            <span className="text-xl font-heading font-black italic tracking-widest uppercase">Vayl</span>
            <div className="w-1.5 h-1.5 rounded-full bg-primary" />
            <span className="text-[10px] font-black uppercase tracking-widest">Protocol Explorer</span>
          </div>
        </footer>
      </div>
    </div>
  );
}
