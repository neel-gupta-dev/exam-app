"use client";

import { useState, useEffect } from "react";
import { X, RotateCcw, CheckCircle, Flame } from "lucide-react";
import api from "@/lib/api";
import MathText from "../UI/MathText";

interface Card {
  _id: string;
  deckId: string;
  frontText: string;
  backText: string;
  type: 'due' | 'new' | 'cram';
  progress?: any;
}

interface FlashcardRunnerProps {
  deckId: string;
  onClose: () => void;
}

/**
 * Flashcard Test Runner
 * The core spaced-repetition testing interface. Fetches a batch of cards (Session or Cram mode),
 * handles UI flipping (Front/Back) and records the user's self-graded retention (0-3).
 * When complete, it displays a success/summary screen.
 */
export default function FlashcardRunner({ deckId, onClose }: FlashcardRunnerProps) {
  const [cards, setCards] = useState<Card[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [loading, setLoading] = useState(true);
  const [completing, setCompleting] = useState(false);
  const [isCramMode, setIsCramMode] = useState(false);

  /**
   * Session Initialization
   * Pulls the appropriate study batch based on the mode.
   * `cram` mode ignores spaced-repetition math and pulls all cards.
   */
  const fetchSession = async (cram = false) => {
    setLoading(true);
    try {
      const endpoint = cram ? `/study/cram/${deckId}` : `/study/session/${deckId}`;
      const response = await api.get(endpoint);
      setCards(response.data);
      if (cram) setIsCramMode(true);
      setCurrentIndex(0);
      setIsFlipped(false);
      setCompleting(false);
    } catch (error) {
      console.error("Failed to fetch study session", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSession();
  }, [deckId]);

  /**
   * Handle Review Submission
   * Submits the self-assessed grade (0=Again, 1=Hard, 2=Good, 3=Easy) to the
   * SuperMemo-2 algorithm endpoint to calculate the next interval.
   */
  const handleReview = async (grade: number) => {
    if (currentIndex >= cards.length) return;
    
    const card = cards[currentIndex];
    
    try {
      await api.post("/study/review", {
        cardId: card._id,
        deckId,
        grade,
        isCram: isCramMode
      });
      
      // Move to next card
      if (currentIndex < cards.length - 1) {
        setIsFlipped(false);
        // Small delay to allow flip animation to reset
        setTimeout(() => {
          setCurrentIndex(prev => prev + 1);
        }, 300);
      } else {
        setCompleting(true);
      }
    } catch (error) {
      console.error("Failed to submit review", error);
    }
  };

  if (loading) {
    return (
      <div className="fixed inset-0 z-[60] bg-background flex items-center justify-center">
        <div className="text-primary animate-pulse font-bold tracking-widest uppercase">
          Initializing {isCramMode ? 'Cram' : 'Study'} Session...
        </div>
      </div>
    );
  }

  // "All caught up" state (Daily Goal Reached)
  if (cards.length === 0 && !completing) {
    return (
      <div className="fixed inset-0 z-[60] bg-background/95 backdrop-blur-xl flex items-center justify-center p-6 text-center">
        <div className="max-w-md w-full bg-surface-container border border-white/10 p-10 rounded-3xl shadow-2xl glass-card space-y-8">
          <div className="flex justify-center">
            <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center relative">
              <CheckCircle className="w-10 h-10 text-primary" />
              <div className="absolute -top-1 -right-1">
                <Flame className="w-6 h-6 text-tertiary animate-pulse" />
              </div>
            </div>
          </div>
          <div className="space-y-2">
            <h2 className="text-3xl font-extrabold text-on-surface tracking-tight">Daily Goal Reached</h2>
            <p className="text-on-surface-variant leading-relaxed">
              You&apos;re all caught up for today! Your long-term memory is working on consolidating these concepts.
            </p>
          </div>
          <div className="flex flex-col gap-3">
             <button 
              onClick={() => fetchSession(true)}
              className="w-full py-4 bg-surface-container-highest text-on-surface font-bold rounded-2xl hover:bg-white/5 transition-all text-sm border border-white/5"
            >
              Study Anyway (Cram Mode)
            </button>
            <button 
              onClick={onClose} 
              className="w-full py-4 text-on-surface-variant font-bold text-sm hover:text-on-surface transition-colors"
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (completing) {
    return (
      <div className="fixed inset-0 z-[60] bg-background flex items-center justify-center p-6 text-center">
        <div className="max-w-md space-y-6">
          <div className="text-4xl text-primary animate-heart-beat">✨</div>
          <h2 className="text-3xl font-extrabold text-on-surface">Session Complete!</h2>
          <p className="text-on-surface-variant">You&apos;ve strengthened your neural pathways for {cards.length} concepts.</p>
          <button onClick={onClose} className="w-full py-4 bg-primary text-on-primary font-bold rounded-xl shadow-xl">
            Finish Study
          </button>
        </div>
      </div>
    );
  }

  const currentCard = cards[currentIndex];

  return (
    <div className="fixed inset-0 z-[60] bg-background/95 backdrop-blur-xl flex flex-col">
      {/* Top Bar */}
      <div className="px-6 py-4 flex justify-between items-center border-b border-white/5">
        <div className="flex items-center gap-4">
          <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-lg transition-colors">
            <X className="w-5 h-5 text-on-surface-variant" />
          </button>
          <div className="h-4 w-px bg-white/10" />
          <div className="flex flex-col">
            <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest leading-none mb-1">
              Session Progress
            </span>
            {isCramMode && (
              <span className="text-[9px] font-extrabold text-tertiary uppercase tracking-tighter bg-tertiary/10 px-1.5 py-0.5 rounded leading-none w-fit">
                Cram Mode Active: No Algorithm impact
              </span>
            )}
          </div>
        </div>
        <div className="text-xs font-bold text-primary uppercase tracking-widest">
          {currentIndex + 1} / {cards.length}
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full h-1 bg-white/5">
        <div 
          className={`h-full transition-all duration-500 ${isCramMode ? 'bg-tertiary' : 'bg-primary'}`}
          style={{ width: `${((currentIndex + 1) / cards.length) * 100}%` }}
        />
      </div>

      {/* Main Runner */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 md:p-12 overflow-hidden">
        <div className="w-full max-w-2xl aspect-[4/3] md:aspect-[16/9] perspective-1000">
          <div 
            className={`flashcard-inner ${isFlipped ? 'is-flipped' : ''}`}
            onClick={() => setIsFlipped(!isFlipped)}
          >
            {/* Front */}
            <div className={`flashcard-face bg-surface-container border border-white/10 glass-card transition-opacity ${isFlipped ? 'opacity-0 z-0' : 'opacity-100 z-10'}`}>
              <span className="absolute top-6 left-6 text-[10px] font-bold text-primary uppercase tracking-widest opacity-50 font-interface">
                Question
              </span>
              <div className="text-2xl md:text-3xl font-medium text-on-surface leading-tight px-4 lg:px-12 font-body">
                <MathText text={currentCard.frontText} />
              </div>
              <div className="absolute bottom-10 flex items-center gap-2 text-[10px] font-bold text-on-surface-variant uppercase tracking-widest opacity-50 font-interface">
                <RotateCcw className="w-3 h-3" />
                Tap to flip
              </div>
            </div>

            {/* Back */}
            <div className={`flashcard-face flashcard-back bg-surface-container-highest border border-primary/20 glass-card transition-opacity ${isFlipped ? 'opacity-100 z-10' : 'opacity-0 z-0'}`}>
              <span className="absolute top-6 left-6 text-[10px] font-bold text-secondary uppercase tracking-widest opacity-50 font-interface">
                Retention Solution
              </span>
              <div className="text-xl md:text-2xl font-medium text-on-surface leading-relaxed px-4 lg:px-12 overflow-y-auto max-h-[80%] custom-scrollbar font-body">
                <MathText text={currentCard.backText} />
              </div>
            </div>
          </div>
        </div>

        {/* Controls - Only show when flipped */}
        <div className={`mt-12 w-full max-w-2xl grid grid-cols-2 md:grid-cols-4 gap-4 transition-all duration-500 ${isFlipped ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10 pointer-events-none'}`}>
          <button 
            onClick={() => handleReview(0)}
            className="group flex flex-col items-center p-4 bg-error/10 hover:bg-error/20 border border-error/20 rounded-2xl transition-all"
          >
            <span className="text-error font-bold text-sm mb-1">Again</span>
            <span className="text-[10px] text-error/60 font-bold uppercase tracking-tight">1m</span>
          </button>
          
          <button 
            onClick={() => handleReview(1)}
            className="group flex flex-col items-center p-4 bg-secondary/10 hover:bg-secondary/20 border border-secondary/20 rounded-2xl transition-all"
          >
            <span className="text-secondary font-bold text-sm mb-1">Hard</span>
            <span className="text-[10px] text-secondary/60 font-bold uppercase tracking-tight">12h</span>
          </button>

          <button 
            onClick={() => handleReview(2)}
            className="group flex flex-col items-center p-4 bg-primary/10 hover:bg-primary/20 border border-primary/20 rounded-2xl transition-all"
          >
            <span className="text-primary font-bold text-sm mb-1">Good</span>
            <span className="text-[10px] text-primary/60 font-bold uppercase tracking-tight">1d</span>
          </button>

          <button 
            onClick={() => handleReview(3)}
            className="group flex flex-col items-center p-4 bg-tertiary/10 hover:bg-tertiary/20 border border-tertiary/20 rounded-2xl transition-all"
          >
            <span className="text-tertiary font-bold text-sm mb-1">Easy</span>
            <span className="text-[10px] text-tertiary/60 font-bold uppercase tracking-tight">4d</span>
          </button>
        </div>

        {/* Peek tip */}
        {!isFlipped && (
          <div className="mt-8 text-on-surface-variant text-xs animate-pulse font-medium">
            Click anywhere on the card to reveal answer
          </div>
        )}
      </div>
    </div>
  );
}
