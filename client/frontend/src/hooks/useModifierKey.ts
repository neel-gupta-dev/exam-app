'use client';

import { useState, useEffect } from 'react';

type OS = 'macos' | 'windows' | 'linux' | 'other';

export function useModifierKey() {
  const [os, setOs] = useState<OS>('other');

  useEffect(() => {
    const platform = window.navigator.platform.toLowerCase();
    if (platform.includes('mac')) {
      setOs('macos');
    } else if (platform.includes('win')) {
      setOs('windows');
    } else if (platform.includes('linux')) {
      setOs('linux');
    } else {
      setOs('other');
    }
  }, []);

  const isMac = os === 'macos';
  const modifierKey = isMac ? 'metaKey' : 'ctrlKey';
  const modifierSymbol = isMac ? '⌘' : 'Ctrl';

  return { os, isMac, modifierKey, modifierSymbol };
}
