import type { Metadata } from "next";
import type React from "react";
import { Montserrat, Poppins, Hanken_Grotesk } from "next/font/google";
import "../globals.css";

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
  title: "Vayl Notes",
  description: "Free study notes and PYQs for aspirants.",
};

export default function NotesLayout({
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
      <body className="min-h-full bg-surface text-on-surface font-body antialiased selection:bg-primary/20">
        {children}
      </body>
    </html>
  );
}
