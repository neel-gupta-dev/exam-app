import "./globals.css";

export const metadata = {
  title: "Vayl Periodic Table",
  description: "Interactive Periodic Table built with Next.js",
  icons: {
    icon: '/vayl-logo.png',
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" data-theme="dark">
      <body>{children}</body>
    </html>
  );
}
