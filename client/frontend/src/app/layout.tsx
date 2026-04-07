import type { Metadata } from "next";
import Script from "next/script";
import { Montserrat, Poppins, Hanken_Grotesk } from "next/font/google";
import AppProvider from "@/components/AppProvider";
import AppShell from "@/components/AppShell";
import { GoogleAnalytics } from "@next/third-parties/google";
import { WebVitals } from "@/components/WebVitals";
import CookieConsent from "@/components/CookieConsent";
import GoogleSchema from "@/components/GoogleSchema";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import "./globals.css";

/**
 * Font Configurations
 * We use next/font/google to optimize and load fonts at build time.
 * This prevents layout shift and improves performance.
 */
const montserrat = Montserrat({
  subsets: ["latin"],
  weight: ["700", "800"],
  variable: "--font-montserrat",
  display: "swap",
});

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-poppins",
  display: "swap",
});

const hanken = Hanken_Grotesk({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-hanken",
  display: "swap",
});

/**
 * Global Metadata Configuration
 * This object defines the SEO, OpenGraph data, Twitter cards, and other head tags
 * that apply globally across the Vayl application. Individual pages can override these.
 */
export const metadata: Metadata = {
  metadataBase: new URL("https://vayl.in"),
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
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`h-full antialiased ${montserrat.variable} ${poppins.variable} ${hanken.variable}`}
    >
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link rel="dns-prefetch" href="https://www.google-analytics.com" />
        <link rel="dns-prefetch" href="https://va.vercel-scripts.com" />
        <link rel="dns-prefetch" href="https://www.clarity.ms" />
        <link rel="dns-prefetch" href="https://cdn.jsdelivr.net" />
        <link rel="dns-prefetch" href="https://lh3.googleusercontent.com" />
        <meta name="monetag" content="cea460f1d065bd17030bb5e93cdf9d58"></meta>
        <meta
          name="google-adsense-account"
          content="ca-pub-4176158320009115"
        ></meta>
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@24,400,0..1,0&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-full bg-surface text-on-surface font-body antialiased selection:bg-primary/20">
        {/* Service Worker Registration */}
        <Script id="register-sw" strategy="afterInteractive">
          {`
            if ('serviceWorker' in navigator) {
              window.addEventListener('load', function() {
                navigator.serviceWorker.register('/sw.js').then(
                  function(registration) {
                    console.log('Service Worker registration successful');
                  },
                  function(err) {
                    console.log('Service Worker registration failed: ', err);
                  }
                );
              });
            }
          `}
        </Script>
        {process.env.NODE_ENV === "production" && (
          <>
            <GoogleAnalytics gaId="G-ZDWW48QNX7" />
            <Analytics />
            <SpeedInsights />
            <Script
              src="https://n6wxm.com/vignette.min.js"
              data-zone="10841880"
              strategy="afterInteractive"
            />
            <Script id="clarity-script" strategy="afterInteractive">
              {`
                (function(c,l,a,r,i,t,y){
                    c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
                    t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
                    y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
                })(window, document, "clarity", "script", "w4cyy5rkht");
              `}
            </Script>
          </>
        )}
        <WebVitals />
        <GoogleSchema />
        <CookieConsent />
        <AppProvider>
          <AppShell>{children}</AppShell>
        </AppProvider>
      </body>
    </html>
  );
}
