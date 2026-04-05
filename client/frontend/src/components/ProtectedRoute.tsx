'use client';

import { useAuth } from '@/context/AuthContext';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import DemoSignupModal from '@/components/DemoSignupModal';
import { isDemoAllowedPath, DEMO_ALLOWED_PATHS } from '@/lib/demo';

export { DEMO_ALLOWED_PATHS };


export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { token, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const isDemoUrl = searchParams.get('demo') === 'true';
  const [showRetry, setShowRetry] = useState(false);
  const [showLockedModal, setShowLockedModal] = useState(false);

  // Check if the current page is accessible without login (demo mode)
  const isDemoAllowed = isDemoAllowedPath(pathname);

  useEffect(() => {
    let timer: any;
    if (isLoading) {
      timer = setTimeout(() => setShowRetry(true), 7000);
    } else {
      setShowRetry(false);
    }
    return () => clearTimeout(timer);
  }, [isLoading]);

  // Show the "locked" modal then redirect non-authed users away from private pages
  useEffect(() => {
    if (!isLoading && !token) {
      if (!isDemoAllowed) {
        setShowLockedModal(true);
      } else if (pathname !== '/' && !isDemoUrl) {
        // If they are on a sub-page but lack the ?demo=true flag, kick to landing page
        router.push('/');
      }
    }
  }, [isLoading, token, isDemoAllowed, pathname, isDemoUrl, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-surface flex flex-col items-center justify-center gap-6 p-4">
        <div className="w-10 h-10 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        
        {showRetry && (
          <div className="flex flex-col items-center gap-4 animate-fade-in text-center max-w-sm">
             <p className="text-on-surface-variant text-sm">
              Connecting to Vayl is taking longer than usual...
            </p>
            <div className="flex gap-4">
              <button 
                onClick={() => window.location.reload()}
                className="px-4 py-2 bg-primary/10 hover:bg-primary/20 text-primary-fixed rounded-lg text-xs font-bold transition-all"
              >
                Retry Connection
              </button>
              <button 
                onClick={() => router.push('/login')}
                className="px-4 py-2 bg-on-surface-variant/10 hover:bg-on-surface-variant/20 text-on-surface-variant rounded-lg text-xs font-bold transition-all"
              >
                Go to Login
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Authenticated users: full access, render normally
  if (token) {
    return <>{children}</>;
  }

  // Unauthenticated user on a DEMO-ALLOWED page: render with demo data
  if (isDemoAllowed) {
    if (pathname !== '/' && !isDemoUrl) {
      return null; // prevent rendering before redirect happens
    }
    return <>{children}</>;
  }

  // Unauthenticated user on a LOCKED page: show modal then default to landing
  return (
    <>
      {/* Render nothing behind the modal for locked pages */}
      <DemoSignupModal
        isOpen={showLockedModal}
        onClose={() => {
          setShowLockedModal(false);
          router.push('/');
        }}
        feature="this page"
      />
    </>
  );
}
