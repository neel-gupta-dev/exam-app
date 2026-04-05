"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Archive, Brain, Layers, GraduationCap, User as UserIcon, Settings } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { isDemoAllowedPath } from "@/lib/demo";
import DemoSignupModal from "@/components/DemoSignupModal";
import { useState } from "react";

const navItems = [
  { href: "/", label: "Vault", icon: Archive },
  { href: "/focus-room", label: "Focus", icon: Brain },
  { href: "/flashcards", label: "Cards", icon: Layers },
  { href: "/classroom", label: "Classroom", icon: GraduationCap },
  { href: "/profile", label: "Profile", icon: UserIcon },
  { href: "/settings", label: "Settings", icon: Settings },
];

/**
 * Mobile Bottom Navigation
 * Replaces the Sidebar on devices with smaller screens (e.g., phones)
 * to provide easy thumb-level access to core routes.
 * In demo mode (unauthenticated), locked pages show a signup modal.
 */
export default function MobileBottomNav() {
  const pathname = usePathname();
  const { user } = useAuth();
  const isDemo = !user;
  const [lockedModal, setLockedModal] = useState<{ open: boolean; feature: string }>({ open: false, feature: "" });

  return (
    <>
      <nav className="fixed bottom-0 left-0 right-0 z-50 bg-surface/80 backdrop-blur-lg border-t border-outline-variant/10 px-6 py-3 flex md:hidden items-center justify-between pb-safe">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const isLocked = isDemo && !isDemoAllowedPath(item.href);
          const Icon = item.icon;
          
          if (isLocked) {
            return (
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
            );
          }

          const demoHref = isDemo && item.href !== '/' ? `${item.href}?demo=true` : (isDemo && item.href === '/' ? '/?demo=true' : item.href);

          return (
            <Link
              key={item.href}
              href={demoHref}
              className={`flex flex-col items-center gap-1 min-w-[3.5rem] transition-colors ${
                isActive 
                  ? "text-primary" 
                  : "text-on-surface-variant hover:text-on-surface"
              }`}
            >
              <div className={`p-1.5 rounded-xl transition-all ${
                isActive ? "bg-indigo-500/20" : ""
              }`}>
                <Icon className="w-6 h-6" strokeWidth={isActive ? 2.5 : 2} />
              </div>
              <span className={`text-[10px] font-medium tracking-wide ${
                isActive ? "font-bold" : ""
              }`}>
                {item.label}
              </span>
            </Link>
          );
        })}
      </nav>
      <DemoSignupModal
        isOpen={lockedModal.open}
        onClose={() => setLockedModal({ open: false, feature: "" })}
        feature={lockedModal.feature}
      />
    </>
  );
}
