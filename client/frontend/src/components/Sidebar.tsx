"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Archive,
  Brain,
  Layers,
  BarChart3,
  FlaskConical,
  Sigma,
  Beaker,
  Terminal,
  Settings,
  User,
  FolderOpen,
} from "lucide-react";
import Image from "next/image";
import { userProfile } from "@/lib/mockData";

const navItems = [
  { href: "/", label: "Vault", icon: Archive },
  { href: "/focus-room", label: "Focus Room", icon: Brain },
  { href: "/flashcards", label: "Flashcards", icon: Layers },
  { href: "/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/settings", label: "Settings", icon: Settings },
  { href: "/profile", label: "Profile", icon: User },
];

const folders = [
  { href: "/subjects/physics", label: "Physics", icon: FlaskConical },
  { href: "#", label: "Maths", icon: Sigma },
  { href: "#", label: "Chemistry", icon: Beaker },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="h-screen w-64 fixed left-0 top-0 bg-surface-container-low font-[family-name:var(--font-headline)] antialiased tracking-tight flex flex-col overflow-y-auto z-50">
      <div className="px-6 py-8">
        {/* Brand */}
        <div className="flex items-center gap-3 mb-10">
          <div className="w-8 h-8 rounded bg-primary flex items-center justify-center">
            <Terminal className="w-4 h-4 text-on-primary" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-indigo-400 leading-none">
              The Focused Scholar
            </h1>
            <p className="text-[10px] text-on-surface-variant uppercase tracking-widest mt-1">
              JEE Preparation
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
                className={`flex items-center gap-3 px-3 py-2 rounded-md transition-all duration-200 ${
                  isActive
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

        {/* Folders */}
        <div className="mt-12">
          <h2 className="px-3 text-[11px] font-bold text-on-surface-variant uppercase tracking-wider mb-4">
            Folders
          </h2>
          <div className="space-y-1">
            {folders.map((folder) => {
              const isActive = pathname === folder.href;
              const Icon = folder.icon;
              return (
                <Link
                  key={folder.label}
                  href={folder.href}
                  className={`flex items-center gap-3 px-3 py-2 rounded-md transition-colors duration-200 ${
                    isActive
                      ? "bg-indigo-500/10 text-indigo-400"
                      : "text-slate-400 hover:text-slate-200 hover:bg-surface-bright"
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="text-sm font-medium">{folder.label}</span>
                </Link>
              );
            })}
          </div>
        </div>
      </div>

      {/* User Profile Card */}
      <div className="mt-auto p-4">
        <div className="bg-surface-container rounded-xl p-4 flex items-center gap-3">
          <Image
            src={userProfile.avatarUrl}
            alt="User Avatar"
            width={32}
            height={32}
            className="w-8 h-8 rounded-full bg-surface-bright object-cover"
          />
          <div className="overflow-hidden">
            <p className="text-xs font-semibold text-on-surface truncate">
              {userProfile.name}
            </p>
            <p className="text-[10px] text-on-surface-variant truncate">
              {userProfile.role}
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
}
