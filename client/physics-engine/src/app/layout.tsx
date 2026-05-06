import React from "react";
import type { Metadata } from "next";
import { Montserrat, Poppins, Hanken_Grotesk } from "next/font/google";
import { Toaster } from "sonner";
import Script from "next/script";
import TabManager from "@/components/TabManager";
import "./globals.css";

const isProd = process.env.NODE_ENV === 'production';
const GA_ID = process.env.NEXT_PUBLIC_GA_ID;

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
  title: {
    default: "VAYL Physics Lab | Interactive Physics Engine",
    template: "%s | VAYL Physics Lab"
  },
  description: "A high-performance, interactive physics sandbox for students and educators. Simulate projectile motion, collisions, and more with real-time vector visualization.",
  keywords: ["Physics Simulator", "Matter.js", "STEM Education", "VAYL", "Kinematics", "Projectile Motion Lab", "Online Physics Lab"],
  authors: [{ name: "VAYL Team" }],
  creator: "VAYL",
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "https://lab.vayl.in"),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "VAYL Physics Lab",
    description: "Interactive physics engine for visual learning and high-precision experimentation.",
    url: "https://lab.vayl.in",
    siteName: "VAYL Physics Lab",
    images: [
      {
        url: "/vayl-logo.png",
        width: 1200,
        height: 630,
        alt: "VAYL Physics Lab Preview",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "VAYL Physics Lab",
    description: "Visualize physics like never before with our interactive simulation engine.",
    images: ["/vayl-logo.png"],
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
    <html
      lang="en"
      suppressHydrationWarning
      className={`h-full antialiased ${montserrat.variable} ${poppins.variable} ${hanken.variable}`}
    >
      <head>
        {/* Dark mode: detect system preference before first paint to avoid flash */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{if(window.matchMedia('(prefers-color-scheme:dark)').matches){document.documentElement.classList.add('dark')}}catch(e){}})();`,
          }}
        />
        {isProd && GA_ID && (
          <>
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
              strategy="afterInteractive"
            />
            <Script id="google-analytics" strategy="afterInteractive">
              {`
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '${GA_ID}');
              `}
            </Script>
          </>
        )}
        {/* Preload Material Symbols to avoid render-blocking */}
        <link
          rel="preload"
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@24,400,0..1,0&display=swap"
          as="style"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@24,400,0..1,0&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-full bg-surface text-on-surface font-body antialiased selection:bg-primary/20">
        <TabManager />
        {children}
        <Toaster position="bottom-right" theme="dark" richColors />
        
        {/* JSON-LD Structured Data for SEO */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "SoftwareApplication",
              "name": "VAYL Physics Lab",
              "operatingSystem": "Web",
              "applicationCategory": "EducationApplication",
              "description": "High-performance interactive physics engine for students and educators.",
              "offers": {
                "@type": "Offer",
                "price": "0",
                "priceCurrency": "USD"
              },
              "author": {
                "@type": "Organization",
                "name": "VAYL",
                "url": "https://vayl.in"
              }
            }),
          }}
        />
      </body>
    </html>
  );
}
