import type { Metadata } from "next";
import type React from "react";

export const metadata: Metadata = {
  title: "Vayl Notes",
  description: "Free study notes and PYQs for aspirants.",
};

export default function NotesLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <>{children}</>;
}
