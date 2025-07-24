import { useState, useRef } from "react";
import { getPhoneticSpelling } from "@/utils/phoneticDictionary";
import { Volume2, HelpCircle } from "lucide-react";
import { ElevenLabsService, getWordDefinition } from "@/services/textToSpeechService";

interface InteractiveWordProps {
  word: string;
  className?: string;
  difficulty?: "easy" | "medium" | "hard" | "expert";
  elevenLabsService?: ElevenLabsService;
}

export const InteractiveWord = ({ word, className = "", difficulty = "easy", elevenLabsService }: InteractiveWordProps) => {
  const [showTooltip, setShowTooltip] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const hideTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const phoneticSpelling = getPhoneticSpelling(word);

  const handleMouseEnter = () => {
    if (hideTimeoutRef.current) {
      clearTimeout(hideTimeoutRef.current);
      hideTimeoutRef.current = null;
    }
    setShowTooltip(true);
  };

  const handleMouseLeave = () => {
    hideTimeoutRef.current = setTimeout(() => {
      setShowTooltip(false);
    }, 200); // 200ms delay before hiding
  };

  const handlePronounce = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isPlaying) return;
    
    setIsPlaying(true);
    try {
      if (elevenLabsService) {
        await elevenLabsService.speakText(word);
      } else {
        // Fallback to browser speech synthesis
        if ('speechSynthesis' in window) {
          const utterance = new SpeechSynthesisUtterance(word.replace(/[.,!?;:'"()]/g, ''));
          utterance.rate = 0.7;
          utterance.pitch = 1.2;
          speechSynthesis.speak(utterance);
        }
      }
    } catch (error) {
      console.error('Error pronouncing word:', error);
    } finally {
      setIsPlaying(false);
    }
  };

  const handleExplain = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isPlaying) return;
    
    setIsPlaying(true);
    try {
      const definition = getWordDefinition(word);
      if (elevenLabsService) {
        await elevenLabsService.explainWord(word, definition);
      } else {
        // Fallback explanation
        const cleanWord = word.replace(/[.,!?;:'"()]/g, '');
        const explanationText = definition 
          ? `The word ${cleanWord} means: ${definition}`
          : `The word is: ${cleanWord}`;
        
        if ('speechSynthesis' in window) {
          const utterance = new SpeechSynthesisUtterance(explanationText);
          utterance.rate = 0.7;
          utterance.pitch = 1.1;
          speechSynthesis.speak(utterance);
        }
      }
    } catch (error) {
      console.error('Error explaining word:', error);
    } finally {
      setIsPlaying(false);
    }
  };

  // Determine if word should be interactive based on difficulty level
  const shouldBeInteractive = () => {
    const cleanWord = word.toLowerCase().replace(/[.,!?;:'"()]/g, '');
    
    // Easy level: all words are interactive
    if (difficulty === "easy") return true;
    
    // Other levels: only words longer than 4 letters
    return cleanWord.length > 4;
  };

  if (!shouldBeInteractive()) {
    return <span className={className}>{word}</span>;
  }

  return (
    <span
      className={`relative inline-block cursor-pointer ${className} ${isPlaying ? 'opacity-70' : ''}`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <span className="underline decoration-primary/30 decoration-dotted hover:decoration-primary/60 transition-colors">
        {word}
      </span>
      
      {showTooltip && (
        <div 
          className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 z-50"
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          <div className="bg-popover border text-popover-foreground px-3 py-2 rounded-lg shadow-lg text-sm font-medium whitespace-nowrap">
            <div className="flex items-center gap-2 mb-2">
              {phoneticSpelling && (
                <span className="text-xs text-muted-foreground">"{phoneticSpelling}"</span>
              )}
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handlePronounce}
                className="flex items-center gap-1 text-xs bg-secondary hover:bg-secondary/80 px-2 py-1 rounded transition-colors"
                disabled={isPlaying}
              >
                <Volume2 className="w-3 h-3" />
                Hear it
              </button>
              <button
                onClick={handleExplain}
                className="flex items-center gap-1 text-xs bg-secondary hover:bg-secondary/80 px-2 py-1 rounded transition-colors"
                disabled={isPlaying}
              >
                <HelpCircle className="w-3 h-3" />
                Explain
              </button>
            </div>
          </div>
          {/* Arrow pointing down */}
          <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-border"></div>
        </div>
      )}
    </span>
  );
};