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
  Sun,
  Moon,
  Lock,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { useAuth } from "@/context/AuthContext";
import api from "@/lib/api";
import { isDemoAllowedPath } from "@/lib/demo";
import DemoSignupModal from "@/components/DemoSignupModal";
import { useSidebar } from "@/hooks/useSidebar";

const navItems = [
  { href: "/", label: "Vault", icon: Archive },
  { href: "/focus-room", label: "Focus Room", icon: Brain },
  { href: "/flashcards", label: "Flashcards", icon: Layers },
  { href: "/cheatsheet", label: "Cheatsheet", icon: Layers }, // Or another appropriate icon
  { href: "/classroom", label: "Classroom", icon: GraduationCap },
  { href: "/performance", label: "Performance", icon: BarChart2 },
  { href: "/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/settings", label: "Settings", icon: Settings },
  { href: "/profile", label: "Profile", icon: UserIcon },
];

/** Demo persona shown in the sidebar when no user is logged in */
const DEMO_USER = {
  name: "Alex Chen",
  email: "demo@vayl.in",
  level: 7,
  exam: "SAT",
};

/**
 * Main Application Sidebar
 * Primary navigation menu for authenticated and demo-mode routes.
 * Dynamically fetches and displays user-created resource folders.
 * In demo mode (unauthenticated), shows lock icons on restricted pages.
 */
export default function Sidebar() {
  const pathname = usePathname();
  const { user, theme, toggleTheme } = useAuth();
  const { isCollapsed, toggleSidebar } = useSidebar();
  const [folders, setFolders] = useState<string[]>([]);
  const [lockedModal, setLockedModal] = useState<{ open: boolean; feature: string }>({
    open: false,
    feature: "",
  });

  const isDemo = !user;

  /**
   * Dynamic Folder Fetching
   * Skipped in demo mode — demo users see static demo folders.
   */
  useEffect(() => {
    const fetchFolders = async () => {
      if (isDemo) {
        const demoVault = JSON.parse(localStorage.getItem('vayl_demo_vault') || '[]');
        const staticFolders = ["Biology", "Physics", "Mathematics", "Chemistry"];
        const dynamicFolders = Array.from(new Set(demoVault.map((r: any) => r.folderName).filter(Boolean))) as string[];
        setFolders([...new Set([...staticFolders, ...dynamicFolders])]);
        return;
      }
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
    
    // Always call fetchFolders. It will inherently handle the isDemo bypass internally.
    fetchFolders();

    const handleResourceAdded = () => fetchFolders();
    window.addEventListener("resourceAdded", handleResourceAdded);
    return () => window.removeEventListener("resourceAdded", handleResourceAdded);
  }, [isDemo]);

  const displayUser = user ?? DEMO_USER;

  return (
    <>
      <aside className={`fixed left-0 top-0 h-screen ${isCollapsed ? 'w-20' : 'w-56 lg:w-64'} bg-surface border-r border-outline-variant/10 flex flex-col z-50 hidden md:flex transition-all duration-300 overflow-y-auto overflow-x-hidden`}>
        <div className="p-4 flex-1">
          {/* Brand & Toggle */}
          <div className={`flex items-center ${isCollapsed ? 'justify-center' : 'justify-between'} mb-10`}>
            {/* Branding - Only clearly visible when expanded */}
            {!isCollapsed && (
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-xl group hover:bg-primary/20 transition-all duration-300">
                  <Image 
                    src="/vayl-logo.png" 
                    alt="Vayl" 
                    width={24} 
                    height={24} 
                    className="object-contain" 
                  />
                </div>
                <div>
                  <Link href="/">
                    <h1 className="text-xl font-heading font-black tracking-tighter text-on-surface">VAYL</h1>
                  </Link>
                  <p className="text-[10px] text-on-surface-variant font-bold uppercase tracking-[0.2em] mt-0.5">
                    {user?.targetExam?.[0] || DEMO_USER.exam} • Level {user?.levelData?.currentLevel || DEMO_USER.level}
                  </p>
                </div>
              </div>
            )}
            
            {/* Toggle Button */}
            <button
              onClick={toggleSidebar}
              className={`p-2 rounded-xl text-on-surface-variant hover:bg-surface-bright transition-colors ${isCollapsed ? 'bg-primary/10 hover:bg-primary/20 text-primary' : ''}`}
            >
              {isCollapsed ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
            </button>
          </div>

          {/* Demo Banner */}
          {isDemo && (
            <div className={`mb-6 ${isCollapsed ? 'mx-auto w-10 h-10 justify-center px-0' : 'px-3 py-2.5'} bg-primary/10 border border-primary/20 rounded-xl flex items-center gap-2`}>
              <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse shrink-0" />
              {!isCollapsed && <span className="text-[10px] font-black uppercase tracking-widest text-primary truncate">Demo Mode</span>}
            </div>
          )}

          {/* Navigation */}
          <nav className="space-y-1">
            {(() => {
              const displayNavItems = [...navItems];
              // Unconditionally show Chapter List under Vault
              displayNavItems.splice(1, 0, { href: "/chapters", label: "Chapter List", icon: Layers });
              return displayNavItems.map((item) => {
                if (item.label === "Strategic Calendar") return null;
                const isActive = pathname === item.href;
                const isLocked = isDemo && !isDemoAllowedPath(item.href);
                const Icon = item.icon;

                if (isLocked) {
                  return (
                    <button
                      key={item.href}
                      onClick={() => setLockedModal({ open: true, feature: item.label })}
                      className={`w-full flex items-center ${isCollapsed ? 'justify-center p-2' : 'gap-3 px-3 py-2'} rounded-md transition-all duration-200 text-on-surface-variant/40 hover:text-on-surface-variant hover:bg-surface-bright cursor-pointer`}
                      title={isCollapsed ? item.label : undefined}
                    >
                      <Icon className="w-5 h-5 shrink-0" />
                      {!isCollapsed && <span className="text-sm font-medium flex-1 text-left">{item.label}</span>}
                      {!isCollapsed && <Lock className="w-3.5 h-3.5 opacity-50 shrink-0" />}
                    </button>
                  );
                }

                const demoHref = isDemo && item.href !== '/' ? `${item.href}?demo=true` : (isDemo && item.href === '/' ? '/?demo=true' : item.href);

                return (
                  <Link
                    key={item.href}
                    href={demoHref}
                    className={`flex items-center ${isCollapsed ? 'justify-center p-2' : 'gap-3 px-3 py-2'} rounded-md transition-all duration-200 ${isActive
                      ? "bg-primary/10 text-primary border-l-2 border-primary"
                      : "text-on-surface-variant hover:text-on-surface hover:bg-surface-bright"
                      }`}
                    title={isCollapsed ? item.label : undefined}
                  >
                    <Icon className="w-5 h-5 shrink-0" />
                    {!isCollapsed && <span className="text-sm font-medium truncate">{item.label}</span>}
                  </Link>
                );
              });
            })()}
          </nav>

          {/* Dynamic Folders */}
          <div className="mt-12">
            {!isCollapsed && (
              <h2 className="px-3 text-[11px] font-bold text-on-surface-variant uppercase tracking-wider mb-4">
                Folders
              </h2>
            )}
            <div className="space-y-1">
              {folders.length === 0 ? (
                !isCollapsed && <p className="px-3 text-xs text-on-surface-variant italic">No folders yet.</p>
              ) : (
                folders.map((folderName) => {
                  const folderHref = `/subjects/${encodeURIComponent(folderName)}`;
                  const isActive = pathname === folderHref;
                  const demoHref = isDemo ? `${folderHref}?demo=true` : folderHref;
                  return (
                    <Link
                      key={folderName}
                      href={demoHref}
                      className={`flex items-center ${isCollapsed ? 'justify-center p-2' : 'gap-3 px-3 py-2'} rounded-md transition-colors duration-200 ${isActive
                        ? "bg-primary/10 text-primary"
                        : "text-on-surface-variant hover:text-on-surface hover:bg-surface-bright"
                        }`}
                      title={isCollapsed ? folderName : undefined}
                    >
                      <FolderLock className="w-5 h-5 shrink-0" />
                      {!isCollapsed && <span className="text-sm font-medium truncate">{folderName}</span>}
                    </Link>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* Theme Toggle */}
        <div className="p-4">
          <button
            onClick={toggleTheme}
            className={`w-full flex items-center ${isCollapsed ? 'justify-center p-2' : 'justify-between px-4 py-2'} bg-surface-container rounded-xl text-on-surface-variant hover:text-on-surface transition-all group overflow-hidden relative shadow-inner`}
            title={isCollapsed ? (theme === 'dark' ? 'Light Mode' : 'Dark Mode') : undefined}
          >
            {!isCollapsed && (
              <span className="text-xs font-bold uppercase tracking-wider">
                {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
              </span>
            )}
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
        <div className="mt-auto p-4 border-t border-outline-variant/10">
          {isDemo && !isCollapsed && (
            <button 
              onClick={() => {
                localStorage.removeItem('vayl_demo_mode');
                window.location.href = '/';
              }}
              className="w-full mb-3 py-2 bg-red-500/10 text-red-500 hover:bg-red-500/20 hover:text-red-400 font-bold text-xs uppercase tracking-wider rounded-xl transition-colors border border-red-500/20 flex flex-col items-center justify-center gap-1"
            >
              Exit Demo
            </button>
          )}
          {isDemo && isCollapsed && (
            <button 
              onClick={() => {
                localStorage.removeItem('vayl_demo_mode');
                window.location.href = '/';
              }}
              className="w-full mb-3 p-2 bg-red-500/10 text-red-500 hover:bg-red-500/20 hover:text-red-400 rounded-xl transition-colors flex items-center justify-center"
              title="Exit Demo"
            >
              Exit
            </button>
          )}
          
          <div className={`bg-surface-container rounded-xl ${isCollapsed ? 'p-2 justify-center' : 'p-4'} flex items-center gap-3 ${isDemo ? 'border border-primary/10' : ''}`}>
            <div className="w-8 h-8 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold font-body uppercase shrink-0">
              {displayUser.name.charAt(0)}
            </div>
            {!isCollapsed && (
              <div className="overflow-hidden">
                <p className="text-xs font-semibold text-on-surface truncate">
                  {displayUser.name}
                  {isDemo && <span className="ml-1 text-[9px] font-black text-primary uppercase tracking-wider">Demo</span>}
                </p>
                <p className="text-[10px] text-on-surface-variant truncate">
                  {displayUser.email}
                </p>
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* Locked page modal */}
      <DemoSignupModal
        isOpen={lockedModal.open}
        onClose={() => setLockedModal({ open: false, feature: "" })}
        feature={lockedModal.feature}
      />
    </>
  );
}
