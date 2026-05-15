import React from 'react';
import katex from 'katex';
import 'katex/dist/katex.min.css';

export default function LatexRenderer({ text }) {
  if (!text) return null;

  // Standard double backslash healing to resolve JSON double-escaping
  const cleaned = text.replace(/\\\\/g, '\\');

  // Split the string into alternating tokens of plain text and mathematical blocks.
  // Delimiter precedence: $$ (display math) then $ (inline math)
  const tokens = cleaned.split(/(\$\$[\s\S]*?\$\$|\$[\s\S]*?\$)/g);

  const elements = tokens.map((token, index) => {
    if (!token) return null;

    // Handle Display Math ($$...$$)
    if (token.startsWith('$$') && token.endsWith('$$')) {
      const math = token.slice(2, -2);
      try {
        const html = katex.renderToString(math, {
          displayMode: true,
          throwOnError: false,
          trust: true,
        });
        return <span key={index} dangerouslySetInnerHTML={{ __html: html }} style={{ display: 'block', margin: '1em 0' }} />;
      } catch (err) {
        return <span key={index} style={{ color: '#e74c3c' }}>{token}</span>;
      }
    }
    
    // Handle Inline Math ($...$)
    if (token.startsWith('$') && token.endsWith('$')) {
      const math = token.slice(1, -1);
      try {
        const html = katex.renderToString(math, {
          displayMode: false,
          throwOnError: false,
          trust: true,
        });
        return <span key={index} dangerouslySetInnerHTML={{ __html: html }} style={{ display: 'inline-block', verticalAlign: 'middle' }} />;
      } catch (err) {
        return <span key={index} style={{ color: '#e74c3c' }}>{token}</span>;
      }
    }

    // Regular text block
    return <span key={index}>{token}</span>;
  });

  return (
    <span className="latex-rendered-wrapper" style={{ whiteSpace: 'pre-wrap', display: 'inline-block', maxWidth: '100%' }}>
      {elements}
    </span>
  );
}
