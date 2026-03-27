'use client';

import React from 'react';
import Link from 'next/link';
import { BookOpen, Target, Brain, ArrowRight, ShieldCheck, Timer } from 'lucide-react';
import Image from 'next/image';
import { sendGAEvent } from '@next/third-parties/google';

const ARTICLES = [
  {
    slug: 'the-jee-2026-roadmap',
    title: 'The Definitive 2026 Roadmap: A Protocol for Excellence',
    description: 'A month-by-month structural breakdown of how to dominate the JEE 2026 syllabus with surgical precision.',
    category: 'Strategy',
    readTime: '12 min',
    icon: <Image src="/vayl-logo.png" alt="Vayl Logo" width={20} height={20} className="object-contain" />,
    color: 'border-primary/20 bg-primary/5',
  },
  {
    slug: 'deep-work-for-aspirants',
    title: 'The Geometry of Focus: Why Deep Work is the only way to JEE',
    description: 'Understanding the cognitive science behind intense concentration and how to apply it to your study sessions.',
    category: 'Focus',
    readTime: '8 min',
    icon: <Timer className="w-5 h-5 text-error" />,
    color: 'border-error/20 bg-error/5',
  },
  {
    slug: 'mastering-organic-chemistry',
    title: 'Organic Synthesis: A Structural Approach to Mastery',
    description: 'Stop memorizing reactions. Start understanding mechanisms. A guide to making Organic Chemistry your strongest subject.',
    category: 'Chemistry',
    readTime: '15 min',
    icon: <Brain className="w-5 h-5 text-tertiary" />,
    color: 'border-tertiary/20 bg-tertiary/5',
  },
  {
    slug: 'physics-high-yield-mechanics',
    title: 'Mechanics of Success: Breaking Down High-Yield Physics',
    description: 'Identifying the 20% of Physics concepts that yield 80% of the marks in JEE Advanced.',
    category: 'Physics',
    readTime: '10 min',
    icon: <BookOpen className="w-5 h-5 text-primary" />,
    color: 'border-primary/20 bg-primary/5',
  },
  {
    slug: 'exam-anxiety-protocol',
    title: 'Mental Fortitude: The Protocol for Managing JEE Pressure',
    description: 'Advanced psychological techniques to stay calm, focused, and precise during mock tests and the final exam.',
    category: 'Mindset',
    readTime: '7 min',
    icon: <ShieldCheck className="w-5 h-5 text-error" />,
    color: 'border-error/20 bg-error/5',
  }
];

export default function BlogHub() {
  return (
    <div className="min-h-screen bg-surface text-on-surface font-body selection:bg-primary/20 pb-20">
      {/* Background Grid & Orbs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
        <div className="orb w-[800px] h-[800px] bg-primary/5 top-[-10%] right-[-10%] blur-[120px]" />
        <div className="orb w-[600px] h-[600px] bg-tertiary/5 bottom-[-10%] left-[-10%] blur-[100px]" />
        <div className="mesh-grid absolute inset-0 opacity-15" />
      </div>

      <nav className="max-w-7xl mx-auto px-6 h-24 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3 group relative">
          <div className="w-10 h-10 flex items-center justify-center group-hover:scale-110 transition-transform">
            <Image src="/vayl-logo.png" alt="Vayl Logo" width={32} height={32} className="object-contain" />
          </div>
          <div className="flex flex-col">
            <span className="text-xl font-heading font-black tracking-widest text-white uppercase italic">Vayl</span>
            <span className="absolute left-14 top-full mt-2 w-max px-3 py-1 bg-white text-black text-[8px] font-black uppercase tracking-[0.2em] rounded-md opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none shadow-xl z-50">
              Vayl: Dweller in the Valley
            </span>
          </div>
        </Link>
        <div className="flex items-center gap-8">
          <Link href="/login" className="text-xs font-interface font-black uppercase tracking-widest text-on-surface-variant hover:text-white transition-colors">Login</Link>
          <Link href="/signup" className="bg-primary text-on-primary px-6 py-2.5 rounded-xl font-bold text-xs uppercase tracking-widest hover:scale-105 transition-transform">Deploy Vault</Link>
        </div>
      </nav>

      <header className="pt-20 pb-16 px-6 max-w-7xl mx-auto text-center">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 mb-8">
          <span className="text-[10px] font-black uppercase tracking-[0.25em] text-primary">Public Blog Protocol</span>
        </div>
        <h1 className="text-5xl md:text-7xl font-heading font-black tracking-tightest leading-[0.9] text-white mb-8">
          The JEE <span className="text-primary italic">Blog Hub.</span>
        </h1>
        <p className="text-on-surface-variant max-w-2xl mx-auto text-lg leading-relaxed opacity-80 font-medium italic">
          High-authority studies, strategies, and cognitive frameworks for the elite JEE aspirant. Elevate your preparation to a system.
        </p>
      </header>

      <main className="max-w-6xl mx-auto px-6 grid gap-6 md:grid-cols-2 lg:grid-cols-2">
        {ARTICLES.map((article, i) => (
          <Link 
            key={article.slug} 
            href={`/blogs/${article.slug}`}
            onClick={() => sendGAEvent({ event: 'blog_click', value: article.slug })}
            className="group relative"
          >
            <div className={`h-full glass-card p-10 rounded-[3rem] border ${article.color} flex flex-col justify-between hover:translate-y-[-8px] transition-all duration-500 hover:border-white/20 shadow-2xl shadow-black/40`}>
              <div>
                <div className="flex justify-between items-start mb-8">
                  <div className="p-3 bg-white/5 rounded-2xl border border-white/10">
                    {article.icon}
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant opacity-60">
                    {article.readTime}
                  </span>
                </div>
                <h2 className="text-3xl font-heading font-bold text-white mb-4 group-hover:text-primary transition-colors leading-tight">
                  {article.title}
                </h2>
                <p className="text-on-surface-variant leading-relaxed opacity-70 font-interface text-sm line-clamp-2">
                  {article.description}
                </p>
              </div>
              <div className="mt-10 flex items-center justify-between">
                <span className="px-4 py-1 rounded-full bg-white/5 border border-white/10 text-[10px] font-black uppercase tracking-widest text-on-surface-variant">
                  {article.category}
                </span>
                <div className="flex items-center gap-2 text-primary font-bold text-xs uppercase tracking-widest group-hover:translate-x-2 transition-transform">
                  Read Article <ArrowRight className="w-4 h-4" />
                </div>
              </div>
            </div>
          </Link>
        ))}
      </main>

      <section className="mt-32 max-w-4xl mx-auto px-6 text-center">
        <div className="glass-card p-12 rounded-[3.5rem] border border-white/5 relative overflow-hidden group">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
          <h2 className="text-2xl font-heading font-bold text-white mb-4 tracking-tight">Access the Full Architecture.</h2>
          <p className="text-on-surface-variant leading-relaxed opacity-70 mb-10 max-w-lg mx-auto text-sm">
            Thousands more resources, focus analytics, and personalized flashcards exist inside the Digital Vault.
          </p>
          <Link 
            href="/signup"
            className="inline-flex py-4 px-10 bg-white text-black rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-primary hover:text-white transition-all shadow-xl"
          >
            Request Full Access
          </Link>
        </div>
      </section>
    </div>
  );
}
