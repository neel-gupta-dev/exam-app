'use client';

import { useState } from 'react';

type OS = 'macos' | 'windows' | 'linux' | 'other';

export function useModifierKey() {
  const [os] = useState<OS>(() => {
    if (typeof window === 'undefined') return 'other';
    const platform = window.navigator.platform.toLowerCase();
    if (platform.includes('mac')) {
      return 'macos';
    }
    if (platform.includes('win')) {
      return 'windows';
    }
    if (platform.includes('linux')) {
      return 'linux';
    }
    return 'other';
  });

  const isMac = os === 'macos';
  const modifierKey = isMac ? 'metaKey' : 'ctrlKey';
  const modifierSymbol = isMac ? '⌘' : 'Ctrl';

  return { os, isMac, modifierKey, modifierSymbol };
}
