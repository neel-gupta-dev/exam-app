'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/api';
import { recentResources as mockResources } from '@/lib/mockData';
import { FileText, Play, Clock, ChevronRight } from 'lucide-react';
import Image from 'next/image';

interface Resource {
  _id: string;
  title: string;
  type: 'pdf' | 'video';
  url: string;
  folderName: string;
  createdAt: string;
}

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
  };
  const color = colors[resource.type] || colors.pdf;

  return (
    <div className="group bg-surface-container hover:bg-surface-container-high transition-colors p-5 rounded-xl flex items-center gap-5 cursor-pointer">
      <div className={`w-14 h-14 ${color.bg} rounded-lg flex items-center justify-center ${color.text} shrink-0`}>
        {resource.type === 'video' ? <Play className="w-7 h-7" /> : <FileText className="w-7 h-7" />}
      </div>
      <div className="flex-1">
        <h3 className="font-semibold text-on-surface group-hover:text-primary transition-colors">
          {resource.title}
        </h3>
        <div className="flex items-center gap-3 mt-2">
          <span className="px-2 py-0.5 rounded bg-surface-bright text-[10px] font-bold text-indigo-400 uppercase tracking-wider">
            {resource.folderName}
          </span>
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

// Fallback card using mock data shape
function MockResourceCard({ resource }: { resource: typeof mockResources[0] }) {
  return (
    <div className="group bg-surface-container hover:bg-surface-container-high transition-colors p-5 rounded-xl flex items-center gap-5 cursor-pointer">
      {resource.type === 'video' && resource.thumbnailUrl ? (
        <div className="relative w-14 h-14 shrink-0 overflow-hidden rounded-lg">
          <Image src={resource.thumbnailUrl} alt="Video Thumbnail" fill className="object-cover" />
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
            <Play className="w-5 h-5 text-white fill-white" />
          </div>
        </div>
      ) : (
        <div className={`w-14 h-14 ${resource.iconBg} rounded-lg flex items-center justify-center ${resource.iconColor} shrink-0`}>
          <FileText className="w-7 h-7" />
        </div>
      )}
      <div className="flex-1">
        <h3 className="font-semibold text-on-surface group-hover:text-primary transition-colors">{resource.title}</h3>
        <div className="flex items-center gap-3 mt-2">
          <span className="px-2 py-0.5 rounded bg-surface-bright text-[10px] font-bold text-indigo-400 uppercase tracking-wider">{resource.tag}</span>
          <span className="text-xs text-on-surface-variant flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {resource.timeAgo}
          </span>
        </div>
      </div>
      <ChevronRight className="w-5 h-5 text-outline opacity-0 group-hover:opacity-100 transition-opacity" />
    </div>
  );
}

export default function DashboardGrid() {
  const [resources, setResources] = useState<Resource[]>([]);
  const [useMock, setUseMock] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchResources = async () => {
      try {
        const { data } = await api.get('/resources?page=1&limit=3');
        if (data.resources && data.resources.length > 0) {
          setResources(data.resources);
        } else {
          setUseMock(true);
        }
      } catch {
        setUseMock(true);
      } finally {
        setLoading(false);
      }
    };
    fetchResources();
  }, []);

  if (loading) {
    return (
      <div className="grid grid-cols-1 gap-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-surface-container p-5 rounded-xl h-20 animate-pulse" />
        ))}
      </div>
    );
  }

  if (useMock) {
    return (
      <div className="grid grid-cols-1 gap-4">
        {mockResources.slice(0, 3).map((resource) => (
          <MockResourceCard key={resource.id} resource={resource} />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4">
      {resources.map((resource) => (
        <ResourceCard key={resource._id} resource={resource} />
      ))}
    </div>
  );
}
