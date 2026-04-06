'use client';

import { useAuth } from '@/context/AuthContext';
import Script from 'next/script';

/**
 * VaultAdScript Component
 * 
 * Conditionally injects a specialized on-click advertisement script
 * only for authenticated users who are actively browsing their vault.
 * 
 * The script uses a self-invoking function to append the ad tag to the
 * document's body or root element, enabling interactive pop-under/pop-up
 * ads upon user engagement (clicking saved resources).
 */
export default function VaultAdScript() {
  const { user } = useAuth();

  // Load ONLY for logged-in users (excludes Guest/Demo mode where user is null)
  if (!user) return null;

  return (
    <Script id="vault-onclick-ad" strategy="afterInteractive">
      {`
        (function(s){
          s.dataset.zone='10841834';
          s.src='https://al5sm.com/tag.min.js';
        })([document.documentElement, document.body].filter(Boolean).pop().appendChild(document.createElement('script')))
      `}
    </Script>
  );
}
