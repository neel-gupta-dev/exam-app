import type { Metadata } from "next";
import { Montserrat, Poppins, Hanken_Grotesk } from "next/font/google";
import AppProviders from "@/components/AppProviders";
import Script from "next/script";
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
  title: "Vayl",
  description: "Your personal study dashboard for JEE preparation",
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
        <Script async src="https://www.googletagmanager.com/gtag/js?id=G-ZDWW48QNX7" strategy="afterInteractive" />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());

            gtag('config', 'G-ZDWW48QNX7');
          `}
        </Script>
        <MathJaxContext>
          <AppProviders>{children}</AppProviders>
        </MathJaxContext>
      </body>
    </html>
  );
}
