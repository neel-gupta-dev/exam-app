"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";

/**
 * About Page
 * A static marketing page explaining the mission and vision of the Vayl platform.
 * Utilizes a responsive, glassmorphic UI design to match the app's aesthetic.
 */
export default function AboutPage() {
  return (
    <div className="min-h-screen bg-surface text-on-surface font-body selection:bg-primary/20">
      {/* Background Orbs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
        <div className="orb w-[600px] h-[600px] bg-primary/10 top-[-15%] right-[-10%]" />
        <div className="orb w-[500px] h-[500px] bg-tertiary/5 bottom-[-10%] left-[-5%] rotate-12" />
        <div className="mesh-grid absolute inset-0 opacity-15" />
      </div>

      <div className="max-w-5xl mx-auto px-6 py-20 relative z-10">
        <header className="mb-20 text-center">
          <Link 
            href="/" 
            className="inline-flex items-center gap-2 text-primary hover:text-white transition-all group mb-8 bg-surface-variant/50 px-5 py-2.5 rounded-full border border-white/5 shadow-xl shadow-black/20"
          >
            <Image src="/vayl-logo.png" alt="Vayl Logo" width={20} height={20} className="object-contain" />
            <span className="text-xs font-interface uppercase tracking-[0.2em] font-bold">Back to Vayl</span>
          </Link>
          <h1 className="text-6xl md:text-8xl font-heading font-black tracking-tighter mb-6 bg-gradient-to-br from-white via-white to-primary/30 bg-clip-text text-transparent">
            Our Mission.
          </h1>
          <p className="text-on-surface-variant font-interface max-w-2xl mx-auto text-lg md:text-xl leading-relaxed opacity-80">
            Vayl is built for the focused few—students who treat their JEE preparation as a mission, not just a task.
          </p>
        </header>

        <div className="grid md:grid-cols-2 gap-8 mb-20">
          <div className="glass-card rounded-[3rem] p-10 border-white/5 space-y-6">
            <div className="w-14 h-14 bg-primary/20 rounded-2xl flex items-center justify-center text-primary border border-primary/20 shadow-inner">
              <span className="material-symbols-outlined text-3xl">psychology</span>
            </div>
            <h2 className="text-3xl font-heading font-bold text-white tracking-tight">The Vision</h2>
            <p className="text-on-surface-variant leading-relaxed">
              We believe that effective learning starts with a clear mind. Vayl provides a unified dashboard to manage high-yield resources, track daily progress, and maintain focus in a world of digital noise.
            </p>
          </div>

          <div className="glass-card rounded-[3rem] p-10 border-white/5 space-y-6">
            <div className="w-14 h-14 bg-tertiary/20 rounded-2xl flex items-center justify-center text-tertiary border border-tertiary/20 shadow-inner">
              <span className="material-symbols-outlined text-3xl">auto_awesome</span>
            </div>
            <h2 className="text-3xl font-heading font-bold text-white tracking-tight">Focus Protocol</h2>
            <p className="text-on-surface-variant leading-relaxed">
              Our "Focus Room" and gamified progress systems are designed to turn hours of study into deep work sessions. No distractions, just pure execution.
            </p>
          </div>
        </div>

        <section className="glass-card rounded-[3rem] p-12 mb-20 border-white/5 overflow-hidden relative">
          <div className="absolute top-0 right-0 w-80 h-80 bg-primary/10 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2" />
          <div className="relative z-10 space-y-8">
            <h2 className="text-4xl font-heading font-black text-white">Why Vayl?</h2>
            <div className="grid sm:grid-cols-3 gap-8">
              {[
                { title: "Personalized", desc: "Every student's vault is unique to their target exam goals.", icon: "person" },
                { title: "Integrated", desc: "Flashcards, resources, and focus timers in one dashboard.", icon: "grid_view" },
                { title: "Data-Driven", desc: "Track your mastery with weekly goals and streak analytics.", icon: "insights" }
              ].map((item, i) => (
                <div key={i} className="space-y-3">
                  <div className="text-primary flex items-center gap-2 mb-2">
                    <span className="material-symbols-outlined">{item.icon}</span>
                    <span className="font-bold text-sm tracking-widest uppercase">{item.title}</span>
                  </div>
                  <p className="text-sm text-on-surface-variant leading-relaxed opacity-70">
                    {item.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <footer className="text-center pt-10 border-t border-white/5">
          <p className="text-on-surface-variant text-sm mb-6">Designed for students, by someone who's been there.</p>
          <div className="flex justify-center gap-8 text-xs font-interface font-bold uppercase tracking-widest">
            <Link href="/privacy-policy" className="text-on-surface-variant hover:text-primary transition-colors">Privacy</Link>
            <Link href="/terms" className="text-on-surface-variant hover:text-primary transition-colors">Terms</Link>
            <Link href="/contact" className="text-on-surface-variant hover:text-primary transition-colors">Contact</Link>
            <Link href="/login" className="text-on-surface-variant hover:text-primary transition-colors">Login</Link>
          </div>
        </footer>
      </div>
    </div>
  );
}
