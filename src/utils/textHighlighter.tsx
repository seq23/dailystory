import React from 'react';

interface HighlightTextProps {
  text: string;
  searchTerms: string[];
  className?: string;
}

/**
 * Highlights search terms in text with visual emphasis
 */
export function HighlightText({ text, searchTerms, className = '' }: HighlightTextProps): JSX.Element {
  if (!searchTerms.length || !text) {
    return <span className={className}>{text}</span>;
  }

  // Create a regex pattern for all search terms (case insensitive, word boundaries)
  const escapedTerms = searchTerms.map(term => 
    term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  );
  const pattern = `\\b(${escapedTerms.join('|')})\\b`;
  const regex = new RegExp(pattern, 'gi');

  // Split text by matches and rebuild with highlighting
  const parts = text.split(regex);
  
  return (
    <span className={className}>
      {parts.map((part, index) => {
        // Check if this part is one of our search terms (case insensitive)
        const isMatch = searchTerms.some(term => 
          part.toLowerCase() === term.toLowerCase()
        );
        
        return isMatch ? (
          <mark
            key={index}
            className="bg-green-200 text-green-800 px-1 rounded font-medium"
          >
            {part}
          </mark>
        ) : (
          <span key={index}>{part}</span>
        );
      })}
    </span>
  );
}

/**
 * Get all found terms from placeholder validation results
 */
export function getFoundTerms(placeholderValidation?: any): string[] {
  if (!placeholderValidation?.foundInstances) {
    return [];
  }

  const foundTerms: string[] = [];
  
  Object.values(placeholderValidation.foundInstances).forEach((instances: any) => {
    if (Array.isArray(instances)) {
      foundTerms.push(...instances);
    }
  });

  return [...new Set(foundTerms)]; // Remove duplicates
}