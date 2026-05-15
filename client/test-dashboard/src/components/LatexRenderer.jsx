import React from 'react';
import 'katex/dist/katex.min.css';
import Latex from 'react-latex-next';

export default function LatexRenderer({ text }) {
  if (!text) return null;

  // Pre-processing engine to heal server-side LaTeX string anomalies
  const formatLatex = (str) => {
    if (!str) return '';

    // Step 1: Fix literal double-backslashes caused by JSON double-escaping.
    // This converts \\begin to \begin, and \\\\ to \\ (maintaining KaTeX newlines).
    let cleaned = str.replace(/\\\\/g, '\\');

    // Step 2: Recover common standalone math keywords that might have lost their backslashes
    // For instance, if "\rightarrow" was parsed into raw "rightarrow" or merged.
    cleaned = cleaned.replace(/\b(rightarrow|leftarrow|leftrightarrow|implies)\b/g, ' $\\$1$ ');
    cleaned = cleaned.replace(/\b(le|ge|ne|pm|times|div|approx|propto|infty)\b/g, ' $\\$1$ ');
    cleaned = cleaned.replace(/\b(alpha|beta|gamma|theta|pi|phi|omega|lambda|mu|sigma|delta|Delta|Omega|Gamma)\b/g, ' $\\$1$ ');

    // Step 3: Auto-detect math environments (like begin{cases}...end{cases})
    // If they are naked outside delimiters, we wrap them in display-math ($$) so KaTeX typesets them.
    const envRegex = /(\\begin\{[a-zA-Z*]+\}[\s\S]*?\\end\{[a-zA-Z*]+\})/g;
    cleaned = cleaned.replace(envRegex, (match) => {
      return `$$${match}$$`;
    });

    // Step 4: Ensure lone backslash commands that slipped outside delimiters are wrapped
    cleaned = cleaned.replace(/\\(rightarrow|leftarrow|leftrightarrow|implies|le|ge|ne|pm|times|div|approx|propto|infty|alpha|beta|gamma|theta|pi|phi|omega|lambda|mu|sigma|delta|Delta|Omega|Gamma)\b/g, ' $\\$1$ ');

    // Safety pass: Remove any accidental triple dollar signs caused by merging
    cleaned = cleaned.replace(/\$\$\$/g, '$$');

    return cleaned;
  };

  const processed = formatLatex(text);

  return (
    <div className="latex-container">
      <Latex>{processed}</Latex>
    </div>
  );
}
