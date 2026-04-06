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
  const { token } = useAuth();

  // Load immediately when a token is detected, without waiting for full user profile fetch.
  // This ensures the ad script is ready as soon as the user enters the vault.
  if (!token) return null;

  return (
    <Script 
      id="vault-vignette-ad" 
      src="https://n6wxm.com/vignette.min.js"
      data-zone="10841880"
      strategy="afterInteractive"
    />
  );
}
