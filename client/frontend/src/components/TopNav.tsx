"use client";

import { useState, FormEvent, useEffect, useRef } from "react";
import Link from "next/link";
import { Search, Plus, Bell, Settings, X, Loader2 } from "lucide-react";
import api from "@/lib/api";
import { toast } from "sonner";
import { useSearch } from "@/context/SearchContext";
import { useModifierKey } from "@/hooks/useModifierKey";
import { useHaptics } from "@/hooks/useHaptics";

export default function TopNav() {
  const [isOpen, setIsOpen] = useState(false);
  const [url, setUrl] = useState("");
  const [title, setTitle] = useState("");
  const [type, setType] = useState<"video" | "pdf" | "link" | "other">("link");
  const [folderName, setFolderName] = useState("");
  const [loading, setLoading] = useState(false);
  const { searchQuery, setSearchQuery } = useSearch();
  const { modifierSymbol } = useModifierKey();
  const { vibrateClick } = useHaptics();
  const searchInputRef = useRef<HTMLInputElement>(null);

  // ── Keyboard Shortcuts ──────────────────────────────────────────────
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // ⌘/Ctrl + K (Search)
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
      
      // ⌘/Ctrl + S (Quick Save Modal)
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        setIsOpen(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleSearch = async (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && searchQuery.trim()) {
      try {
        await api.post('/users/search-log', { term: searchQuery.trim() });
        // After logging, we could also trigger a local search filtering event
        // but for now we just satisfy the "passive logger" requirement.
        console.log("Search behavior logged passively.");
      } catch (err) {
        console.error("Failed to log search behavior", err);
      }
    }
  };

  const handleQuickSave = async (e: FormEvent) => {
    e.preventDefault();
    if (!url) return toast.error("URL is required");
    if (!title) return toast.error("Title is required");
    
    setLoading(true);
    try {
      await api.post('/resources', { url, title, type, folderName: folderName || "General" });
      toast.success("Resource saved to vault!");
      vibrateClick();
      setIsOpen(false);
      setUrl("");
      setTitle("");
      setType("link");
      setFolderName("");
      // Trigger a refresh event for Dashboard and Sidebar
      window.dispatchEvent(new Event("resourceAdded"));
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to save resource");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <header className="fixed top-0 right-0 h-16 bg-surface flex items-center justify-between px-8 w-[calc(100%-16rem)] ml-auto z-40">
        {/* Search */}
        <div className="flex items-center gap-4 w-1/2">
          <div className="relative w-full max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-on-surface-variant" />
            <input
              ref={searchInputRef}
              type="text"
              placeholder={`Search resources... (${modifierSymbol} + K)`}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={handleSearch}
              className="w-full bg-surface-container-highest border-none rounded-xl pl-10 pr-4 py-2 text-sm focus:ring-1 focus:ring-primary/50 placeholder:text-outline text-on-surface transition-all outline-none"
            />
            <div className="absolute right-3 top-1/2 -translate-y-1/2 flex gap-1 pointer-events-none">
              <span className="bg-surface-container rounded px-1.5 py-0.5 text-[10px] text-on-surface-variant font-mono border border-outline-variant/20">
                {modifierSymbol}
              </span>
              <span className="bg-surface-container rounded px-1.5 py-0.5 text-[10px] text-on-surface-variant font-mono border border-outline-variant/20">
                K
              </span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-6">
          <button 
            onClick={() => setIsOpen(true)}
            className="bg-indigo-500 hover:opacity-90 transition-all text-white px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Quick Save
          </button>
          <div className="flex items-center gap-4 text-on-surface-variant">
            <button className="hover:text-indigo-300 transition-opacity">
              <Bell className="w-5 h-5" />
            </button>
            <Link href="/settings" className="hover:text-indigo-300 transition-opacity">
              <Settings className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </header>

      {/* Quick Save Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/75 backdrop-blur-sm pointer-events-auto">
          <div className="bg-surface-container rounded-2xl w-full max-w-sm shadow-2xl border border-white/10 relative overflow-hidden pointer-events-auto">
            <div className="p-5 border-b border-outline-variant/20 flex justify-between items-center">
              <h2 className="font-headline font-bold text-on-surface">Save Resource</h2>
              <button 
                onClick={() => setIsOpen(false)}
                className="p-1 rounded-lg hover:bg-surface-bright text-on-surface-variant transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleQuickSave} className="p-5 space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">Title</label>
                <input
                  type="text"
                  placeholder="e.g. Calculus Lecture Notes"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-surface-container-highest border border-outline-variant/30 rounded-xl py-2 px-3 text-sm text-on-surface focus:ring-2 focus:ring-primary/20 focus:border-primary/50 transition-all outline-none"
                  required
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">URL</label>
                <input
                  type="url"
                  placeholder="https://youtube.com/... or .pdf"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  className="w-full bg-surface-container-highest border border-outline-variant/30 rounded-xl py-2 px-3 text-sm text-on-surface focus:ring-2 focus:ring-primary/20 focus:border-primary/50 transition-all outline-none"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">Type</label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value as any)}
                    className="w-full bg-surface-container-highest border border-outline-variant/30 rounded-xl py-2 px-3 text-sm text-on-surface focus:ring-2 focus:ring-primary/20 focus:border-primary/50 transition-all outline-none"
                  >
                    <option value="link">Link</option>
                    <option value="video">Video</option>
                    <option value="pdf">PDF</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">Folder</label>
                  <input
                    type="text"
                    placeholder="General"
                    value={folderName}
                    onChange={(e) => setFolderName(e.target.value)}
                    className="w-full bg-surface-container-highest border border-outline-variant/30 rounded-xl py-2 px-3 text-sm text-on-surface focus:ring-2 focus:ring-primary/20 focus:border-primary/50 transition-all outline-none"
                  />
                </div>
              </div>
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-2.5 bg-primary text-on-primary rounded-xl text-sm font-bold flex items-center justify-center disabled:opacity-50 transition-all"
                >
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Save to Vault"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
