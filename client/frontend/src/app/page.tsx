/**
 * Home Page (Root /)
 * Acts as an intelligent router determining what the user sees based on their authentication state.
 */
"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import DashboardSkeleton from "@/components/DashboardSkeleton";
import dynamic from "next/dynamic";

/**
 * Dynamically imported heavy components.
 * This ensures that unauthenticated users don't download the large Dashboard bundle,
 * and authenticated users don't download the large LandingPage bundle.
 */
const LandingPage = dynamic(() => import('@/components/LandingPage'));
const DashboardView = dynamic(() => import('@/components/DashboardView'), { 
  loading: () => <DashboardSkeleton /> 
});

export default function HomePage() {
  // Access global authentication state to route the user
  const { token, isLoading } = useAuth();
  
  // Track demo state exclusively on the client
  const [isDemo, setIsDemo] = useState(false);
  const [demoChecked, setDemoChecked] = useState(false);

  useEffect(() => {
    // Check URL query param directly on mount
    const urlParams = new URLSearchParams(window.location.search);
    const hasDemoQuery = urlParams.get('demo') === 'true';
    
    if (hasDemoQuery) {
      localStorage.setItem('vayl_demo_mode', 'true');
      setIsDemo(true);
    } else {
      // If the user manually removes ?demo=true from the URL, immediately exit demo mode
      localStorage.removeItem('vayl_demo_mode');
      setIsDemo(false);
    }
    setDemoChecked(true);
  }, []);

  if (isLoading || !demoChecked) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center">
        <DashboardSkeleton />
      </div>
    );
  }

  // If logged in, OR if user explicitly entered Demo mode, show the private dashboard
  if (token || isDemo) {
    return <DashboardView />;
  }

  // If not logged in and not in demo mode, show the stunning public landing page for Adsense and new users
  return <LandingPage />;
}
