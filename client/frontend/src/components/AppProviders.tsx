'use client';

import { AuthProvider } from '@/context/AuthContext';
import { AudioProvider } from '@/context/AudioContext';
import { SearchProvider } from '@/context/SearchContext';
import { Toaster } from 'sonner';
import OnboardingModal from '@/components/OnboardingModal';
import DreamerModal from '@/components/DreamerModal';
import dynamic from 'next/dynamic';

const MathProvider = dynamic(() => import('@/components/MathProvider'), { ssr: false });

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
    </AuthProvider>
  );
}
