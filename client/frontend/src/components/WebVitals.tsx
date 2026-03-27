'use client';

import { useReportWebVitals } from 'next/web-vitals';
import { sendGAEvent } from '@next/third-parties/google';

/**
 * Reports Next.js Web Vitals to Google Analytics.
 * This helps monitor performance metrics like LCP, FID, and CLS.
 */
export function WebVitals() {
  useReportWebVitals((metric) => {
    // Send standard web vitals metrics to GA
    sendGAEvent({
      event: metric.name,
      value: Math.round(metric.name === 'CLS' ? metric.value * 1000 : metric.value),
      label: metric.id,
      non_interaction: true,
    });
  });

  return null;
}
