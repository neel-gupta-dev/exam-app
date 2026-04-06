"use client";

import ProtectedRoute from "@/components/ProtectedRoute";
import MobileBottomNav from "@/components/MobileBottomNav";
import Link from "next/link";
import packageInfo from '../../package.json';
import { useSidebar } from "@/hooks/useSidebar";


const version = packageInfo.version;

/**
 * DashboardLayout — Authenticated Page Shell
 *
 * Provides the content area offset/padding for authenticated pages.
 * Sidebar, TopNav, and global overlays are handled by AppShell in layout.tsx
 * and are shared/persistent across all route changes.
 *
 * This component is intentionally thin — it should only contain
 * layout concerns specific to the content area, not the chrome.
 */
export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isCollapsed } = useSidebar();

  return (
    <ProtectedRoute>
      {/* Content area — offset to account for the persistent Sidebar and TopNav from AppShell */}
      <main className={`pt-20 md:pt-24 pb-24 md:pb-8 ml-0 ${isCollapsed ? 'md:ml-20' : 'md:ml-64'} px-4 md:px-8 min-h-screen relative flex flex-col transition-all duration-300`}>
        <div className="flex-1 flex flex-col">
          {children}
        </div>

        {/* Global Footer */}
        <footer className="mt-12 mx-6 py-12 border border-outline-variant/10 bg-surface-container-high/60 backdrop-blur-md rounded-[3rem] shadow-xl shadow-black/5 dark:shadow-black/40">
          <div className="max-w-7xl mx-auto px-4 text-center">
            <p className="text-xs md:text-sm text-on-surface-variant/60 font-mono tracking-wider uppercase">
              Vault ID: <span className="text-on-surface-variant font-bold">#SYSTEM-ORIGIN</span>
              <span className="mx-3 opacity-20">|</span>
              Crafted with precision in the{" "}
              <span className="text-primary font-bold">
                <Link target="_blank" href="https://en.wikipedia.org/wiki/Udaipur">City of Lakes</Link>
              </span>
            </p>

            <div className="mt-4 flex items-center justify-center gap-2">
              <div className="h-px w-8 bg-outline-variant/20" />
              <p className="text-sm text-on-surface-variant font-medium">
                Made with <span className="text-rose-400 animate-heart-beat">❤️</span> by
                <span className="ml-1 text-primary hover:text-primary-dim transition-all duration-300 cursor-default font-black uppercase tracking-tight">
                  Neel Gupta
                </span>
              </p>
              <div className="h-px w-8 bg-outline-variant/20" />
            </div>

            <p className="mt-6 text-[10px] text-on-surface-variant/40 uppercase tracking-[0.2em] font-bold">
              Vayl v{version} • Academic Integrity Guaranteed
            </p>

            <div className="mt-8 flex justify-center gap-6 text-[10px] uppercase tracking-widest font-black text-on-surface-variant/60">
              <Link href="/about" className="hover:text-primary transition-colors">About</Link>
              <Link href="/contact" className="hover:text-primary transition-colors">Contact</Link>
              <Link href="/terms" className="hover:text-primary transition-colors">Terms</Link>
              <Link href="/privacy-policy" className="hover:text-primary transition-colors">Privacy</Link>
            </div>
          </div>
        </footer>
      </main>

      <MobileBottomNav />
    </ProtectedRoute>


  );
}
