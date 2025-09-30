import React, { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface ExpandableTextProps {
  text: string;
  maxLength?: number;
  className?: string;
  showCharCount?: boolean;
}

export const ExpandableText: React.FC<ExpandableTextProps> = ({
  text,
  maxLength = 100,
  className = '',
  showCharCount = true
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const needsTruncation = text.length > maxLength;
  
  if (!needsTruncation) {
    return <span className={`whitespace-pre-wrap break-words ${className}`}>{text}</span>;
  }

  const displayText = isExpanded ? text : text.substring(0, maxLength) + '...';
  
  return (
    <div className="inline-flex flex-col gap-1 w-full">
      <span className={`whitespace-pre-wrap break-words ${className}`}>
        {displayText}
      </span>
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="text-xs text-blue-600 hover:text-blue-800 flex items-center gap-1 self-start"
      >
        {isExpanded ? (
          <>
            <ChevronUp className="h-3 w-3" />
            Show less
          </>
        ) : (
          <>
            <ChevronDown className="h-3 w-3" />
            Show more {showCharCount && `(${text.length} chars)`}
          </>
        )}
      </button>
    </div>
  );
};
