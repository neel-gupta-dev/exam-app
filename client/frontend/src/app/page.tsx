"use client";

import { useAuth } from "@/context/AuthContext";
import LoadingSkeleton from "@/components/LoadingSkeleton";
import dynamic from "next/dynamic";

const LandingPage = dynamic(() => import('@/components/LandingPage'));
const DashboardView = dynamic(() => import('@/components/DashboardView'), { 
  loading: () => <LoadingSkeleton count={3} /> 
});

export default function HomePage() {
  const { token, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center">
        <LoadingSkeleton count={3} />
      </div>
    );
  }

  // If not logged in, show the stunning public landing page for Adsense and new users
  if (!token) {
    return <LandingPage />;
  }

  // If logged in, show the private dashboard
  return <DashboardView />;
}
