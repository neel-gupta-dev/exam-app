"use client";

import { useState } from "react";
import { X } from "lucide-react";
import api from "@/lib/api";

interface AddCardModalProps {
  isOpen: boolean;
  onClose: () => void;
  deckId: string | null;
  onSuccess: () => void;
}

export default function AddCardModal({ isOpen, onClose, deckId, onSuccess }: AddCardModalProps) {
  const [frontText, setFrontText] = useState("");
  const [backText, setBackText] = useState("");
  const [loading, setLoading] = useState(false);

  if (!isOpen || !deckId) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post("/study/card", {
        deckId,
        frontText,
        backText,
      });
      onSuccess();
      onClose();
      // Reset form
      setFrontText("");
      setBackText("");
    } catch (error) {
      console.error("Failed to add card", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-background/80 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative w-full max-w-lg bg-surface-container border border-white/10 rounded-2xl shadow-2xl overflow-hidden glass-card">
        <div className="flex justify-between items-center p-6 border-b border-white/5">
          <h3 className="text-xl font-bold text-on-surface">Add New Flashcard</h3>
          <button onClick={onClose} className="text-on-surface-variant hover:text-on-surface">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-primary uppercase tracking-widest mb-2">
                Front Face (Question)
              </label>
              <textarea
                required
                value={frontText}
                onChange={(e) => setFrontText(e.target.value)}
                placeholder="Ask something challenging..."
                rows={4}
                className="w-full bg-surface-variant/30 border border-white/5 rounded-xl px-4 py-3 text-on-surface focus:outline-none focus:border-primary/50 transition-colors resize-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-primary uppercase tracking-widest mb-2">
                Back Face (Answer)
              </label>
              <textarea
                required
                value={backText}
                onChange={(e) => setBackText(e.target.value)}
                placeholder="The concise explanation..."
                rows={4}
                className="w-full bg-surface-variant/30 border border-white/5 rounded-xl px-4 py-3 text-on-surface focus:outline-none focus:border-primary/50 transition-colors resize-none"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 bg-primary text-on-primary font-bold rounded-xl hover:bg-primary-dim transition-all shadow-lg shadow-primary/10 disabled:opacity-50"
          >
            {loading ? "Adding Card..." : "Confirm & Save Card"}
          </button>
        </form>
      </div>
    </div>
  );
}
