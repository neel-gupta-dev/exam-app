import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, ShieldCheck, Zap, AlertTriangle } from "lucide-react";

export const metadata: Metadata = {
  title: "Terms of Service",
  description: "Rules of engagement and fair play policies for JEE Battle.",
};

export default function TermsOfService() {
  return (
    <div className="min-h-screen bg-[#0f1115] text-white p-6 md:p-12 font-['Clash_Grotesk',sans-serif]">
      <div className="max-w-4xl mx-auto space-y-12">
        <header className="space-y-6">
          <Link href="/" className="inline-flex items-center gap-2 text-rose-400 hover:text-rose-300 transition-colors group">
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            Back to Arena
          </Link>
          <h1 className="text-5xl md:text-7xl font-black italic tracking-tighter bg-gradient-to-r from-rose-500 via-purple-500 to-indigo-500 bg-clip-text text-transparent uppercase">
            Rules of Engagement
          </h1>
          <p className="text-white/40 text-sm font-bold uppercase tracking-widest">Effective Date: May 7, 2026</p>
        </header>

        <div className="bg-[#16191f] rounded-3xl border border-white/5 p-8 md:p-12 space-y-12 leading-relaxed shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-rose-500/5 rounded-full blur-[100px] -z-10" />
          
          <section className="space-y-6">
            <div className="flex items-center gap-3 text-rose-400">
              <ShieldCheck className="w-6 h-6" />
              <h2 className="text-2xl font-bold uppercase tracking-tight">1. Code of Honor</h2>
            </div>
            <p className="text-white/70">
              JEE Battle is designed to sharpen your academic competitive edge. By using this platform, you agree to compete with integrity. Use of any unauthorized aids, including but not limited to:
            </p>
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="p-4 rounded-2xl bg-white/5 border border-white/5 text-sm text-white/60">
                • Scientific Calculators
              </div>
              <div className="p-4 rounded-2xl bg-white/5 border border-white/5 text-sm text-white/60">
                • AI Problem Solvers
              </div>
              <div className="p-4 rounded-2xl bg-white/5 border border-white/5 text-sm text-white/60">
                • External Reference Books
              </div>
              <div className="p-4 rounded-2xl bg-white/5 border border-white/5 text-sm text-white/60">
                • Peer Collaboration
              </div>
            </div>
            <p className="text-white/70">
              ...is strictly prohibited during live duels.
            </p>
          </section>

          <section className="space-y-6">
            <div className="flex items-center gap-3 text-indigo-400">
              <Zap className="w-6 h-6" />
              <h2 className="text-2xl font-bold uppercase tracking-tight">2. Fair Play & Matchmaking</h2>
            </div>
            <p className="text-white/70">
              Any attempt to manipulate match results, including intentional disconnection to avoid losses or "win-trading" with friends, will result in a reset of your global leaderboard points and potential suspension of your Vayl account.
            </p>
          </section>

          <section className="space-y-6">
            <div className="flex items-center gap-3 text-yellow-500">
              <AlertTriangle className="w-6 h-6" />
              <h2 className="text-2xl font-bold uppercase tracking-tight">3. Platform Limitations</h2>
            </div>
            <p className="text-white/70">
              While we strive for 100% accuracy, JEE Battle is a tool for practice. Match results do not guarantee actual JEE exam performance. The platform is provided "as-is" without warranty of continuous availability.
            </p>
          </section>

          <footer className="pt-10 border-t border-white/5 text-center">
            <p className="text-white/40 text-sm italic mb-6">
              Full terms of the Vayl ecosystem apply.
            </p>
            <a href="mailto:support@vayl.in" className="inline-block bg-rose-500 text-white px-8 py-3 rounded-2xl font-black uppercase tracking-widest hover:scale-105 transition-transform shadow-lg shadow-rose-500/20">
              Report Violation
            </a>
          </footer>
        </div>
      </div>
    </div>
  );
}
