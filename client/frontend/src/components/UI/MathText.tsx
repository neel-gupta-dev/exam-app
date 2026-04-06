"use client";

import { MathJax } from "better-react-mathjax";

interface MathTextProps {
  text: string;
  className?: string;
}

/**
 * Math Text Wrapper
 * Uses MathJax to render LaTeX equations embedded within strings.
 * Used heavily in the Flashcards system to render mathematical formulas.
 * Hides raw text until typesetting is complete to prevent layout jumping.
 */
export default function MathText({ text, className = "" }: MathTextProps) {
  return (
    <div className={className}>
      <MathJax>
        {text}
      </MathJax>
    </div>
  );
}
