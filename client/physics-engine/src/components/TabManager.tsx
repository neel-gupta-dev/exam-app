"use client";

import { useEffect, useRef } from "react";

export default function TabManager() {
  const titleCaptured = useRef(false);
  const originalTitle = useRef("");

  useEffect(() => {
    // Delay capture to ensure Next.js metadata has been applied
    const timer = setTimeout(() => {
      originalTitle.current = document.title;
      titleCaptured.current = true;
    }, 100);

    const handleVisibilityChange = () => {
      if (!titleCaptured.current) return;
      if (document.hidden) {
        document.title = "🧪 Laboratory in Progress...";
      } else {
        document.title = originalTitle.current;
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      clearTimeout(timer);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);

  return null;
}
