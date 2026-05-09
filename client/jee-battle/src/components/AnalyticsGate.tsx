"use client";

import { useEffect, useState } from "react";
import Script from "next/script";
import { Analytics } from "@vercel/analytics/next";

const CONSENT_KEY = "battle_cookie_consent";
const CONSENT_EVENT = "battle-cookie-consent-change";

export { CONSENT_EVENT, CONSENT_KEY };

export default function AnalyticsGate() {
  const [accepted, setAccepted] = useState(false);
  const gaId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;
  const isProd = process.env.NODE_ENV === "production";

  useEffect(() => {
    const updateConsent = () => {
      setAccepted(localStorage.getItem(CONSENT_KEY) === "accepted");
    };

    updateConsent();
    window.addEventListener(CONSENT_EVENT, updateConsent);
    window.addEventListener("storage", updateConsent);

    return () => {
      window.removeEventListener(CONSENT_EVENT, updateConsent);
      window.removeEventListener("storage", updateConsent);
    };
  }, []);

  if (!isProd || !accepted) return null;

  return (
    <>
      {gaId && (
        <>
          <Script
            src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`}
            strategy="afterInteractive"
          />
          <Script id="google-analytics" strategy="afterInteractive">
            {`
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', '${gaId}');
            `}
          </Script>
        </>
      )}
      <Analytics />
    </>
  );
}
