"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import api from "@/lib/api";
import { 
  Star, 
  X, 
  CheckCircle2, 
  AlertCircle,
  ThumbsUp,
  Meh,
  Frown,
  Smile,
  Zap
} from "lucide-react";
import { toast } from "sonner";

const RATINGS = [
  { value: 1, label: "Confused", icon: Frown, color: "text-red-400", bg: "bg-red-500/10" },
  { value: 2, label: "Shaky", icon: Meh, color: "text-orange-400", bg: "bg-orange-500/10" },
  { value: 3, label: "Neutral", icon: Smile, color: "text-yellow-400", bg: "bg-yellow-500/10" },
  { value: 4, label: "Strong", icon: ThumbsUp, color: "text-blue-400", bg: "bg-blue-500/10" },
  { value: 5, label: "Mastered", icon: Zap, color: "text-emerald-400", bg: "bg-emerald-500/10" },
];

export default function ConfidencePopup() {
  const { user, updateUser } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [resourceId, setResourceId] = useState<string | null>(null);
  const [rating, setRating] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Check for pending rating flag on mount
    const pendingId = localStorage.getItem("pendingConfidenceRating");
    if (pendingId) {
      setResourceId(pendingId);
      setIsOpen(true);
      // Clean up flag immediately so it doesn't show again on refresh
      localStorage.removeItem("pendingConfidenceRating");
    }
  }, []);

  if (!isOpen) return null;

  const handleRate = async (value: number) => {
    setRating(value);
    setLoading(true);
    try {
      const { data } = await api.post("/users/confidence", { rating: value });
      updateUser(data);
      toast.success("Feedback saved! Your intelligence profile is growing.");
      
      // Close after a brief delay for feedback
      setTimeout(() => setIsOpen(false), 1000);
    } catch (error) {
      console.error("Failed to save confidence rating", error);
      toast.error("Failed to save rating.");
      setLoading(false);
    }
  };

  const close = () => setIsOpen(false);

  return (
    <div className="fixed bottom-6 right-6 z-[90] w-full max-w-xs animate-in slide-in-from-bottom-8 duration-500">
      <div className="bg-surface-bright border border-white/10 rounded-2xl p-6 shadow-2xl relative overflow-hidden group">
        
        {/* Glow effect */}
        <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />

        <button 
          onClick={close}
          className="absolute top-4 right-4 text-on-surface-variant hover:text-on-surface transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-2 mb-4">
          <CheckCircle2 className="w-4 h-4 text-primary" />
          <span className="text-[10px] font-bold uppercase tracking-widest text-primary">Session Reflection</span>
        </div>

        <h3 className="text-sm font-bold text-on-surface mb-2">
          How confident do you feel about this topic now?
        </h3>
        <p className="text-[10px] text-on-surface-variant mb-6 leading-relaxed">
          Your feedback helps quantify your "Cognitive Growth" and identifies content gaps.
        </p>

        <div className="flex justify-between items-center gap-2">
          {RATINGS.map((r) => {
            const Icon = r.icon;
            const isSelected = rating === r.value;
            return (
              <button
                key={r.value}
                disabled={loading}
                onClick={() => handleRate(r.value)}
                className={`flex-1 flex flex-col items-center gap-1.5 p-2 rounded-xl border transition-all ${
                  isSelected 
                    ? `${r.bg} ${r.color} border-current scale-110 shadow-lg` 
                    : "bg-white/5 border-transparent text-on-surface-variant hover:bg-white/10 hover:border-white/10"
                }`}
                title={r.label}
              >
                <Icon className={`w-5 h-5 ${isSelected ? "" : "opacity-60"}`} />
                <span className="text-[8px] font-black uppercase tracking-tighter">{r.value}</span>
              </button>
            )
          })}
        </div>

        {rating && !loading && (
          <div className="mt-4 animate-in fade-in slide-in-from-top-2">
            <p className="text-[10px] font-bold text-center text-primary uppercase">
              {RATINGS.find(r => r.value === rating)?.label}! Saving...
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
