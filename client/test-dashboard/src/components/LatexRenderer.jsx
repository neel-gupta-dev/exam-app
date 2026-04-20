import React from 'react';
import 'katex/dist/katex.min.css';
import Latex from 'react-latex-next';

export default function LatexRenderer({ text }) {
  if (!text) return null;
  return (
    <div className="latex-container">
      <Latex>{text}</Latex>
    </div>
  );
}
