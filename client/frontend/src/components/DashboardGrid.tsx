'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/api';
import { Resource } from '@/types';
import { FileText, Play, Clock, ChevronRight, FolderOpen } from 'lucide-react';
import LoadingSkeleton from './LoadingSkeleton';

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const hours = Math.floor(diff / 3600000);
  if (hours < 1) return 'Just now';
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return `${Math.floor(days / 7)}w ago`;
}

function ResourceCard({ resource }: { resource: Resource }) {
  const colors: Record<string, { text: string; bg: string }> = {
    pdf: { text: 'text-red-400', bg: 'bg-red-500/10' },
    video: { text: 'text-indigo-400', bg: 'bg-indigo-500/10' },
    link: { text: 'text-emerald-400', bg: 'bg-emerald-500/10' },
    other: { text: 'text-slate-400', bg: 'bg-slate-500/10' }
  };
  const color = colors[resource.type] || colors.pdf;

  return (
    <div className="group bg-surface-container hover:bg-surface-container-high transition-colors p-5 rounded-xl flex items-center gap-5 cursor-pointer border border-transparent hover:border-outline-variant/10">
      <div className={`w-14 h-14 ${color.bg} rounded-lg flex items-center justify-center ${color.text} shrink-0`}>
        {resource.type === 'video' ? <Play className="w-7 h-7" /> : <FileText className="w-7 h-7" />}
      </div>
      <div className="flex-1">
        <h3 className="font-semibold text-on-surface group-hover:text-primary transition-colors line-clamp-1">
          {resource.title}
        </h3>
        <div className="flex items-center gap-3 mt-2">
          {resource.folderName && (
            <span className="px-2 py-0.5 rounded bg-surface-bright text-[10px] font-bold text-indigo-400 uppercase tracking-wider">
              {resource.folderName}
            </span>
          )}
          <span className="text-xs text-on-surface-variant flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {timeAgo(resource.createdAt)}
          </span>
        </div>
      </div>
      <ChevronRight className="w-5 h-5 text-outline opacity-0 group-hover:opacity-100 transition-opacity" />
    </div>
  );
}


// ----------------------------------------------------------------------------
// Empty State
// ----------------------------------------------------------------------------
function EmptyState() {
  return (
    <div className="bg-surface-container/50 border border-dashed border-outline-variant/30 rounded-2xl p-10 flex flex-col items-center justify-center text-center">
      <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mb-4">
        <FolderOpen className="w-8 h-8 text-primary" />
      </div>
      <h3 className="text-lg font-bold text-on-surface mb-2">Your Vault is Empty</h3>
      <p className="text-sm text-on-surface-variant max-w-xs mb-6">
        Click Quick Save in the top right to start adding your study materials, PDFs, or YouTube links.
      </p>
    </div>
  );
}

// ----------------------------------------------------------------------------
// Main Grid
// ----------------------------------------------------------------------------
export default function DashboardGrid() {
  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchResources = async () => {
      try {
        const { data } = await api.get('/resources?page=1&limit=20');
        setResources(data.resources || []);
      } catch (error) {
        console.error('Failed to fetch resources:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchResources();

    const handleResourceAdded = () => {
      setLoading(true);
      fetchResources();
    };
    
    window.addEventListener("resourceAdded", handleResourceAdded);
    return () => window.removeEventListener("resourceAdded", handleResourceAdded);
  }, []);

  if (loading) return <LoadingSkeleton count={3} />;
  
  if (resources.length === 0) return <EmptyState />;

  return (
    <div className="grid grid-cols-1 gap-4">
      {resources.map((resource) => (
        <ResourceCard key={resource._id} resource={resource} />
      ))}
    </div>
  );
}
