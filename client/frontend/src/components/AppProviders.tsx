'use client';

import { AuthProvider } from '@/context/AuthContext';
import { Toaster } from 'sonner';
import OnboardingModal from '@/components/OnboardingModal';

export default function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      {children}
      <OnboardingModal />
      <Toaster position="top-right" richColors closeButton />
    </AuthProvider>
  );
}
