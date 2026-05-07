"use client";

import { MathJaxContext } from "better-react-mathjax";

const config = {
  loader: { load: ["input/tex", "output/chtml"] },
  tex: {
    inlineMath: [
      ["$", "$"],
      ["\\(", "\\)"],
    ],
    displayMath: [
      ["$$", "$$"],
      ["\\[", "\\]"],
    ],
  },
};

export default function MathProvider({ children }: { children: React.ReactNode }) {
  return (
    <MathJaxContext 
      config={config} 
      src="https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-chtml.js"
    >
      {children}
    </MathJaxContext>
  );
}
