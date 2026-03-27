"use client";

import React from "react";
import Link from "next/link";

export default function TermsOfService() {
  return (
    <div className="min-h-screen bg-surface text-on-surface font-body selection:bg-primary/20">
      {/* Background Orbs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
        <div className="orb w-[500px] h-[500px] bg-tertiary/10 top-[-10%] right-[-10%] animate-pulse" />
        <div className="orb w-[400px] h-[400px] bg-primary/20 bottom-[-5%] left-[-5%] delay-700 animate-pulse" />
        <div className="mesh-grid absolute inset-0 opacity-20" />
      </div>

      <div className="max-w-4xl mx-auto px-6 py-20 relative z-10">
        {/* Header */}
        <header className="mb-16 text-center">
          <Link 
            href="/" 
            className="inline-flex items-center gap-2 text-primary hover:text-white transition-all group mb-8 bg-surface-variant/50 px-4 py-2 rounded-full border border-white/5 hover:border-primary/20"
          >
            <span className="material-symbols-outlined text-sm group-hover:-translate-x-1 transition-transform">arrow_back</span>
            <span className="text-xs font-interface uppercase tracking-widest font-bold">Back to Vayl</span>
          </Link>
          <h1 className="text-5xl md:text-6xl font-heading font-black tracking-tighter mb-4 bg-gradient-to-br from-white via-white to-tertiary/40 bg-clip-text text-transparent">
            Terms of Service
          </h1>
          <p className="text-on-surface-variant font-interface text-sm uppercase tracking-[0.2em] font-medium opacity-70">
            Effective Date: March 27, 2026
          </p>
        </header>

        {/* Content */}
        <div className="glass-card rounded-[2.5rem] p-8 md:p-12 space-y-12 leading-relaxed border-white/10 shadow-2xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-64 h-64 bg-tertiary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:bg-tertiary/10 transition-colors duration-700" />
          
          <section className="space-y-4">
            <p className="text-lg text-on-surface/90 italic">
              By using Vayl ("the Platform"), you agree to abide by the following Terms of Service. Please read them carefully.
            </p>
          </section>

          <section className="space-y-6">
            <h2 className="text-2xl font-heading font-bold text-white flex items-center gap-3">
              <span className="w-8 h-8 rounded-lg bg-tertiary/20 flex items-center justify-center text-tertiary text-sm font-black">1</span>
              Acceptance of Terms
            </h2>
            <p className="text-on-surface-variant">
              By accessing or using Vayl, you agree to be bound by these Terms. If you do not agree to all of the terms and conditions, you may not access the Platform.
            </p>
          </section>

          <section className="space-y-6">
            <h2 className="text-2xl font-heading font-bold text-white flex items-center gap-3">
              <span className="w-8 h-8 rounded-lg bg-tertiary/20 flex items-center justify-center text-tertiary text-sm font-black">2</span>
              User Conduct
            </h2>
            <div className="bg-white/5 p-6 rounded-2xl border border-white/5 space-y-4">
              <p className="text-on-surface-variant text-sm">As a user of Vayl, you agree:</p>
              <ul className="space-y-3 text-on-surface-variant text-sm">
                <li className="flex items-start gap-2">
                  <span className="material-symbols-outlined text-tertiary text-[10px] mt-1">circle</span>
                  <span>To provide accurate registration information.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="material-symbols-outlined text-tertiary text-[10px] mt-1">circle</span>
                  <span>To maintain account security.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="material-symbols-outlined text-tertiary text-[10px] mt-1">circle</span>
                  <span>To use the Platform legally and ethically.</span>
                </li>
              </ul>
            </div>
          </section>

          <section className="space-y-6">
            <h2 className="text-2xl font-heading font-bold text-white flex items-center gap-3">
              <span className="w-8 h-8 rounded-lg bg-tertiary/20 flex items-center justify-center text-tertiary text-sm font-black">3</span>
              Academic Integrity
            </h2>
            <p className="text-on-surface-variant">
              Vayl is intended to support your learning process. You agree to use the Platform in a manner that complies with the academic integrity policies of your educational institution and examination bodies (e.g., NTA for JEE).
            </p>
          </section>

          <section className="space-y-6">
            <h2 className="text-2xl font-heading font-bold text-white flex items-center gap-3">
              <span className="w-8 h-8 rounded-lg bg-tertiary/20 flex items-center justify-center text-tertiary text-sm font-black">4</span>
              Intellectual Property
            </h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="p-5 rounded-xl bg-white/2 border border-white/5">
                <h3 className="font-bold text-white mb-2 text-sm uppercase tracking-wider">Platform Content</h3>
                <p className="text-xs text-on-surface-variant">All software, design, and branded elements of Vayl are the intellectual property of the Platform owners.</p>
              </div>
              <div className="p-5 rounded-xl bg-white/2 border border-white/5">
                <h3 className="font-bold text-white mb-2 text-sm uppercase tracking-wider">User Content</h3>
                <p className="text-xs text-on-surface-variant">You retain ownership of any resources you upload. We host them solely for your personal use.</p>
              </div>
            </div>
          </section>

          <footer className="pt-12 border-t border-white/10 mt-12 text-center">
            <p className="text-on-surface-variant mb-6 text-sm">
              Any questions? Reach out to us.
            </p>
            <a 
              href="mailto:neelgupta30@zohomail.in" 
              className="inline-flex items-center gap-3 bg-tertiary text-on-tertiary px-8 py-3 rounded-2xl font-bold hover:scale-105 transition-transform duration-300 shadow-lg shadow-tertiary/20"
            >
              <span className="material-symbols-outlined">mail</span>
              neelgupta30@zohomail.in
            </a>
          </footer>
        </div>

        {/* Bottom Navigation */}
        <div className="mt-12 text-center">
          <p className="text-on-surface-variant text-xs mb-4">© 2026 Vayl Education. All rights reserved.</p>
          <div className="flex justify-center gap-6">
            <Link href="/" className="text-on-surface-variant text-xs hover:text-primary transition-colors">Home</Link>
            <Link href="/privacy-policy" className="text-on-surface-variant text-xs hover:text-primary transition-colors">Privacy</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
