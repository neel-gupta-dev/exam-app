"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  Archive, Brain, Layers, GraduationCap, Menu, X, 
  User as UserIcon, Settings, BarChart2, BarChart3, 
  FolderLock, Sun, Moon, Lock, LogOut 
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { isDemoAllowedPath } from "@/lib/demo";
import DemoSignupModal from "@/components/DemoSignupModal";
import { motion, AnimatePresence } from "framer-motion";
import api from "@/lib/api";

const primaryNavItems = [
  { href: "/", label: "Vault", icon: Archive },
  { href: "/focus-room", label: "Focus", icon: Brain },
  { href: "/flashcards", label: "Cards", icon: Layers },
  { href: "/classroom", label: "Classroom", icon: GraduationCap },
];

const secondaryNavItems = [
  { href: "/chapters", label: "Chapter List", icon: Layers },
  { href: "/performance", label: "Performance", icon: BarChart2 },
  { href: "/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/settings", label: "Settings", icon: Settings },
  { href: "/profile", label: "Profile", icon: UserIcon },
];

export default function MobileBottomNav() {
  const pathname = usePathname();
  const { user, theme, toggleTheme } = useAuth();
  const isDemo = !user;
  
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [lockedModal, setLockedModal] = useState<{ open: boolean; feature: string }>({ open: false, feature: "" });
  const [folders, setFolders] = useState<string[]>([]);

  // Fetch dynamic folders just like Sidebar when menu opens
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
    
    if (isMenuOpen) {
      fetchFolders();
    }
  }, [isDemo, isMenuOpen]);

  const handleLinkClick = (isLocked: boolean, label: string) => {
    if (isLocked) {
      setLockedModal({ open: true, feature: label });
      return false;
    }
    setIsMenuOpen(false);
    return true;
  };

  return (
    <>
      <nav className="fixed bottom-0 left-0 right-0 z-50 bg-surface/80 backdrop-blur-lg border-t border-outline-variant/10 px-4 py-2 flex md:hidden items-center justify-between pb-safe">
        {primaryNavItems.map((item) => {
          const isActive = pathname === item.href;
          const isLocked = isDemo && !isDemoAllowedPath(item.href);
          const Icon = item.icon;
          const demoHref = isDemo && item.href !== '/' ? `${item.href}?demo=true` : (isDemo && item.href === '/' ? '/?demo=true' : item.href);

          return isLocked ? (
            <button
              key={item.href}
              onClick={() => setLockedModal({ open: true, feature: item.label })}
              className="flex flex-col items-center gap-1 min-w-[3.5rem] transition-colors text-on-surface-variant/40"
            >
              <div className="p-1.5 rounded-xl relative">
                <Icon className="w-6 h-6" strokeWidth={2} />
              </div>
              <span className="text-[10px] font-medium tracking-wide">{item.label}</span>
            </button>
          ) : (
            <Link
              key={item.href}
              href={demoHref}
              className={`flex flex-col items-center gap-1 min-w-[3.5rem] transition-colors ${
                isActive ? "text-primary" : "text-on-surface-variant hover:text-on-surface"
              }`}
            >
              <div className={`p-1.5 rounded-xl transition-all ${isActive ? "bg-indigo-500/20" : ""}`}>
                <Icon className="w-6 h-6" strokeWidth={isActive ? 2.5 : 2} />
              </div>
              <span className={`text-[10px] font-medium tracking-wide ${isActive ? "font-bold" : ""}`}>
                {item.label}
              </span>
            </Link>
          );
        })}

        {/* Menu Button */}
        <button
          onClick={() => setIsMenuOpen(true)}
          className={`flex flex-col items-center gap-1 min-w-[3.5rem] transition-colors text-on-surface-variant hover:text-on-surface`}
        >
          <div className="p-1.5 rounded-xl transition-all">
            <Menu className="w-6 h-6" strokeWidth={2} />
          </div>
          <span className="text-[10px] font-medium tracking-wide">Menu</span>
        </button>
      </nav>

      {/* Full-Screen Menu Drawer */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed inset-0 z-[60] bg-surface flex flex-col md:hidden pb-safe"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-outline-variant/10">
              <h2 className="text-xl font-heading font-black tracking-widest text-on-surface uppercase">Vayl Menu</h2>
              <button onClick={() => setIsMenuOpen(false)} className="p-2 bg-surface-container rounded-full text-on-surface-variant hover:bg-surface-bright transition-colors">
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Menu Content */}
            <div className="flex-1 overflow-y-auto px-6 py-6 space-y-8">
              
              {/* Secondary Navigation */}
              <div className="space-y-3">
                <h3 className="text-[11px] font-bold text-on-surface-variant uppercase tracking-wider mb-2">Core Tools</h3>
                <div className="grid grid-cols-2 gap-3">
                  {secondaryNavItems.map((item) => {
                    const isLocked = isDemo && !isDemoAllowedPath(item.href);
                    const Icon = item.icon;
                    const demoHref = isDemo && item.href !== '/' ? `${item.href}?demo=true` : (isDemo && item.href === '/' ? '/?demo=true' : item.href);

                    return isLocked ? (
                       <button
                        key={item.href}
                        onClick={() => handleLinkClick(true, item.label)}
                        className="flex items-center gap-3 p-3.5 rounded-xl bg-surface-container/50 text-on-surface-variant/50 w-full text-left"
                      >
                        <Icon className="w-5 h-5 shrink-0" />
                        <span className="text-sm font-medium flex-1 truncate">{item.label}</span>
                        <Lock className="w-3 h-3 opacity-50 shrink-0" />
                      </button>
                    ) : (
                      <Link
                        key={item.href}
                        href={demoHref}
                        onClick={() => handleLinkClick(false, item.label)}
                        className="flex items-center gap-3 p-3.5 rounded-xl bg-surface-container hover:bg-surface-bright text-on-surface-variant hover:text-primary transition-colors"
                      >
                        <Icon className="w-5 h-5 shrink-0" />
                        <span className="text-sm font-medium truncate">{item.label}</span>
                      </Link>
                    )
                  })}
                </div>
              </div>

              {/* Dynamic Folders */}
              <div className="space-y-3">
                <h3 className="text-[11px] font-bold text-on-surface-variant uppercase tracking-wider mb-2">My Folders</h3>
                {folders.length === 0 ? (
                  <p className="text-sm text-on-surface-variant italic">No folders yet.</p>
                ) : (
                  <div className="grid grid-cols-2 gap-3">
                    {folders.map((folderName) => {
                      const folderHref = `/subjects/${encodeURIComponent(folderName)}`;
                      const demoHref = isDemo ? `${folderHref}?demo=true` : folderHref;

                      return (
                        <Link
                          key={folderName}
                          href={demoHref}
                          onClick={() => setIsMenuOpen(false)}
                          className="flex items-center gap-3 p-3.5 rounded-xl bg-surface-container hover:bg-surface-bright text-on-surface-variant hover:text-primary transition-colors"
                        >
                          <FolderLock className="w-5 h-5 shrink-0 text-primary/70" />
                          <span className="text-sm font-medium truncate">{folderName}</span>
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* Footer Options */}
            <div className="p-6 border-t border-outline-variant/10 bg-surface-container/30 space-y-3">
              <button
                onClick={toggleTheme}
                className="w-full flex items-center justify-between p-4 bg-surface rounded-xl text-on-surface-variant hover:text-primary transition-colors shadow-sm border border-outline-variant/5"
              >
                <span className="text-sm font-bold uppercase tracking-wider">
                  {theme === 'dark' ? 'Enable Light Mode' : 'Enable Dark Mode'}
                </span>
                {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </button>

              {isDemo && (
                <button 
                  onClick={() => {
                    localStorage.removeItem('vayl_demo_mode');
                    window.location.href = '/';
                  }}
                  className="w-full flex items-center justify-center gap-2 p-4 bg-red-500/10 text-red-500 hover:bg-red-500/20 font-bold text-xs uppercase tracking-wider rounded-xl transition-colors border border-red-500/20"
                >
                  <LogOut className="w-4 h-4 text-red-500" />
                  Exit Demo Mode
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <DemoSignupModal
        isOpen={lockedModal.open}
        onClose={() => setLockedModal({ open: false, feature: "" })}
        feature={lockedModal.feature}
      />
    </>
  );
}
