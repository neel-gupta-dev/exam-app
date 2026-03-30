"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Archive,
  Brain,
  Layers,
  BarChart3,
  Settings,
  User as UserIcon,
  FolderLock,
  GraduationCap,
  BarChart2,
  Calendar,
  Sun,
  Moon
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { useAuth } from "@/context/AuthContext";
import api from "@/lib/api";

const navItems = [
  { href: "/", label: "Vault", icon: Archive },
  { href: "/focus-room", label: "Focus Room", icon: Brain },
  { href: "/flashcards", label: "Flashcards", icon: Layers },
  { href: "/classroom", label: "Classroom", icon: GraduationCap },
  { href: "/performance", label: "Performance", icon: BarChart2 },
  { href: "/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/settings", label: "Settings", icon: Settings },
  { href: "/profile", label: "Profile", icon: UserIcon },
];

/**
 * Main Application Sidebar
 * Primary navigation menu for authenticated routes.
 * Dynamically fetches and displays user-created resource folders.
 */
export default function Sidebar() {
  const pathname = usePathname();
  const { user, theme, toggleTheme } = useAuth();
  const [folders, setFolders] = useState<string[]>([]);

  /**
   * Dynamic Folder Fetching
   * Fetches unique folder names from the user's saved resources.
   * Listens to the global `resourceAdded` event to refresh the folder
   * list immediately after a new Quick Save.
   */
  useEffect(() => {
    const fetchFolders = async () => {
      try {
        const { data } = await api.get('/resources?page=1&limit=100');
        if (data.resources) {
          const uniqueFolders = Array.from(
            new Set(data.resources.map((r: any) => r.folderName).filter(Boolean))
          ) as string[];
          setFolders(uniqueFolders);
        }
      } catch (error) {
        console.error("Failed to fetch folders:", error);
      }
    };
    if (user) {
      fetchFolders();

      const handleResourceAdded = () => fetchFolders();
      window.addEventListener("resourceAdded", handleResourceAdded);
      return () => window.removeEventListener("resourceAdded", handleResourceAdded);
    }
  }, [user]);

  return (
    <aside className="h-screen w-64 fixed left-0 top-0 bg-surface-container-low font-interface antialiased tracking-tight flex flex-col overflow-y-auto z-50">
      <div className="px-6 py-8 flex-1">
        {/* Brand */}
        <div className="flex items-center gap-3 mb-10">
          <div className="w-10 h-10 flex items-center justify-center">
            <Image src="/vayl-logo.png" alt="Vayl Logo" width={32} height={32} className="object-contain" />
          </div>
          <div>
            <Link href="/"><h1 className="text-2xl font-extrabold text-primary font-heading leading-tight tracking-tighter">
              Vayl
            </h1></Link>
            <p className="text-[10px] text-on-surface-variant font-bold uppercase tracking-[0.2em] mt-0.5">
              {user?.targetExam?.[0] || 'Preparation'} • Level {user?.levelData?.currentLevel || 1}
            </p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="space-y-2">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2 rounded-md transition-all duration-200 ${isActive
                  ? "bg-primary/10 text-primary border-l-2 border-primary"
                  : "text-on-surface-variant hover:text-on-surface hover:bg-surface-bright"
                  }`}
              >
                <Icon className="w-5 h-5" />
                <span className="text-sm font-medium">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Dynamic Folders */}
        <div className="mt-12">
          <h2 className="px-3 text-[11px] font-bold text-on-surface-variant uppercase tracking-wider mb-4">
            Folders
          </h2>
          <div className="space-y-1">
            {folders.length === 0 ? (
              <p className="px-3 text-xs text-on-surface-variant italic">No folders yet.</p>
            ) : (
              folders.map((folderName) => {
                const folderHref = `/subjects/${encodeURIComponent(folderName)}`;
                const isActive = pathname === folderHref;
                return (
                  <Link
                    key={folderName}
                    href={folderHref}
                    className={`flex items-center gap-3 px-3 py-2 rounded-md transition-colors duration-200 ${isActive
                      ? "bg-primary/10 text-primary"
                      : "text-on-surface-variant hover:text-on-surface hover:bg-surface-bright"
                      }`}
                  >
                    <FolderLock className="w-5 h-5" />
                    <span className="text-sm font-medium">{folderName}</span>
                  </Link>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Theme Toggle */}
      <div className="px-6 py-2">
        <button
          onClick={toggleTheme}
          className="w-full flex items-center justify-between px-4 py-2 bg-surface-container rounded-xl text-on-surface-variant hover:text-on-surface transition-all group overflow-hidden relative"
        >
          <span className="text-xs font-bold uppercase tracking-wider">
            {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
          </span>
          <AnimatePresence mode="wait">
            {theme === 'dark' ? (
              <motion.div
                key="sun"
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -20, opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <Sun className="w-4 h-4" />
              </motion.div>
            ) : (
              <motion.div
                key="moon"
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -20, opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <Moon className="w-4 h-4" />
              </motion.div>
            )}
          </AnimatePresence>
        </button>
      </div>

      {/* User Profile Card */}
      {
        user && (
          <div className="mt-auto p-4 border-t border-outline-variant/10">
            <div className="bg-surface-container rounded-xl p-4 flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold font-body uppercase shrink-0">
                {user.name.charAt(0)}
              </div>
              <div className="overflow-hidden">
                <p className="text-xs font-semibold text-on-surface truncate">
                  {user.name}
                </p>
                <p className="text-[10px] text-on-surface-variant truncate">
                  {user.email}
                </p>
                {user.vaultId && (
                  <p className="text-[9px] font-mono text-primary/80 mt-1 uppercase tracking-tighter">
                    ID: {user.vaultId}
                  </p>
                )}
              </div>
            </div>
          </div>
        )
      }
    </aside >
  );
}
