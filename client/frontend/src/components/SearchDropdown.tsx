"use client";

import React from "react";
import { 
  FileText, 
  Video, 
  Link as LinkIcon, 
  MoreHorizontal, 
  Search,
  ExternalLink,
  FolderOpen
} from "lucide-react";
import Link from "next/link";

export interface ResourceSearchResult {
  _id: string;
  title: string;
  type: 'pdf' | 'video' | 'link' | 'other';
  url: string;
  folderName: string;
  createdAt: string;
}

interface SearchDropdownProps {
  results: ResourceSearchResult[];
  isLoading: boolean;
  query: string;
  onClose: () => void;
  onSelect: (result: ResourceSearchResult) => void;
}

/**
 * Global Search Results Dropdown
 * Displays a list of resources matching the current search query in the TopNav.
 * Renders icons based on resource type (PDF, Video, Link) and provides quick navigation.
 */
export default function SearchDropdown({ results, isLoading, query, onClose, onSelect }: SearchDropdownProps) {
  if (!query) return null;

  const getIcon = (type: string) => {
    switch (type) {
      case 'pdf': return <FileText className="w-4 h-4 text-rose-400" />;
      case 'video': return <Video className="w-4 h-4 text-emerald-400" />;
      case 'link': return <LinkIcon className="w-4 h-4 text-blue-400" />;
      default: return <MoreHorizontal className="w-4 h-4 text-on-surface-variant" />;
    }
  };

  return (
    <div className="absolute top-full left-0 right-0 mt-3 animate-in fade-in slide-in-from-top-2 duration-200 z-[100]">
      <div className="glass-card shadow-2xl shadow-black/60 rounded-[1.5rem] border border-white/5 overflow-hidden backdrop-blur-3xl bg-surface/90">
        {/* Header */}
        <div className="px-5 py-3 border-b border-outline-variant/10 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Search className="w-3.5 h-3.5 text-primary" />
            <span className="text-[10px] uppercase font-black tracking-widest text-on-surface-variant">Search Results</span>
          </div>
          <span className="text-[10px] font-bold text-on-surface-variant uppercase opacity-50 px-2 py-0.5 bg-surface-container rounded-md">
            {results.length} Found
          </span>
        </div>

        {/* Results List */}
        <div className="max-h-[360px] overflow-y-auto custom-scrollbar p-2 space-y-1">
          {isLoading ? (
            <div className="py-12 flex flex-col items-center justify-center gap-4 text-on-surface-variant">
              <div className="w-10 h-10 rounded-full border-2 border-primary/20 border-t-primary animate-spin" />
              <p className="text-xs font-bold uppercase tracking-tighter animate-pulse">Scanning Vault...</p>
            </div>
          ) : results.length > 0 ? (
            results.map((result) => (
              <div
                key={result._id}
                onClick={() => onSelect(result)}
                className="group p-3 rounded-xl hover:bg-white/5 cursor-pointer transition-all border border-transparent hover:border-white/5 flex items-start justify-between gap-4"
              >
                <div className="flex gap-4">
                  <div className="mt-1 p-2 bg-white/5 rounded-lg group-hover:bg-primary/20 group-hover:scale-110 transition-all duration-300">
                    {getIcon(result.type)}
                  </div>
                  <div className="flex flex-col gap-0.5 min-w-0">
                    <p className="font-bold text-sm text-on-surface truncate group-hover:text-primary transition-colors pr-2">
                      {result.title}
                    </p>
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1 text-[10px] text-on-surface-variant font-medium">
                        <FolderOpen className="w-3 h-3 text-amber-500/80" />
                        <span className="truncate max-w-[120px]">{result.folderName}</span>
                      </div>
                      <span className="text-[10px] text-outline opacity-40 italic">
                        {new Date(result.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-2 translate-x-2 group-hover:translate-x-0 transition-transform">
                   <span className="text-[10px] font-bold text-primary uppercase flex items-center gap-1">
                     Open <ExternalLink size={10} />
                   </span>
                </div>
              </div>
            ))
          ) : (
            <div className="py-12 text-center space-y-3">
              <div className="w-16 h-16 bg-surface-variant/30 rounded-3xl flex items-center justify-center mx-auto scale-90 opacity-50 border border-outline-variant/10">
                <Search size={32} />
              </div>
              <div className="space-y-1">
                <p className="font-black text-on-surface uppercase tracking-tight">No Matches Found</p>
                <p className="text-[10px] text-on-surface-variant max-w-[180px] mx-auto opacity-70">
                  Try adjusting your keywords or folder filter for better results.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer/Advanced Actions */}
        <div className="p-3 bg-primary/5 border-t border-outline-variant/10 flex items-center justify-between px-5">
           <Link 
            href="/subjects" 
            onClick={onClose}
            className="text-[10px] font-black text-primary uppercase tracking-widest hover:brightness-125 transition-all flex items-center gap-2 group"
          >
            Go to Vault
            <Search size={10} className="group-hover:translate-x-0.5 transition-transform" />
          </Link>
          <span className="text-[9px] font-mono text-outline opacity-40 uppercase tracking-tighter">
            Press ESC to close
          </span>
        </div>
      </div>
    </div>
  );
}
