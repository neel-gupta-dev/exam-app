import "./globals.css";

export const metadata = {
  metadataBase: new URL('https://pt.vayl.in'),
  title: {
    default: "Vayl Periodic Table",
    template: "%s | Vayl Periodic Table",
  },
  description: "An interactive, modern Periodic Table of Elements. Explore atomic properties, electron configurations, and element history with Vayl.",
  keywords: ["Periodic Table", "Chemistry", "Elements", "Science", "Vayl", "Interactive Periodic Table"],
  authors: [{ name: "Vayl" }],
  creator: "Vayl",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://pt.vayl.in/",
    siteName: "Vayl Periodic Table",
    title: "Vayl Periodic Table - Interactive Elements Explorer",
    description: "Explore the elements of the periodic table interactively. View detailed atomic properties, electron configurations, and discovery history.",
    images: [
      {
        url: "/icon.png",
        width: 512,
        height: 512,
        alt: "Vayl Periodic Table Logo",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Vayl Periodic Table",
    description: "An interactive, modern Periodic Table of Elements by Vayl.",
    images: ["/icon.png"],
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
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" data-theme="dark">
      <body>{children}</body>
    </html>
  );
}
