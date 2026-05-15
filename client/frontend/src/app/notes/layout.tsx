import type { Metadata } from "next";
import type React from "react";

export const metadata: Metadata = {
  metadataBase: new URL("https://vayl.in"),
  alternates: {
    canonical: '/notes',
  },
  title: "Vayl Notes | Free High-Yield Study Material & PYQs",
  description: "Access premium, curated study notes, formulas, and previous year questions (PYQs) for elite academic preparation on Vayl.",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
    }
  }
};

export default function NotesLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <>{children}</>;
}
