"use client";

// ────────────────────────────────────────────────────────────
// useShortlist — Hook for managing the college shortlist.
// Uses a stable sessionId (persisted in localStorage) and syncs
// with the backend API. Optimistically updates local state.
// ────────────────────────────────────────────────────────────

import { useState, useEffect, useCallback } from "react";

export interface ShortlistItem {
  _id?: string;
  sessionId: string;
  institute_code: string;
  program_code: string;
  institute_name: string;
  short_name: string;
  program_name: string;
  institute_type: string;
  city?: string;
  nirf_rank?: number | null;
  placement_median_lpa?: number | null;
  chance: "safe" | "moderate" | "low";
  chance_percentage: number;
  composite_score: number;
  closing_rank: number;
  quota?: string;
  seat_type?: string;
  counseling?: string;
}

function getOrCreateSessionId(): string {
  if (typeof window === "undefined") return "ssr";
  let id = localStorage.getItem("vayl_predictor_session");
  if (!id) {
    id = `sess_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
    localStorage.setItem("vayl_predictor_session", id);
  }
  return id;
}

export function useShortlist() {
  const [sessionId] = useState<string>(getOrCreateSessionId);
  const [items, setItems] = useState<ShortlistItem[]>([]);
  const [loading, setLoading] = useState(true);

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

  // Load shortlist from DB on mount
  useEffect(() => {
    if (!sessionId || sessionId === "ssr") { setLoading(false); return; }
    fetch(`${apiUrl}/public/shortlist/${sessionId}`)
      .then(r => r.json())
      .then(data => {
        if (Array.isArray(data)) setItems(data);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [sessionId, apiUrl]);

  const isShortlisted = useCallback(
    (institute_code: string, program_code: string) =>
      items.some(i => i.institute_code === institute_code && i.program_code === program_code),
    [items]
  );

  const addToShortlist = useCallback(
    async (item: Omit<ShortlistItem, "sessionId">) => {
      const newItem: ShortlistItem = { ...item, sessionId };
      // Optimistic update
      setItems(prev => [newItem, ...prev.filter(i => !(i.institute_code === item.institute_code && i.program_code === item.program_code))]);
      try {
        const res = await fetch(`${apiUrl}/public/shortlist`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(newItem),
        });
        if (res.ok) {
          const saved = await res.json();
          setItems(prev => [saved, ...prev.filter(i => i.institute_code !== item.institute_code || i.program_code !== item.program_code)]);
        }
      } catch {}
    },
    [sessionId, apiUrl]
  );

  const removeFromShortlist = useCallback(
    async (institute_code: string, program_code: string) => {
      // Optimistic update
      setItems(prev => prev.filter(i => !(i.institute_code === institute_code && i.program_code === program_code)));
      try {
        await fetch(`${apiUrl}/public/shortlist/${sessionId}/${institute_code}/${program_code}`, {
          method: "DELETE",
        });
      } catch {}
    },
    [sessionId, apiUrl]
  );

  const toggleShortlist = useCallback(
    (item: Omit<ShortlistItem, "sessionId">) => {
      if (isShortlisted(item.institute_code, item.program_code)) {
        removeFromShortlist(item.institute_code, item.program_code);
      } else {
        addToShortlist(item);
      }
    },
    [isShortlisted, addToShortlist, removeFromShortlist]
  );

  return { items, loading, isShortlisted, toggleShortlist, removeFromShortlist };
}
