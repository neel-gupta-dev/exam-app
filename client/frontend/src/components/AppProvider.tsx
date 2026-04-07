"use client"; // This must be a client component to use hooks

import { usePathname } from "next/navigation";
import Script from "next/script";

export default function AdProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <>
      {/* Passing the pathname as the key forces Next.js to 
        unmount and remount this script tag on every page change.
      */}
      <Script
        key={pathname} 
        src="https://n6wxm.com/vignette.min.js"
        data-zone="10841880"
        strategy="afterInteractive"
      />
      {children}
    </>
  );
}