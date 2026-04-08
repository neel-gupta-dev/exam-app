"use client";

import React from "react";
import Link from "next/link";
import { Montserrat, Poppins, Hanken_Grotesk } from "next/font/google";

/**
 * Privacy Policy Page
 * Static legal page detailing data collection, usage, and user rights.
 */
export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-surface text-on-surface font-body selection:bg-primary/20">
      {/* Background Orbs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
        <div className="orb w-[500px] h-[500px] bg-primary/20 top-[-10%] left-[-10%] animate-pulse" />
        <div className="orb w-[400px] h-[400px] bg-tertiary/10 bottom-[-5%] right-[-5%] delay-700 animate-pulse" />
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
          <h1 className="text-5xl md:text-6xl font-heading font-black tracking-tighter mb-4 bg-gradient-to-br from-on-surface via-on-surface to-primary bg-clip-text text-transparent">
            Privacy Policy
          </h1>
          <p className="text-on-surface-variant font-interface text-sm uppercase tracking-[0.2em] font-medium opacity-70">
            Effective Date: April 8, 2026
          </p>
        </header>

        {/* Content */}
        <div className="glass-card rounded-[2.5rem] p-8 md:p-12 space-y-12 leading-relaxed border-outline-variant/10 shadow-2xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:bg-primary/10 transition-colors duration-700" />

          <section className="space-y-4">
            <p className="text-lg text-on-surface/90 italic">
              Welcome to Vayl ("we," "our," or "us"). We are committed to protecting your privacy and ensuring that your personal information is handled in a safe and responsible manner. This Privacy Policy outlines how we collect, use, and safeguard your data when you use our platform.
            </p>
          </section>

          <section className="space-y-6">
            <h2 className="text-2xl font-heading font-bold text-on-surface flex items-center gap-3">
              <span className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center text-primary text-sm font-black">1</span>
              Information We Collect
            </h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-surface-container-low p-6 rounded-2xl border border-outline-variant/10 hover:border-primary/20 transition-colors">
                <h3 className="font-heading font-bold text-primary mb-3 text-sm uppercase tracking-wider">1.1 Account & Identity</h3>
                <ul className="space-y-3 text-on-surface-variant text-sm">
                  <li className="flex items-start gap-2">
                    <span className="material-symbols-outlined text-primary text-[10px] mt-1">circle</span>
                    <span><strong>Google Profile:</strong> Name, email, and profile picture retrieved via Google OAuth.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="material-symbols-outlined text-primary text-[10px] mt-1">circle</span>
                    <span><strong>Academic Email:</strong> We process your email domain to verify institutional status.</span>
                  </li>
                </ul>
              </div>
              <div className="bg-surface-container-low p-6 rounded-2xl border border-outline-variant/10 hover:border-primary/20 transition-colors">
                <h3 className="font-heading font-bold text-primary mb-3 text-sm uppercase tracking-wider">1.2 Google Classroom Data</h3>
                <ul className="space-y-3 text-on-surface-variant text-sm">
                  <li className="flex items-start gap-2">
                    <span className="material-symbols-outlined text-primary text-[10px] mt-1">circle</span>
                    <span><strong>Course Metadata:</strong> Course names, descriptions, and teacher profiles.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="material-symbols-outlined text-primary text-[10px] mt-1">circle</span>
                    <span><strong>Stream Activity:</strong> Assignments, announcements, and resource materials for syncing.</span>
                  </li>
                </ul>
              </div>
              <div className="bg-surface-container-low p-6 rounded-2xl border border-outline-variant/10 hover:border-primary/20 transition-colors md:col-span-2">
                <h3 className="font-heading font-bold text-primary mb-3 text-sm uppercase tracking-wider">1.3 Vayl Notes Subdomain</h3>
                <ul className="space-y-3 text-on-surface-variant text-sm">
                  <li className="flex items-start gap-2">
                    <span className="material-symbols-outlined text-primary text-[10px] mt-1">circle</span>
                    <span><strong>Public Access:</strong> Access to study materials on notes.vayl.in is offered. We do not track individual reading behavior for unauthenticated users beyond standard anonymized network analytics.</span>
                  </li>
                </ul>
              </div>
            </div>
            <div className="bg-primary/5 p-4 rounded-xl border border-primary/20">
              <p className="text-xs text-primary font-medium flex items-center gap-2">
                <span className="material-symbols-outlined text-sm">info</span>
                Note: Vayl does not store or download your Google Drive files. We only process metadata (titles and links) to display them in your Classroom Hub.
              </p>
            </div>
          </section>

          <section className="space-y-6">
            <h2 className="text-2xl font-heading font-bold text-on-surface flex items-center gap-3">
              <span className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center text-primary text-sm font-black">2</span>
              How We Use Your Information
            </h2>
            <div className="bg-surface-container-lowest rounded-2xl p-6 border border-outline-variant/5">
              <ul className="grid md:grid-cols-2 gap-4 text-on-surface-variant text-sm">
                {[
                  "Synchronize academic deadlines",
                  "Automated institutional verification",
                  "Unified classroom stream feed",
                  "AI-driven study plan personalization",
                  "Focus session activity tracking",
                  "Secure platform authentication"
                ].map((item, i) => (
                  <li key={i} className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-primary text-lg">check_circle</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </section>

          <section className="space-y-6">
            <h2 className="text-2xl font-heading font-bold text-on-surface flex items-center gap-3">
              <span className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center text-primary text-sm font-black">3</span>
              Third-Party Integrations
            </h2>
            <p className="text-on-surface-variant text-sm">
              Our platform integrates directly with Google Workspace. Your data use is governed by your Google account settings and our specified scopes.
            </p>
            <div className="space-y-4">
              {[
                { title: "Google OAuth 2.0", desc: "Used for secure identity management and session persistence." },
                { title: "Classroom API", desc: "Read-only access to synchronize your academic journey in real-time." },
                { title: "Revocation", desc: "You can revoke access at any time through your Google Security settings." }
              ].map((item, i) => (
                <div key={i} className="flex gap-4 p-4 rounded-xl bg-surface-container-low border border-outline-variant/10">
                  <div className="font-heading font-bold text-on-surface min-w-[140px] text-sm">{item.title}</div>
                  <div className="text-on-surface-variant text-sm">{item.desc}</div>
                </div>
              ))}
            </div>
          </section>

          <div className="grid md:grid-cols-2 gap-8">
            <section className="space-y-4">
              <h2 className="text-xl font-heading font-bold text-white">4. Verification</h2>
              <p className="text-on-surface-variant text-sm leading-relaxed">
                We automatically verify students using institutional email suffixes (e.g., .edu, .ac.in). Users from non-academic domains may require manual verification.
              </p>
            </section>
            <section className="space-y-4">
              <h2 className="text-xl font-heading font-bold text-white">5. Data Retention</h2>
              <p className="text-on-surface-variant text-sm leading-relaxed">
                Classroom metadata is cached temporarily to improve speed and was deleted immediately upon account disconnection or deletion.
              </p>
            </section>
          </div>

          <section className="space-y-6">
            <h2 className="text-2xl font-heading font-bold text-on-surface flex items-center gap-3">
              <span className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center text-primary text-sm font-black">6</span>
              Security & Research
            </h2>
            <p className="text-on-surface-variant text-sm leading-relaxed">
              We process contact information provided by security researchers solely for vulnerability disclosure and resolution. All reports are handled with confidentiality and patched within 72 hours of verification. For more details, refer to our <Link href="/.well-known/security.txt" className="text-primary hover:underline">security.txt</Link> protocol.
            </p>
          </section>

          <footer className="pt-12 border-t border-outline-variant/10 mt-12 text-center">
            <p className="text-on-surface-variant mb-6 text-sm">
              Questions? Reach out to our dedicated support team.
            </p>
            <a
              href="mailto:support@vayl.in"
              className="inline-flex items-center gap-3 bg-primary text-on-primary px-8 py-3 rounded-2xl font-bold hover:scale-105 transition-transform duration-300 shadow-lg shadow-primary/20"
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
            <Link href="/login" className="text-on-surface-variant text-xs hover:text-primary transition-colors">Login</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
