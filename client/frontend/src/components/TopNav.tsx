import Link from "next/link";
import { Search, Plus, Bell, Settings } from "lucide-react";

export default function TopNav() {
  return (
    <header className="fixed top-0 right-0 h-16 bg-surface flex items-center justify-between px-8 w-[calc(100%-16rem)] ml-auto z-40">
      {/* Search */}
      <div className="flex items-center gap-4 w-1/2">
        <div className="relative w-full max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-on-surface-variant" />
          <input
            type="text"
            placeholder="Command + K to search notes"
            className="w-full bg-surface-container-highest border-none rounded-xl pl-10 pr-4 py-2 text-sm focus:ring-1 focus:ring-primary/50 placeholder:text-outline text-on-surface transition-all outline-none"
          />
          <div className="absolute right-3 top-1/2 -translate-y-1/2 flex gap-1">
            <span className="bg-surface-container rounded px-1.5 py-0.5 text-[10px] text-on-surface-variant font-mono border border-outline-variant/20">
              ⌘
            </span>
            <span className="bg-surface-container rounded px-1.5 py-0.5 text-[10px] text-on-surface-variant font-mono border border-outline-variant/20">
              K
            </span>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-6">
        <button className="bg-indigo-500 hover:opacity-90 transition-all text-white px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Quick Save
        </button>
        <div className="flex items-center gap-4 text-on-surface-variant">
          <button className="hover:text-indigo-300 transition-opacity">
            <Bell className="w-5 h-5" />
          </button>
          <Link href="/settings" className="hover:text-indigo-300 transition-opacity">
            <Settings className="w-5 h-5" />
          </Link>
        </div>
      </div>
    </header>
  );
}
