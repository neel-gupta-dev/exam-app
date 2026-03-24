import Sidebar from "@/components/Sidebar";
import TopNav from "@/components/TopNav";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-surface text-on-surface">
      <Sidebar />
      <TopNav />
      <main className="pt-24 pb-12 ml-64 px-8 min-h-screen">
        {children}
      </main>
    </div>
  );
}
