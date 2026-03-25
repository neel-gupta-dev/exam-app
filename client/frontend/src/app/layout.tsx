import type { Metadata } from "next";
import { Inter, Manrope } from "next/font/google";
import AppProviders from "@/components/AppProviders";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap",
});

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-headline",
  display: "swap",
});

export const metadata: Metadata = {
  title: "The Focused Scholar - Knowledge Vault",
  description: "Your personal study dashboard for JEE preparation",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Knowledge Vault",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`dark h-full antialiased ${inter.variable} ${manrope.variable}`}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700;800&family=Inter:wght@400;500;600&display=swap" rel="stylesheet" />
        <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet" />
      </head>
      <body className="min-h-full bg-surface text-on-surface font-[family-name:var(--font-body)]">
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
