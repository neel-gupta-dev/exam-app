import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
  variable: "--font-inter",
  display: "swap",
});

const SITE_URL = "https://battle.vayl.in";
const TITLE = "JEE Battle — 1v1 Real-Time Quiz Duels";
const DESCRIPTION =
  "Challenge friends or random opponents to a head-to-head JEE quiz battle. 10 questions, 60 seconds each. Physics, Chemistry & Maths. Prove you're the fastest mind.";

export const metadata: Metadata = {
  // ── Core ──────────────────────────────────────────────
  title: {
    default: TITLE,
    template: "%s | JEE Battle",
  },
  description: DESCRIPTION,
  keywords: [
    "JEE Battle",
    "JEE quiz",
    "1v1 quiz",
    "JEE Mains practice",
    "competitive quiz",
    "real-time quiz",
    "Physics quiz",
    "Chemistry quiz",
    "Maths quiz",
    "IIT JEE preparation",
    "JEE multiplayer",
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
        url: "/og-image.png",
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
    images: ["/og-image.png"],
    creator: "@vaaborern",
  },

  // ── Icons ─────────────────────────────────────────────
  icons: {
    icon: "/favicon.ico",
    apple: "/og-image.png",
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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} h-full antialiased`}
    >
      <head>
        {/* Structured Data — WebApplication */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebApplication",
              name: "JEE Battle",
              url: SITE_URL,
              description: DESCRIPTION,
              applicationCategory: "EducationalApplication",
              operatingSystem: "Any",
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
      <body className="min-h-full flex flex-col bg-[#0f1115] text-white font-[var(--font-inter)]">
        {children}
      </body>
    </html>
  );
}
