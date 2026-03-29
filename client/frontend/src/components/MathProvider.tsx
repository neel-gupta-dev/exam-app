"use client";

import { MathJaxContext } from "better-react-mathjax";

export default function MathProvider({ children }: { children: React.ReactNode }) {
  return <MathJaxContext>{children}</MathJaxContext>;
}
