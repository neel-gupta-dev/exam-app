'use client';

import { AuthProvider } from '@/context/AuthContext';
import { AudioProvider } from '@/context/AudioContext';
import { Toaster } from 'sonner';
import OnboardingModal from '@/components/OnboardingModal';

export default function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <AudioProvider>
        {children}
        <OnboardingModal />
        <Toaster position="top-right" richColors closeButton />
      </AudioProvider>
    </AuthProvider>
  );
}
