'use client';

import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { token, isLoading } = useAuth();
  const router = useRouter();
  const [showRetry, setShowRetry] = useState(false);

  useEffect(() => {
    if (!isLoading && !token) {
      router.push('/login');
    }
  }, [isLoading, token, router]);

  useEffect(() => {
    let timer: any;
    if (isLoading) {
      timer = setTimeout(() => setShowRetry(true), 7000); // Show retry after 7s
    } else {
      setShowRetry(false);
    }
    return () => clearTimeout(timer);
  }, [isLoading]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-surface flex flex-col items-center justify-center gap-6 p-4">
        <div className="w-10 h-10 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        
        {showRetry && (
          <div className="flex flex-col items-center gap-4 animate-fade-in text-center max-w-sm">
            <p className="text-on-surface-variant text-sm">
              Connecting to the Knowledge Vault is taking longer than usual...
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
            <p className="text-[10px] text-outline uppercase tracking-wider mt-4">
              Check if your NEXT_PUBLIC_API_URL is configured correctly.
            </p>
          </div>
        )}
      </div>
    );
  }

  if (!token) return null;

  return <>{children}</>;
}
