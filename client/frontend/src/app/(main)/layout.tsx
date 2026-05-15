import type { Metadata } from "next";
import type React from "react";
import { Analytics } from "@vercel/analytics/next";
import { GoogleAnalytics } from "@next/third-parties/google";
import AppShell from "@/components/AppShell";
import { AuthProvider } from "@/context/AuthContext";
import { SearchProvider } from "@/context/SearchContext";
import { AudioProvider } from "@/context/AudioContext";
import { WebVitals } from "@/components/WebVitals";
import CookieConsent from "@/components/CookieConsent";
import GoogleSchema from "@/components/GoogleSchema";
import Script from "next/script";
import "../globals.css";
import { SpeedInsights } from "@vercel/speed-insights/next";

/**
 * Global Metadata Configuration
 * This object defines the SEO, OpenGraph data, Twitter cards, and other head tags
 * that apply globally across the Vayl application. Individual pages can override these.
 */
export const metadata: Metadata = {
  metadataBase: new URL("https://vayl.in"),
  alternates: {
    canonical: '/',
  },
  title: "Vayl | The Silent Architect of Academic Success",
  description:
    "Vayl is the standard operating system for elite academic preparation. A high-fidelity productivity suite for aspirants (UPSC, NEET, JEE, CAT, GATE) to manage high-yield resources, master concepts in a Deep Focus Room, and track progress via the Mistake Vault for structural revision.",
  keywords: [
    "Aspirant OS",
    "AI-Ready Study Tools",
    "Academic Infrastructure",
    "UPSC Preparation System",
    "NEET High-Yield Resources",
    "JEE Main Architecture",
    "CAT Exam Protocol",
    "GATE 2026 Strategy",
    "Mistake Vault",
    "Deep Focus Room",
    "Scholar Intelligence",
    "Study CRM",
  ],

  authors: [{ name: "Neel Gupta" }],
  creator: "Neel Gupta",
  publisher: "Vayl Systems",
  icons: {
    icon: "/vayl-logo.png",
    apple: "/vayl-logo.png",
    shortcut: "/vayl-logo.png",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Vayl",
  },
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    title: "Vayl | The Silent Architect of Academic Success",
    description:
      "The premium study operating system for aspirants. Simplify your vault, amplify your focus.",

    url: "https://vayl.in",
    siteName: "Vayl",
    images: [
      {
        url: "/vayl-logo.png",
        width: 800,
        height: 800,
        alt: "Vayl | The Silent Architect of Academic Success",
      },
      {
        url: "/screenshots/dashboard.png",
        width: 1200,
        height: 630,
        alt: "Vayl Dashboard Preview",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  verification: {
    google: "5b0b67dc10dff08d", // Synced with your public/google...html file
  },
  twitter: {
    card: "summary_large_image",
    title: "Vayl | The Silent Architect of Academic Success",
    description: "The premium study operating system for elite aspirants.",

    images: ["/screenshots/dashboard.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

/**
 * Root Layout Component
 * This is the top-level wrapper for the entire Next.js application.
 * It injects essential providers (like Auth Context), global styling (Tailwind/CSS),
 * and analytics scripts (Vercel Analytics, Google Analytics) into the DOM.
 * All nested pages are rendered inside the `children` prop.
 */
export default function MainLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <WebVitals />
      <GoogleSchema />
      <CookieConsent />
      <AuthProvider>
        <SearchProvider>
          <AudioProvider>
            <AppShell>{children}</AppShell>
          </AudioProvider>
        </SearchProvider>
      </AuthProvider>

      {process.env.NEXT_PUBLIC_GA_ID && <GoogleAnalytics gaId={process.env.NEXT_PUBLIC_GA_ID} />}
      {process.env.NODE_ENV === "production" && (
          <>
            {/* <GoogleAnalytics gaId="G-ZDWW48QNX7" /> */}
            <Analytics />
            <SpeedInsights />
            <Script id="clarity-script" strategy="lazyOnload">
              {`
                (function(c,l,a,r,i,t,y){
                  c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
                  t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
                  y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
                })(window, document, "clarity", "script", "wawvue9wgw");
              `}
            </Script>
          </>
        )}

    </>
  );
}
