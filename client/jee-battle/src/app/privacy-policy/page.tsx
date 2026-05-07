import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "How JEE Battle handles your data and ensures a secure competitive environment.",
};

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-[#0f1115] text-white p-6 md:p-12 font-['Clash_Grotesk',sans-serif]">
      <div className="max-w-4xl mx-auto space-y-12">
        <header className="space-y-6">
          <Link href="/" className="inline-flex items-center gap-2 text-indigo-400 hover:text-indigo-300 transition-colors group">
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            Back to Arena
          </Link>
          <h1 className="text-5xl md:text-7xl font-black italic tracking-tighter bg-gradient-to-r from-indigo-500 via-purple-500 to-rose-500 bg-clip-text text-transparent uppercase">
            Privacy Protocol
          </h1>
          <p className="text-white/40 text-sm font-bold uppercase tracking-widest">Effective Date: May 7, 2026</p>
        </header>

        <div className="bg-[#16191f] rounded-3xl border border-white/5 p-8 md:p-12 space-y-10 leading-relaxed shadow-2xl">
          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-indigo-400 uppercase tracking-tight">1. Data Transmission</h2>
            <p className="text-white/70">
              JEE Battle is a real-time multiplayer application. To provide this service, we transmit your user profile data (Name, Profile Picture) to your opponent during a live duel. This information is shared only for the duration of the match to facilitate social interaction.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-purple-400 uppercase tracking-tight">2. Performance Analytics</h2>
            <p className="text-white/70">
              We collect data on your battle performance, including:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-white/60">
              <li>Question response times</li>
              <li>Correctness of answers</li>
              <li>Match win/loss records</li>
              <li>Leaderboard standings</li>
            </ul>
            <p className="text-white/70 mt-4">
              This data is used to calculate rankings, display global leaderboards, and improve the difficulty balancing of our question bank.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-rose-400 uppercase tracking-tight">3. Authentication</h2>
            <p className="text-white/70">
              We use a secure token-based bridge from the main Vayl platform. No passwords are stored on the JEE Battle servers. Your session is protected by industry-standard encryption.
            </p>
          </section>

          <section className="space-y-4 pt-10 border-t border-white/5">
            <p className="text-white/40 text-sm italic">
              Questions regarding your data? Contact our security protocol team at <a href="mailto:support@vayl.in" className="text-indigo-400 underline">support@vayl.in</a>
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
