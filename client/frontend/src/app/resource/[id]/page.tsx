"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams } from "next/navigation";
import api from "@/lib/api";
import Link from "next/link";
import LoadingSkeleton from "@/components/LoadingSkeleton";
import { toast } from "sonner";
import { trackResourceView, event as trackEvent } from "@/lib/analytics";
import {
  ExternalLink,
  Play,
  ChevronRight,
  Home,
  Maximize2,
  Share2,
  Zap,
  Clock,
  Bold,
  Italic,
  Link2,
  ImageIcon,
} from "lucide-react";

interface Resource {
  _id: string;
  type: "video" | "link";
  url: string;
  title?: string;
  folderName?: string;
  createdAt?: string;
}

interface Note {
  _id: string;
  content: string;
  createdAt: string;
  resourceId?: string;
}

// ── YouTube ID extraction ──────────────────────────────────────────────
function extractYouTubeId(url: string): string | null {
  if (!url) return null;
  const re = /(?:youtu\.be\/|youtube(?:-nocookie)?\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=|shorts\/))([\w-]{11})/;
  const m = url.match(re);
  return m ? m[1] : null;
}

function isPdf(url: string): boolean {
  return url.toLowerCase().split(/[?#]/)[0].endsWith(".pdf");
}

function isDirectVideo(url: string): boolean {
  const cleanUrl = url.toLowerCase().split(/[?#]/)[0];
  return cleanUrl.endsWith(".mp4") || cleanUrl.endsWith(".webm") || cleanUrl.endsWith(".ogg");
}


function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours} hours ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
/**
 * Resource Viewer Page
 * Central hub for consuming saved content. Provides specialized viewers for 
 * YouTube videos, PDFs, and generic external links, along with a synchronized
 * note-taking interface.
 */
export default function ResourceViewerPage() {
  const params = useParams();
  const id = params?.id as string;

  const [resource, setResource] = useState<Resource | null>(null);
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [newNote, setNewNote] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [videoTitle, setVideoTitle] = useState<string | null>(null);

  // ── Track session duration for confidence prompt ──────────────────────
  /**
   * Session Duration Tracker
   * Checks if the user spends more than 5 minutes on a single resource.
   * If true, it saves a flag to localStorage to trigger a "confidence rating"
   * modal later in the user flow.
   */
  useEffect(() => {
    const startTime = Date.now();

    return () => {
      const duration = Date.now() - startTime;
      const fiveMinutes = 5 * 60 * 1000;

      if (duration >= fiveMinutes && id) {
        localStorage.setItem("pendingConfidenceRating", id);
      }
    };
  }, [id]);

  // ── Fetch data on mount ──────────────────────────────────────────────
  useEffect(() => {
    if (!id) return;
    const fetchData = async () => {
      try {
        setLoading(true);
        let resData: Resource | null = null;
        let notesData: Note[] = [];

        if (id.startsWith('demo_')) {
          const demoVault = JSON.parse(localStorage.getItem('vayl_demo_vault') || '[]');
          resData = demoVault.find((r: any) => r._id === id) || null;
          if (!resData) throw new Error("Demo resource not found");
          
          const demoNotes = JSON.parse(localStorage.getItem('vayl_demo_notes') || '{}');
          notesData = demoNotes[id] || [];
        } else {
          const [resResp, notesResp] = await Promise.all([
            api.get(`/resources/${id}`),
            api.get(`/notes/${id}`),
          ]);
          resData = resResp.data;
          notesData = Array.isArray(notesResp.data) ? notesResp.data : [];
        }

        setResource(resData);
        setNotes(notesData);

        // Track resource view
        if (resData) {
          trackResourceView(resData.title || "Untitled", resData.type || "link");
        }

        // Fetch YouTube Title if applicable
        if (resData?.url && extractYouTubeId(resData.url)) {
          try {
            const ytResp = await fetch(`https://noembed.com/embed?url=${encodeURIComponent(resData.url)}`);
            if (ytResp.ok) {
              const ytData = await ytResp.json();
              if (ytData.title) {
                setVideoTitle(ytData.title);
              }
            }
          } catch (ytErr) {
            // Silently ignore to prevent console.error from triggering the Next.js dev error overlay
          }
        }
      } catch (err: any) {
        console.error("Failed to fetch resource data:", err);
        toast.error(
          err.response?.data?.error || "Failed to load resource data"
        );
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  // ── Save note (optimistic) ──────────────────────────────────────────
  const handleSaveNote = async () => {
    if (!newNote.trim()) return;
    setIsSubmitting(true);
    const mockId = `temp-${Date.now()}`;
    const noteObj: Note = {
      _id: mockId,
      content: newNote,
      createdAt: new Date().toISOString(),
      resourceId: id,
    };
    setNotes((prev) => [noteObj, ...prev]);
    const savedText = newNote;
    setNewNote("");

    try {
      if (id.startsWith('demo_')) {
        const demoNotesObj = JSON.parse(localStorage.getItem('vayl_demo_notes') || '{}');
        const existingList = demoNotesObj[id] || [];
        demoNotesObj[id] = [noteObj, ...existingList];
        localStorage.setItem('vayl_demo_notes', JSON.stringify(demoNotesObj));
        toast.success("Demo note saved!");
      } else {
        const resp = await api.post("/notes", {
          resourceId: id,
          content: savedText,
        });
        setNotes((prev) =>
          prev.map((n) => (n._id === mockId ? resp.data : n))
        );
        toast.success("Note saved!");
      }

      // Track note creation
      trackEvent({
        action: "note_created",
        category: "study_notes",
        label: resource?.title || "Untitled",
      });
    } catch (err: any) {
      toast.error(err.response?.data?.error || "Failed to save note");
      setNotes((prev) => prev.filter((n) => n._id !== mockId));
      setNewNote(savedText);
    } finally {
      setIsSubmitting(false);
    }
  };

  // ── Media Viewer ─────────────────────────────────────────────────────
  /**
   * Primary Media Viewer Renderer
   * Dynamically selects the best rendering method based on the resource URL:
   * 1. YouTube embeds without cookies.
   * 2. Direct PDF iframes.
   * 3. Generic sandboxed iframes for arbitrary web links.
   */
  const renderViewer = () => {
    if (!resource) return null;

    // Always try YouTube extraction first regardless of stored type
    const vid = extractYouTubeId(resource.url);
    if (vid) {
      return (
        <div className="relative aspect-video rounded-xl overflow-hidden bg-surface-container-highest group">
          <iframe
            className="w-full h-full"
            src={`https://www.youtube-nocookie.com/embed/${vid}`}
            title="YouTube video player"
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            referrerPolicy="strict-origin-when-cross-origin"
            allowFullScreen
          />
          {/* Bottom gradient overlay with title */}
          <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/80 to-transparent pointer-events-none">
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-bold font-headline tracking-tight text-white">
                {resource.title || "Video Resource"}
              </h1>
            </div>
          </div>
          {/* Open in new tab */}
          <div className="absolute top-4 right-4 flex gap-2">
            <a
              href={resource.url}
              target="_blank"
              rel="noreferrer"
              className="bg-surface-bright/20 backdrop-blur-md p-2 rounded-lg hover:bg-surface-bright/40 transition-colors"
            >
              <ExternalLink className="w-5 h-5 text-white" />
            </a>
          </div>
        </div>
      );
    }

    // Direct Video (mp4, webm, etc)
    if (isDirectVideo(resource.url)) {
      return (
        <div className="relative aspect-video rounded-xl overflow-hidden bg-black group flex items-center justify-center border border-white/10 shadow-2xl">
          <video
            className="w-full h-full outline-none"
            src={resource.url}
            controls
          />
          {/* Bottom gradient overlay with title (hides when user interacts with video) */}
          <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/80 to-transparent pointer-events-none transition-opacity duration-300 opacity-100 group-hover:opacity-0 focus-within:opacity-0">
            <h1 className="text-2xl font-bold font-headline tracking-tight text-white mb-2">
              {resource.title || "Video Resource"}
            </h1>
          </div>
          {/* Open in new tab */}
          <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <a href={resource.url} target="_blank" rel="noreferrer" className="bg-black/40 backdrop-blur-md p-2 rounded-lg hover:bg-black/60 transition-colors">
              <ExternalLink className="w-5 h-5 text-white" />
            </a>
          </div>
        </div>
      );
    }

    // PDF Reader
    if (isPdf(resource.url)) {
      return (
        <div className="relative w-full h-[110vh] rounded-2xl overflow-hidden bg-surface-container-highest border border-outline-variant/10 shadow-2xl">
          <iframe
            src={`${resource.url}#view=FitH`}
            className="w-full h-full"
            title={resource.title || "PDF Resource"}
          />
          {/* Floating Actions for PDF */}
          <div className="absolute bottom-6 right-6 flex flex-col gap-3">
            <a
              href={resource.url}
              download
              className="bg-surface-bright/80 backdrop-blur-md p-4 rounded-2xl hover:bg-surface-bright transition-all shadow-xl shadow-black/20 group/btn"
              title="Download PDF"
            >
              <Download className="w-6 h-6 text-on-surface group-hover/btn:scale-110 active:scale-95 transition-transform" />
            </a>
            <a
              href={resource.url}
              target="_blank"
              rel="noreferrer"
              className="bg-surface-bright/80 backdrop-blur-md p-4 rounded-2xl hover:bg-surface-bright transition-all shadow-xl shadow-black/20 group/btn"
              title="Open in new tab"
            >
              <ExternalLink className="w-6 h-6 text-on-surface group-hover/btn:scale-110 active:scale-95 transition-transform" />
            </a>
          </div>
        </div>
      );
    }

    // Explicit Fallback for Non-Embeddable YouTube Links (like channels/playlists without a specific video ID) 
    // This prevents Chrome from showing the generic 'sad face' block icon for X-Frame-Options violations. 
    if (resource.url && (resource.url.includes("youtube.com") || resource.url.includes("youtu.be"))) {
       return (
         <div className="relative aspect-video rounded-xl overflow-hidden bg-surface-container-highest group flex flex-col items-center justify-center p-6 text-center border border-white/10 shadow-2xl">
           <div className="w-16 h-16 rounded-full bg-surface-variant flex items-center justify-center mb-4 text-on-surface-variant group-hover:text-primary transition-colors">
              <ExternalLink className="w-8 h-8" />
           </div>
           <h2 className="text-xl font-bold text-on-surface mb-2">YouTube Content Requires External Viewing</h2>
           <p className="text-sm text-on-surface-variant max-w-sm mb-6">
             Due to YouTube's strict embed policies, this specific link type (like a channel, playlist, or search result) must be opened directly.
           </p>
           <a
             href={resource.url}
             target="_blank"
             rel="noreferrer"
             className="px-6 py-3 bg-primary text-on-primary font-bold rounded-xl shadow-lg shadow-primary/20 hover:scale-105 active:scale-95 transition-all"
           >
             Open in YouTube
           </a>
         </div>
       );
    }

    // Default for 'link' type or un-parsed video
    return (
      <div className="relative aspect-video rounded-xl overflow-hidden bg-surface-container-highest group">
        <iframe
          className="w-full h-full"
          src={resource.url}
          title="External Resource"
          sandbox="allow-same-origin allow-scripts allow-forms allow-popups"
        />
        {/* Bottom gradient overlay with title */}
        <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/80 to-transparent pointer-events-none">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold font-headline tracking-tight text-white">
              {resource.title || "External Resource"}
            </h1>
            <a
              href={resource.url}
              target="_blank"
              rel="noreferrer"
              className="pointer-events-auto bg-surface-bright/20 backdrop-blur-md p-2 rounded-lg hover:bg-surface-bright/40 transition-colors"
            >
              <Maximize2 className="w-5 h-5 text-white" />
            </a>
          </div>
        </div>
        {/* Prominent fallback */}
        <div className="absolute top-4 right-4">
          <a
            href={resource.url}
            target="_blank"
            rel="noreferrer"
            className="bg-primary text-on-primary text-xs font-bold px-4 py-2 rounded-lg shadow-lg shadow-primary/20 hover:scale-105 transition-transform"
          >
            Open Original Link
          </a>
        </div>
      </div>
    );
  };

  // ── Loading / Error states ───────────────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-screen bg-surface text-on-surface font-body selection:bg-primary/30">
        <main className="ml-0 md:ml-64 pt-20 px-6 pb-12 min-h-screen w-full">
          <LoadingSkeleton />
        </main>
      </div>
    );
  }

  if (!resource) {
    return (
      <div className="min-h-screen bg-surface text-on-surface font-body selection:bg-primary/30">
        <main className="ml-0 md:ml-64 pt-20 px-6 pb-12 min-h-screen w-full flex items-center justify-center">
          <div className="text-center text-on-surface-variant">
            <ExternalLink className="w-12 h-12 mb-4 opacity-50 mx-auto" />
            <h2 className="text-xl font-headline font-bold">
              Resource Not Found
            </h2>
            <p className="text-sm mt-2 opacity-80">
              The requested resource could not be loaded.
            </p>
          </div>
        </main>
      </div>
    );
  }

  // ── Main render ──────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-surface text-on-surface font-body selection:bg-primary/30">
      {/* Sidebar and TopNav are provided by AppShell in layout.tsx */}
      <main className="md:ml-64 pt-20 px-6 pb-12 min-h-screen flex-1">
        <div className="max-w-[1400px] mx-auto">
          {/* Breadcrumbs */}
          <nav className="flex items-center gap-2 mb-6 text-sm">
            <Link
              href="/"
              className="text-on-surface-variant hover:text-primary transition-colors flex items-center gap-1"
            >
              <Home className="w-3 h-3" />
              Vault
            </Link>
            <ChevronRight className="w-3 h-3 text-outline-variant" />
            {resource.folderName && (
              <>
                <Link
                  href={`/subjects/${resource.folderName}`}
                  className="text-on-surface-variant hover:text-primary transition-colors"
                >
                  {resource.folderName}
                </Link>
                <ChevronRight className="w-3 h-3 text-outline-variant" />
              </>
            )}
            <span className="text-on-surface font-semibold truncate max-w-xs">
              {resource.title || "Resource"}
            </span>
          </nav>

          {/* ── 12-column grid ────────────────────────────────────── */}
          <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">
            {/* Center Column: Viewer + Notes (8 cols) */}
            <div className="xl:col-span-8 space-y-8">
              {/* Embedded Viewer */}
              {renderViewer()}

              {/* Notes Section */}
              <section className="bg-surface-container p-8 rounded-xl">
                <div className="flex items-center justify-between mb-8">
                  <h2 className="text-xl font-bold font-headline flex items-center gap-2">
                    <span className="text-primary">≡</span>
                    Active Study Notes
                  </h2>
                  <div className="flex gap-2">
                    <button className="text-xs bg-surface-variant text-on-surface-variant px-3 py-1.5 rounded-lg hover:bg-primary-container hover:text-white transition-colors">
                      Export PDF
                    </button>
                    <button className="text-xs bg-surface-variant text-on-surface-variant px-3 py-1.5 rounded-lg hover:bg-primary-container hover:text-white transition-colors">
                      Sync to Obsidian
                    </button>
                  </div>
                </div>

                {/* Notes List */}
                <div className="space-y-6 mb-8">
                  {notes.length === 0 ? (
                    <p className="text-sm text-on-surface-variant italic text-center py-6">
                      No notes yet. Capture your first insight below.
                    </p>
                  ) : (
                    notes.map((note) => (
                      <div key={note._id} className="flex gap-4 group">
                        <span className="text-xs font-mono text-primary bg-primary/10 px-2 py-1 rounded h-fit mt-1">
                          {new Date(note.createdAt).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                        <div>
                          <p className="text-on-surface leading-relaxed whitespace-pre-wrap">
                            {note.content}
                          </p>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {/* Quick Note Input */}
                <div className="bg-surface-container-highest p-4 rounded-xl">
                  <textarea
                    value={newNote}
                    onChange={(e) => setNewNote(e.target.value)}
                    className="w-full bg-transparent border-none focus:ring-0 text-sm resize-none h-24 text-on-surface placeholder:text-outline-variant outline-none"
                    placeholder="Capture a quick note or key insight..."
                  />
                  <div className="flex items-center justify-between mt-2 pt-4 border-t border-outline-variant/10">
                    <div className="flex gap-2">
                      <button className="p-1.5 text-outline-variant hover:text-primary transition-colors">
                        <Bold className="w-4 h-4" />
                      </button>
                      <button className="p-1.5 text-outline-variant hover:text-primary transition-colors">
                        <Italic className="w-4 h-4" />
                      </button>
                      <button className="p-1.5 text-outline-variant hover:text-primary transition-colors">
                        <Link2 className="w-4 h-4" />
                      </button>
                      <button className="p-1.5 text-outline-variant hover:text-primary transition-colors">
                        <ImageIcon className="w-4 h-4" />
                      </button>
                    </div>
                    <button
                      onClick={handleSaveNote}
                      disabled={isSubmitting || !newNote.trim()}
                      className="bg-primary text-on-primary px-6 py-2 rounded-lg text-sm font-bold shadow-lg shadow-primary/20 hover:scale-105 transition-transform disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isSubmitting ? "Saving..." : "Save Note"}
                    </button>
                  </div>
                </div>
              </section>
            </div>

            {/* Right Column: Metadata & Details (4 cols) */}
            <aside className="xl:col-span-4 space-y-6">
              {/* Metadata Card */}
              <div className="bg-surface-container-low p-6 rounded-xl space-y-6">
                <h3 className="text-sm font-bold text-outline-variant uppercase tracking-widest">
                  Resource Metadata
                </h3>
                <div className="space-y-4">
                  {resource.folderName && (
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-on-surface-variant">
                        Subject
                      </span>
                      <span className="text-sm font-semibold text-primary bg-primary/10 px-3 py-1 rounded-full">
                        {resource.folderName}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-on-surface-variant">
                      Type
                    </span>
                    <span className="text-sm font-semibold capitalize">
                      {resource.type === "video"
                        ? "Video Lecture"
                        : isPdf(resource.url) ? "PDF Document" : "Web Link"}
                    </span>
                  </div>
                  {videoTitle && (
                    <div className="flex flex-col gap-1 pt-2 border-t border-outline-variant/10">
                      <span className="text-xs text-on-surface-variant uppercase font-bold tracking-wider">
                        Source Title
                      </span>
                      <p className="text-sm font-medium leading-normal text-on-surface line-clamp-2">
                        {videoTitle}
                      </p>
                    </div>
                  )}
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-on-surface-variant">
                      Date Added
                    </span>
                    <span className="text-sm font-semibold">
                      {resource.createdAt
                        ? new Date(resource.createdAt).toLocaleDateString(
                          "en-US",
                          {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          }
                        )
                        : "N/A"}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-on-surface-variant">
                      Last Viewed
                    </span>
                    <span className="text-sm font-semibold">
                      {resource.createdAt
                        ? timeAgo(resource.createdAt)
                        : "N/A"}
                    </span>
                  </div>
                </div>

                <div className="pt-4">
                  <button className="w-full flex items-center justify-center gap-2 bg-surface-container-highest py-3 rounded-xl text-on-surface hover:bg-surface-bright transition-colors">
                    <Share2 className="w-4 h-4" />
                    <span className="text-sm font-medium">Collaborate</span>
                  </button>
                </div>
              </div>




              {/* Open Original Link (prominent fallback) */}
              <a
                href={resource.url}
                target="_blank"
                rel="noreferrer"
                className="block w-full text-center bg-surface-container-low py-3 rounded-xl text-on-surface-variant hover:text-primary hover:bg-surface-container transition-colors text-sm font-medium"
              >
                <span className="flex items-center justify-center gap-2">
                  <ExternalLink className="w-4 h-4" />
                  Open Original Link in New Tab
                </span>
              </a>
            </aside>
          </div>
        </div>
      </main>
    </div>
  );
}
