import type { Metadata } from "next";
import Script from "next/script";
import { Analytics } from "@vercel/analytics/next"
import "./globals.css";

const SITE_URL = "https://battle.vayl.in";
const TITLE = "JEE Battle | 1v1 Live Quiz Challenges for Aspirants";
const DESCRIPTION =
  "The most exciting way to practice for JEE. Challenge your friends to quick 1v1 duels in Physics, Chemistry, and Math. See who's faster and sharper in real-time.";

export const metadata: Metadata = {
  // ── Core ──────────────────────────────────────────────
  title: {
    default: TITLE,
    template: "%s | JEE Battle",
  },
  description: DESCRIPTION,
  keywords: [
    "JEE Battle",
    "JEE practice",
    "1v1 quiz",
    "JEE Mains challenge",
    "Physics quiz",
    "Chemistry quiz",
    "Maths quiz",
    "IIT JEE prep",
    "online JEE test",
    "Vayl",
  ],
  authors: [{ name: "Vayl", url: "https://vayl.in" }],
  creator: "Vayl",
  publisher: "Vayl",
  metadataBase: new URL(SITE_URL),

  // ── OpenGraph (WhatsApp, Instagram, Facebook, LinkedIn, Discord) ───
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: SITE_URL,
    siteName: "JEE Battle by Vayl",
    title: TITLE,
    description: DESCRIPTION,
    images: [
      {
        url: "/vayl-logo.png",
        width: 1200,
        height: 630,
        alt: "JEE Battle — 1v1 Real-Time Quiz Duels",
        type: "image/png",
      },
    ],
  },

  // ── Twitter / X Card ──────────────────────────────────
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: DESCRIPTION,
    images: ["/vayl-logo.png"],
    creator: "@vaaborern",
  },

  // ── Icons ─────────────────────────────────────────────
  icons: {
    icon: "/vayl-logo.png",
    apple: "/vayl-logo.png",
  },

  // ── Robots ────────────────────────────────────────────
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

  // ── Other ─────────────────────────────────────────────
  alternates: {
    canonical: SITE_URL,
  },
  category: "education",
};

import MathProvider from "@/components/MathProvider";
import CookieConsent from "@/components/CookieConsent";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const GA_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;
  const isProd = process.env.NODE_ENV === 'production';

  return (
    <html
      lang="en"
      className="h-full antialiased"
    >
      <head>
        <link
          href="https://api.fontshare.com/v2/css?f[]=clash-grotesk@200,300,400,500,600,700&display=swap"
          rel="stylesheet"
        />
        {/* Structured Data — WebApplication */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebApplication",
              name: "JEE Battle",
              url: SITE_URL,
              description: "A real-time 1v1 quiz platform for JEE aspirants to practice Physics, Chemistry, and Maths through friendly competition.",
              applicationCategory: "Educational Game",
              operatingSystem: "Web",
              offers: {
                "@type": "Offer",
                price: "0",
                priceCurrency: "INR",
              },
              author: {
                "@type": "Organization",
                name: "Vayl",
                url: "https://vayl.in",
              },
            }),
          }}
        />
      </head>
      <body className="min-h-full flex flex-col bg-[#0f1115] text-white font-['Clash_Grotesk',sans-serif]">
        {isProd && GA_ID && (
          <>
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
              strategy="afterInteractive"
            />
            <Script id="google-analytics" strategy="afterInteractive">
              {`
                if (localStorage.getItem('battle_cookie_consent') === 'accepted') {
                  window.dataLayer = window.dataLayer || [];
                  function gtag(){dataLayer.push(arguments);}
                  gtag('js', new Date());
                  gtag('config', '${GA_ID}');
                }
              `}
            </Script>
            <Analytics />
          </>
        )}
        <MathProvider>
          {children}
          <CookieConsent />
        </MathProvider>
      </body>
    </html>
  );
}
