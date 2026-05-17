import { useEffect, useMemo, useRef } from 'react';
import renderMathInElement from 'katex/contrib/auto-render';
import 'katex/contrib/mhchem';
import 'katex/dist/katex.min.css';

const formatLatex = (value) => {
  if (!value) return '';

  let cleaned = String(value).replace(/\\\\(?=[A-Za-z()[\]{}])/g, '\\');
  cleaned = cleaned.replace(/\\n/g, '\n');

  const hasMathDelimiters = /\$|\\\(|\\\[/.test(cleaned);

  if (!hasMathDelimiters) {
    cleaned = cleaned.replace(/\b(rightarrow|leftarrow|leftrightarrow|implies)\b/g, ' $\\$1$ ');
    cleaned = cleaned.replace(/\b(le|ge|ne|pm|times|div|approx|propto|infty)\b/g, ' $\\$1$ ');
    cleaned = cleaned.replace(/\b(alpha|beta|gamma|theta|pi|phi|omega|lambda|mu|sigma|delta|Delta|Omega|Gamma)\b/g, ' $\\$1$ ');

    if (cleaned.includes('\\') || /[\^{}_]/.test(cleaned)) {
      cleaned = `$${cleaned}$`;
    }
  }

  cleaned = cleaned.replace(
    /(\\begin\{[a-zA-Z*]+\}[\s\S]*?\\end\{[a-zA-Z*]+\})/g,
    (match) => `$$${match}$$`
  );

  return cleaned.replace(/\$\$\$/g, '$$');
};

export default function LatexRenderer({ text }) {
  const containerRef = useRef(null);
  const processedText = useMemo(() => formatLatex(text), [text]);

  useEffect(() => {
    if (!containerRef.current) return;

    renderMathInElement(containerRef.current, {
      delimiters: [
        { left: '$$', right: '$$', display: true },
        { left: '$', right: '$', display: false },
        { left: '\\(', right: '\\)', display: false },
        { left: '\\[', right: '\\]', display: true },
      ],
      throwOnError: false,
      trust: false,
    });
  }, [processedText]);

  if (!processedText) return null;

  return (
    <span ref={containerRef} className="latex-rendered-wrapper">
      {processedText}
    </span>
  );
}
