"use client";

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const SYLLABUS_STEPS = [
  "Initializing learning matrix...",
  "Fetching global curriculum standards...",
  "Optimizing chapter dependencies...",
  "Syncing with educational satellites...",
  "Validating pedagogical structures...",
  "Defragmenting study nodes...",
  "Applying neuro-learning patches...",
  "Calculating infinite syllabus loops...",
  "Finalizing curriculum integrity...",
  "Almost there, just a bit more...",
  "Wait, something's not right...",
];

export default function SyllabusLoadingPage() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const duration = 15000; // 15 seconds to reach 99%
    const interval = 50;
    const increment = 99 / (duration / interval);

    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 98.9) {
          clearInterval(timer);
          return 99;
        }
        return prev + increment;
      });
    }, interval);

    return () => clearInterval(timer);
  }, []);

  const stepIndex = Math.min(
    Math.floor((progress / 100) * SYLLABUS_STEPS.length),
    SYLLABUS_STEPS.length - 1
  );

  return (
    <div className="min-h-screen bg-[#0a0a0c] text-white flex flex-col items-center justify-center p-6 font-sans selection:bg-primary/30">
      {/* Background Ambient Glows */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/10 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-500/10 blur-[120px] rounded-full" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="relative z-10 w-full max-w-lg"
      >
        <div className="text-center mb-12">
          <motion.h1 
            className="text-4xl md:text-5xl font-black tracking-tighter mb-2 bg-gradient-to-b from-white to-white/60 bg-clip-text text-transparent"
            animate={{ opacity: [0.7, 1, 0.7] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          >
            VAYL SYLLABUS
          </motion.h1>
          <p className="text-white/40 font-medium tracking-widest uppercase text-[10px]">
            Quantum Curriculum Engine v4.2.0
          </p>
        </div>

        {/* Glass Container */}
        <div className="bg-white/[0.03] border border-white/10 backdrop-blur-xl rounded-3xl p-8 shadow-2xl relative overflow-hidden group">
          {/* Internal Glow */}
          <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-700" />

          <div className="flex justify-between items-end mb-4">
            <div className="flex flex-col">
              <span className="text-[10px] font-bold text-primary tracking-widest uppercase mb-1">Current Task</span>
              <div className="h-6 overflow-hidden">
                <AnimatePresence mode="wait">
                  <motion.p
                    key={stepIndex}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="text-white/80 font-medium text-sm"
                  >
                    {SYLLABUS_STEPS[stepIndex]}
                  </motion.p>
                </AnimatePresence>
              </div>
            </div>
            <div className="text-right">
              <span className="text-3xl font-black tabular-nums bg-gradient-to-r from-primary to-blue-400 bg-clip-text text-transparent">
                {Math.floor(progress)}%
              </span>
            </div>
          </div>

          {/* Progress Bar Track */}
          <div className="h-4 bg-white/[0.05] rounded-full p-1 border border-white/5 relative overflow-hidden">
            {/* Animated Progress Fill */}
            <motion.div
              className="h-full rounded-full bg-gradient-to-r from-primary via-primary-dim to-blue-500 relative shadow-[0_0_20px_rgba(var(--primary-rgb),0.3)]"
              style={{ width: `${progress}%` }}
              initial={{ width: "0%" }}
              animate={{ width: `${progress}%` }}
              transition={{ ease: "easeOut" }}
            >
              {/* Animated Shine Effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full animate-[shimmer_2s_infinite]" />
            </motion.div>
          </div>

          <div className="mt-6 flex items-center justify-center gap-4 text-white/20">
            <div className="flex gap-1">
              {[0, 1, 2].map((i) => (
                <motion.div
                  key={i}
                  className="w-1.5 h-1.5 rounded-full bg-current"
                  animate={{ opacity: [0.2, 1, 0.2] }}
                  transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }}
                />
              ))}
            </div>
          </div>
        </div>

        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: progress >= 99 ? 0.6 : 0 }}
          className="text-center mt-8 text-white/30 text-xs italic font-light"
        >
          {progress >= 99 ? "Load state: HUNG_AT_FINAL_PERCENT. Please wait forever." : "Please do not close this window."}
        </motion.p>
      </motion.div>

      <style jsx global>{`
        @keyframes shimmer {
          100% {
            transform: translateX(100%);
          }
        }
        :root {
          --primary-rgb: 192, 193, 255;
          --primary: #c0c1ff;
          --primary-dim: #7c7db5;
        }
      `}</style>
    </div>
  );
}
