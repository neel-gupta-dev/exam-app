'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { BookOpen, Zap, Target, Brain, ArrowLeft, ShieldCheck, Timer, Share2, Info } from 'lucide-react';
import { sendGAEvent } from '@next/third-parties/google';

const ARTICLES = {
  'the-jee-2026-roadmap': {
    title: 'The Definitive 2026 Roadmap: A Protocol for Excellence',
    category: 'Strategy',
    date: 'March 27, 2024',
    readTime: '12 min',
    takeaways: ['Atomic fundamentals focus', 'Recursive revision loops', 'Data-driven mistake vaulting'],
    content: `
      <h2>The Core Architecture</h2>
      <p>Success in JEE 2026 is not about how many hours you study; it's about the structure of your retrieval. Most aspirants fail because they treat their preparation as a linear track rather than a recursive system. To dominate the JEE, you must build your preparation around the concept of <strong>Structural Mastery</strong>.</p>
      
      <h3>Phase 1: Foundation Protocol (Months 1-8)</h3>
      <p>During this phase, your primary objective is to build an atomic understanding of Mechanics, Stoichiometry, and Calculus. Do not bypass the fundamentals for complex problems. The complexity in JEE Advanced is often just several fundamentals stacked on each other.</p>
      <p>In Physics, if your Newton's Laws aren't intuitive, your Electrodynamics will crumble. In Chemistry, if you don't master the Mole Concept, Physical Chemistry becomes a series of disconnected formulas. In Mathematics, Calculus is the language of the entire paper.</p>
      
      <blockquote>
        "The elite JEE aspirant spends 80% of their time on the 20% of concepts that govern all outcomes."
      </blockquote>

      <h3>Phase 2: Transition & Mastery (Months 9-18)</h3>
      <p>Shift from learning to synthesis. This is where most students get "lost in the woods." Use the Vayl Vault to store and categorize your mistakes. A mistake is not an embarrassment; it is a data point showing a gap in your identity as a scholar. Categorize your errors into: Conceptual, Calculation, or Pressure-based.</p>
      
      <h3>Phase 3: The Execution Protocol (Final 6 Months)</h3>
      <p>Simulated pressure is your best teacher. Your performance during mock tests should be a surgical extraction of knowledge under time constraints. At this stage, you are no longer learning; you are training your brain to retrieve information instantly under high cortisol levels.</p>

      <h2>The Weekly Protocol</h2>
      <p>Every Sunday should be a "System Check." Review your progress analytics in the Vayl dashboard. If your streak is broken, identify the friction point. If your resource count is low, identify the source of procrastination.</p>
    `,
    related: ['physics-high-yield-mechanics', 'deep-work-for-aspirants']
  },
  'deep-work-for-aspirants': {
    title: 'The Geometry of Focus: Why Deep Work is the only way to JEE',
    category: 'Focus',
    date: 'March 26, 2024',
    readTime: '8 min',
    takeaways: ['Zero-distraction environment', 'Time-blocking strategies', 'Cognitive flow induction'],
    content: `
      <h2>The Focus Formula</h2>
      <p>Cal Newport's concept of Deep Work is vital for JEE. The formula is simple but deadly effective: <strong>High Quality Work Produced = (Time Spent) x (Intensity of Focus).</strong></p>
      
      <h3>Eliminate Context Switching</h3>
      <p>Checking your phone every 15 minutes destroys your cognitive flow. It takes your brain 23 minutes to fully recover from a single distraction. If you check your phone 4 times an hour, you are never actually focused; you are in a state of constant "Attention Residue."</p>
      
      <h3>The Time-Blocking Protocol</h3>
      <p>Divide your day into "Focus Blocks." A 90-minute block of pure Physics is infinitely more valuable than 4 hours of distracted study with a textbook open while listening to music. During these blocks, all notifications must be dead. The world stops; only the concepts exist.</p>
      
      <h3>The Atmospheric Protocol</h3>
      <p>Use the Vayl Focus Room. Surround yourself with high-yield ambient audio and a visual countdown. This triggers a Pavlovian response in your brain—it's time to work. Over time, the sound of the Focus Room timer will automatically induce a flow state in your mind.</p>

      <h2>Recovery and Sustainability</h2>
      <p>Deep work is exhausting. You cannot do it for 12 hours a day. Target 4–6 hours of truly deep work. The rest of the day should be for shallow tasks, physical health, and cognitive recovery. Excellence is a marathon, not a sprint.</p>
    `,
    related: ['the-jee-2026-roadmap', 'exam-anxiety-protocol']
  },
  'mastering-organic-chemistry': {
    title: 'Organic Synthesis: A Structural Approach to Mastery',
    category: 'Chemistry',
    date: 'March 25, 2024',
    readTime: '15 min',
    takeaways: ['Electronic mechanism focus', 'Reagent categorization', 'Recursive reaction mapping'],
    content: `
      <h2>Mechanisms over Memorization</h2>
      <p>Do not memorize 500 named reactions. That is a recipe for failure in JEE Advanced. Instead, master the movement of electrons. If you understand <strong>nucleophiles</strong> and <strong>electrophiles</strong>, you can derive almost any reaction on the spot.</p>
      
      <h3>The Electronic Logic</h3>
      <p>Organic Chemistry is a story of charge imbalance. Electrons move from where they are (Lone pairs, π-bonds) to where they want to be (Positive charges, Electronegative atoms). Once you see this "electron flow," the mechanisms become intuitive.</p>
      
      <h3>The Reagent Protocol</h3>
      <p>Categorize your reagents by their functionality: Oxidizing agents, Reducing agents, Carbanion-formers, and Leaving groups. In your Vayl Vault, create flashcards not for "Reaction X," but for "Reagent Y." When you see a reagent in the exam, its purpose should be as clear as a tool in a surgeon's hand.</p>

      <h2>Practical Implementation</h2>
      <p>Spend your first 5 minutes of study drawing the GOC (General Organic Chemistry) basics: Resonance, Hyperconjugation, and Inductive effects. These are the gravity of the Organic world. Everything follows these rules.</p>
    `,
    related: ['the-jee-2026-roadmap', 'physics-high-yield-mechanics']
  },
  'physics-high-yield-mechanics': {
    title: 'Mechanics of Success: Breaking Down High-Yield Physics',
    category: 'Physics',
    date: 'March 24, 2024',
    readTime: '10 min',
    takeaways: ['FBD visualization', 'Conservation laws mastery', 'Trunk-to-leaf learning'],
    content: `
      <h2>The Law of High Yield</h2>
      <p>Mechanics is the trunk of the Physics tree. If your mechanics is weak, Electrodynamics, Magnetism, and even Modern Physics will inevitably suffer. Treat Newton's Laws and Rotational Dynamics as your primary tools of trade.</p>
      
      <h3>The FBD Protocol</h3>
      <p>Never solve a physics problem without a Free Body Diagram. The FBD is the architectural blueprint of the problem. If the blueprint is wrong, the building will fall. An FBD allows you to translate a physical scenario into a mathematical equation with zero ambiguity.</p>
      
      <h3>The Conservation Framework</h3>
      <p>Whenever you are stuck, look for constants. Conservation of Momentum, Energy, and Angular Momentum are the "cheat codes" of JEE Physics. If you can't find a path through force, find a path through energy.</p>

      <h2>Rotational Dynamics: The Filter</h2>
      <p>Rotational Dynamics is where most aspirants fall behind. Do not shy away from it. Master Moment of Inertia and Torque as if they were as simple as Mass and Force. Once the rotations become clear, the rest of Physics feels like it's in slow motion.</p>
    `,
    related: ['mastering-organic-chemistry', 'the-jee-2026-roadmap']
  },
  'exam-anxiety-protocol': {
    title: 'Mental Fortitude: The Protocol for Managing JEE Pressure',
    category: 'Mindset',
    date: 'March 23, 2024',
    readTime: '7 min',
    takeaways: ['Anxiety reframing', 'Early momentum strategy', 'Tactical breathing'],
    content: `
      <h2>The Pressure Protocol</h2>
      <p>Anxiety is often just misinterpreted energy. Learn to reframe exam stress as <strong>"Readiness."</strong> Your body is preparing you for a high-intensity task. That racing heart is oxygen being delivered to your brain for faster processing.</p>
      
      <h3>The First 5 Minutes Strategy</h3>
      <p>The first 5 minutes of your exam determine your entire flow. Do not start with the hardest question. Scan for "Easy Wins." Solving three simple problems in the first 10 minutes releases dopamine and builds the momentum needed to tackle the complex 4-mark questions later.</p>
      
      <h3>Tactical Breathing for Clarity</h3>
      <p>If you feel a "brain freeze" during the test, use the Box Breathing technique: Inhale for 4, Hold for 4, Exhale for 4, Hold for 4. This physically lowers your heart rate and resets your nervous system, allowing you to return to the logic of the problem.</p>

      <h2>Post-Exam Protocol</h2>
      <p>Never discuss answers immediately after the exam. Your focus should be on recovery and the next mission. The system only works if you protect your mental clarity between sessions.</p>
    `,
    related: ['deep-work-for-aspirants', 'the-jee-2026-roadmap']
  }
};

export default function ArticlePage({ params }: { params: { slug: string } }) {
  const article = ARTICLES[params.slug as keyof typeof ARTICLES];
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

  if (!article) {
    notFound();
  }

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
            sendGAEvent({ event: 'blog_share', value: params.slug });
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
              {article.category}
            </span>
            <span className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant opacity-40">
              {article.date} • {article.readTime}
            </span>
          </div>
          <h1 className="text-4xl md:text-6xl font-heading font-black tracking-tight text-white leading-[1.1] mb-8">
            {article.title}
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
            {article.takeaways.map((task, i) => (
              <li key={i} className="flex items-start gap-3 text-sm font-medium text-on-surface-variant">
                <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
                {task}
              </li>
            ))}
          </ul>
        </div>

        <div 
          className="prose prose-invert prose-p:text-on-surface-variant prose-p:leading-relaxed prose-p:text-lg prose-headings:font-heading prose-headings:font-bold prose-headings:text-white prose-blockquote:border-primary prose-blockquote:bg-white/5 prose-blockquote:p-6 prose-blockquote:rounded-2xl prose-blockquote:italic prose-h2:text-3xl prose-h2:mt-16 prose-h3:text-xl prose-h3:mt-8 max-w-none"
          dangerouslySetInnerHTML={{ __html: article.content }}
        />

        <div className="mt-24 pt-16 border-t border-white/5">
          <h4 className="text-xs font-black uppercase tracking-[0.2em] text-on-surface-variant mb-8 opacity-40">Continue the Reading</h4>
          <div className="grid sm:grid-cols-2 gap-4">
            {article.related.map((slug) => {
              const related = ARTICLES[slug as keyof typeof ARTICLES];
              return (
                <Link 
                  key={slug} 
                  href={`/blogs/${slug}`}
                  className="glass-card p-6 rounded-3xl border border-white/5 hover:border-primary/30 transition-all group"
                >
                  <span className="text-[10px] font-black uppercase tracking-widest text-primary mb-2 block">{related.category}</span>
                  <h5 className="font-bold text-white group-hover:text-primary transition-colors line-clamp-2">{related.title}</h5>
                </Link>
              );
            })}
          </div>
        </div>
      </article>

      <footer className="mt-32 border-t border-white/5 pt-16 px-6">
        <div className="max-w-4xl mx-auto flex flex-col items-center gap-8">
          <div className="flex items-center gap-3">
            <Zap className="w-6 h-6 text-primary" />
            <span className="text-xl font-heading font-black tracking-widest text-white uppercase italic">Vayl</span>
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
