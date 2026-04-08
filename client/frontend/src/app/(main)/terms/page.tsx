"use client";

import React from "react";
import Link from "next/link";

/**
 * Terms Of Service Page
 * Static legal page outlining user conduct, privacy agreements, and intellectual property.
 */
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
            className="inline-flex items-center gap-2 text-primary hover:text-primary-dim transition-all group mb-8 bg-surface-container-high px-4 py-2 rounded-full border border-outline-variant/10 hover:border-primary/20"
          >
            <span className="material-symbols-outlined text-sm group-hover:-translate-x-1 transition-transform">arrow_back</span>
            <span className="text-xs font-interface uppercase tracking-widest font-bold">Back to Vayl</span>
          </Link>
          <h1 className="text-5xl md:text-6xl font-heading font-black tracking-tighter mb-4 bg-gradient-to-br from-on-surface via-on-surface to-tertiary bg-clip-text text-transparent">
            Terms of Service
          </h1>
          <p className="text-on-surface-variant font-interface text-sm uppercase tracking-[0.2em] font-medium opacity-70">
            Effective Date: April 8, 2026
          </p>
        </header>

        {/* Content */}
        <div className="glass-card rounded-[2.5rem] p-8 md:p-12 space-y-12 leading-relaxed border-outline-variant/10 shadow-2xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-64 h-64 bg-tertiary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:bg-tertiary/10 transition-colors duration-700" />
          
          <section className="space-y-4">
            <p className="text-lg text-on-surface/90 italic">
              By using Vayl ("the Platform"), you agree to abide by the following Terms of Service. Please read them carefully.
            </p>
          </section>

          <section className="space-y-6">
            <h2 className="text-2xl font-heading font-bold text-on-surface flex items-center gap-3">
              <span className="w-8 h-8 rounded-lg bg-tertiary/20 flex items-center justify-center text-tertiary text-sm font-black">1</span>
              Acceptance of Terms
            </h2>
            <p className="text-on-surface-variant text-sm">
              By accessing Vayl, you agree to these Terms. If you are using the Platform on behalf of an educational institution, you represent that you have the authority to bind that institution to these Terms.
            </p>
          </section>

          <section className="space-y-6">
            <h2 className="text-2xl font-heading font-bold text-on-surface flex items-center gap-3">
              <span className="w-8 h-8 rounded-lg bg-tertiary/20 flex items-center justify-center text-tertiary text-sm font-black">2</span>
              Third-Party Integrations
            </h2>
            <div className="bg-surface-container-low p-6 rounded-2xl border border-outline-variant/10 space-y-4">
              <p className="text-on-surface-variant text-sm">Vayl allows you to connect your Google Classroom account. By doing so, you acknowledge:</p>
              <ul className="space-y-3 text-on-surface-variant text-sm">
                <li className="flex items-start gap-2">
                  <span className="material-symbols-outlined text-tertiary text-[10px] mt-1">circle</span>
                  <span>You have the necessary permissions to access and sync your academic data.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="material-symbols-outlined text-tertiary text-[10px] mt-1">circle</span>
                  <span>Syncing delays or API limitations from Google's end are beyond Vayl's control.</span>
                </li>
              </ul>
            </div>
          </section>

          <section className="space-y-6">
            <h2 className="text-2xl font-heading font-bold text-on-surface flex items-center gap-3">
              <span className="w-8 h-8 rounded-lg bg-tertiary/20 flex items-center justify-center text-tertiary text-sm font-black">3</span>
              Academic Integrity & Conduct
            </h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="p-5 rounded-xl bg-white/2 border border-white/5">
                <h3 className="font-bold text-white mb-2 text-sm uppercase tracking-wider">Focus Room Etiquette</h3>
                <p className="text-xs text-on-surface-variant leading-relaxed">
                  Focus Rooms are for deep work. Any disruptive behavior, spamming, or use of the platform to facilitate cheating will result in immediate suspension.
                </p>
              </div>
              <div className="p-5 rounded-xl bg-white/2 border border-white/5">
                <h3 className="font-bold text-white mb-2 text-sm uppercase tracking-wider">Independent Study</h3>
                <p className="text-xs text-on-surface-variant leading-relaxed">
                  AI-assisted features are tools for understanding, not shortcuts. Using Vayl to bypass institutional homework policies is prohibited.
                </p>
              </div>
            </div>
          </section>

          <section className="space-y-6">
            <h2 className="text-2xl font-heading font-bold text-on-surface flex items-center gap-3">
              <span className="w-8 h-8 rounded-lg bg-tertiary/20 flex items-center justify-center text-tertiary text-sm font-black">4</span>
              Institutional Verification
            </h2>
            <p className="text-on-surface-variant text-sm">
              We provide "Verified Student" status based on academic email domains. We reserve the right to revoke this status if we determine the email does not belong to a legitimate educational institution or if the account is used for non-academic purposes.
            </p>
          </section>

          <section className="space-y-6">
            <h2 className="text-2xl font-heading font-bold text-on-surface flex items-center gap-3">
              <span className="w-8 h-8 rounded-lg bg-tertiary/20 flex items-center justify-center text-tertiary text-sm font-black">5</span>
              Intellectual Property
            </h2>
            <div className="space-y-4">
              <div className="bg-white/5 rounded-2xl p-6 border border-white/5">
                <h3 className="font-bold text-white mb-2 text-sm uppercase tracking-wider">User Content</h3>
                <p className="text-on-surface-variant text-sm leading-relaxed">
                  Vayl's brand, software, and proprietary algorithms are protected. You retain ownership of your original notes and uploaded materials, granting Vayl a limited license to host them for your personal use.
                </p>
              </div>
              <div className="bg-white/5 rounded-2xl p-6 border border-white/5">
                <h3 className="font-bold text-white mb-2 text-sm uppercase tracking-wider">Vayl Notes Subdomain</h3>
                <p className="text-on-surface-variant text-sm leading-relaxed">
                  Materials provided on the curated Vayl Notes platform (notes.vayl.in), including PYQs and study guides, are provided solely for your personal, non-commercial education. Automated scraping, mass reproduction, or commercial redistribution of these resources is strictly prohibited.
                </p>
              </div>
            </div>
          </section>

          <section className="space-y-6">
            <h2 className="text-2xl font-heading font-bold text-on-surface flex items-center gap-3">
              <span className="w-8 h-8 rounded-lg bg-tertiary/20 flex items-center justify-center text-tertiary text-sm font-black">6</span>
              Vulnerability Disclosure
            </h2>
            <div className="bg-tertiary/5 rounded-2xl p-6 border border-tertiary/10">
              <p className="text-on-surface-variant text-sm leading-relaxed">
                Vayl encourages responsible security research. We provide a **Safe Harbor** for researchers who discover and disclose vulnerabilities in accordance with our <Link href="/.well-known/security.txt" className="text-tertiary hover:underline">security.txt</Link> guidelines. We promise not to pursue legal action against researchers acting in good faith.
              </p>
            </div>
          </section>

          <footer className="pt-12 border-t border-outline-variant/10 mt-12 text-center">
            <p className="text-on-surface-variant mb-6 text-sm">
              Any questions? Reach out to us.
            </p>
            <a 
              href="mailto:support@vayl.in" 
              className="inline-flex items-center gap-3 bg-tertiary text-on-tertiary px-8 py-3 rounded-2xl font-bold hover:scale-105 transition-transform duration-300 shadow-lg shadow-tertiary/20"
            >
              <span className="material-symbols-outlined">mail</span>
              support@vayl.in
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
