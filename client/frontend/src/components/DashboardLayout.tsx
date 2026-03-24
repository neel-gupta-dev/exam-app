import Sidebar from "@/components/Sidebar";
import TopNav from "@/components/TopNav";
import ProtectedRoute from "@/components/ProtectedRoute";
import OnboardingModal from "@/components/OnboardingModal";

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
        <main className="pt-24 pb-12 ml-64 px-8 min-h-screen">
          {children}
        </main>
        <OnboardingModal />
      </div>
    </ProtectedRoute>
  );
}
