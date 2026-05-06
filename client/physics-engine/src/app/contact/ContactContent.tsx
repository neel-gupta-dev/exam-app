"use client";

import React, { useState, useRef } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowLeft, Shield, Globe, Send, Loader2 } from 'lucide-react';
import ReCAPTCHA from 'react-google-recaptcha';
import { toast } from 'sonner';

export default function ContactContent() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const recaptchaRef = useRef<ReCAPTCHA>(null);

  const isProd = process.env.NODE_ENV === 'production';
  const siteKey = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    let captchaToken = null;
    if (isProd) {
      if (recaptchaRef.current) {
        captchaToken = recaptchaRef.current.getValue();
        if (!captchaToken) {
          toast.error('Please complete the CAPTCHA verification');
          setIsSubmitting(false);
          return;
        }
      } else if (!siteKey) {
        console.warn("reCAPTCHA site key is missing, bypassing for local testing if configured that way, but this will fail in production.");
      }
    }

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, message, captchaToken })
      });

      const data = await res.json();
      if (res.ok) {
        toast.success('Message sent successfully!');
        setEmail('');
        setMessage('');
        if (isProd && recaptchaRef.current) recaptchaRef.current.reset();
      } else {
        toast.error(data.error || 'Failed to send message');
      }
    } catch (err) {
      toast.error('An unexpected error occurred while sending your message');
    } finally {
      setIsSubmitting(false);
    }
  };

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

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-xs font-black uppercase tracking-widest text-on-surface-variant mb-2">
                  Email Address
                </label>
                <input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isSubmitting}
                  className="w-full p-4 rounded-xl bg-surface-container-high border border-white/5 text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all disabled:opacity-50"
                  placeholder="your@email.com"
                />
              </div>

              <div>
                <label htmlFor="message" className="block text-xs font-black uppercase tracking-widest text-on-surface-variant mb-2">
                  Message
                </label>
                <textarea
                  id="message"
                  required
                  rows={4}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  disabled={isSubmitting}
                  className="w-full p-4 rounded-xl bg-surface-container-high border border-white/5 text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all resize-none disabled:opacity-50"
                  placeholder="How can we help?"
                />
              </div>

              {isProd && siteKey && (
                <div className="flex justify-center pt-2">
                  <ReCAPTCHA
                    ref={recaptchaRef}
                    sitekey={siteKey}
                    theme="dark" // Assuming standard theme matches VAYL better
                  />
                </div>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-4 mt-2 rounded-xl bg-primary text-on-primary font-black uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-primary-dim transition-colors disabled:opacity-70"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Send className="w-5 h-5" />
                    Send Message
                  </>
                )}
              </button>
            </form>

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
