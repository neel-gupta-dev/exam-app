"use client";

import React from "react";
import Image from "next/image";
import { motion } from "framer-motion";

export default function IIITPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] px-4 py-12 relative overflow-hidden">
      {/* Background Ambient Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-primary/5 blur-[120px] rounded-full pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1.2, ease: "easeOut" }}
        className="relative z-10 flex flex-col items-center"
      >
        {/* Image Container with Premium Styling */}
        <div className="relative group mb-12">
          {/* Outer Glow */}
          <div className="absolute -inset-1 bg-gradient-to-r from-primary/30 via-blue-500/30 to-primary/30 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
          
          <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-sm p-4 shadow-2xl transition-transform duration-700 group-hover:scale-[1.02]">
            <Image
              src="/IIIT-Hyderabad.webp"
              alt="IIIT Hyderabad"
              width={600}
              height={400}
              className="rounded-xl shadow-inner w-full max-w-[500px] h-auto object-cover"
              priority
            />
          </div>
        </div>

        {/* Centered Text */}
        <div className="text-center">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 1 }}
            className="text-4xl md:text-6xl font-black tracking-tighter bg-gradient-to-b from-white to-white/50 bg-clip-text text-transparent uppercase"
          >
            keep grinding.
          </motion.h1>
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: "80px" }}
            transition={{ delay: 1.5, duration: 1 }}
            className="h-1 bg-primary mx-auto mt-4 rounded-full opacity-50"
          />
        </div>
      </motion.div>

      <style jsx global>{`
        :root {
          --primary: #c0c1ff;
        }
      `}</style>
    </div>
  );
}
