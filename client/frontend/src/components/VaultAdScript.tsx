'use client';

import { useAuth } from '@/context/AuthContext';
import Script from 'next/script';

/**
 * VaultAdScript Component
 *
 * Conditionally injects the vignette ad script only for authenticated users.
 * The script pre-loads on the dashboard so it is ready to intercept resource
 * link clicks and display an interstitial ad before navigation.
 */
export default function VaultAdScript() {
  const { token } = useAuth();

  // Only inject for authenticated sessions
  if (!token) return null;

  return (
    <Script id="vault-vignette-ad" strategy="afterInteractive">
      {`(function(s){s.dataset.zone='10841880',s.src='https://n6wxm.com/vignette.min.js'})([document.documentElement, document.body].filter(Boolean).pop().appendChild(document.createElement('script')))`}
    </Script>
  );
}
