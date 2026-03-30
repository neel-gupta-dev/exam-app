"use client";

import React, { useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { 
  Zap, 
  Target, 
  Brain, 
  ShieldCheck, 
  ArrowRight, 
  BookOpen, 
  Timer, 
  LayoutDashboard,
  Sun,
  Moon
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { sendGAEvent } from '@next/third-parties/google';
import { motion, AnimatePresence, Variants, useScroll, useTransform, useSpring, useMotionValue } from 'framer-motion';

// --- Components ---

const MagneticButton = ({ children, className, onClick, href }: { children: React.ReactNode, className?: string, onClick?: () => void, href?: string }) => {
  const ref = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const springConfig = { damping: 15, stiffness: 150 };
  const springX = useSpring(x, springConfig);
  const springY = useSpring(y, springConfig);

  const handleMouseMove = (e: React.MouseEvent) => {
    const { clientX, clientY } = e;
    const { left, top, width, height } = ref.current?.getBoundingClientRect() || { left: 0, top: 0, width: 0, height: 0 };
    const centerX = left + width / 2;
    const centerY = top + height / 2;
    const distanceX = clientX - centerX;
    const distanceY = clientY - centerY;
    
    // Limits the magnetic pull
    x.set(distanceX * 0.35);
    y.set(distanceY * 0.35);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  const content = (
    <motion.div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{ x: springX, y: springY }}
      className={className}
    >
      {children}
    </motion.div>
  );

  if (href) {
    return <Link href={href} onClick={onClick}>{content}</Link>;
  }
  return content;
};

const TiltCard = ({ children, className }: { children: React.ReactNode, className?: string }) => {
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const rotateX = useSpring(useTransform(y, [-100, 100], [15, -15]), { stiffness: 100, damping: 30 });
  const rotateY = useSpring(useTransform(x, [-100, 100], [-15, 15]), { stiffness: 100, damping: 30 });

  function handleMouse(event: React.MouseEvent) {
    const rect = event.currentTarget.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    x.set(event.clientX - centerX);
    y.set(event.clientY - centerY);
  }

  return (
    <motion.div
      onMouseMove={handleMouse}
      onMouseLeave={() => { x.set(0); y.set(0); }}
      style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
      className={className}
    >
      <div style={{ transform: "translateZ(50px)" }}>
        {children}
      </div>
    </motion.div>
  );
};

const CharacterReveal = ({ text, className }: { text: string, className?: string }) => {
  const words = text.split(" ");
  return (
    <span className={className}>
      {words.map((word, i) => (
        <span key={i} className="inline-block overflow-hidden mr-[0.2em] last:mr-0">
          <motion.span
            initial={{ y: "100%" }}
            whileInView={{ y: 0 }}
            transition={{ 
              duration: 0.8, 
              delay: i * 0.05, 
              ease: [0.33, 1, 0.68, 1] 
            }}
            viewport={{ once: true }}
            className="inline-block"
          >
            {word}
          </motion.span>
        </span>
      ))}
    </span>
  );
};

/**
 * Public Landing Page
 * The unauthenticated entry point of the Vayl platform.
 * Features extensive Framer Motion animations (Magnetic Buttons, Tilt Cards,
 * Scroll-Linked Parallax) to create a premium, high-conversion marketing presence.
 */
export default function LandingPage() {
  const { theme, toggleTheme } = useAuth();
  const { scrollY } = useScroll();
  const orb1Y = useTransform(scrollY, [0, 1000], [0, 200]);
  const orb2Y = useTransform(scrollY, [0, 1000], [0, -150]);
  const meshOpacity = useTransform(scrollY, [0, 500], [0.2, 0.05]);

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.2
      }
    }
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 100, damping: 20 } }
  };

  return (
    <div className="min-h-screen bg-surface text-on-surface font-body selection:bg-primary/20 overflow-x-hidden transition-colors duration-500">
      {/* Background Grid & Orbs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
        <motion.div 
          style={{ y: orb1Y }}
          className="orb w-[800px] h-[800px] bg-primary/10 top-[-20%] right-[-10%] blur-[120px]" 
        />
        <motion.div 
          style={{ y: orb2Y }}
          className="orb w-[600px] h-[600px] bg-tertiary/5 bottom-[-10%] left-[-10%] blur-[100px]" 
        />
        <motion.div 
          style={{ opacity: meshOpacity }}
          className="mesh-grid absolute inset-0 opacity-20" 
        />
      </div>

      {/* Scroll Progress Bar */}
      <motion.div 
        className="fixed top-0 left-0 h-1 bg-primary z-[60] origin-left" 
        style={{ scaleX: useSpring(useTransform(scrollY, [0, 1], [0, 1]), { stiffness: 100, damping: 30 }) }}
      />

      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-surface/80 backdrop-blur-xl border-b border-outline-variant/10">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 group relative">
            <motion.div 
              animate={{ rotate: [0, 5, -5, 0] }}
              transition={{ repeat: Infinity, duration: 6, ease: "easeInOut" }}
              className="w-12 h-12 flex items-center justify-center group-hover:scale-110 transition-transform relative"
            >
              <Image 
                src="/vayl-logo.png" 
                alt="Vayl Logo" 
                width={48} 
                height={48} 
                className="brightness-0 contrast-125 dark:brightness-100 dark:contrast-100 object-contain"
              />
            </motion.div>
            <div className="flex flex-col">
              <span className="text-xl font-heading font-black tracking-widest text-on-surface uppercase italic">Vayl</span>
              <span className="absolute left-14 top-full mt-2 w-max px-3 py-1 bg-on-surface text-surface text-[8px] font-black uppercase tracking-[0.2em] rounded-md opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none shadow-xl z-50">
                Vayl: Dweller in the Valley
              </span>
            </div>
          </Link>
          <div className="flex items-center gap-8">
            <div className="hidden md:flex items-center gap-8 text-xs font-interface font-black uppercase tracking-widest text-on-surface-variant">
              <MagneticButton href="/blogs" className="hover:text-primary transition-colors">Blogs</MagneticButton>
              <MagneticButton href="/about" className="hover:text-primary transition-colors">About</MagneticButton>
              <MagneticButton href="/contact" className="hover:text-primary transition-colors">Contact</MagneticButton>
            </div>
            <div className="flex items-center gap-4">
              <button 
                onClick={toggleTheme}
                className="w-10 h-10 flex items-center justify-center rounded-xl bg-on-surface/5 hover:bg-on-surface/10 transition-colors text-on-surface-variant relative overflow-hidden group"
              >
                <AnimatePresence mode="wait">
                  {theme === 'dark' ? (
                    <motion.div
                      key="sun"
                      initial={{ y: 20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      exit={{ y: -20, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <Sun className="w-5 h-5" />
                    </motion.div>
                  ) : (
                    <motion.div
                      key="moon"
                      initial={{ y: 20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      exit={{ y: -20, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <Moon className="w-5 h-5" />
                    </motion.div>
                  )}
                </AnimatePresence>
              </button>
              <MagneticButton href="/login" className="text-xs font-interface font-black uppercase tracking-widest text-on-surface hover:text-primary transition-colors">Login</MagneticButton>
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
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.div variants={itemVariants} className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-8 backdrop-blur-md">
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">
              The Academic Excellence Protocol
            </span>
          </motion.div>
          
          <motion.h1 variants={itemVariants} className="text-5xl md:text-8xl font-heading font-black tracking-tightest leading-[1.1] text-on-surface mb-10 max-w-4xl mx-auto">
            <CharacterReveal text="Built for the" /> <span className="bg-gradient-to-br from-primary via-on-surface to-tertiary bg-clip-text text-transparent italic">Academic Elite.</span>
          </motion.h1>

          <motion.p variants={itemVariants} className="text-on-surface-variant max-w-2xl mx-auto text-lg md:text-xl leading-relaxed mb-12 opacity-80 font-medium font-interface italic">
            Stop managing files. Start mastering concepts. Vayl is the ultimate command center for high-yield resource management and focused study.
          </motion.p>

          <motion.div variants={itemVariants} className="flex flex-col sm:flex-row items-center justify-center gap-6 mb-24">
            <MagneticButton 
              href="/signup" 
              onClick={() => sendGAEvent({ event: 'cta_click', value: 'hero_deploy_vault' })}
              className="group relative px-10 py-5 bg-primary text-on-primary rounded-2xl font-black uppercase tracking-widest text-xs flex items-center gap-3 overflow-hidden shadow-2xl shadow-primary/40"
            >
              <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
              <span className="relative z-10">Deploy Your Vault</span>
              <ArrowRight className="w-4 h-4 relative z-10 group-hover:translate-x-1 transition-transform" />
            </MagneticButton>
            <MagneticButton 
              href="/about" 
              onClick={() => sendGAEvent({ event: 'cta_click', value: 'hero_explore_system' })}
              className="px-10 py-5 bg-surface-container-low border border-outline-variant/10 text-on-surface rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-surface-bright transition-all font-interface"
            >
              Explore System
            </MagneticButton>
          </motion.div>
        </motion.div>

        {/* Dashboard Preview */}
        <motion.div 
          initial={{ opacity: 0, y: 60, scale: 0.95 }}
          whileInView={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ type: "spring", stiffness: 50, damping: 20 }}
          viewport={{ once: true }}
          className="relative max-w-5xl mx-auto group"
        >
          <TiltCard className="relative glass-card rounded-[2.5rem] border-outline-variant/10 overflow-hidden shadow-2xl shadow-black/50">
            <div className="absolute -inset-1 bg-gradient-to-r from-primary/20 to-tertiary/20 rounded-[2.5rem] blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
            <Image 
              src="/screenshots/dashboard.png" 
              alt="Vayl Dashboard" 
              width={1200}
              height={700}
              priority
              className="w-full h-auto object-contain transform transition duration-700 group-hover:scale-[1.01]"
            />
            <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-surface to-transparent opacity-20 pointer-events-none" />
          </TiltCard>
        </motion.div>
      </section>

      {/* Stats/Proof */}
      <section className="py-20 px-6 max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8">
        {[
          { label: "Daily Focus Minutes", value: "480+", icon: <Timer className="w-5 h-5 text-primary" /> },
          { label: "Resources Tracked", value: "5k+", icon: <BookOpen className="w-5 h-5 text-tertiary" /> },
          { label: "Aspirants Joined", value: "1k+", icon: <Brain className="w-5 h-5 text-error" /> },
          { label: "Efficiency Boost", value: "35%", icon: <Image src="/vayl-logo.png" alt="Vayl Logo" width={20} height={20} className="brightness-0 contrast-125 dark:brightness-100 dark:contrast-100 object-contain" /> }
        ].map((stat, i) => (
          <motion.div 
            key={i} 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1, type: "spring" }}
            viewport={{ once: true }}
            whileHover={{ y: -8, scale: 1.02 }}
            className="glass-card p-6 md:p-8 rounded-[2rem] border-outline-variant/5 group hover:border-primary/20 transition-all duration-300"
          >
            <div className="mb-4">{stat.icon}</div>
            <div className="text-3xl font-heading font-black text-on-surface mb-1">{stat.value}</div>
            <div className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant opacity-60 line-clamp-1">{stat.label}</div>
          </motion.div>
        ))}
      </section>

      {/* Mission Section (Content Depth for SEO) */}
      <section className="py-24 px-6 max-w-5xl mx-auto border-y border-outline-variant/10 relative overflow-hidden">
        <div className="absolute top-1/2 left-0 w-64 h-64 bg-primary/10 rounded-full blur-[100px] -translate-x-1/2" />
        <div className="relative z-10 text-center space-y-12">
          <h2 className="text-3xl md:text-5xl font-heading font-black text-on-surface tracking-tight">
            The Mission of <span className="text-primary italic">The Silent Architect.</span>
          </h2>
          <div className="grid md:grid-cols-2 gap-12 text-left">
            <div className="space-y-4">
              <h3 className="text-xl font-bold text-on-surface flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-primary" />
                Surgical Precision
              </h3>
              <p className="text-on-surface-variant leading-relaxed opacity-70 font-interface font-medium">
                Elite preparation isn't about how much you study, but how effectively you manage what you know. Vayl provides the infrastructure for high-retention learning, taking the cognitive load off your organization and placing it purely on execution.
              </p>

            </div>
            <div className="space-y-4">
              <h3 className="text-xl font-bold text-on-surface flex items-center gap-2">
                <Image src="/vayl-logo.png" alt="Vayl Logo" width={20} height={20} className="brightness-0 contrast-125 dark:brightness-100 dark:contrast-100 object-contain" />
                Elite Workflow
              </h3>
              <p className="text-on-surface-variant leading-relaxed opacity-70 font-interface font-medium">
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
            <h2 className="text-4xl md:text-6xl font-heading font-black tracking-tight text-on-surface leading-tight">
              Deep Work <br /><span className="text-error italic">Standardized.</span>
            </h2>
            <p className="text-on-surface-variant text-lg leading-relaxed opacity-70 font-semibold font-interface">
              Eliminate peripheral noise with our integrated Focus Room. Real-time timer, atmospheric audio controls, and a distraction-free environment engineered for peak performance.
            </p>
            <ul className="space-y-4 text-sm font-bold text-on-surface-variant font-interface">
              <li className="flex items-center gap-3">
                <motion.div
                  animate={{ y: [0, -5, 0] }}
                  transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
                >
                  <Target className="w-5 h-5 text-error" />
                </motion.div>
                <span>25:00 Focus Intervals</span>
              </li>
              <li className="flex items-center gap-3">
                <motion.div
                  animate={{ y: [0, -5, 0] }}
                  transition={{ repeat: Infinity, duration: 2, delay: 0.5, ease: "easeInOut" }}
                >
                  <Image src="/vayl-logo.png" alt="Vayl Logo" width={20} height={20} className="brightness-0 contrast-125 dark:brightness-100 dark:contrast-100 object-contain" />
                </motion.div>
                <span>Ambient High-Yield Audio</span>
              </li>
            </ul>
          </div>
          <TiltCard className="relative group">
            <div className="absolute -inset-4 bg-error/10 rounded-[3rem] blur-2xl opacity-0 group-hover:opacity-100 transition duration-700"></div>
            <div className="relative glass-card rounded-[2.5rem] border-outline-variant/10 overflow-hidden shadow-2xl">
              <Image 
                src="/screenshots/focus-room.png" 
                alt="Focus Room" 
                width={800}
                height={450}
                className="w-full h-auto hover:scale-105 transition-transform duration-700" 
              />
            </div>
          </TiltCard>
        </div>

        {/* Analytics Section */}
        <div className="grid md:grid-cols-2 gap-16 items-center">
          <TiltCard className="relative group order-2 md:order-1">
            <div className="absolute -inset-4 bg-tertiary/10 rounded-[3rem] blur-2xl opacity-0 group-hover:opacity-100 transition duration-700"></div>
            <div className="relative glass-card rounded-[2.5rem] border-outline-variant/10 overflow-hidden shadow-2xl">
              <Image 
                src="/screenshots/analytics.png" 
                alt="Vault Analytics" 
                width={800}
                height={450}
                className="w-full h-auto hover:scale-105 transition-transform duration-700" 
              />
            </div>
          </TiltCard>
          <div className="space-y-8 order-1 md:order-2">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-tertiary/10 border border-tertiary/20">
              <Brain className="w-4 h-4 text-tertiary" />
              <span className="text-[10px] font-black uppercase tracking-widest text-tertiary">Performance Intelligence</span>
            </div>
            <h2 className="text-4xl md:text-6xl font-heading font-black tracking-tight text-on-surface leading-tight">
              Mastery <br /><span className="text-tertiary italic">Visualized.</span>
            </h2>
            <p className="text-on-surface-variant text-lg leading-relaxed opacity-70 font-semibold font-interface">
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
              <Image src="/vayl-logo.png" alt="Vayl Logo" width={16} height={16} className="brightness-0 contrast-125 dark:brightness-100 dark:contrast-100 object-contain" />
              <span className="text-[10px] font-black uppercase tracking-widest text-primary">Academic Identity</span>
            </div>
            <h2 className="text-4xl md:text-6xl font-heading font-black tracking-tight text-on-surface leading-tight">
              Share Your <br /><span className="text-primary italic">Scholarship.</span>
            </h2>
            <p className="text-on-surface-variant text-lg leading-relaxed opacity-70 font-semibold font-interface">
              Every aspirant gets a unique Vault ID and a public profile. Show off your streaks, study hours, and academic credentials to the network.
            </p>
          </div>
          <TiltCard className="relative group">
            <div className="absolute -inset-4 bg-primary/10 rounded-[3rem] blur-2xl opacity-0 group-hover:opacity-100 transition duration-700"></div>
            <div className="relative glass-card rounded-[2.5rem] border-outline-variant/10 overflow-hidden shadow-2xl">
              <Image 
                src="/screenshots/public-profile.png" 
                alt="Public Profile" 
                width={800}
                height={500}
                className="w-full h-auto object-contain hover:scale-105 transition-transform duration-700" 
              />
            </div>
          </TiltCard>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-32 px-6 max-w-7xl mx-auto">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-20 text-center md:text-left"
        >
          <h2 className="text-[10px] font-black uppercase tracking-[0.25em] text-primary mb-4">Structural Advantage</h2>
          <h3 className="text-4xl md:text-6xl font-heading font-black tracking-tightest leading-[0.9] text-on-surface">
            BUILT FOR <span className="text-primary italic">OUTLIERS.</span>
          </h3>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6">
          {[
            {
              icon: Brain,
              title: "Mistake Vault",
              desc: "Convert every wrong answer into a permanent neural pathway. Structural revision for the 1%."
            },
            {
              icon: Timer,
              title: "Focus Protocol",
              desc: "Enter flow state on command. Integrated deep-work timers with biometric simulation."
            },
            {
              icon: Target,
              title: "Yield Mapping",
              desc: "Data-driven analytics that show exactly which 20% of effort is driving 80% of results."
            }
          ].map((feature, i) => (
            <TiltCard 
              key={i}
            >
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.15, type: "spring", stiffness: 100 }}
                viewport={{ once: true }}
                className="glass-card p-12 h-full rounded-[3rem] border border-outline-variant/10 hover:border-primary/20 transition-all duration-500 group overflow-hidden relative"
              >
                <div className="absolute -top-10 -right-10 w-32 h-32 bg-primary/5 rounded-full blur-2xl group-hover:bg-primary/10 transition-colors" />
                <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center text-primary mb-8 group-hover:scale-110 group-hover:bg-primary group-hover:text-on-primary transition-all duration-500">
                  <feature.icon className="w-7 h-7" />
                </div>
                <h4 className="text-2xl font-heading font-bold text-on-surface mb-4">{feature.title}</h4>
                <p className="text-sm text-on-surface-variant leading-relaxed opacity-60 font-medium italic">{feature.desc}</p>
              </motion.div>
            </TiltCard>
          ))}
        </div>
      </section>

      {/* Trust Section for Adsense */}
      <section className="py-20 px-6 max-w-4xl mx-auto text-center">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="glass-card p-12 rounded-[3.5rem] border border-primary/20 flex flex-col items-center gap-8 relative overflow-hidden"
        >
          <div className="absolute -top-24 -left-24 w-64 h-64 bg-primary/20 rounded-full blur-[100px]" />
          <ShieldCheck className="w-16 h-16 text-primary" />
          <h2 className="text-3xl font-heading font-bold text-on-surface">Your data stays your data.</h2>
          <p className="text-on-surface-variant leading-relaxed opacity-80 font-medium">
            Vayl follows strict data isolation protocols. We provide a space for learning where academic integrity and user privacy are prioritized above all else.
          </p>
          <Link 
            href="/privacy-policy" 
            onClick={() => sendGAEvent({ event: 'cta_click', value: 'trust_read_protocol' })}
            className="text-xs font-interface font-black uppercase tracking-widest text-primary hover:underline"
          >
            Read our Protocol
          </Link>
        </motion.div>
      </section>

      <footer className="theme-light py-20 px-6 border-t border-outline-variant/10 bg-surface-container/30">
        <motion.div 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="max-w-7xl mx-auto grid md:grid-cols-4 gap-12 mb-20"
        >
          <div className="col-span-2 space-y-6">
            <div className="flex items-center gap-3">
              <Image src="/vayl-logo.png" alt="Vayl Logo" width={32} height={32} className="brightness-0 contrast-125 dark:brightness-100 dark:contrast-100 object-contain" />
              <span className="text-xl font-heading font-black tracking-widest text-on-surface uppercase italic">Vayl</span>
            </div>
            <p className="text-sm text-on-surface-variant max-w-sm leading-relaxed font-medium">
              The next-generation study operating system for aspirants who target excellence. Simplify your vault, amplify your focus.
            </p>
          </div>
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            viewport={{ once: true }}
            className="space-y-6"
          >
            <h4 className="text-[10px] font-black uppercase tracking-[0.25em] text-on-surface">Platform</h4>
            <ul className="space-y-4 text-xs font-interface font-medium text-on-surface-variant">
              <li><Link href="/blogs" className="hover:text-primary transition-colors">Blog Hub</Link></li>
              <li><Link href="/about" className="hover:text-primary transition-colors">Mission</Link></li>
              <li><Link href="/contact" className="hover:text-primary transition-colors">Support</Link></li>
              <li><Link href="/login" className="hover:text-primary transition-colors">Access Portal</Link></li>
            </ul>
          </motion.div>
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            viewport={{ once: true }}
            className="space-y-6"
          >
            <h4 className="text-[10px] font-black uppercase tracking-[0.25em] text-on-surface">Legal</h4>
            <ul className="space-y-4 text-xs font-interface font-medium text-on-surface-variant">
              <li><Link href="/privacy-policy" className="hover:text-primary transition-colors">Privacy Protocol</Link></li>
              <li><Link href="/terms" className="hover:text-primary transition-colors">Terms of Service</Link></li>
              <li><Link href="/health" className="hover:text-primary transition-colors">System Health</Link></li>
            </ul>
          </motion.div>
        </motion.div>
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <p className="text-[10px] text-on-surface-variant font-medium opacity-40 italic">
            © 2026 Academic Excellence Protocol.
          </p>

        </div>
      </footer>
    </div>
  );
}
