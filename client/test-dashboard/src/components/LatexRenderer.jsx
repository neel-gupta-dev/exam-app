import React from 'react';
import Latex from 'react-latex-next';

export default function LatexRenderer({ text }) {
  if (!text) return null;

  // Pre-processing engine to heal server-side LaTeX string anomalies
  const formatLatex = (str) => {
    if (!str) return '';

    // Step 1: Aggressive backslash and newline recovery. 
    // In production, strings might be double, triple, or quadruple escaped.
    // We convert any sequence of 2+ backslashes into a single one for LaTeX commands.
    let cleaned = str.replace(/\\{2,}/g, '\\');
    cleaned = cleaned.replace(/\\n/g, '\n'); // Fixes visible '\n' in text

    // Step 2: Auto-delimit "naked" LaTeX or Chemistry commands.
    // We look for ANY backslash (including \ce), power symbol, underscore, or LaTeX braces.
    // If no $ delimiters are present, we wrap the whole string.
    if (!cleaned.includes('$') && (cleaned.includes('\\') || /[\^{}_]/.test(cleaned))) {
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
