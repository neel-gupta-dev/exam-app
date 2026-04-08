"use client";

import { useEffect, useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import Image from "next/image";
import LoadingSkeleton from "@/components/LoadingSkeleton";
import { useAuth } from "@/context/AuthContext";
import api from "@/lib/api";
import CreateDeckModal from "@/components/Flashcards/CreateDeckModal";
import AddCardModal from "@/components/Flashcards/AddCardModal";
import FlashcardRunner from "@/components/Flashcards/FlashcardRunner";
import { trackDeckStudyStart, trackDeckCreate } from "@/lib/analytics";
import DemoSignupModal from "@/components/DemoSignupModal";
import {
  Sparkles,
  Zap,
  Plus,
  Users,
  Bot,
  Atom,
  FlaskConical,
  Sigma,
  BookOpen,
  FolderOpen
} from "lucide-react";

interface FlashcardDeck {
  id: string;
  _id: string;
  title: string;
  description: string;
  category: string;
  totalCards: number;
  dueCards: number;
}

const deckIcons: Record<string, React.ReactNode> = {
  Science: <FlaskConical className="w-5 h-5" />,
  Math: <Sigma className="w-5 h-5" />,
  Physics: <Atom className="w-5 h-5" />,
};

function EmptyState({ onCreateDeck }: { onCreateDeck: () => void }) {
  return (
    <div className="bg-surface-container rounded-2xl p-10 flex flex-col items-center justify-center text-center border border-dashed border-outline-variant/30 min-h-[400px]">
      <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mb-6">
        <Sparkles className="w-10 h-10 text-primary" />
      </div>
      <h3 className="text-xl font-bold text-on-surface mb-2">No Active Decks</h3>
      <p className="text-sm text-on-surface-variant max-w-sm mb-8 leading-relaxed">
        You haven&apos;t created any flashcard decks yet. Start by creating a private deck for your study materials.
      </p>
      <button 
        onClick={onCreateDeck}
        className="bg-primary text-on-primary font-bold px-6 py-3 rounded-xl hover:bg-primary-dim transition-all shadow-lg flex items-center gap-2"
      >
        <Plus className="w-5 h-5" />
        Create First Deck
      </button>
    </div>
  );
}

/**
 * Flashcards Sub-System
 * The main container for creating, managing, and studying spaced-repetition flashcards.
 * Hosts multiple specialized modals (CreateDeck, AddCard) and the FlashcardRunner.
 */
export default function FlashcardsPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [decks, setDecks] = useState<FlashcardDeck[]>([]);
  const isDemo = !user;
  
  // Modal states
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isAddCardModalOpen, setIsAddCardModalOpen] = useState(false);
  const [isRunnerOpen, setIsRunnerOpen] = useState(false);
  const [selectedDeckId, setSelectedDeckId] = useState<string | null>(null);
  const [showDemoModal, setShowDemoModal] = useState(false);

  // Demo decks
  const DEMO_DECKS: FlashcardDeck[] = [
    { id: 'demo1', _id: 'demo1', title: 'Biology Basics', description: 'Cell biology, genetics, and evolution fundamentals', category: 'Science', totalCards: 24, dueCards: 8 },
    { id: 'demo2', _id: 'demo2', title: 'Physics Laws', description: 'Newtonian mechanics, thermodynamics, and electromagnetism', category: 'Physics', totalCards: 18, dueCards: 3 },
  ];

  /**
   * Data Loading
   * Retrieves all flashcard decks associated with the user, including metadata
   * like `totalCards` and `dueCards` calculation from the backend.
   */
  const fetchDecks = async () => {
    try {
      const response = await api.get('/study/decks');
      setDecks(response.data);
    } catch (error) {
      console.error("Failed to fetch flashcard data", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isDemo) {
      setDecks(DEMO_DECKS);
      setLoading(false);
      return;
    }
    if (user) {
      fetchDecks();
    }
  }, [user, isDemo]);

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

  const openAddCard = (e: React.MouseEvent, deckId: string) => {
    e.stopPropagation();
    if (isDemo) { setShowDemoModal(true); return; }
    setSelectedDeckId(deckId);
    setIsAddCardModalOpen(true);
  };

  const startStudy = (deckId: string) => {
    if (isDemo) { setShowDemoModal(true); return; }
    const deck = decks.find(d => d._id === deckId);
    if (deck) {
      trackDeckStudyStart(deck.title, deck.totalCards);
    }
    setSelectedDeckId(deckId);
    setIsRunnerOpen(true);
  };

  return (
    <>
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
            <button 
              onClick={() => isDemo ? setShowDemoModal(true) : setIsCreateModalOpen(true)}
              className="px-6 py-2.5 bg-surface-container-highest text-on-surface text-sm font-semibold rounded-xl hover:bg-surface-bright transition-colors"
            >
              Add New Deck
            </button>
            <button 
              className="px-8 py-2.5 bg-gradient-to-br from-primary-container to-primary text-on-primary-fixed font-bold rounded-xl text-sm shadow-xl shadow-primary/10 disabled:opacity-50" 
              disabled={dueDateCount === 0}
            >
              Study All Due
            </button>
          </div>
        </div>

        {/* Dynamic Empty State vs Deck Grid */}
        {decks.length === 0 ? (
          <EmptyState onCreateDeck={() => setIsCreateModalOpen(true)} />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {decks.map((deck) => (
              <div
                key={deck._id}
                onClick={() => startStudy(deck._id)}
                className="group relative bg-surface-container rounded-2xl overflow-hidden p-6 hover:bg-surface-container-high transition-all duration-300 cursor-pointer border border-white/5"
              >
                <div className="flex justify-between items-start mb-8">
                  <div className={`p-3 bg-surface-variant/30 rounded-xl text-primary`}>
                    {deckIcons[deck.category] || <BookOpen className="w-5 h-5" />}
                  </div>
                  <div className={`px-3 py-1 rounded-full ${deck.dueCards > 0 ? "bg-error/10" : "bg-surface-variant"}`}>
                    <span className={`text-[10px] font-bold uppercase tracking-wider ${deck.dueCards > 0 ? "text-error" : "text-on-surface-variant"}`}>
                      {deck.dueCards > 0 ? `${deck.dueCards} Due` : "Up to Date"}
                    </span>
                  </div>
                </div>
                <div className="space-y-1 mb-8">
                  <h3 className="text-xl font-bold text-on-surface">{deck.title}</h3>
                  <p className="text-xs text-on-surface-variant">{deck.category || 'No Category'}</p>
                </div>
                <div className="grid grid-cols-2 gap-4 mb-8">
                  <div>
                    <p className="text-[10px] text-on-surface-variant uppercase tracking-widest mb-1">Total Cards</p>
                    <p className="text-lg font-bold text-on-surface">{deck.totalCards}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-on-surface-variant uppercase tracking-widest mb-1">Due Now</p>
                    <p className={`text-lg font-bold ${deck.dueCards > 0 ? "text-error" : "text-on-surface-variant"}`}>{deck.dueCards}</p>
                  </div>
                </div>
                
                <div className="flex gap-2">
                  <button 
                    onClick={(e) => openAddCard(e, deck._id)}
                    className="flex-1 py-3 bg-surface-variant/50 text-on-surface text-xs font-bold rounded-xl hover:bg-white/10 transition-all"
                  >
                    Add Cards
                  </button>
                  <button className="flex-1 py-3 bg-primary text-on-primary text-xs font-bold rounded-xl hover:bg-primary-dim transition-all shadow-lg shadow-primary/10">
                    Start Review
                  </button>
                </div>
              </div>
            ))}

            {/* Default Insight-style create card */}
            <div 
              onClick={() => setIsCreateModalOpen(true)}
              className="border-2 border-dashed border-outline-variant/20 rounded-2xl p-6 flex flex-col items-center justify-center text-center hover:border-primary/40 transition-all cursor-pointer group"
            >
              <div className="w-12 h-12 rounded-full bg-surface-container-high flex items-center justify-center mb-4 group-hover:bg-primary/10 transition-colors">
                <Plus className="w-6 h-6 text-on-surface-variant group-hover:text-primary" />
              </div>
              <h4 className="text-sm font-bold text-on-surface">Create New Deck</h4>
              <p className="text-[10px] text-on-surface-variant mt-1">Organize your cards by subject or topic</p>
            </div>
          </div>
        )}

        {/* Insight Card (Static representation for layout) */}
        {decks.length > 0 && (
          <div className="mt-12 bg-gradient-to-r from-surface-container to-surface-container-high rounded-2xl p-8 flex flex-col md:flex-row items-center gap-10 border border-white/5">
            <div className="flex-1 space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary/10 rounded-full">
                <Image src="/vayl-logo.png" alt="Vayl Logo" width={12} height={12} className="object-contain" />
                <span className="text-[10px] font-bold text-primary uppercase tracking-widest">Efficiency Insight</span>
              </div>
              <h3 className="text-3xl font-extrabold text-on-surface tracking-tight">
                Your memory retention is 14% higher during morning sessions.
              </h3>
              <p className="text-on-surface-variant text-sm leading-relaxed">
                The algorithm suggests focusing on your complex decks before 10:00 AM for optimal long-term consolidation.
              </p>
            </div>
            <div className="w-full md:w-64 aspect-square bg-surface-bright rounded-2xl p-6 flex items-center justify-center border border-outline-variant/10 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-tr from-primary/5 to-transparent" />
                <div className="relative flex flex-col items-center">
                  <div className="text-5xl font-extrabold text-primary mb-2">94%</div>
                  <div className="text-[10px] text-on-surface-variant font-bold uppercase tracking-widest">Avg. Retention</div>
                </div>
            </div>
          </div>
        )}
      </div>

      {/* Modals and Runner */}
      <CreateDeckModal 
        isOpen={isCreateModalOpen} 
        onClose={() => setIsCreateModalOpen(false)} 
        onSuccess={fetchDecks} 
      />
      
      <AddCardModal 
        isOpen={isAddCardModalOpen} 
        onClose={() => setIsAddCardModalOpen(false)} 
        deckId={selectedDeckId}
        onSuccess={fetchDecks}
      />

      {isRunnerOpen && selectedDeckId && (
        <FlashcardRunner 
          deckId={selectedDeckId} 
          onClose={() => {
            setIsRunnerOpen(false);
            if (!isDemo) fetchDecks();
          }} 
        />
      )}
    </DashboardLayout>
    <DemoSignupModal
      isOpen={showDemoModal}
      onClose={() => setShowDemoModal(false)}
      feature="Flashcard Decks"
    />
    </>
  );
}
