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
            className="inline-flex items-center gap-2 text-primary hover:text-white transition-all group mb-8 bg-surface-variant/50 px-4 py-2 rounded-full border border-white/5 hover:border-primary/20"
          >
            <span className="material-symbols-outlined text-sm group-hover:-translate-x-1 transition-transform">arrow_back</span>
            <span className="text-xs font-interface uppercase tracking-widest font-bold">Back to Vayl</span>
          </Link>
          <h1 className="text-5xl md:text-6xl font-heading font-black tracking-tighter mb-4 bg-gradient-to-br from-white via-white to-primary/40 bg-clip-text text-transparent">
            Privacy Policy
          </h1>
          <p className="text-on-surface-variant font-interface text-sm uppercase tracking-[0.2em] font-medium opacity-70">
            Effective Date: March 27, 2026
          </p>
        </header>

        {/* Content */}
        <div className="glass-card rounded-[2.5rem] p-8 md:p-12 space-y-12 leading-relaxed border-white/10 shadow-2xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:bg-primary/10 transition-colors duration-700" />

          <section className="space-y-4">
            <p className="text-lg text-on-surface/90 italic">
              Welcome to Vayl ("we," "our," or "us"). We are committed to protecting your privacy and ensuring that your personal information is handled in a safe and responsible manner. This Privacy Policy outlines how we collect, use, and safeguard your data when you use our platform.
            </p>
          </section>

          <section className="space-y-6">
            <h2 className="text-2xl font-heading font-bold text-white flex items-center gap-3">
              <span className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center text-primary text-sm font-black">1</span>
              Information We Collect
            </h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-white/5 p-6 rounded-2xl border border-white/5 hover:border-white/10 transition-colors">
                <h3 className="font-heading font-bold text-primary mb-3 text-sm uppercase tracking-wider">1.1 Personal Information</h3>
                <ul className="space-y-3 text-on-surface-variant text-sm">
                  <li className="flex items-start gap-2">
                    <span className="material-symbols-outlined text-primary text-[10px] mt-1">circle</span>
                    <span><strong>Account Data:</strong> Name, email address, roll number, and password.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="material-symbols-outlined text-primary text-[10px] mt-1">circle</span>
                    <span><strong>Profile Information:</strong> Profile picture, academic interests, and target examination year.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="material-symbols-outlined text-primary text-[10px] mt-1">circle</span>
                    <span><strong>Communication Data:</strong> Inquiries sent to support.</span>
                  </li>
                </ul>
              </div>
              <div className="bg-white/5 p-6 rounded-2xl border border-white/5 hover:border-white/10 transition-colors">
                <h3 className="font-heading font-bold text-primary mb-3 text-sm uppercase tracking-wider">1.2 Usage Data</h3>
                <ul className="space-y-3 text-on-surface-variant text-sm">
                  <li className="flex items-start gap-2">
                    <span className="material-symbols-outlined text-primary text-[10px] mt-1">circle</span>
                    <span>Activity logs, including time spent on modules and quiz performance.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="material-symbols-outlined text-primary text-[10px] mt-1">circle</span>
                    <span>Device info: IP address, browser type, and OS.</span>
                  </li>
                </ul>
              </div>
            </div>
          </section>

          <section className="space-y-6">
            <h2 className="text-2xl font-heading font-bold text-white flex items-center gap-3">
              <span className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center text-primary text-sm font-black">2</span>
              How We Use Your Information
            </h2>
            <div className="bg-white/2 rounded-2xl p-6 border border-white/5">
              <ul className="grid md:grid-cols-2 gap-4 text-on-surface-variant text-sm">
                {[
                  "Provide and maintain services",
                  "Personalize learning experience",
                  "Track academic progress",
                  "Communicate updates",
                  "Improve platform functionality",
                  "Security and support"
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
            <h2 className="text-2xl font-heading font-bold text-white flex items-center gap-3">
              <span className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center text-primary text-sm font-black">3</span>
              Sharing Your Information
            </h2>
            <p className="text-on-surface-variant">
              We do not sell your personal information. We share data only with:
            </p>
            <div className="space-y-4">
              {[
                { title: "Service Providers", desc: "Trusted partners assisting in platform operations (hosting, analytics)." },
                { title: "Legal Requirements", desc: "If mandated by law or for safety purposes." },
                { title: "Public Profiles", desc: "If you opt-in, your academic identity may be visible to others." }
              ].map((item, i) => (
                <div key={i} className="flex gap-4 p-4 rounded-xl bg-white/5 border border-white/5">
                  <div className="font-heading font-bold text-white min-w-[140px] text-sm">{item.title}</div>
                  <div className="text-on-surface-variant text-sm">{item.desc}</div>
                </div>
              ))}
            </div>
          </section>

          <div className="grid md:grid-cols-2 gap-8">
            <section className="space-y-4">
              <h2 className="text-xl font-heading font-bold text-white">4. Data Security</h2>
              <p className="text-on-surface-variant text-sm">
                We implement industry-standard security measures. While we strive for 100% security, no internet transmission is entirely risk-free.
              </p>
            </section>
            <section className="space-y-4">
              <h2 className="text-xl font-heading font-bold text-white">5. Your Rights</h2>
              <p className="text-on-surface-variant text-sm">
                You can access, update, or request deletion of your data at any time via settings or by contacting us directly.
              </p>
            </section>
          </div>

          <footer className="pt-12 border-t border-white/10 mt-12 text-center">
            <p className="text-on-surface-variant mb-6 text-sm">
              Questions? Reach out to our dedicated support team.
            </p>
            <a
              href="mailto:support@vayl.app"
              className="inline-flex items-center gap-3 bg-primary text-on-primary px-8 py-3 rounded-2xl font-bold hover:scale-105 transition-transform duration-300 shadow-lg shadow-primary/20"
            >
              <span className="material-symbols-outlined">mail</span>
              neelgupta30@zohomail.in
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
