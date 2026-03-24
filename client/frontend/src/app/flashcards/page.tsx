"use client";

import { useEffect, useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import LoadingSkeleton from "@/components/LoadingSkeleton";
import { useAuth } from "@/context/AuthContext";
import api from "@/lib/api";
import { Resource } from "@/types";
import {
  Sparkles,
  Zap,
  Plus,
  Users,
  Bot,
  Pen,
  ChevronDown,
  Atom,
  FlaskConical,
  Sigma,
  BookOpen,
  FolderOpen
} from "lucide-react";

interface FlashcardDeck {
  id: string;
  title: string;
  icon: string;
  iconColor: string;
  dueToday: boolean;
  lastStudied: string;
  totalCards: number;
  dueCards: number;
  mastered: number;
  progressColor: string;
}

const deckIcons: Record<string, React.ReactNode> = {
  cyclone: <Atom className="w-5 h-5" />,
  flask: <FlaskConical className="w-5 h-5" />,
  functions: <Sigma className="w-5 h-5" />,
  folder: <FolderOpen className="w-5 h-5" />,
};

function EmptyState() {
  return (
    <div className="bg-surface-container rounded-2xl p-10 flex flex-col items-center justify-center text-center border border-dashed border-outline-variant/30 min-h-[400px]">
      <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mb-6">
        <Sparkles className="w-10 h-10 text-primary" />
      </div>
      <h3 className="text-xl font-bold text-on-surface mb-2">No Active Decks</h3>
      <p className="text-sm text-on-surface-variant max-w-sm mb-8 leading-relaxed">
        You haven&apos;t generated any flashcard decks yet. Use the AI Assistant to automatically create spaced-repetition cards from your saved resources.
      </p>
      <button className="bg-primary text-on-primary font-bold px-6 py-3 rounded-xl hover:bg-primary-dim transition-all shadow-lg flex items-center gap-2">
        <Bot className="w-5 h-5" />
        Generate from Vault
      </button>
    </div>
  );
}

export default function FlashcardsPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [decks, setDecks] = useState<FlashcardDeck[]>([]);

  useEffect(() => {
    // We simulate fetching decks. In the future, this will be api.get('/flashcards')
    const fetchDecks = async () => {
      try {
        // Fetching resources just to verify authentication and connection
        await api.get('/resources?page=1&limit=1');
        // Setting empty array to prove hydration strategy (no static mock arrays)
        setDecks([]);
      } catch (error) {
        console.error("Failed to fetch flashcard data", error);
      } finally {
        setLoading(false);
      }
    };
    if (user) {
      fetchDecks();
    }
  }, [user]);

  if (loading) {
    return (
      <DashboardLayout>
        <div className="max-w-7xl mx-auto p-10">
          <LoadingSkeleton count={3} />
        </div>
      </DashboardLayout>
    );
  }

  const dueDateCount = decks.reduce((acc, obj) => acc + obj.dueCards, 0);

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-end gap-6 mb-12">
          <div className="space-y-2">
            <h2 className="text-4xl font-extrabold tracking-tighter text-on-surface">
              Knowledge Decks
            </h2>
            <p className="text-on-surface-variant text-sm max-w-md">
              Master concepts through spaced repetition. You have{" "}
              <span className="text-primary font-semibold">{dueDateCount} cards</span> due for review today.
            </p>
          </div>
          <div className="flex gap-4">
            <button className="px-6 py-2.5 bg-surface-container-highest text-on-surface text-sm font-semibold rounded-xl hover:bg-surface-bright transition-colors">
              Add New Deck
            </button>
            <button className="px-8 py-2.5 bg-gradient-to-br from-primary-container to-primary text-on-primary-fixed font-bold rounded-xl text-sm shadow-xl shadow-primary/10 disabled:opacity-50" disabled={decks.length === 0}>
              Study All Due
            </button>
          </div>
        </div>

        {/* Dynamic Empty State vs Deck Grid */}
        {decks.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {decks.map((deck) => (
              <div
                key={deck.id}
                className="group relative bg-surface-container rounded-2xl overflow-hidden p-6 hover:bg-surface-container-high transition-all duration-300 cursor-pointer"
              >
                <div className="flex justify-between items-start mb-8">
                  <div className={`p-3 bg-surface-variant/30 rounded-xl ${deck.iconColor}`}>
                    {deckIcons[deck.icon] || <BookOpen className="w-5 h-5" />}
                  </div>
                  <div className={`px-3 py-1 rounded-full ${deck.dueToday ? "bg-error-container/20" : "bg-surface-variant"}`}>
                    <span className={`text-[10px] font-bold uppercase tracking-wider ${deck.dueToday ? "text-error" : "text-on-surface-variant"}`}>
                      {deck.dueToday ? "Due Today" : "Up to Date"}
                    </span>
                  </div>
                </div>
                <div className="space-y-1 mb-8">
                  <h3 className="text-xl font-bold text-on-surface">{deck.title}</h3>
                  <p className="text-xs text-on-surface-variant">Last studied {deck.lastStudied}</p>
                </div>
                <div className="grid grid-cols-3 gap-4 mb-8">
                  <div>
                    <p className="text-[10px] text-on-surface-variant uppercase tracking-widest mb-1">Cards</p>
                    <p className="text-lg font-bold text-on-surface">{deck.totalCards}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-on-surface-variant uppercase tracking-widest mb-1">Due</p>
                    <p className={`text-lg font-bold ${deck.dueCards > 0 ? "text-error" : "text-on-surface-variant"}`}>{deck.dueCards}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-on-surface-variant uppercase tracking-widest mb-1">Mastered</p>
                    <p className="text-lg font-bold text-tertiary">{deck.mastered}%</p>
                  </div>
                </div>
                <div className="w-full bg-surface-variant h-1 rounded-full overflow-hidden mb-6">
                  <div className={`${deck.progressColor} h-full rounded-full`} style={{ width: `${deck.mastered}%` }} />
                </div>
                <button className="w-full py-3 bg-surface-container-highest text-on-surface text-xs font-bold rounded-xl group-hover:bg-primary group-hover:text-on-primary transition-all">
                  {deck.dueToday ? "Start Session" : "Review Deck"}
                </button>
              </div>
            ))}

            {/* Insight Card */}
            <div className="md:col-span-2 bg-gradient-to-r from-surface-container to-surface-container-high rounded-2xl p-8 flex flex-col md:flex-row items-center gap-10">
              <div className="flex-1 space-y-6">
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary/10 rounded-full">
                  <Sparkles className="w-3 h-3 text-primary" />
                  <span className="text-[10px] font-bold text-primary uppercase tracking-widest">Efficiency Insight</span>
                </div>
                <h3 className="text-3xl font-extrabold text-on-surface tracking-tight">
                  Your memory retention is 14% higher during morning sessions.
                </h3>
                <p className="text-on-surface-variant text-sm leading-relaxed">
                  The algorithm suggests focusing on your complex decks before 10:00 AM for optimal long-term consolidation.
                </p>
                <div className="flex gap-4 pt-2">
                  <button className="flex items-center gap-2 px-5 py-2.5 bg-primary text-on-primary text-xs font-bold rounded-xl shadow-lg shadow-primary/20">
                    <Zap className="w-4 h-4" />
                    View Efficiency Report
                  </button>
                </div>
              </div>
              <div className="w-full md:w-64 aspect-square bg-surface-bright rounded-2xl p-6 flex items-center justify-center border border-outline-variant/10 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-tr from-primary/5 to-transparent" />
                <div className="relative flex flex-col items-center">
                  <div className="text-5xl font-extrabold text-primary mb-2">0%</div>
                  <div className="text-[10px] text-on-surface-variant font-bold uppercase tracking-widest">Avg. Retention</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="mt-16 pt-8 border-t border-outline-variant/10 flex flex-col md:flex-row justify-between items-center gap-6 cursor-not-allowed opacity-50">
          <div className="flex gap-4 overflow-x-auto pb-2 w-full md:w-auto">
            <button className="px-5 py-2 bg-primary-container text-on-primary-container text-xs font-bold rounded-full whitespace-nowrap">All Decks</button>
            <button className="px-5 py-2 bg-surface-container-high text-on-surface-variant text-xs font-bold rounded-full hover:text-on-surface transition-colors whitespace-nowrap">Active Recall</button>
            <button className="px-5 py-2 bg-surface-container-high text-on-surface-variant text-xs font-bold rounded-full hover:text-on-surface transition-colors whitespace-nowrap">New Concepts</button>
          </div>
        </div>

        {/* Import Cards */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { icon: <Plus className="w-5 h-5" />, title: "Import from Quizlet", desc: "Quick sync your existing library" },
            { icon: <Bot className="w-5 h-5" />, title: "Generate from Notes", desc: "AI-powered card creation" },
            { icon: <Users className="w-5 h-5" />, title: "Browse Community", desc: "Shared scholar decks" },
          ].map((item) => (
            <div key={item.title} className="group border-2 border-dashed border-outline-variant/20 rounded-2xl p-8 flex flex-col items-center justify-center text-center hover:border-primary/40 transition-all cursor-pointer">
              <div className="w-12 h-12 rounded-full bg-surface-container-high flex items-center justify-center mb-4 group-hover:bg-primary/10 transition-colors text-on-surface-variant group-hover:text-primary">
                {item.icon}
              </div>
              <p className="text-sm font-bold text-on-surface">{item.title}</p>
              <p className="text-[10px] text-on-surface-variant mt-1">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}
