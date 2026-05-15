import React from 'react';
import 'katex/dist/katex.min.css';
import Latex from 'react-latex-next';

export default function LatexRenderer({ text }) {
  if (!text) return null;

  // Pre-processing engine to heal server-side LaTeX string anomalies
  const formatLatex = (str) => {
    if (!str) return '';

    // Step 1: Fix literal double-backslashes or quadruple-backslashes caused by JSON escaping.
    // This ensures that strings like "\\sqrt" or "\\\\sqrt" both become "\sqrt".
    let cleaned = str.replace(/\\\\/g, '\\');
    
    // Step 2: Auto-delimit "naked" LaTeX.
    // If the string contains common LaTeX markers (\, ^, _, {, }) but NO delimiters ($ or $$),
    // we wrap the whole thing in $ to ensure react-latex-next/KaTeX processes it.
    if (!cleaned.includes('$') && /[\\][a-zA-Z]+|[\^{}_]/.test(cleaned)) {
      cleaned = `$${cleaned}$`;
    }

    // Step 3: Recover common standalone math keywords that might have lost their backslashes
    cleaned = cleaned.replace(/\b(rightarrow|leftarrow|leftrightarrow|implies)\b/g, ' $\\$1$ ');
    cleaned = cleaned.replace(/\b(le|ge|ne|pm|times|div|approx|propto|infty)\b/g, ' $\\$1$ ');
    cleaned = cleaned.replace(/\b(alpha|beta|gamma|theta|pi|phi|omega|lambda|mu|sigma|delta|Delta|Omega|Gamma)\b/g, ' $\\$1$ ');

    // Step 4: Auto-detect math environments (like begin{cases}...end{cases})
    // If they are naked outside delimiters, we wrap them in display-math ($$) so KaTeX typesets them.
    const envRegex = /(\\begin\{[a-zA-Z*]+\}[\s\S]*?\\end\{[a-zA-Z*]+\})/g;
    cleaned = cleaned.replace(envRegex, (match) => {
      return `$$${match}$$`;
    });

    // Step 5: Ensure lone backslash commands that slipped outside delimiters are wrapped
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
