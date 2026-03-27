'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, Share2, Info, Zap } from 'lucide-react';
import { sendGAEvent } from '@next/third-parties/google';

interface BlogArticleProps {
  title: string;
  category: string;
  date: string;
  readTime: string;
  takeaways: string[];
  content: string;
  slug: string;
  related: { title: string; category: string; slug: string }[];
}

export default function BlogArticle({
  title,
  category,
  date,
  readTime,
  takeaways,
  content,
  slug,
  related
}: BlogArticleProps) {
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const height = document.documentElement.scrollHeight - window.innerHeight;
      const progress = (window.scrollY / height) * 100;
      setScrollProgress(progress);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-surface text-on-surface font-body selection:bg-primary/20 pb-20">
      {/* Scroll Progress Bar */}
      <div className="fixed top-0 left-0 h-1 bg-primary/30 z-[60] w-full">
        <div 
          className="h-full bg-primary transition-all duration-150 shadow-[0_0_10px_rgba(var(--primary),0.5)]" 
          style={{ width: `${scrollProgress}%` }}
        />
      </div>

      {/* Background Orbs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
        <div className="orb w-[600px] h-[600px] bg-primary/5 top-[-10%] left-[-10%] blur-[120px]" />
        <div className="orb w-[500px] h-[500px] bg-tertiary/5 bottom-[-10%] right-[-10%] blur-[100px]" />
        <div className="mesh-grid absolute inset-0 opacity-10" />
      </div>

      <nav className="max-w-4xl mx-auto px-6 h-24 flex items-center justify-between sticky top-0 bg-surface/80 backdrop-blur-md z-50">
        <Link 
          href="/blogs" 
          className="flex items-center gap-2 text-on-surface-variant hover:text-white transition-colors text-xs font-black uppercase tracking-widest group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> Back to Blogs
        </Link>
        <button 
          onClick={() => {
            navigator.clipboard.writeText(window.location.href);
            sendGAEvent({ event: 'blog_share', value: slug });
          }}
          className="p-2.5 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-all text-on-surface-variant hover:text-white"
        >
          <Share2 className="w-4 h-4" />
        </button>
      </nav>

      <article className="max-w-3xl mx-auto px-6 pt-16">
        <header className="mb-16">
          <div className="flex items-center gap-4 mb-6">
            <span className="px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-[10px] font-black uppercase tracking-widest text-primary">
              {category}
            </span>
            <span className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant opacity-40">
              {date} • {readTime}
            </span>
          </div>
          <h1 className="text-4xl md:text-6xl font-heading font-black tracking-tight text-white leading-[1.1] mb-8">
            {title}
          </h1>
          <div className="h-1 w-20 bg-primary/50 rounded-full" />
        </header>

        {/* Quick Summary Block */}
        <div className="glass-card p-8 rounded-[2rem] border border-white/5 bg-white/[0.02] mb-16 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <Info className="w-12 h-12 text-primary" />
          </div>
          <h3 className="text-xs font-black uppercase tracking-[0.2em] text-primary mb-6 flex items-center gap-2">
             Quick Protocol Takeaways
          </h3>
          <ul className="space-y-4">
            {takeaways.map((task, i) => (
              <li key={i} className="flex items-start gap-3 text-sm font-medium text-on-surface-variant">
                <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
                {task}
              </li>
            ))}
          </ul>
        </div>

        <div 
          className="prose prose-invert prose-p:text-on-surface-variant prose-p:leading-relaxed prose-p:text-lg prose-headings:font-heading prose-headings:font-bold prose-headings:text-white prose-blockquote:border-primary prose-blockquote:bg-white/5 prose-blockquote:p-6 prose-blockquote:rounded-2xl prose-blockquote:italic prose-h2:text-3xl prose-h2:mt-16 prose-h3:text-xl prose-h3:mt-8 max-w-none"
          dangerouslySetInnerHTML={{ __html: content }}
        />

        <div className="mt-24 pt-16 border-t border-white/5">
          <h4 className="text-xs font-black uppercase tracking-[0.2em] text-on-surface-variant mb-8 opacity-40">Continue the Reading</h4>
          <div className="grid sm:grid-cols-2 gap-4">
            {related.map((rel) => (
              <Link 
                key={rel.slug} 
                href={`/blogs/${rel.slug}`}
                className="glass-card p-6 rounded-3xl border border-white/5 hover:border-primary/30 transition-all group"
              >
                <span className="text-[10px] font-black uppercase tracking-widest text-primary mb-2 block">{rel.category}</span>
                <h5 className="font-bold text-white group-hover:text-primary transition-colors line-clamp-2">{rel.title}</h5>
              </Link>
            ))}
          </div>
        </div>
      </article>

      <footer className="mt-32 border-t border-white/5 pt-16 px-6">
        <div className="max-w-4xl mx-auto flex flex-col items-center gap-8">
          <div className="flex items-center gap-3 group relative cursor-help">
            <Zap className="w-6 h-6 text-primary group-hover:scale-110 transition-transform" />
            <div className="flex flex-col">
              <span className="text-xl font-heading font-black tracking-widest text-white uppercase italic">Vayl</span>
              <span className="absolute left-0 bottom-full mb-2 w-max px-3 py-1 bg-white text-black text-[8px] font-black uppercase tracking-[0.2em] rounded-md opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none shadow-xl z-50">
                Vayl: Dweller in the Valley
              </span>
            </div>
          </div>
          <p className="text-xs text-on-surface-variant font-medium opacity-40 max-w-sm text-center italic">
            Part of the Academic Excellence Protocol. Built for the elite JEE aspirant seeking structural mastery.
          </p>
          <div className="flex gap-8 text-[10px] font-black uppercase tracking-widest text-on-surface-variant opacity-60">
            <Link href="/" className="hover:text-primary transition-colors">Platform</Link>
            <Link href="/about" className="hover:text-primary transition-colors">Mission</Link>
            <Link href="/contact" className="hover:text-primary transition-colors">Support</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
