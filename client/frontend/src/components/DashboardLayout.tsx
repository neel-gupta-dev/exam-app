import Sidebar from "@/components/Sidebar";
import TopNav from "@/components/TopNav";
import ProtectedRoute from "@/components/ProtectedRoute";
import DreamerModal from "@/components/DreamerModal";
import ConfidencePopup from "@/components/ConfidencePopup";
import FocusAudioPlayer from "@/components/FocusAudioPlayer";
import packageInfo from '../../package.json';
import { useAuth } from "@/context/AuthContext";
import { useHaptics } from "@/hooks/useHaptics";
import { useEffect, useRef } from "react";

const version = packageInfo.version;

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user } = useAuth();
  const { vibrateClick } = useHaptics();
  const prevLevelRef = useRef<number | undefined>(user?.levelData?.currentLevel);

  useEffect(() => {
    if (user?.levelData?.currentLevel !== undefined) {
      if (prevLevelRef.current !== undefined && user.levelData.currentLevel > prevLevelRef.current) {
        vibrateClick();
      }
      prevLevelRef.current = user.levelData.currentLevel;
    }
  }, [user?.levelData?.currentLevel]);

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-surface text-on-surface">
        <Sidebar />
        <TopNav />
        <DreamerModal />
        <ConfidencePopup />
        <FocusAudioPlayer />
        <main className="pt-24 pb-8 ml-64 px-8 min-h-screen relative flex flex-col">
          <div className="flex-1">
            {children}
          </div>

          {/* Global Footer Branded Text */}
          <footer className="mt-12 mx-6 py-12 border border-gray-900 bg-black/50 backdrop-blur-sm rounded-3xl shadow-2xl shadow-black/40">
            <div className="max-w-7xl mx-auto px-4 text-center">

              {/* Line 1: The Meta ID (Senior Move: Uses mono font) */}
              <p className="text-xs md:text-sm text-gray-500 font-mono tracking-wider uppercase">
                Vault ID: <span className="text-gray-400">#SYSTEM-ORIGIN</span>
                <span className="mx-3 text-gray-800">|</span>
                Crafted with precision in the <span className="text-blue-400/80">City of Lakes</span>
              </p>

              {/* Line 2: The Personal Signature */}
              <div className="mt-4 flex items-center justify-center gap-2">
                <div className="h-px w-8 bg-gray-800" />
                <p className="text-sm text-gray-400 font-medium">
                  Made with <span className="text-rose-400 animate-heart-beat">❤️</span> by
                  <span className="ml-1 bg-gradient-to-r from-white to-gray-500 bg-clip-text text-transparent hover:to-white transition-all duration-300 cursor-default">
                    Neel Gupta
                  </span>
                </p>
                <div className="h-px w-8 bg-gray-800" />
              </div>

              {/* Optional: Version tag for your Coolify deployments */}
              <p className="mt-6 text-[10px] text-gray-700 uppercase tracking-[0.2em]">
                Vayl v{version} • Academic Integrity Guaranteed
              </p>
            </div>
          </footer>
        </main>
      </div>
    </ProtectedRoute>
  );
}
