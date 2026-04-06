"use client";

import { useState, FormEvent, useEffect, useRef } from "react";
import Link from "next/link";
import { Search, Plus, Bell, Settings, X, Loader2, Sun, Moon } from "lucide-react";
import api from "@/lib/api";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";
import { useSearch } from "@/context/SearchContext";
import { useModifierKey } from "@/hooks/useModifierKey";
import { useHaptics } from "@/hooks/useHaptics";
import SearchDropdown, { ResourceSearchResult } from "./SearchDropdown";
import { useRouter } from "next/navigation";
import DemoSignupModal from "@/components/DemoSignupModal";
import { useSidebar } from "@/hooks/useSidebar";

/**
 * Global Top Navigation Bar
 * Handles global state controls like universal search, notifications, and settings.
 * Includes the "Quick Save" modal for adding new resources from anywhere in the app.
 * Listens for keyboard shortcuts (Cmd/Ctrl+K for search, Cmd/Ctrl+S for save).
 */
export default function TopNav() {
  const { user, theme, toggleTheme } = useAuth();
  const { isCollapsed } = useSidebar();
  const isDemo = !user;
  const [isOpen, setIsOpen] = useState(false);
  const [showDemoModal, setShowDemoModal] = useState(false);
  const [url, setUrl] = useState("");
  const [title, setTitle] = useState("");
  const [type, setType] = useState<"video" | "pdf" | "link" | "other">("link");
  const [folderName, setFolderName] = useState("");
  const [loading, setLoading] = useState(false);
  const { searchQuery, setSearchQuery } = useSearch();
  const { modifierSymbol } = useModifierKey();
  const { vibrateClick } = useHaptics();
  const searchInputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  // ── Search Dropdown State ───────────────────────────────────────────
  const [results, setResults] = useState<ResourceSearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);
  
  const handleOpenModal = () => {
    setIsOpen(true);
  };

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
        handleOpenModal();
      }

      // ESC to close results
      if (e.key === 'Escape') {
        setShowResults(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    
    // Using a separate function reference here so we can remove it properly
    const openQuickSaveEvent = () => handleOpenModal();
    window.addEventListener('openQuickSave', openQuickSaveEvent);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('openQuickSave', openQuickSaveEvent);
    };
  }, [isDemo]);

  // ── Click Outside Search ────────────────────────────────────────────
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        searchInputRef.current &&
        !searchInputRef.current.contains(event.target as Node)
      ) {
        setShowResults(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // ── Debounced Search Fetch ──────────────────────────────────────────
  /**
   * Debounced Search Effect
   * Waits 400ms after the user stops typing before hitting the backend API
   * to fetch search results. This prevents rate-limiting and reduces load.
   */
  useEffect(() => {
    if (!searchQuery.trim()) {
      setResults([]);
      setShowResults(false);
      return;
    }

    const fetchResults = async () => {
      setIsSearching(true);
      setShowResults(true);
      
      if (!user) {
        // Demo Mode Search
        const demoVault = JSON.parse(localStorage.getItem('vayl_demo_vault') || '[]');
        const lowerQ = searchQuery.toLowerCase();
        const demoResults = demoVault.filter((r: any) => 
          r.title?.toLowerCase().includes(lowerQ) || 
          r.folderName?.toLowerCase().includes(lowerQ) || 
          r.type?.toLowerCase().includes(lowerQ)
        ).slice(0, 5);
        
        setTimeout(() => {
          setResults(demoResults);
          setIsSearching(false);
        }, 150);
        return;
      }

      try {
        const { data } = await api.get(`/resources?search=${searchQuery}&limit=5`);
        setResults(data.resources || []);
      } catch (err) {
        console.error("Search fetch error:", err);
      } finally {
        setIsSearching(false);
      }
    };

    const timer = setTimeout(fetchResults, 400);
    return () => clearTimeout(timer);
  }, [searchQuery, user]);


  const handleSearchKeyDown = async (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && searchQuery.trim()) {
      try {
        await api.post('/users/search-log', { term: searchQuery.trim() });
        console.log("Search behavior logged passively.");
      } catch (err) {
        console.error("Failed to log search behavior", err);
      }
    }
  };

  const handleResultSelect = (result: ResourceSearchResult) => {
    setShowResults(false);
    // Open external URL in new tab or navigate to internal viewer
    window.open(result.url, '_blank');
  };

  /**
   * Quick Save Handler
   * Submits the modal form data to save a new resource globally.
   * Dispatches a custom 'resourceAdded' event so the Sidebar and Dashboard
   * can refresh their state instantly.
   */
  const handleQuickSave = async (e: FormEvent) => {
    e.preventDefault();
    if (!url) return toast.error("URL is required");
    if (!title) return toast.error("Title is required");

    setLoading(true);
    try {
      if (isDemo) {
        const newResource = {
          _id: 'demo_' + Date.now().toString(),
          userId: 'demo',
          title,
          url,
          type,
          folderName: folderName || "General",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        const existing = JSON.parse(localStorage.getItem('vayl_demo_vault') || '[]');
        localStorage.setItem('vayl_demo_vault', JSON.stringify([newResource, ...existing]));
        toast.success("Demo resource saved to vault!");
      } else {
        await api.post('/resources', { url, title, type, folderName: folderName || "General" });
        toast.success("Resource saved to vault!");
      }
      
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
      <header className={`fixed top-0 right-0 h-16 bg-surface flex items-center justify-between px-4 md:px-8 w-full ${isCollapsed ? 'md:w-[calc(100%-5rem)]' : 'md:w-[calc(100%-16rem)]'} transition-all duration-300 ml-auto z-40`}>
        {/* Search Bar - Hidden on Mobile */}
        <div className="flex items-center gap-2 md:hidden mr-2 shrink-0">
          <img src="/vayl-logo.png" alt="Vayl" className="w-6 h-6 object-contain" />
        </div>

        {/* Search */}
        <div className="flex items-center gap-2 md:gap-4 flex-1 max-w-xl md:w-1/2">
          <div className="relative w-full max-w-md">
            <Search className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 transition-colors z-10 ${showResults ? 'text-primary' : 'text-on-surface-variant'}`} />
            <input
              ref={searchInputRef}
              type="text"
              placeholder="Search resources..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={handleSearchKeyDown}
              onFocus={() => searchQuery && setShowResults(true)}
              className="w-full bg-surface-container-highest border-none rounded-xl pl-10 pr-4 py-2 text-sm focus:ring-1 focus:ring-primary/50 placeholder:text-outline text-on-surface transition-all outline-none z-10 relative"
            />
            {!searchQuery && (
              <div className="hidden md:flex absolute right-3 top-1/2 -translate-y-1/2 gap-1 pointer-events-none z-10">
                <span className="bg-surface-container rounded px-1.5 py-0.5 text-[10px] text-on-surface-variant font-mono border border-outline-variant/20">
                  {modifierSymbol}
                </span>
                <span className="bg-surface-container rounded px-1.5 py-0.5 text-[10px] text-on-surface-variant font-mono border border-outline-variant/20">
                  K
                </span>
              </div>
            )}

            {/* Results Dropdown Container */}
            <div ref={dropdownRef}>
              {showResults && (
                <SearchDropdown
                  results={results}
                  isLoading={isSearching}
                  query={searchQuery}
                  onClose={() => setShowResults(false)}
                  onSelect={handleResultSelect}
                />
              )}
            </div>
          </div>
        </div>

        {/* Actions - Desktop & Mobile */}
        <div className="flex items-center gap-3 md:gap-6 ml-2 shrink-0">
          <button
            onClick={handleOpenModal}
            className="bg-indigo-500 hover:opacity-90 transition-all text-white px-3 md:px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1 md:gap-2"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Save Resource</span>
          </button>
          <div className="flex items-center gap-2 md:gap-4 text-on-surface-variant">
            <button 
              onClick={toggleTheme}
              className="p-2 hover:bg-surface-container-high rounded-xl transition-all text-on-surface-variant hover:text-primary active:scale-95"
              aria-label="Toggle Theme"
            >
              {theme === "dark" ? <Sun className="w-5 h-5 shadow-sm" /> : <Moon className="w-5 h-5 shadow-sm" />}
            </button>
            <button className="hover:text-indigo-300 transition-opacity hidden md:block">
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
      
      <DemoSignupModal
        isOpen={showDemoModal}
        onClose={() => setShowDemoModal(false)}
        feature="Add Resources"
      />
    </>
  );
}
