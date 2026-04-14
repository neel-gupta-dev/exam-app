import Sidebar from '../components/Sidebar';
import TopNav from '../components/TopNav';

export default function DashboardLayout({ children }) {
  return (
    <div className="dark bg-background text-on-surface h-full w-full">
      <Sidebar />
      <TopNav />
      {/* Main Content Canvas as per code.html */}
      <main className="ml-64 pt-24 px-10 pb-20 min-h-screen">
        {children}
      </main>
    </div>
  );
}
