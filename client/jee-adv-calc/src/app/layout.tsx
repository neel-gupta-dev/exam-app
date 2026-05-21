import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "../components/AuthProvider";

export const metadata: Metadata = {
  title: "JEE Advanced Marks Calculator | Instant Score Prediction & Analysis",
  description: "Calculate your JEE Advanced marks instantly using your official response sheet URL or HTML. Get detailed section-wise analysis, positive/negative marks breakdown, and verify your answers.",
  keywords: ["JEE Advanced", "JEE Advanced Calculator", "Marks Calculator", "JEE Score", "IIT JEE", "Response Sheet Parser"],
  authors: [{ name: "Vayl" }],
  openGraph: {
    title: "JEE Advanced Marks Calculator",
    description: "Instantly calculate your JEE Advanced score from the official response sheet.",
    url: "https://jee-calc.vayl.in",
    siteName: "Vayl",
    locale: "en_IN",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "JEE Advanced Marks Calculator",
    description: "Instantly calculate your JEE Advanced score from the official response sheet.",
  },
  icons: {
    icon: "/vayl-logo.png",
    shortcut: "/vayl-logo.png",
    apple: "/vayl-logo.png",
  },
  robots: {
    index: true,
    follow: true,
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased min-h-screen bg-slate-900 text-slate-50 selection:bg-blue-500/30">
        <AuthProvider>
          <main className="relative flex min-h-screen flex-col">
            {children}
          </main>
        </AuthProvider>
      </body>
    </html>
  );
}
