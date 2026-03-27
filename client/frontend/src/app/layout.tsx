import type { Metadata } from "next";
import { Montserrat, Poppins, Hanken_Grotesk } from "next/font/google";
import AppProviders from "@/components/AppProviders";
import { GoogleAnalytics } from '@next/third-parties/google';
import { WebVitals } from "@/components/WebVitals";
import { MathJaxContext } from "better-react-mathjax";
import "./globals.css";

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

export const metadata: Metadata = {
  metadataBase: new URL('https://vayl-app.vercel.app'),
  title: {
    default: "Vayl | The Silent Architect of JEE Success",
    template: "%s | Vayl"
  },
  description: "Vayl is the premium study operating system designed for JEE aspirants. Manage high-yield resources, master concepts with deep focus, and track your academic journey with precision.",
  keywords: ["JEE Preparation", "Study Dashboard", "Academic Vault", "Deep Work", "JEE Resources", "Focus Timer", "Scholar Identity"],
  authors: [{ name: "Neel Gupta" }],
  creator: "Neel Gupta",
  publisher: "Vayl Systems",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    title: "Vayl | The Silent Architect of JEE Success",
    description: "The premium study operating system for JEE aspirants. Simplify your vault, amplify your focus.",
    url: 'https://vayl-app.vercel.app',
    siteName: 'Vayl',
    images: [
      {
        url: '/screenshots/dashboard.png',
        width: 1200,
        height: 630,
        alt: 'Vayl Dashboard Preview',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Vayl | The Silent Architect of JEE Success',
    description: 'The premium study operating system for JEE aspirants.',
    images: ['/screenshots/dashboard.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Vayl",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html 
      lang="en" 
      suppressHydrationWarning 
      className={`dark h-full antialiased ${montserrat.variable} ${poppins.variable} ${hanken.variable}`}
    >
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet" />
      </head>
      <body className="min-h-full bg-surface text-on-surface font-body">
        <GoogleAnalytics gaId="G-ZDWW48QNX7" />
        <WebVitals />
        <MathJaxContext>
          <AppProviders>{children}</AppProviders>
        </MathJaxContext>
      </body>
    </html>
  );
}
