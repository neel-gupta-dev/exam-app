"use client";

import { useState } from "react";
import { X, Info, HelpCircle } from "lucide-react";
import api from "@/lib/api";
import MathText from "../UI/MathText";

interface AddCardModalProps {
  isOpen: boolean;
  onClose: () => void;
  deckId: string | null;
  onSuccess: () => void;
}

const CHEAT_SHEET = [
  { label: "Fraction", code: "\\frac{a}{b}" },
  { label: "Power", code: "x^{n}" },
  { label: "Subscript", code: "x_{i}" },
  { label: "Square Root", code: "\\sqrt{x}" },
  { label: "N-th Root", code: "\\sqrt[n]{x}" },
  { label: "Integral", code: "\\int_{a}^{b} f(x)dx" },
  { label: "Summation", code: "\\sum_{i=1}^{n}" },
  { label: "Greek Alpha", code: "\\alpha" },
  { label: "Greek Beta", code: "\\beta" },
  { label: "Greek Theta", code: "\\theta" },
  { label: "Pi", code: "\\pi" },
  { label: "Infinity", code: "\\infty" },
];

export default function AddCardModal({ isOpen, onClose, deckId, onSuccess }: AddCardModalProps) {
  const [frontText, setFrontText] = useState("");
  const [backText, setBackText] = useState("");
  const [loading, setLoading] = useState(false);
  const [showCheatSheet, setShowCheatSheet] = useState(false);

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

  const insertCode = (code: string) => {
    // Basic insertion at current end of text for simplicity
    // In a real app, we'd use ref and selection range
    setFrontText(prev => prev + " " + code);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-background/80 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative w-full max-w-4xl bg-surface-container border border-white/10 rounded-3xl shadow-2xl overflow-hidden glass-card flex flex-col md:flex-row">
        
        {/* Main Form */}
        <div className="flex-1 p-8 space-y-8 border-r border-white/5">
          <div className="flex justify-between items-center">
            <h3 className="text-2xl font-extrabold text-on-surface tracking-tight">Create Card</h3>
            <button 
              onClick={() => setShowCheatSheet(!showCheatSheet)}
              className="flex items-center gap-2 px-3 py-1.5 bg-surface-variant/30 text-on-surface-variant text-[10px] font-bold uppercase tracking-widest rounded-lg hover:bg-surface-variant/50 transition-all border border-white/5"
            >
              <HelpCircle className="w-3 h-3 text-primary" />
              Formula Help
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Inputs */}
              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-primary uppercase tracking-widest px-1">
                    Front Message
                  </label>
                  <textarea
                    required
                    value={frontText}
                    onChange={(e) => setFrontText(e.target.value)}
                    placeholder="e.g. Solve $x^2 + 2x + 1 = 0$..."
                    rows={4}
                    className="w-full bg-surface-variant/20 border border-white/5 rounded-2xl px-4 py-3 text-on-surface focus:outline-none focus:border-primary/40 transition-all resize-none shadow-inner"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-secondary uppercase tracking-widest px-1">
                    Back Solution
                  </label>
                  <textarea
                    required
                    value={backText}
                    onChange={(e) => setBackText(e.target.value)}
                    placeholder="The concise answer..."
                    rows={4}
                    className="w-full bg-surface-variant/20 border border-white/5 rounded-2xl px-4 py-3 text-on-surface focus:outline-none focus:border-secondary/40 transition-all resize-none shadow-inner"
                  />
                </div>
              </div>

              {/* Live Preview */}
              <div className="hidden md:flex flex-col space-y-2">
                <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest px-1">
                  Live Preview
                </label>
                <div className="flex-1 bg-surface-bright/20 border border-dashed border-white/10 rounded-2xl p-6 flex flex-col gap-6 overflow-y-auto">
                   <div className="space-y-1">
                      <p className="text-[9px] font-bold text-primary/50 uppercase">Question</p>
                      <div className="text-sm text-on-surface">
                        {frontText ? <MathText text={frontText} /> : <span className="opacity-30 italic">Text will appear here...</span>}
                      </div>
                   </div>
                   <div className="h-px bg-white/5" />
                   <div className="space-y-1">
                      <p className="text-[9px] font-bold text-secondary/50 uppercase">Answer</p>
                      <div className="text-sm text-on-surface">
                        {backText ? <MathText text={backText} /> : <span className="opacity-30 italic">Solution will appear here...</span>}
                      </div>
                   </div>
                </div>
              </div>
            </div>

            <div className="flex gap-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-4 text-on-surface font-bold text-sm hover:bg-white/5 rounded-2xl transition-all"
              >
                Discard
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-[2] py-4 bg-primary text-on-primary font-bold rounded-2xl hover:bg-primary-dim transition-all shadow-xl shadow-primary/10 disabled:opacity-50"
              >
                {loading ? "Saving..." : "Confirm & Save Card"}
              </button>
            </div>
          </form>
        </div>

        {/* Cheat Sheet Sidebar */}
        {showCheatSheet && (
          <div className="w-full md:w-64 bg-surface-container-high p-8 border-l border-white/5 space-y-6 overflow-y-auto max-h-[400px] md:max-h-full">
            <div className="flex items-center gap-2 mb-2">
              <Info className="w-4 h-4 text-primary" />
              <h4 className="text-sm font-bold text-on-surface uppercase tracking-wider">Cheat Sheet</h4>
            </div>
            <div className="grid grid-cols-1 gap-2">
              {CHEAT_SHEET.map((item) => (
                <button
                  key={item.label}
                  type="button"
                  onClick={() => insertCode(item.code)}
                  className="group flex flex-col items-start p-3 bg-white/5 hover:bg-primary/10 border border-transparent hover:border-primary/20 rounded-xl transition-all text-left"
                >
                  <span className="text-[10px] font-bold text-on-surface-variant group-hover:text-primary transition-colors">{item.label}</span>
                  <code className="text-[9px] text-primary/70 mt-1 font-mono">{item.code}</code>
                </button>
              ))}
            </div>
            <p className="text-[9px] text-on-surface-variant leading-relaxed">
              Tip: Wrap your math in single <code>$</code> for inline or double <code>$$</code> for block.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
