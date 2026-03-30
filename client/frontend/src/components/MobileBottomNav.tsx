"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Archive, Brain, Layers, GraduationCap, User as UserIcon, Settings } from "lucide-react";

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
 */
export default function MobileBottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-lg border-t border-white/10 px-6 py-3 flex md:hidden items-center justify-between pb-safe">
      {navItems.map((item) => {
        const isActive = pathname === item.href;
        const Icon = item.icon;
        
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`flex flex-col items-center gap-1 min-w-[3.5rem] transition-colors ${
              isActive 
                ? "text-indigo-400" 
                : "text-slate-500 hover:text-slate-300"
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
  );
}
