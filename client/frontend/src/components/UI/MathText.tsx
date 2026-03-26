"use client";

import { MathJax } from "better-react-mathjax";

interface MathTextProps {
  text: string;
  className?: string;
}

export default function MathText({ text, className = "" }: MathTextProps) {
  return (
    <div className={className}>
      <MathJax hideUntilTypeset="every">
        {text}
      </MathJax>
    </div>
  );
}
