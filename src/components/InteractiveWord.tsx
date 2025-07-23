import { useState } from "react";
import { getPhoneticSpelling, speakWord } from "@/utils/phoneticDictionary";
import { Volume2 } from "lucide-react";

interface InteractiveWordProps {
  word: string;
  className?: string;
}

export const InteractiveWord = ({ word, className = "" }: InteractiveWordProps) => {
  const [showTooltip, setShowTooltip] = useState(false);
  const phoneticSpelling = getPhoneticSpelling(word);

  const handleClick = () => {
    speakWord(word);
  };

  if (!phoneticSpelling) {
    return <span className={className}>{word}</span>;
  }

  return (
    <span
      className={`relative inline-block cursor-pointer ${className}`}
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
      onClick={handleClick}
    >
      <span className="underline decoration-primary/30 decoration-dotted hover:decoration-primary/60 transition-colors">
        {word}
      </span>
      
      {showTooltip && (
        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 z-50">
          <div className="bg-primary text-primary-foreground px-3 py-2 rounded-lg shadow-lg text-sm font-medium whitespace-nowrap">
            <div className="flex items-center gap-2">
              <span>"{phoneticSpelling}"</span>
              <Volume2 className="w-3 h-3" />
            </div>
            <div className="text-xs opacity-80 mt-1">Click to hear</div>
          </div>
          {/* Arrow pointing down */}
          <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-primary"></div>
        </div>
      )}
    </span>
  );
};