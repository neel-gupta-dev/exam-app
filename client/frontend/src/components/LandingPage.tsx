"use client";

import React from "react";
import Link from "next/link";
import {
  Zap,
  Target,
  Brain,
  ShieldCheck,
  ArrowRight,
  BookOpen,
  Timer,
  LayoutDashboard
} from "lucide-react";
import { sendGAEvent } from '@next/third-parties/google';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-surface text-on-surface font-body selection:bg-primary/20 overflow-x-hidden">
      {/* Background Grid & Orbs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
        <div className="orb w-[800px] h-[800px] bg-primary/10 top-[-20%] right-[-10%] blur-[120px]" />
        <div className="orb w-[600px] h-[600px] bg-tertiary/5 bottom-[-10%] left-[-10%] blur-[100px]" />
        <div className="mesh-grid absolute inset-0 opacity-20" />
      </div>

      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-surface/50 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 group relative">
            <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center shadow-lg shadow-primary/20 group-hover:scale-110 transition-transform">
              <Zap className="w-6 h-6 text-on-primary" />
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-heading font-black tracking-widest text-white uppercase italic">Vayl</span>
              <span className="absolute left-14 top-full mt-2 w-max px-3 py-1 bg-white text-black text-[8px] font-black uppercase tracking-[0.2em] rounded-md opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none shadow-xl z-50">
                Vayl: Dweller in the Valley
              </span>
            </div>
          </Link>
          <div className="flex items-center gap-8">
            <div className="hidden md:flex items-center gap-8 text-xs font-interface font-black uppercase tracking-widest text-on-surface-variant">
              <Link href="/blogs" className="hover:text-primary transition-colors">Blogs</Link>
              <Link href="/about" className="hover:text-primary transition-colors">About</Link>
              <Link href="/contact" className="hover:text-primary transition-colors">Contact</Link>
            </div>
            <div className="flex items-center gap-4">
              <Link href="/login" className="text-xs font-interface font-black uppercase tracking-widest text-white hover:text-primary transition-colors">Login</Link>
              <Link
                href="/signup"
                onClick={() => sendGAEvent({ event: 'cta_click', value: 'nav_join_now' })}
                className="bg-primary text-on-primary px-6 py-2.5 rounded-xl font-bold text-xs uppercase tracking-widest hover:scale-105 transition-transform shadow-lg shadow-primary/20"
              >
                Join Now
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-40 pb-20 px-6 max-w-7xl mx-auto text-center relative">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "SoftwareApplication",
              "name": "Vayl",
              "operatingSystem": "Web",
              "applicationCategory": "EducationalApplication",
              "description": "Vayl is the premium study operating system designed for JEE aspirants to manage high-yield resources and master concepts with deep focus.",
              "offers": {
                "@type": "Offer",
                "price": "0",
                "priceCurrency": "INR"
              }
            })
          }}
        />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-[600px] bg-primary/5 rounded-full blur-[150px] -z-10" />
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 mb-8 animate-fade-in">
          <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
          <span className="text-[10px] font-black uppercase tracking-[0.25em] text-primary">The Premium Study Protocol</span>
        </div>
        <h1 className="text-6xl md:text-8xl lg:text-9xl font-heading font-black tracking-tightest leading-[0.9] text-white mb-10 max-w-4xl mx-auto">
          Built for the <span className="bg-gradient-to-br from-primary via-white to-tertiary bg-clip-text text-transparent">JEE Elite.</span>
        </h1>
        <p className="text-on-surface-variant max-w-2xl mx-auto text-lg md:text-xl leading-relaxed mb-12 opacity-80 font-medium font-interface">
          Stop managing files. Start mastering concepts. Vayl is the ultimate command center for high-yield JEE resource management and focused study.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-6 mb-24">
          <Link 
            href="/signup" 
            onClick={() => sendGAEvent({ event: 'cta_click', value: 'hero_deploy_vault' })}
            className="w-full sm:w-auto px-10 py-5 bg-white text-black rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-primary hover:text-white transition-all shadow-2xl hover:scale-105"
          >
            Deploy Your Vault
          </Link>
          <Link 
            href="/about" 
            onClick={() => sendGAEvent({ event: 'cta_click', value: 'hero_explore_system' })}
            className="w-full sm:w-auto px-10 py-5 bg-surface-container-highest border border-white/5 rounded-2xl font-black text-sm uppercase tracking-widest text-white hover:bg-white hover:text-black transition-all"
          >
            Explore System
          </Link>
        </div>

        {/* Dashboard Preview */}
        <div className="relative max-w-5xl mx-auto group">
          <div className="absolute -inset-1 bg-gradient-to-r from-primary/20 to-tertiary/20 rounded-[2.5rem] blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
          <div className="relative glass-card rounded-[2.5rem] border-white/10 overflow-hidden shadow-2xl shadow-black/50">
            <img 
              src="/screenshots/dashboard.png" 
              alt="Vayl Dashboard" 
              className="w-full h-auto object-cover transform transition duration-700 group-hover:scale-[1.01]"
            />
            <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-surface to-transparent opacity-60 pointer-events-none" />
          </div>
        </div>
      </section>

      {/* Stats/Proof */}
      <section className="py-20 px-6 max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8">
        {[
          { label: "Daily Focus Minutes", value: "480+", icon: <Timer className="w-5 h-5 text-primary" /> },
          { label: "Resources Tracked", value: "5k+", icon: <BookOpen className="w-5 h-5 text-tertiary" /> },
          { label: "Aspirants Joined", value: "1k+", icon: <Brain className="w-5 h-5 text-error" /> },
          { label: "Efficiency Boost", value: "35%", icon: <Zap className="w-5 h-5 text-primary" /> }
        ].map((stat, i) => (
          <div key={i} className="glass-card p-6 md:p-8 rounded-[2rem] border-white/5 group hover:border-primary/20 transition-colors">
            <div className="mb-4">{stat.icon}</div>
            <div className="text-3xl font-heading font-black text-white mb-1">{stat.value}</div>
            <div className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant opacity-60 line-clamp-1">{stat.label}</div>
          </div>
        ))}
      </section>

      {/* Mission Section (Content Depth for SEO) */}
      <section className="py-24 px-6 max-w-5xl mx-auto border-y border-white/5 relative overflow-hidden">
        <div className="absolute top-1/2 left-0 w-64 h-64 bg-primary/10 rounded-full blur-[100px] -translate-x-1/2" />
        <div className="relative z-10 text-center space-y-12">
          <h2 className="text-3xl md:text-5xl font-heading font-black text-white tracking-tight">
            The Mission of <span className="text-primary italic">The Silent Architect.</span>
          </h2>
          <div className="grid md:grid-cols-2 gap-12 text-left">
            <div className="space-y-4">
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-primary" />
                Surgical Precision
              </h3>
              <p className="text-on-surface-variant leading-relaxed opacity-70 font-interface">
                JEE preparation isn't about how much you study, but how effectively you manage what you know. Vayl provides the infrastructure for high-retention learning, taking the cognitive load off your organization and placing it purely on execution.
              </p>
            </div>
            <div className="space-y-4">
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <Zap className="w-5 h-5 text-tertiary" />
                Elite Workflow
              </h3>
              <p className="text-on-surface-variant leading-relaxed opacity-70 font-interface">
                From the way resources are categorized to the atmospheric audio in the Focus Room, every pixel is designed to induce a flow state. We don't just provide tools; we provide a standardized protocol for excellence.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Interface Showcase Grid */}
      <section className="py-32 px-6 max-w-7xl mx-auto space-y-32">
        {/* Focus Room Section */}
        <div className="grid md:grid-cols-2 gap-16 items-center">
          <div className="space-y-8">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-error/10 border border-error/20">
              <Timer className="w-4 h-4 text-error" />
              <span className="text-[10px] font-black uppercase tracking-widest text-error">Cognitive Protocol</span>
            </div>
            <h2 className="text-4xl md:text-6xl font-heading font-black tracking-tight text-white leading-tight">
              Deep Work <br /><span className="text-error italic">Standardized.</span>
            </h2>
            <p className="text-on-surface-variant text-lg leading-relaxed opacity-70 font-medium font-interface">
              Eliminate peripheral noise with our integrated Focus Room. Real-time timer, atmospheric audio controls, and a distraction-free environment engineered for peak performance.
            </p>
            <ul className="space-y-4 text-sm font-bold text-white/80 font-interface">
              <li className="flex items-center gap-3">
                <Target className="w-5 h-5 text-error" />
                <span>25:00 Focus Intervals</span>
              </li>
              <li className="flex items-center gap-3">
                <Zap className="w-5 h-5 text-error" />
                <span>Ambient High-Yield Audio</span>
              </li>
            </ul>
          </div>
          <div className="relative group">
            <div className="absolute -inset-4 bg-error/10 rounded-[3rem] blur-2xl opacity-0 group-hover:opacity-100 transition duration-700"></div>
            <div className="relative glass-card rounded-[2.5rem] border-white/5 overflow-hidden shadow-2xl">
              <img src="/screenshots/focus-room.png" alt="Focus Room" className="w-full h-auto hover:scale-105 transition-transform duration-700" />
            </div>
          </div>
        </div>

        {/* Analytics Section */}
        <div className="grid md:grid-cols-2 gap-16 items-center">
          <div className="relative group order-2 md:order-1">
            <div className="absolute -inset-4 bg-tertiary/10 rounded-[3rem] blur-2xl opacity-0 group-hover:opacity-100 transition duration-700"></div>
            <div className="relative glass-card rounded-[2.5rem] border-white/5 overflow-hidden shadow-2xl">
              <img src="/screenshots/analytics.png" alt="Vault Analytics" className="w-full h-auto hover:scale-105 transition-transform duration-700" />
            </div>
          </div>
          <div className="space-y-8 order-1 md:order-2">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-tertiary/10 border border-tertiary/20">
              <Brain className="w-4 h-4 text-tertiary" />
              <span className="text-[10px] font-black uppercase tracking-widest text-tertiary">Performance Intelligence</span>
            </div>
            <h2 className="text-4xl md:text-6xl font-heading font-black tracking-tight text-white leading-tight">
              Mastery <br /><span className="text-tertiary italic">Visualized.</span>
            </h2>
            <p className="text-on-surface-variant text-lg leading-relaxed opacity-70 font-medium font-interface">
              Understand your coverage and streaks with surgical precision. Our analytics suite tracks progress so you can focus on the gaps.
            </p>
            <Link 
              href="/signup" 
              onClick={() => sendGAEvent({ event: 'cta_click', value: 'analytics_preview_analyze' })}
              className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-widest text-tertiary hover:underline"
            >
              Analyze Your Potential <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>

        {/* Public Profile Section */}
        <div className="grid md:grid-cols-2 gap-16 items-center">
          <div className="space-y-8">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20">
              <Zap className="w-4 h-4 text-primary" />
              <span className="text-[10px] font-black uppercase tracking-widest text-primary">Academic Identity</span>
            </div>
            <h2 className="text-4xl md:text-6xl font-heading font-black tracking-tight text-white leading-tight">
              Share Your <br /><span className="text-primary italic">Scholarship.</span>
            </h2>
            <p className="text-on-surface-variant text-lg leading-relaxed opacity-70 font-medium font-interface">
              Every aspirant gets a unique Vault ID and a public profile. Show off your streaks, study hours, and academic credentials to the network.
            </p>
          </div>
          <div className="relative group">
            <div className="absolute -inset-4 bg-primary/10 rounded-[3rem] blur-2xl opacity-0 group-hover:opacity-100 transition duration-700"></div>
            <div className="relative glass-card rounded-[2.5rem] border-white/5 overflow-hidden shadow-2xl">
              <img src="/screenshots/public-profile.png" alt="Public Profile" className="w-full h-auto hover:scale-105 transition-transform duration-700" />
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-32 px-6 max-w-7xl mx-auto">
        <h2 className="text-4xl md:text-6xl font-heading font-black tracking-tight text-white mb-20 text-center">
          Engineered for <br /><span className="text-primary italic">Extreme Efficiency.</span>
        </h2>
        <div className="grid md:grid-cols-3 gap-8">
          {[
            { 
              title: "Smart Resource Vault", 
              desc: "Upload, categorize, and recall high-yield JEE materials with zero friction. Your personal academic repository.", 
              icon: <LayoutDashboard className="w-8 h-8 text-primary" /> 
            },
            { 
              title: "Focus Protocols", 
              desc: "Integrated Deep Work sessions with tailored audio environments to maximize your cognitive output.", 
              icon: <Target className="w-8 h-8 text-error" /> 
            },
            { 
              title: "Mastery Insights", 
              desc: "Data-driven analytics that track your coverage, streaks, and focus metrics in real-time.", 
              icon: <Brain className="w-8 h-8 text-tertiary" /> 
            }
          ].map((feature, i) => (
            <div key={i} className="glass-card p-10 rounded-[3rem] border-white/5 space-y-6 hover:translate-y-[-8px] transition-transform duration-500">
              <div className="w-16 h-16 bg-white/5 rounded-[1.5rem] flex items-center justify-center text-white border border-white/10">
                {feature.icon}
              </div>
              <h3 className="text-2xl font-heading font-bold text-white">{feature.title}</h3>
              <p className="text-on-surface-variant leading-relaxed opacity-70 font-interface">
                {feature.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Trust Section for Adsense */}
      <section className="py-20 px-6 max-w-4xl mx-auto text-center">
        <div className="glass-card p-12 rounded-[3.5rem] border border-primary/20 flex flex-col items-center gap-8 relative overflow-hidden">
          <div className="absolute -top-24 -left-24 w-64 h-64 bg-primary/20 rounded-full blur-[100px]" />
          <ShieldCheck className="w-16 h-16 text-primary" />
          <h2 className="text-3xl font-heading font-bold text-white">Your data stays your data.</h2>
          <p className="text-on-surface-variant leading-relaxed opacity-80">
            Vayl follows strict data isolation protocols. We provide a space for learning where academic integrity and user privacy are prioritized above all else.
          </p>
          <Link 
            href="/privacy-policy" 
            onClick={() => sendGAEvent({ event: 'cta_click', value: 'trust_read_protocol' })}
            className="text-xs font-interface font-black uppercase tracking-widest text-primary hover:underline"
          >
            Read our Protocol
          </Link>
        </div>
      </section>

      <footer className="py-20 px-6 border-t border-white/5 bg-surface-container/30">
        <div className="max-w-7xl mx-auto grid md:grid-cols-4 gap-12 mb-20">
          <div className="col-span-2 space-y-6">
            <div className="flex items-center gap-3">
              <Zap className="w-6 h-6 text-primary" />
              <span className="text-xl font-heading font-black tracking-widest text-white uppercase italic">Vayl</span>
            </div>
            <p className="text-sm text-on-surface-variant max-w-sm leading-relaxed font-medium">
              The next-generation study operating system for aspirants who target excellence. Simplify your vault, amplify your focus.
            </p>
          </div>
          <div className="space-y-6">
            <h4 className="text-[10px] font-black uppercase tracking-[0.25em] text-white">Platform</h4>
            <ul className="space-y-4 text-xs font-interface font-medium text-on-surface-variant">
              <li><Link href="/blogs" className="hover:text-primary transition-colors">Blog Hub</Link></li>
              <li><Link href="/about" className="hover:text-primary transition-colors">Mission</Link></li>
              <li><Link href="/contact" className="hover:text-primary transition-colors">Support</Link></li>
              <li><Link href="/login" className="hover:text-primary transition-colors">Access Portal</Link></li>
            </ul>
          </div>
          <div className="space-y-6">
            <h4 className="text-[10px] font-black uppercase tracking-[0.25em] text-white">Legal</h4>
            <ul className="space-y-4 text-xs font-interface font-medium text-on-surface-variant">
              <li><Link href="/privacy-policy" className="hover:text-primary transition-colors">Privacy Protocol</Link></li>
              <li><Link href="/terms" className="hover:text-primary transition-colors">Terms of Service</Link></li>
              <li><Link href="/health" className="hover:text-primary transition-colors">System Health</Link></li>
            </ul>
          </div>
        </div>
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <p className="text-[10px] text-on-surface-variant font-medium opacity-40 italic">
            © 2026 Academic Excellence Protocol. Built for JEE Aspirants.
          </p>
          <div className="flex gap-4">
            <div className="w-8 h-8 rounded-lg bg-surface-container flex items-center justify-center text-on-surface-variant hover:text-white transition-colors border border-white/5">
              <ArrowRight className="w-4 h-4" />
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
