import Sidebar from "@/components/Sidebar";
import TopNav from "@/components/TopNav";
import ProtectedRoute from "@/components/ProtectedRoute";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-surface text-on-surface">
        <Sidebar />
        <TopNav />
        <main className="pt-24 pb-20 ml-64 px-8 min-h-screen relative flex flex-col">
          <div className="flex-1">
            {children}
          </div>

          {/* Global Footer Branded Text */}
          <footer className="mt-20 pb-10 border-t border-white/[0.03] pt-10">
            <h2 className="text-2xl md:text-3xl font-bold text-on-surface opacity-90 max-w-2xl leading-tight">
              Made with <span className="text-rose-400 animate-heart-beat">❤️</span> by Vault team, for aspirants like you.
            </h2>
            <p className="mt-4 text-lg font-medium text-on-surface-variant/50 italic tracking-wide">
              {/* # */}
            </p>
          </footer>
        </main>
      </div>
    </ProtectedRoute>
  );
}
