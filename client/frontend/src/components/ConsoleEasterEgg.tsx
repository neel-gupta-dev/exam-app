"use client";

import { useEffect } from "react";

export default function ConsoleEasterEgg() {
  useEffect(() => {
    console.log(
      "%c👨💻 Stop inspecting the DOM and go revise Organic Chemistry!",
      "color: #22c55e; font-size: 20px; font-weight: bold; background: black; padding: 10px;"
    );
    console.log(
      "P.S. If you're smart enough to find this, email me at admin@vayl.in for a free premium upgrade. (first 10 users only)"
    );
  }, []);

  return null;
}
