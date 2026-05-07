import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, Mail, MessageSquare, ShieldAlert } from "lucide-react";

export const metadata: Metadata = {
  title: "Contact Support",
  description: "Get in touch with the JEE Battle technical team for assistance or reporting issues.",
};

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-[#0f1115] text-white p-6 md:p-12 font-['Clash_Grotesk',sans-serif]">
      <div className="max-w-4xl mx-auto space-y-12">
        <header className="space-y-6">
          <Link href="/" className="inline-flex items-center gap-2 text-emerald-400 hover:text-emerald-300 transition-colors group">
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            Back to Arena
          </Link>
          <h1 className="text-5xl md:text-7xl font-black italic tracking-tighter bg-gradient-to-r from-emerald-500 via-teal-500 to-indigo-500 bg-clip-text text-transparent uppercase">
            Support Comms
          </h1>
          <p className="text-white/40 text-sm font-bold uppercase tracking-widest">We respond within 24 hours.</p>
        </header>

        <div className="grid md:grid-cols-2 gap-8">
          <div className="bg-[#16191f] rounded-3xl border border-white/5 p-8 space-y-6 shadow-2xl hover:border-emerald-500/20 transition-colors">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-400 border border-emerald-500/20">
              <Mail className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold uppercase tracking-tight">Primary Channel</h3>
            <p className="text-white/60 text-sm leading-relaxed">
              For account issues, session errors, or technical bugs, reach out to our core team.
            </p>
            <a href="mailto:support@vayl.in" className="block text-2xl font-bold text-white hover:text-emerald-400 transition-colors">
              support@vayl.in
            </a>
          </div>

          <div className="bg-[#16191f] rounded-3xl border border-white/5 p-8 space-y-6 shadow-2xl hover:border-teal-500/20 transition-colors">
            <div className="w-12 h-12 rounded-2xl bg-teal-500/10 flex items-center justify-center text-teal-400 border border-teal-500/20">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold uppercase tracking-tight">Report Integrity</h3>
            <p className="text-white/60 text-sm leading-relaxed">
              Spotted a cheater or an incorrect question? Send us the room code and a screenshot.
            </p>
            <div className="text-teal-400 text-sm font-bold uppercase tracking-widest pt-4">
              Priority Review: Active
            </div>
          </div>
        </div>

        <div className="bg-[#16191f] rounded-3xl border border-white/5 p-8 flex flex-col md:flex-row items-center justify-between gap-6 opacity-60">
          <div className="flex items-center gap-4">
            <div className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs font-bold uppercase tracking-widest">Global Arena Servers Online</span>
          </div>
          <div className="text-[10px] font-bold uppercase tracking-widest text-white/40">
            Powered by Vayl Technologies
          </div>
        </div>
      </div>
    </div>
  );
}
