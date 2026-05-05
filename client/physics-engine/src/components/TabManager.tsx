"use client";

import { useEffect } from "react";

export default function TabManager() {
  useEffect(() => {
    const originalTitle = document.title;
    
    const handleVisibilityChange = () => {
      if (document.hidden) {
        document.title = "🧪 Laboratory in Progress...";
      } else {
        document.title = originalTitle;
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);

  return null;
}
