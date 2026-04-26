import type { Metadata } from "next";
import { Inter, Space_Grotesk } from "next/font/google";
import { CaptchaProvider } from "../components/CaptchaProvider";
import "./globals.css";

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

export const metadata: Metadata = {
  title: "College Predictor — JEE Mains & Advanced 2025",
  description:
    "Predict your best colleges based on JEE Mains and JEE Advanced rank. Get personalized recommendations for IITs, NITs, IIITs, and GFTIs with our smart algorithm.",
  keywords: [
    "JEE",
    "college predictor",
    "IIT",
    "NIT",
    "IIIT",
    "GFTI",
    "JoSAA",
    "CSAB",
    "cutoff",
    "rank predictor",
    "JEE Mains",
    "JEE Advanced",
  ],
  openGraph: {
    title: "College Predictor — JEE Mains & Advanced 2025",
    description:
      "Smart college predictions based on your rank, preferences, and market trends.",
    type: "website",
  },
  icons: {
    icon: "/vayl-logo.png",
    shortcut: "/vayl-logo.png",
    apple: "/vayl-logo.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${spaceGrotesk.variable}`}>
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
      </body>
    </html>
  );
}
