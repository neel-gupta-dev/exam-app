"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/context/AuthContext";
import { useHaptics } from "@/hooks/useHaptics";
import { useActivityTracker } from "@/hooks/useActivityTracker";
import Sidebar from "@/components/Sidebar";
import TopNav from "@/components/TopNav";
import DreamerModal from "@/components/DreamerModal";
import ConfidencePopup from "@/components/ConfidencePopup";
import FocusAudioPlayer from "@/components/FocusAudioPlayer";
import { isDemoAllowedPath } from "@/lib/demo";

/**
 * Inner component that safely calls hooks which require auth context.
 * Split out so AppShell can render it conditionally after token is confirmed.
 */
function AuthenticatedEffects() {
  const { user } = useAuth();
  const { vibrateClick } = useHaptics();
  const prevLevelRef = useRef<number | undefined>(user?.levelData?.currentLevel);

  // Global activity tracking (pings backend to maintain streak)
  useActivityTracker();

  // Fire haptic when user levels up
  useEffect(() => {
    if (user?.levelData?.currentLevel !== undefined) {
      if (
        prevLevelRef.current !== undefined &&
        user.levelData.currentLevel > prevLevelRef.current
      ) {
        vibrateClick();
      }
      prevLevelRef.current = user.levelData.currentLevel;
    }
  }, [user?.levelData?.currentLevel, vibrateClick]);

  return null;
}

/**
 * AppShell — Persistent Application Shell
 *
 * Lives inside the root layout.tsx so it NEVER unmounts between route changes.
 * This is the only correct way in Next.js App Router to keep Sidebar and TopNav
 * visually static while page content transitions.
 *
 * Architecture:
 *   layout.tsx
 *     └── AppProviders
 *           └── AppShell           ← this component (never re-mounts)
 *                 ├── Sidebar      ← static, never animates
 *                 ├── TopNav       ← static, never animates
 *                 ├── overlays     ← global, never re-mount
 *                 └── AnimatePresence
 *                       └── motion.div (key=pathname)  ← only this transitions
 *                             └── {children}           ← page content
 */
export default function AppShell({ children }: { children: React.ReactNode }) {
  const { token } = useAuth();
  const pathname = usePathname();
  const isAuthenticated = !!token;
  
  const [isDemoMode, setIsDemoMode] = useState(false);

  useEffect(() => {
    const handleStorageChange = () => {
      setIsDemoMode(localStorage.getItem('vayl_demo_mode') === 'true');
    };
    handleStorageChange();
    
    // Quick polling interval just to catch when page.tsx sets the item via query param
    const interval = setInterval(handleStorageChange, 500);
    return () => clearInterval(interval);
  }, [pathname]);

  // Show the full shell for authenticated users.
  // For unauthenticated users, show it on demo-allowed paths, EXCEPT the root path '/' 
  // which should only show the shell if 'vayl_demo_mode' is actually active in localStorage
  // (otherwise '/' is the Landing Page and should NOT have the sidebar).
  const isDemoPath = isDemoAllowedPath(pathname);
  const showShell = isAuthenticated || (isDemoPath && (pathname !== '/' || isDemoMode));

  return (
    <>
      {/* ── Persistent shell (auth + demo users) ──────────────────── */}
      {showShell && (
        <>
          {/* Desktop sidebar — fixed position, unaffected by page transitions */}
          <div className="hidden md:block">
            <Sidebar />
          </div>

          {/* Fixed top navigation bar */}
          <TopNav />

          {/* Global overlays — only for authenticated users */}
          {isAuthenticated && (
            <>
              <DreamerModal />
              <ConfidencePopup />
              <FocusAudioPlayer />
              <AuthenticatedEffects />
            </>
          )}
        </>
      )}

      {/* ── Page content with transition ─────────────────────────────── */}
      {/*
        AnimatePresence here wraps ONLY the page children.
        Sidebar/TopNav are SIBLINGS to this, so they are completely
        unaffected by the animation and never flash or reload.
      */}
      <AnimatePresence mode="wait">
        <motion.div
          key={pathname}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
        >
          {children}
        </motion.div>
      </AnimatePresence>
    </>
  );
}
