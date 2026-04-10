'use client';

import React, { useState, useEffect } from 'react';
import axios from 'axios';

interface Flashcard {
  _id: string;
  frontText: string;
  backText: string;
}

interface FlashcardReviewProps {
  deckId: string;
}

/**
 * FlashcardReview Component
 * 
 * Demonstrates the integration with the SM-2 Spaced Repetition System.
 * Fetches due cards and allows the user to rate their recall quality.
 */
const FlashcardReview: React.FC<FlashcardReviewProps> = ({ deckId }) => {
  const [dueCards, setDueCards] = useState<Flashcard[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 1. Fetch Due Cards
  useEffect(() => {
    const fetchDueCards = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`/api/flashcards/due/${deckId}`);
        setDueCards(response.data);
        setError(null);
      } catch (err) {
        setError('Failed to fetch due cards');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchDueCards();
  }, [deckId]);

  // 2. Handle Review submission
  const handleReview = async (quality: number) => {
    const card = dueCards[currentIndex];
    
    try {
      // POST the quality score to the SM-2 review endpoint
      await axios.post(`/api/flashcards/${card._id}/review`, {
        quality,
        deckId
      });

      // Move to the next card in the local state queue
      setShowAnswer(false);
      setCurrentIndex((prev) => prev + 1);
    } catch (err) {
      console.error('Failed to submit review:', err);
      alert('Error saving review. Please try again.');
    }
  };

  if (loading) return <div className="p-8 text-center">Loading due cards...</div>;
  if (error) return <div className="p-8 text-center text-red-500">{error}</div>;
  if (currentIndex >= dueCards.length) {
    return (
      <div className="p-12 text-center bg-surface-container rounded-3xl">
        <h2 className="text-2xl font-bold font-headline mb-4">Session Complete! 🎉</h2>
        <p className="text-on-surface-variant">You've reached the end of your due cards for now.</p>
      </div>
    );
  }

  const currentCard = dueCards[currentIndex];

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-8">
      <div className="flex justify-between items-center text-sm font-bold text-outline-variant uppercase tracking-widest">
        <span>Daily Review</span>
        <span>{currentIndex + 1} / {dueCards.length}</span>
      </div>

      {/* Flashcard Display */}
      <div 
        className="min-h-[300px] bg-surface-container-low border border-outline-variant/10 rounded-[2rem] p-12 flex flex-col items-center justify-center text-center shadow-2xl transition-all duration-500 cursor-pointer hover:bg-surface-container-high"
        onClick={() => setShowAnswer(true)}
      >
        <div className="text-on-surface-variant text-xs mb-4 font-black tracking-widest uppercase opacity-50">
          {showAnswer ? 'Answer' : 'Question'}
        </div>
        <div className="text-2xl md:text-3xl font-bold font-headline leading-tight">
          {showAnswer ? currentCard.backText : currentCard.frontText}
        </div>
        
        {!showAnswer && (
          <div className="mt-8 text-sm text-primary animate-pulse font-medium">
            Tap to reveal answer
          </div>
        )}
      </div>

      {/* Quality Rating Buttons */}
      {showAnswer && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <button
            onClick={() => handleReview(1)}
            className="flex flex-col items-center gap-1 p-4 bg-error-container text-on-error-container rounded-2xl hover:scale-105 active:scale-95 transition-all shadow-lg"
          >
            <span className="font-black text-xl">1</span>
            <span className="text-[10px] uppercase font-bold tracking-tighter">Again</span>
          </button>
          
          <button
            onClick={() => handleReview(3)}
            className="flex flex-col items-center gap-1 p-4 bg-surface-container-highest text-on-surface rounded-2xl hover:scale-105 active:scale-95 transition-all shadow-lg"
          >
            <span className="font-black text-xl">3</span>
            <span className="text-[10px] uppercase font-bold tracking-tighter">Hard</span>
          </button>
          
          <button
            onClick={() => handleReview(4)}
            className="flex flex-col items-center gap-1 p-4 bg-primary text-on-primary rounded-2xl hover:scale-105 active:scale-95 transition-all shadow-lg shadow-primary/20"
          >
            <span className="font-black text-xl">4</span>
            <span className="text-[10px] uppercase font-bold tracking-tighter">Good</span>
          </button>
          
          <button
            onClick={() => handleReview(5)}
            className="flex flex-col items-center gap-1 p-4 bg-secondary-container text-on-secondary-container rounded-2xl hover:scale-105 active:scale-95 transition-all shadow-lg"
          >
            <span className="font-black text-xl">5</span>
            <span className="text-[10px] uppercase font-bold tracking-tighter">Easy</span>
          </button>
        </div>
      )}
    </div>
  );
};

export default FlashcardReview;
