'use client';

import { AuthProvider } from '@/context/AuthContext';
import { AudioProvider } from '@/context/AudioContext';
import { SearchProvider } from '@/context/SearchContext';
import { Toaster } from 'sonner';
import OnboardingModal from '@/components/OnboardingModal';
import DreamerModal from '@/components/DreamerModal';

export default function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <AudioProvider>
        <SearchProvider>
          {children}
          <OnboardingModal />
          <DreamerModal />
          <Toaster position="top-right" richColors closeButton />
        </SearchProvider>
      </AudioProvider>
    </AuthProvider>
  );
}
