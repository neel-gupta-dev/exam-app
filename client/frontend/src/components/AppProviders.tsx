'use client';

import { AuthProvider } from '@/context/AuthContext';
import { Toaster } from 'sonner';

export default function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      {children}
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: '#1a2230',
            border: '1px solid rgba(255,255,255,0.05)',
            color: '#e0e0e0',
            fontFamily: 'var(--font-body)',
          },
        }}
        theme="dark"
      />
    </AuthProvider>
  );
}
