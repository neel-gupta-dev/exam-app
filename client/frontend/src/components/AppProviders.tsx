'use client';

import { AuthProvider } from '@/context/AuthContext';
import { AudioProvider } from '@/context/AudioContext';
import { SearchProvider } from '@/context/SearchContext';
import { Toaster } from 'sonner';
import OnboardingModal from '@/components/OnboardingModal';
import DreamerModal from '@/components/DreamerModal';
import dynamic from 'next/dynamic';

const MathProvider = dynamic(() => import('@/components/MathProvider'), { ssr: false });

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
