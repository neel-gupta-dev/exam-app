"use client";

import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { X, ArrowRight, Sparkles, Lock } from "lucide-react";

interface DemoSignupModalProps {
  isOpen: boolean;
  onClose: () => void;
  feature?: string;
}

/**
 * DemoSignupModal
 * A premium "gate" modal shown when a demo (unauthenticated) user
 * tries to access a feature that requires a free account.
 * Intentionally gorgeous to convert visitors into signups.
 */
export default function DemoSignupModal({ isOpen, onClose, feature }: DemoSignupModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-black/70 backdrop-blur-md"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 24 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 24 }}
            transition={{ type: "spring", stiffness: 260, damping: 24 }}
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-md bg-surface border border-outline-variant/20 rounded-[2.5rem] shadow-2xl shadow-black/60 overflow-hidden"
          >
            {/* Decorative gradient orbs */}
            <div className="absolute -top-20 -right-20 w-64 h-64 bg-primary/20 rounded-full blur-[80px] pointer-events-none" />
            <div className="absolute -bottom-16 -left-16 w-48 h-48 bg-tertiary/10 rounded-full blur-[60px] pointer-events-none" />

            {/* Close button */}
            <button
              onClick={onClose}
              className="absolute top-5 right-5 z-10 p-2 rounded-xl bg-on-surface/5 hover:bg-on-surface/10 text-on-surface-variant hover:text-on-surface transition-all"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="relative z-10 p-10 flex flex-col items-center text-center">
              {/* Icon */}
              <div className="relative mb-6">
                <div className="w-20 h-20 rounded-[1.5rem] bg-primary/10 border border-primary/20 flex items-center justify-center">
                  <Image src="/vayl-logo.png" alt="Vayl" width={40} height={40} className="object-contain" />
                </div>
                <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-primary rounded-lg flex items-center justify-center shadow-lg shadow-primary/30">
                  <Lock className="w-4 h-4 text-on-primary" />
                </div>
              </div>

              {/* Badge */}
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 mb-4">
                <Sparkles className="w-3 h-3 text-primary" />
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">Free Account Required</span>
              </div>

              <h2 className="text-2xl font-heading font-black text-on-surface tracking-tight mb-3">
                {feature ? `Unlock ${feature}` : "Join Vayl for Free"}
              </h2>
              <p className="text-on-surface-variant text-sm leading-relaxed mb-8 max-w-xs">
                You&apos;re exploring the demo. Create a free account to save your work, track progress, and unlock the full academic arsenal.
              </p>

              {/* What you get */}
              <div className="w-full bg-surface-container rounded-2xl p-5 mb-8 text-left space-y-3">
                {[
                  "Unlimited resource vault & folders",
                  "Spaced repetition flashcard decks",
                  "AI-powered study analytics",
                  "Performance tracking & brag sheet",
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="w-4 h-4 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                      <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                    </div>
                    <span className="text-xs font-medium text-on-surface">{item}</span>
                  </div>
                ))}
              </div>

              {/* CTAs */}
              <div className="w-full space-y-3">
                <Link
                  href="/signup"
                  className="w-full flex items-center justify-center gap-2 bg-primary text-on-primary px-6 py-3.5 rounded-xl font-black text-sm uppercase tracking-widest hover:scale-[1.02] active:scale-95 transition-all shadow-lg shadow-primary/30"
                >
                  Create Free Account
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <Link
                  href="/login"
                  className="w-full flex items-center justify-center gap-2 bg-on-surface/5 text-on-surface px-6 py-3.5 rounded-xl font-bold text-sm hover:bg-on-surface/10 transition-all"
                >
                  Already have an account? Sign In
                </Link>
              </div>

              <p className="mt-5 text-[10px] text-on-surface-variant/50 font-medium">
                100% free. No credit card required. Ever.
              </p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
