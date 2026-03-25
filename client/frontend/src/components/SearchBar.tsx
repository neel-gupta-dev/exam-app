"use client";

import { useState, useEffect, useRef } from "react";
import { Search, Loader2 } from "lucide-react";

interface SearchBarProps {
  onSearch: (query: string) => void;
  isLoading?: boolean;
  placeholder?: string;
}

export default function SearchBar({ onSearch, isLoading, placeholder = "Search resources..." }: SearchBarProps) {
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  // Keyboard shortcut listener: '/' to focus
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "/" && document.activeElement !== inputRef.current) {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Debouncing logic: 300ms
  useEffect(() => {
    const timer = setTimeout(() => {
      onSearch(query);
    }, 300);
    return () => clearTimeout(timer);
  }, [query, onSearch]);

  return (
    <div className="relative w-full max-w-xl group">
      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
        {isLoading ? (
          <Loader2 className="h-4 w-4 animate-spin text-primary/70" />
        ) : (
          <Search className="h-4 w-4 text-on-surface-variant group-focus-within:text-primary transition-colors" />
        )}
      </div>
      <input
        ref={inputRef}
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder={placeholder}
        className="w-full bg-surface-container/40 border border-outline-variant/10 rounded-xl py-2.5 pl-10 pr-12 text-sm text-on-surface placeholder:text-on-surface-variant/50 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30 backdrop-blur-xl transition-all shadow-sm"
      />
      <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
        <kbd className="hidden sm:inline-flex h-5 select-none items-center gap-1 rounded border border-outline-variant/20 bg-surface-container-highest px-1.5 font-mono text-[10px] font-medium text-on-surface-variant opacity-100">
          <span className="text-xs">/</span>
        </kbd>
      </div>
    </div>
  );
}
