import type { Metadata } from "next";
import { Inter, Manrope } from "next/font/google";
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
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`dark h-full antialiased ${inter.variable} ${manrope.variable}`}>
      <body className="min-h-full bg-surface text-on-surface font-[family-name:var(--font-body)]">
        {children}
      </body>
    </html>
  );
}
