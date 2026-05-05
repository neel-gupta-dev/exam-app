"use client";

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Mail, ArrowLeft, MessageSquare, Shield, Globe } from 'lucide-react';

export default function ContactPage() {
  return (
    <main className="min-h-screen bg-surface flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Background elements consistent with main app */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/5 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-500/5 blur-[120px] rounded-full" />
        <div className="absolute inset-0 mesh-grid opacity-[0.03]" />
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-2xl"
      >
        <Link 
          href="/"
          className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-widest text-on-surface-variant/60 hover:text-primary transition-colors mb-8 group"
        >
          <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
          Back to Laboratory
        </Link>

        <div className="p-8 md:p-12 rounded-[2rem] bg-surface-container border border-white/5 backdrop-blur-xl shadow-2xl relative overflow-hidden">
          {/* Accent decoration */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 blur-3xl rounded-full -mr-16 -mt-16" />

          <div className="relative z-10 space-y-8">
            <div className="space-y-2">
              <h1 className="text-4xl font-black text-on-surface tracking-tighter">Get in Touch</h1>
              <p className="text-on-surface-variant/70 font-medium">
                Have questions about VAYL Physics Lab? We're here to help students and educators worldwide.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <a 
                href="mailto:support@vayl.in"
                className="p-6 rounded-3xl bg-surface-container-high border border-white/5 hover:border-primary/30 transition-all group"
              >
                <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Mail className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-sm font-black uppercase tracking-widest text-on-surface mb-1">Email Us</h3>
                <p className="text-xs font-mono font-bold text-primary">support@vayl.in</p>
              </a>

              <div className="p-6 rounded-3xl bg-surface-container-high border border-white/5 opacity-50 cursor-not-allowed">
                <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center mb-4">
                  <MessageSquare className="w-6 h-6 text-on-surface-variant" />
                </div>
                <h3 className="text-sm font-black uppercase tracking-widest text-on-surface mb-1">Live Chat</h3>
                <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">Coming Soon</p>
              </div>
            </div>

            <div className="pt-8 border-t border-white/5">
              <h3 className="text-[10px] font-black text-on-surface-variant uppercase tracking-[0.2em] mb-6">Our Commitment</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="flex gap-4">
                  <div className="mt-1"><Shield className="w-4 h-4 text-primary" /></div>
                  <div className="space-y-1">
                    <h4 className="text-xs font-black uppercase tracking-widest text-on-surface">Privacy First</h4>
                    <p className="text-[10px] leading-relaxed text-on-surface-variant/60 font-medium">Your data and experimental results belong to you. We never share student information.</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="mt-1"><Globe className="w-4 h-4 text-indigo-400" /></div>
                  <div className="space-y-1">
                    <h4 className="text-xs font-black uppercase tracking-widest text-on-surface">Global Support</h4>
                    <p className="text-[10px] leading-relaxed text-on-surface-variant/60 font-medium">Available for schools, colleges, and self-learners across the globe.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-12 text-center">
          <p className="text-[10px] font-bold text-on-surface-variant/40 uppercase tracking-[0.3em]">
            © 2026 VAYL.IN • PHYSICS ENGINE v1.0
          </p>
        </div>
      </motion.div>
    </main>
  );
}
