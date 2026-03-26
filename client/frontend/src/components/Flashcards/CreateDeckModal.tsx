"use client";

import { useState } from "react";
import { X } from "lucide-react";
import api from "@/lib/api";

interface CreateDeckModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (deck: any) => void;
}

export default function CreateDeckModal({ isOpen, onClose, onSuccess }: CreateDeckModalProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await api.post("/study/deck", {
        title,
        description,
        category,
      });
      onSuccess(response.data);
      onClose();
      // Reset form
      setTitle("");
      setDescription("");
      setCategory("");
    } catch (error) {
      console.error("Failed to create deck", error);
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
      <div className="relative w-full max-w-md bg-surface-container border border-white/10 rounded-2xl shadow-2xl overflow-hidden glass-card">
        <div className="flex justify-between items-center p-6 border-b border-white/5">
          <h3 className="text-xl font-bold text-on-surface">Create Knowledge Deck</h3>
          <button onClick={onClose} className="text-on-surface-variant hover:text-on-surface">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-bold text-primary uppercase tracking-widest mb-2">
              Deck Title
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Quantum Physics 101"
              className="w-full bg-surface-variant/30 border border-white/5 rounded-xl px-4 py-3 text-on-surface focus:outline-none focus:border-primary/50 transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-primary uppercase tracking-widest mb-2">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What is this deck about?"
              rows={3}
              className="w-full bg-surface-variant/30 border border-white/5 rounded-xl px-4 py-3 text-on-surface focus:outline-none focus:border-primary/50 transition-colors resize-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-primary uppercase tracking-widest mb-2">
              Category
            </label>
            <input
              type="text"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              placeholder="e.g. Science, Medical, UPSC"
              className="w-full bg-surface-variant/30 border border-white/5 rounded-xl px-4 py-3 text-on-surface focus:outline-none focus:border-primary/50 transition-colors"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 bg-primary text-on-primary font-bold rounded-xl hover:bg-primary-dim transition-all shadow-lg shadow-primary/10 disabled:opacity-50"
          >
            {loading ? "Creating..." : "Generate Deck"}
          </button>
        </form>
      </div>
    </div>
  );
}
