import type { Metadata } from "next";
import { Inter, Space_Grotesk } from "next/font/google";
import { CaptchaProvider } from "../components/CaptchaProvider";
import "./globals.css";
import { Analytics } from "@vercel/analytics/next";
import { GoogleAnalytics } from "@next/third-parties/google";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap",
});

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-heading",
  display: "swap",
});

const SITE_URL = "https://predictor.vayl.in";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "JEE College Predictor — IIT, NIT, IIIT, BITS | Vayl",
    template: "%s | Vayl College Predictor",
  },
  description:
    "Free JEE College Predictor. Predict your best IIT, NIT, IIIT, GFTI and BITS college based on your JEE Mains rank, JEE Advanced rank or BITSAT score. Uses real JoSAA & CSAB cutoff data with AI-based branch and college scoring.",
  keywords: [
    "JEE college predictor",
    "JEE Mains college predictor",
    "JEE Advanced college predictor",
    "BITSAT college predictor",
    "BITSAT cutoff predictor",
    "bits predictor",
    "nits and bits",
    "BITS Pilani predictor",
    "BITS Goa predictor",
    "BITS Hyderabad predictor",
    "BITSAT marks to college",
    "BITSAT score predictor",
    "NIT predictor",
    "IIT predictor",
    "IIIT predictor",
    "JoSAA cutoff",
    "CSAB cutoff",
    "college predictor rank wise",
    "best college for JEE rank",
    "JEE rank to college",
    "NIT cutoff",
    "IIT cutoff",
    "GFTI predictor",
    "Vayl predictor",
  ],
  authors: [{ name: "Vayl", url: "https://vayl.in" }],
  creator: "Vayl",
  publisher: "Vayl",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-snippet": -1,
      "max-image-preview": "large",
      "max-video-preview": -1,
    },
  },
  alternates: {
    canonical: SITE_URL,
  },
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: SITE_URL,
    siteName: "Vayl College Predictor",
    title: "JEE College Predictor — IIT, NIT, IIIT, BITS | Vayl",
    description:
      "Free JEE College Predictor. Enter your JEE Mains rank, Advanced rank or BITSAT score and get instant, AI-ranked college predictions with real cutoff data.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Vayl JEE College Predictor",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "JEE College Predictor — IIT, NIT, IIIT, BITS | Vayl",
    description:
      "Free JEE College Predictor. Enter your rank and get instant predictions for IITs, NITs, IIITs, GFTIs & BITS.",
    images: ["/og-image.png"],
    creator: "@vayl_in",
  },
  icons: {
    icon: "/vayl-logo.png",
    shortcut: "/vayl-logo.png",
    apple: "/vayl-logo.png",
  },
  verification: {
    google: "your-google-site-verification-code", // Replace with real code from Google Search Console
  },
  category: "education",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${spaceGrotesk.variable}`}>
      <head>
        {/* JSON-LD Structured Data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@graph": [
                {
                  "@type": "WebSite",
                  "@id": `${SITE_URL}/#website`,
                  url: SITE_URL,
                  name: "Vayl College Predictor",
                  description:
                    "Free JEE College Predictor. Predict IIT, NIT, IIIT, GFTI and BITS colleges using real JoSAA & CSAB cutoff data.",
                  publisher: {
                    "@type": "Organization",
                    name: "Vayl",
                    url: "https://vayl.in",
                    logo: {
                      "@type": "ImageObject",
                      url: `${SITE_URL}/vayl-logo.png`,
                    },
                  },
                  potentialAction: {
                    "@type": "SearchAction",
                    target: {
                      "@type": "EntryPoint",
                      urlTemplate: `${SITE_URL}/?rank={search_term_string}`,
                    },
                    "query-input": "required name=search_term_string",
                  },
                },
                {
                  "@type": "WebApplication",
                  "@id": `${SITE_URL}/#app`,
                  name: "JEE College Predictor",
                  url: SITE_URL,
                  applicationCategory: "EducationalApplication",
                  operatingSystem: "All",
                  description:
                    "Enter your JEE Mains rank, JEE Advanced rank, or BITSAT score to get ranked college predictions for IITs, NITs, IIITs, GFTIs and BITS using real JoSAA and CSAB cutoff data.",
                  offers: {
                    "@type": "Offer",
                    price: "0",
                    priceCurrency: "INR",
                  },
                  creator: {
                    "@type": "Organization",
                    name: "Vayl",
                    url: "https://vayl.in",
                  },
                  keywords:
                    "JEE college predictor, BITSAT predictor, BITS Pilani predictor, NIT predictor, IIT predictor, JoSAA cutoff, JEE rank college",
                },
                {
                  "@type": "FAQPage",
                  mainEntity: [
                    {
                      "@type": "Question",
                      name: "How does the JEE college predictor work?",
                      acceptedAnswer: {
                        "@type": "Answer",
                        text: "Enter your JEE Mains rank, JEE Advanced rank, or BITSAT score along with your category and preferences. Our algorithm matches your rank against real JoSAA and CSAB closing ranks to calculate your admission probability for each college and branch.",
                      },
                    },
                    {
                      "@type": "Question",
                      name: "Is this JEE college predictor free?",
                      acceptedAnswer: {
                        "@type": "Answer",
                        text: "Yes, the Vayl JEE College Predictor is completely free to use. No sign-up required.",
                      },
                    },
                    {
                      "@type": "Question",
                      name: "Which colleges does this predictor cover?",
                      acceptedAnswer: {
                        "@type": "Answer",
                        text: "This predictor covers all 23 IITs, 31 NITs, 25 IIITs, 30+ GFTIs, and all BITS Pilani campuses (BITS Pilani, BITS Goa, BITS Hyderabad), using real JoSAA, CSAB, and BITSAT iteration cutoff data.",
                      },
                    },
                    {
                      "@type": "Question",
                      name: "What is the cutoff data based on?",
                      acceptedAnswer: {
                        "@type": "Answer",
                        text: "All cutoff data is sourced from official JoSAA and CSAB closing ranks across all categories (OPEN, EWS, OBC-NCL, SC, ST) and seat types.",
                      },
                    },
                  ],
                },
              ],
            }),
          }}
        />
      </head>
      <body className="antialiased">
        {/* Background Effects */}
        <div className="fixed inset-0 -z-10 overflow-hidden">
          {/* Gradient orbs */}
          <div className="absolute -top-48 -left-48 w-96 h-96 bg-blue-500/8 rounded-full blur-3xl" />
          <div className="absolute top-1/3 -right-48 w-96 h-96 bg-violet-500/6 rounded-full blur-3xl" />
          <div className="absolute -bottom-48 left-1/3 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl" />
          {/* Grid pattern */}
          <div
            className="absolute inset-0 opacity-3"
            style={{
              backgroundImage: `linear-gradient(rgba(59,130,246,0.05) 1px, transparent 1px),
                               linear-gradient(90deg, rgba(59,130,246,0.05) 1px, transparent 1px)`,
              backgroundSize: "60px 60px",
            }}
          />
        </div>

        {/* Nav Header */}
        <header className="w-full border-b border-navy-800/50 bg-navy-900/40 backdrop-blur-md sticky top-0 z-50">
          <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <img src="/vayl-logo.png" alt="Vayl Logo" className="w-6 h-6 object-contain" />
              <span className="font-[family-name:var(--font-heading)] font-bold text-white text-xl tracking-tight">
                Vayl <span className="text-blue-500 font-medium">Predictor</span>
              </span>
            </div>
          </div>
        </header>

        <CaptchaProvider>
          {children}
        </CaptchaProvider>

        <Analytics />
        {process.env.NEXT_PUBLIC_GA_ID && <GoogleAnalytics gaId={process.env.NEXT_PUBLIC_GA_ID} />}
      </body>
    </html>
  );
}
