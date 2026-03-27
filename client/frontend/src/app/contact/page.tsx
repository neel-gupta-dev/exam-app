"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-surface text-on-surface font-body selection:bg-primary/20">
      {/* Background Orbs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
        <div className="orb w-[400px] h-[400px] bg-error/5 top-[20%] left-[-10%] blur-[120px]" />
        <div className="orb w-[600px] h-[600px] bg-primary/10 bottom-[-10%] right-[-10%] blur-[100px]" />
        <div className="mesh-grid absolute inset-0 opacity-15" />
      </div>

      <div className="max-w-4xl mx-auto px-6 py-20 relative z-10">
        <header className="mb-20 text-center">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-primary hover:text-white transition-all group mb-10 bg-surface-variant/50 px-5 py-2.5 rounded-full border border-white/5 shadow-xl shadow-black/20"
          >
            <Image src="/vayl-logo.png" alt="Vayl Logo" width={20} height={20} className="object-contain" />
            <span className="text-xs font-interface uppercase tracking-[0.2em] font-bold">Back to Vayl</span>
          </Link>
          <h1 className="text-5xl md:text-7xl font-heading font-black tracking-tighter mb-6 bg-gradient-to-br from-white via-white to-error/30 bg-clip-text text-transparent">
            Get in Touch.
          </h1>
          <p className="text-on-surface-variant font-interface max-w-xl mx-auto text-lg opacity-80 leading-relaxed">
            Have questions about your Vayl experience or need technical assistance? Our team is here to help you stay focused.
          </p>
        </header>

        <div className="grid md:grid-cols-1 gap-12 max-w-2xl mx-auto">
          <div className="glass-card rounded-[3rem] p-12 border-white/10 shadow-2xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-40 h-40 bg-primary/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />

            <div className="space-y-12 relative z-10">
              <div className="flex items-start gap-6">
                <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center text-primary shrink-0 border border-primary/20">
                  <span className="material-symbols-outlined text-3xl">mail</span>
                </div>
                <div>
                  <h3 className="text-[10px] font-black uppercase tracking-[0.25em] text-primary mb-2">Primary Support</h3>
                  <a
                    href="mailto:neelgupta30@zohomail.in"
                    className="text-2xl md:text-3xl font-heading font-bold text-white hover:text-primary transition-colors hover:underline decoration-primary/30"
                  >
                    neelgupta30@zohomail.in
                  </a>
                  <p className="text-sm text-on-surface-variant mt-4 font-medium opacity-70">
                    Expected response time: Under 24 hours for verified students.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-6">
                <div className="w-14 h-14 bg-tertiary/10 rounded-2xl flex items-center justify-center text-tertiary shrink-0 border border-tertiary/20">
                  <span className="material-symbols-outlined text-3xl">forum</span>
                </div>
                <div>
                  <h3 className="text-[10px] font-black uppercase tracking-[0.25em] text-tertiary mb-2">Technical Assistance</h3>
                  <p className="text-lg font-bold text-white leading-relaxed">
                    Experiencing sync issues or layout bugs? Reach out with your Roll Number for faster resolution.
                  </p>
                </div>
              </div>
            </div>

            <footer className="mt-16 pt-10 border-t border-white/10 flex flex-wrap gap-4 items-center justify-between">
              <div className="flex gap-4">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                <span className="text-[10px] font-black uppercase tracking-widest text-green-400 opacity-80">Support Systems Live</span>
              </div>
              <p className="text-[10px] text-on-surface-variant font-bold uppercase tracking-widest opacity-40">
                Operating from City of Lakes, India
              </p>
            </footer>
          </div>
        </div>

        <div className="mt-20 flex justify-center gap-10 text-[10px] font-interface font-black uppercase tracking-[0.2em] opacity-40 hover:opacity-100 transition-opacity">
          <Link href="/about" className="hover:text-primary transition-colors">About Us</Link>
          <Link href="/terms" className="hover:text-primary transition-colors">Terms of Service</Link>
          <Link href="/privacy-policy" className="hover:text-primary transition-colors">Privacy Policy</Link>
          <Link href="/login" className="hover:text-primary transition-colors">Support Portal</Link>
        </div>
      </div>
    </div>
  );
}
