'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/api';
import { Resource } from '@/types';
import { 
  FileText, 
  Play, 
  Clock, 
  ChevronRight, 
  ChevronLeft,
  FolderOpen,
  Search,
  Plus
} from 'lucide-react';
import Link from 'next/link';
import LoadingSkeleton from './LoadingSkeleton';
import { useAuth } from '@/context/AuthContext';
import DemoSignupModal from '@/components/DemoSignupModal';

function timeAgo(date: string | Date): string {
  const diff = Date.now() - new Date(date).getTime();
  const hours = Math.floor(diff / 3600000);
  if (hours < 1) return 'Just now';
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return `${Math.floor(days / 7)}w ago`;
}

function ResourceCard({ resource, isDemo }: { resource: Resource; isDemo?: boolean }) {
  const colors: Record<string, { text: string; bg: string }> = {
    pdf: { text: 'text-red-400', bg: 'bg-red-500/10' },
    video: { text: 'text-indigo-400', bg: 'bg-indigo-500/10' },
    link: { text: 'text-emerald-400', bg: 'bg-emerald-500/10' },
    other: { text: 'text-slate-400', bg: 'bg-slate-500/10' }
  };
  const color = colors[resource.type] || colors.pdf;

  const href = isDemo ? `/resource/${resource._id}?demo=true` : `/resource/${resource._id}`;

  return (
    <Link
      href={href}
      className="group bg-surface-container hover:bg-surface-container-high transition-colors p-5 rounded-xl flex items-center gap-5 cursor-pointer border border-transparent hover:border-outline-variant/10 block"
    >
      <div className={`w-14 h-14 ${color.bg} rounded-lg flex items-center justify-center ${color.text} shrink-0`}>
        {resource.type === 'video' ? <Play className="w-7 h-7" /> : <FileText className="w-7 h-7" />}
      </div>
      <div className="flex-1">
        <h3 className="font-semibold text-on-surface group-hover:text-primary transition-colors line-clamp-1">{resource.title}</h3>
        <div className="flex items-center gap-3 mt-2">
          {resource.folderName && (
            <span className="px-2 py-0.5 rounded bg-surface-bright text-[10px] font-bold text-indigo-400 uppercase tracking-wider">{resource.folderName}</span>
          )}
          <span className="text-xs text-on-surface-variant flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {timeAgo(resource.createdAt)}
          </span>
        </div>
      </div>
      <ChevronRight className="w-5 h-5 text-outline opacity-0 group-hover:opacity-100 transition-opacity" />
    </Link>
  );
}


// ----------------------------------------------------------------------------
// Empty States
// ----------------------------------------------------------------------------
function EmptyState({ isDemo }: { isDemo?: boolean }) {
  const handleQuickSaveClick = () => {
    window.dispatchEvent(new Event('openQuickSave'));
  };

  return (
    <div className="bg-surface-container/50 border border-dashed border-outline-variant/30 rounded-2xl p-10 flex flex-col items-center justify-center text-center">
      <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mb-4">
        <FolderOpen className="w-8 h-8 text-primary" />
      </div>
      <h3 className="text-lg font-bold text-on-surface mb-1">Your Vault is Empty</h3>
      <p className="text-sm text-on-surface-variant max-w-xs mb-6 mt-2">
        Click below to start adding your study materials, PDFs, or YouTube links.
      </p>
      <button 
        onClick={handleQuickSaveClick}
        className="bg-indigo-500 hover:opacity-90 transition-all text-white px-6 py-3 rounded-xl text-sm font-bold flex items-center justify-center gap-2 shadow-xl shadow-indigo-500/20 active:scale-95"
      >
        <Plus className="w-4 h-4" />
        Save Resource
      </button>
      <p className="text-xs text-on-surface-variant mt-4 opacity-50 hidden md:block">Shortcut: Ctrl+S or ⌘+S</p>
    </div>
  );
}

function NoMatchesState({ onClear }: { onClear: () => void }) {
  return (
    <div className="bg-surface-container/30 border border-outline-variant/10 rounded-2xl p-10 flex flex-col items-center justify-center text-center backdrop-blur-sm">
      <div className="w-16 h-16 bg-surface-variant/30 rounded-2xl flex items-center justify-center mb-4">
        <Search className="w-8 h-8 text-on-surface-variant" />
      </div>
      <h3 className="text-lg font-bold text-on-surface mb-2">No resources found</h3>
      <p className="text-sm text-on-surface-variant max-w-xs mb-6">
        We couldn't find any resources matching your search. Try different keywords.
      </p>
      <button 
        onClick={onClear}
        className="px-6 py-2 bg-primary/10 border border-primary/20 text-primary rounded-lg text-xs font-bold hover:bg-primary/20 transition-colors"
      >
        Clear Search
      </button>
    </div>
  );
}

// ----------------------------------------------------------------------------
// Main Grid
// ----------------------------------------------------------------------------

import { useSearch } from '@/context/SearchContext';

/**
 * Dashboard Flow & Resource Grid
 * Renders the main feed of recently saved resources.
 * Includes client-side pagination and special empty state components when
 * the vault is empty or no search results are found.
 */
export default function DashboardGrid({ 
  onLoadingChange 
}: { 
  onLoadingChange?: (loading: boolean) => void
}) {
  const { user } = useAuth();
  const isDemo = !user;
  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const { searchQuery, setSearchQuery } = useSearch();
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 4;



  /**
   * Resource Fetcher
   * Fetches the first 100 resources to power the client-side pagination block.
   * Listens to the global `resourceAdded` event to instantly refetch when the
   * user uses the Quick Save feature.
   */
  useEffect(() => {
    const fetchResources = async () => {
      setLoading(true);
      onLoadingChange?.(true);
      
      if (isDemo) {
        const demoVault = JSON.parse(localStorage.getItem('vayl_demo_vault') || '[]');
        setResources(demoVault);
        setLoading(false);
        setIsInitialLoad(false);
        onLoadingChange?.(false);
        return;
      }
      
      try {
        const { data } = await api.get('/resources', {
          params: {
            page: 1,
            limit: 100,
            search: searchQuery || undefined
          }
        });
        setResources(data.resources || []);
        setCurrentPage(1);
      } catch (error) {
        console.error('Failed to fetch resources:', error);
      } finally {
        setLoading(false);
        setIsInitialLoad(false);
        onLoadingChange?.(false);
      }
    };
    
    fetchResources();

    const handleResourceAdded = () => fetchResources();
    window.addEventListener("resourceAdded", handleResourceAdded);
    return () => window.removeEventListener("resourceAdded", handleResourceAdded);
  }, [searchQuery, isDemo]);

  if (loading && isInitialLoad) return <LoadingSkeleton count={3} />;
  
  if (resources.length === 0) {
    return searchQuery ? <NoMatchesState onClear={() => setSearchQuery("")} /> : <EmptyState isDemo={isDemo} />;
  }

  // Pagination Logic
  const totalItems = resources.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, totalItems);
  const currentItems = resources.slice(startIndex, endIndex);

  return (
    <>
    <div className="space-y-4">
      {/* Gmail-style Pagination Header */}
      <div className="flex items-center justify-between pb-2 border-b border-outline-variant/10">
        <h3 className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">
          Recent Vault Items
        </h3>
        
        <div className="flex items-center gap-4">
          <span className="text-[11px] font-medium text-on-surface-variant tabular-nums">
            {startIndex + 1} – {endIndex} of {totalItems}
          </span>
          
          <div className="flex items-center">
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className={`p-1 rounded-md transition-colors ${
                currentPage === 1 
                  ? 'text-outline-variant cursor-not-allowed' 
                  : 'text-on-surface hover:bg-surface-variant'
              }`}
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className={`p-1 rounded-md transition-colors ${
                currentPage === totalPages 
                  ? 'text-outline-variant cursor-not-allowed' 
                  : 'text-on-surface hover:bg-surface-variant'
              }`}
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

    <div className="grid grid-cols-1 gap-4">
      {currentItems.map((resource) => (
        <ResourceCard key={resource._id} resource={resource} isDemo={isDemo} />
      ))}
    </div>
    </div>
    </>
  );
}
