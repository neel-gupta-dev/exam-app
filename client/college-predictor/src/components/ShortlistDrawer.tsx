"use client";

// ────────────────────────────────────────────────────────────
// ShortlistDrawer — Floating button + slide-in panel
// Shows all shortlisted colleges. Appears only when ≥1 item.
// ────────────────────────────────────────────────────────────

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bookmark, X, Trash2, TrendingUp, Award, MapPin } from "lucide-react";
import { ShortlistItem } from "../hooks/useShortlist";
import { getChanceColor, getInstituteTypeColor } from "../lib/utils";

interface ShortlistDrawerProps {
  items: ShortlistItem[];
  onRemove: (institute_code: string, program_code: string) => void;
}

export default function ShortlistDrawer({ items, onRemove }: ShortlistDrawerProps) {
  const [open, setOpen] = useState(false);

  if (items.length === 0) return null;

  return (
    <>
      {/* ── Floating FAB ── */}
      <motion.button
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0, opacity: 0 }}
        onClick={() => setOpen(true)}
        className="fixed bottom-6 left-6 z-50 flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-4 py-3 rounded-full shadow-xl shadow-blue-900/40 transition-colors"
        aria-label="Open shortlist"
      >
        <Bookmark className="w-4 h-4 fill-white" />
        <span className="text-sm font-semibold">{items.length} Shortlisted</span>
      </motion.button>

      {/* ── Drawer Overlay ── */}
      <AnimatePresence>
        {open && (
          <>
            {/* Backdrop */}
            <motion.div
              key="backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
            />

            {/* Panel */}
            <motion.aside
              key="drawer"
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 28, stiffness: 260 }}
              className="fixed top-0 left-0 bottom-0 w-full max-w-sm z-50 bg-navy-900 border-r border-navy-700 flex flex-col shadow-2xl"
            >
              {/* Header */}
              <div className="flex items-center justify-between px-5 py-4 border-b border-navy-700 shrink-0">
                <div className="flex items-center gap-2">
                  <Bookmark className="w-4 h-4 text-blue-400 fill-blue-400" />
                  <h2 className="text-base font-semibold text-white">My Shortlist</h2>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-blue-500/15 text-blue-300 border border-blue-500/20">
                    {items.length}
                  </span>
                </div>
                <button
                  onClick={() => setOpen(false)}
                  className="text-gray-400 hover:text-white transition-colors p-1"
                  aria-label="Close shortlist"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Items */}
              <div className="flex-1 overflow-y-auto py-3 px-3 space-y-2">
                <AnimatePresence>
                  {items.map((item) => {
                    const chance = getChanceColor(item.chance);
                    const typeColor = getInstituteTypeColor(item.institute_type as any);
                    return (
                      <motion.div
                        key={`${item.institute_code}-${item.program_code}`}
                        initial={{ opacity: 0, x: -16 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -16, height: 0, marginBottom: 0 }}
                        transition={{ duration: 0.2 }}
                        className="glass-card-light p-3 flex flex-col gap-2"
                      >
                        {/* Top row */}
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-1.5 flex-wrap mb-1">
                              <span className={`chip ${typeColor} text-[10px] px-1.5 py-0.5`}>
                                {item.institute_type}
                              </span>
                              <span className={`chip ${chance.bg} ${chance.text} ${chance.border} text-[10px] px-1.5 py-0.5`}>
                                {chance.emoji} {chance.label}
                              </span>
                            </div>
                            <p className="text-sm font-semibold text-white leading-tight">
                              {item.short_name}
                            </p>
                            <p className="text-xs text-gray-400 mt-0.5 leading-tight">{item.program_name}</p>
                          </div>
                          <button
                            onClick={() => onRemove(item.institute_code, item.program_code)}
                            className="text-gray-600 hover:text-red-400 transition-colors p-1 shrink-0"
                            aria-label="Remove from shortlist"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        {/* Stats row */}
                        <div className="flex items-center gap-3 text-[10px] text-gray-400">
                          {item.city && (
                            <span className="flex items-center gap-1">
                              <MapPin className="w-2.5 h-2.5" />
                              {item.city}
                            </span>
                          )}
                          {item.nirf_rank && (
                            <span className="flex items-center gap-1">
                              <Award className="w-2.5 h-2.5" />
                              #{item.nirf_rank}
                            </span>
                          )}
                          {item.placement_median_lpa && (
                            <span className="flex items-center gap-1">
                              <TrendingUp className="w-2.5 h-2.5" />
                              ₹{item.placement_median_lpa}L
                            </span>
                          )}
                          <span className={`ml-auto font-medium ${chance.text}`}>
                            {item.chance_percentage}% chance
                          </span>
                        </div>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              </div>

              {/* Footer hint */}
              <div className="px-5 py-3 border-t border-navy-700 text-[10px] text-gray-600 text-center shrink-0">
                Your shortlist is saved automatically and persists across page refreshes.
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
