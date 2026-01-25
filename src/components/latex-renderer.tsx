'use client';

import React from 'react';
import { InlineMath, BlockMath } from 'react-katex';

interface LatexRendererProps {
  text: string;
  className?: string;
}

// This component parses a string for LaTeX expressions and renders them.
// It supports inline math with $...$ and block math with $$...$$
export function LatexRenderer({ text, className }: LatexRendererProps) {
  if (!text) return null;

  // Regular expression to find and split the text by LaTeX delimiters.
  const regex = /(\$\$[\s\S]*?\$\$|\$.*?\$)/g;
  const parts = text.split(regex);

  return (
    <div className={className}>
      {parts.map((part, index) => {
        if (part.startsWith('$$') && part.endsWith('$$')) {
          // Extract the math expression from between the '$$' delimiters.
          const math = part.substring(2, part.length - 2);
          try {
            // Render as a block-level equation.
            return <BlockMath key={index} math={math} />;
          } catch (e) {
            console.error("KaTeX parsing error for block math:", e);
            // If parsing fails, display the original text with an error style.
            return <span key={index} className="text-destructive font-mono">{part}</span>;
          }
        } else if (part.startsWith('$') && part.endsWith('$')) {
          // Extract the math expression from between the '$' delimiters.
          const math = part.substring(1, part.length - 1);
          try {
            // Render as an inline equation.
            return <InlineMath key={index} math={math} />;
          } catch (e) {
            console.error("KaTeX parsing error for inline math:", e);
            // If parsing fails, display the original text with an error style.
            return <span key={index} className="text-destructive font-mono">{part}</span>;
          }
        }
        
        // For regular text parts, split by newlines to preserve them using <br /> tags.
        return part.split(/(\n)/g).map((line, i) =>
            line === '\n' ? <br key={`${index}-${i}`} /> : <React.Fragment key={`${index}-${i}`}>{line}</React.Fragment>
        );
      })}
    </div>
  );
}
