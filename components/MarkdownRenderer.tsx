import React from 'react';

// This function handles inline markdown like **bold** and *italic*.
const renderInlineMarkdown = (text: string): React.ReactNode => {
  const parts = text.split(/(\*\*.*?\*\*|\*.*?\*|__.*?__|_.*?_)/g);
  return parts.map((part, index) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={index}>{part.slice(2, -2)}</strong>;
    }
    if (part.startsWith('__') && part.endsWith('__')) {
      return <strong key={index}>{part.slice(2, -2)}</strong>;
    }
    if (part.startsWith('*') && part.endsWith('*')) {
      return <em key={index}>{part.slice(1, -1)}</em>;
    }
    if (part.startsWith('_') && part.endsWith('_')) {
        return <em key={index}>{part.slice(1, -1)}</em>;
      }
    return part;
  });
};

export const MarkdownRenderer: React.FC<{ text: string }> = ({ text }) => {
  if (!text) return null;

  // Split by blank lines to identify blocks (paragraphs, lists)
  const blocks = text.trim().split(/\n\s*\n/); 

  return (
    <>
      {blocks.map((block, blockIndex) => {
        const lines = block.split('\n');
        
        // Check if the entire block is an ordered or unordered list
        const isOl = lines.every(line => /^\s*\d+\.\s/.test(line));
        const isUl = lines.every(line => /^\s*[-*]\s/.test(line));

        if (isOl) {
          return (
            <ol key={blockIndex} className="list-decimal list-inside space-y-1">
              {lines.map((line, lineIndex) => (
                <li key={lineIndex}>{renderInlineMarkdown(line.replace(/^\s*\d+\.\s*/, ''))}</li>
              ))}
            </ol>
          );
        }

        if (isUl) {
          return (
            <ul key={blockIndex} className="list-disc list-inside space-y-1">
              {lines.map((line, lineIndex) => (
                <li key={lineIndex}>{renderInlineMarkdown(line.replace(/^\s*[-*]\s*/, ''))}</li>
              ))}
            </ul>
          );
        }

        // Otherwise, render as a paragraph, preserving single line breaks with <br>
        return (
          <p key={blockIndex}>
            {lines.map((line, lineIndex) => (
              <React.Fragment key={lineIndex}>
                {renderInlineMarkdown(line)}
                {lineIndex < lines.length - 1 && <br />}
              </React.Fragment>
            ))}
          </p>
        );
      })}
    </>
  );
};