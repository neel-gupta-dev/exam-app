"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Archive,
  Brain,
  Layers,
  BarChart3,
  Terminal,
  Settings,
  User as UserIcon,
  FolderLock
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import api from "@/lib/api";

const navItems = [
  { href: "/", label: "Vault", icon: Archive },
  { href: "/focus-room", label: "Focus Room", icon: Brain },
  { href: "/flashcards", label: "Flashcards", icon: Layers },
  { href: "/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/settings", label: "Settings", icon: Settings },
  { href: "/profile", label: "Profile", icon: UserIcon },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { user } = useAuth();
  const [folders, setFolders] = useState<string[]>([]);

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
    <aside className="h-screen w-64 fixed left-0 top-0 bg-surface-container-low font-[family-name:var(--font-headline)] antialiased tracking-tight flex flex-col overflow-y-auto z-50">
      <div className="px-6 py-8 flex-1">
        {/* Brand */}
        <div className="flex items-center gap-3 mb-10">
          <div className="w-8 h-8 rounded bg-primary flex items-center justify-center">
            <Terminal className="w-4 h-4 text-on-primary" />
          </div>
          <div>
            <Link href="/"><h1 className="text-lg font-bold text-indigo-400 leading-none">
              Knowledge Vault
            </h1></Link>
            <p className="text-[10px] text-on-surface-variant uppercase tracking-widest mt-1">
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
                  ? "bg-indigo-500/10 text-indigo-400 border-l-2 border-indigo-500"
                  : "text-slate-400 hover:text-slate-200 hover:bg-surface-bright"
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
                      ? "bg-indigo-500/10 text-indigo-400"
                      : "text-slate-400 hover:text-slate-200 hover:bg-surface-bright"
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
              </div>
            </div>
          </div>
        )
      }
    </aside >
  );
}
