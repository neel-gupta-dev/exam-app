'use client';

import { AuthProvider, useAuth } from '@/context/AuthContext';
import { AudioProvider } from '@/context/AudioContext';
import { SearchProvider } from '@/context/SearchContext';
import { Toaster } from 'sonner';
import OnboardingModal from '@/components/OnboardingModal';
import DreamerModal from '@/components/DreamerModal';
import dynamic from 'next/dynamic';
import { useEffect } from 'react';

const MathProvider = dynamic(() => import('@/components/MathProvider'), { ssr: false });

/**
 * Theme Sync Component
 * Consumes the theme state from AuthContext and applies the necessary CSS classes
 * to the root HTML/Body elements to trigger the Tailwind/CSS variable overrides.
 */
function ThemeWrapper({ children }: { children: React.ReactNode }) {
  const { theme } = useAuth();

  useEffect(() => {
    const root = window.document.documentElement;

    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [theme]);

  return <>{children}</>;
}

/**
 * Global Application Providers
 * Wraps the entire application tree with essential React Contexts:
 * - AuthProvider: Manages user session and authentication tokens.
 * - AudioProvider: Handles global ambient noise & soundscapes for the focus room.
 * - SearchProvider: Manages global search state and results.
 * - MathProvider: Loads KaTeX/MathJax for rendering LaTeX formulas (client-side only).
 * 
 * Also injects global overlays like Toaster (notifications), OnboardingModal, and DreamerModal.
 */
export default function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <ThemeWrapper>
        <AudioProvider>
          <SearchProvider>
            <MathProvider>
              {children}
              <OnboardingModal />
              <DreamerModal />
              <Toaster position="top-right" richColors closeButton />
            </MathProvider>
          </SearchProvider>
        </AudioProvider>
      </ThemeWrapper>
    </AuthProvider>
  );
}
