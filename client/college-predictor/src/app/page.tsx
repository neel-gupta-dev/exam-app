"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, ArrowDown, Target, Brain, BarChart3, Zap } from "lucide-react";
import InputForm from "../components/InputForm";
import ResultsView from "../components/ResultsView";
import { useCutoffData, usePredictor } from "../hooks/usePredictor";
import { UserInput } from "../lib/types";

export default function Home() {
  const { cutoffs, institutes, loading: dataLoading, error } = useCutoffData();
  const { results, predicting, predict, reset } = usePredictor(cutoffs, institutes);
  const [showResults, setShowResults] = useState(false);

  function handleSubmit(input: UserInput) {
    predict(input);
    setShowResults(true);
    // Scroll to results after a short delay
    setTimeout(() => {
      document.getElementById("results-section")?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }, 300);
    
    // Background data submission
    // Wait slightly to ensure results are calculated (it's sync but just in case)
    setTimeout(() => {
      if (results) {
        const deviceInfo = {
          user_agent: navigator.userAgent,
          screen_width: window.innerWidth,
          language: navigator.language,
          referrer: document.referrer,
        };

        const payload = {
          ...input,
          results_summary: {
            total_safe: results.total_safe,
            total_moderate: results.total_moderate,
            total_low: results.total_low,
            total_results: results.mains_results.length + results.advanced_results.length + results.bitsat_results.length,
          },
          device_info: deviceInfo,
        };

        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://api.vayl.in';

        fetch(`${apiUrl}/api/public/predictor-lead`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        }).catch(err => console.error("Failed to store lead data", err));
      }
    }, 500);
  }

  function handleReset() {
    reset();
    setShowResults(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  return (
    <main className="min-h-screen">
      {/* ─── Hero Section ─── */}
      <section className="relative pt-8 sm:pt-12 pb-4 px-4">
        <div className="max-w-4xl mx-auto text-center">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-300 text-xs font-medium mb-5"
          >
            <Sparkles className="w-3.5 h-3.5" />
            Based on JoSAA & CSAB 2024 Cutoffs
          </motion.div>

          {/* Title */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-3xl sm:text-5xl lg:text-6xl font-bold mb-4 font-[family-name:var(--font-heading)] leading-tight"
          >
            Predict Your{" "}
            <span className="gradient-text">Dream College</span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-gray-400 text-sm sm:text-lg max-w-2xl mx-auto mb-8"
          >
            Enter your JEE rank and preferences. Our smart algorithm analyzes{" "}
            <span className="text-white font-medium">20,000+ cutoff entries</span>{" "}
            to find your best-fit IITs, NITs, IIITs & GFTIs.
          </motion.p>

          {/* Feature Pills */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex flex-wrap items-center justify-center gap-3 mb-10"
          >
            {[
              { icon: <Target className="w-3.5 h-3.5" />, label: "Safe / Moderate / Reach" },
              { icon: <Brain className="w-3.5 h-3.5" />, label: "Market-Demand Ranking" },
              { icon: <BarChart3 className="w-3.5 h-3.5" />, label: "Placement Insights" },
              { icon: <Zap className="w-3.5 h-3.5" />, label: "Instant Results" },
            ].map((pill) => (
              <div
                key={pill.label}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-navy-800/60 border border-navy-700 text-xs text-gray-300"
              >
                {pill.icon}
                {pill.label}
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ─── Loading State ─── */}
      {dataLoading && (
        <div className="flex flex-col items-center justify-center py-20 px-4">
          <div className="relative w-16 h-16 mb-4">
            <div className="absolute inset-0 rounded-full border-2 border-navy-700" />
            <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-blue-500 animate-spin" />
          </div>
          <p className="text-gray-400 text-sm">Loading cutoff data...</p>
        </div>
      )}

      {/* ─── Error State ─── */}
      {error && (
        <div className="max-w-lg mx-auto px-4 py-8">
          <div className="glass-card p-6 text-center">
            <p className="text-red-400 mb-2">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="text-blue-400 text-sm hover:text-blue-300 transition-colors"
            >
              Reload Page
            </button>
          </div>
        </div>
      )}

      {/* ─── Input Form ─── */}
      {!dataLoading && !error && (
        <section className="px-4 pb-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <InputForm
              onSubmit={handleSubmit}
              loading={predicting}
              onReset={handleReset}
              hasResults={showResults}
            />
          </motion.div>
        </section>
      )}

      {/* ─── Results Section ─── */}
      <AnimatePresence>
        {showResults && results && (
          <motion.section
            id="results-section"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="px-4 pb-16 pt-4"
          >
            <div className="max-w-6xl mx-auto">
              {/* Section divider */}
              <div className="flex items-center gap-4 mb-8">
                <div className="h-px flex-1 bg-gradient-to-r from-transparent via-blue-500/30 to-transparent" />
                <div className="flex items-center gap-2 text-blue-400 text-sm font-medium">
                  <ArrowDown className="w-4 h-4" />
                  Your Results
                </div>
                <div className="h-px flex-1 bg-gradient-to-r from-transparent via-blue-500/30 to-transparent" />
              </div>

              <ResultsView output={results} />
            </div>
          </motion.section>
        )}
      </AnimatePresence>

      {/* ─── Footer ─── */}
      <footer className="px-4 py-8 border-t border-navy-800 bg-navy-900/20">
        <div className="max-w-4xl mx-auto flex flex-col items-center text-center">
          <img src="/vayl-logo.png" alt="Vayl Logo" className="w-8 h-8 object-contain mb-3 opacity-80" />
          <p className="text-xs text-gray-500 mb-3">
            Cutoff data sourced from JoSAA & CSAB 2024/2025. Results are predictive
            and based on previous year trends. Actual cutoffs may vary.
          </p>
          <div className="flex gap-4 text-xs text-gray-500 mb-3">
            <a href="/privacy" className="hover:text-blue-400 transition-colors">Privacy Policy</a>
            <span>•</span>
            <a href="/terms" className="hover:text-blue-400 transition-colors">Terms of Service</a>
          </div>
          <p className="text-xs text-gray-700 font-medium">
            Powered by Vayl Platform
          </p>
        </div>
      </footer>
    </main>
  );
}
