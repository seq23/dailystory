import { MobileOptimizedInteractiveWord } from "@/components/MobileOptimizedInteractiveWord";
import type { UserInfo } from "@/types";

interface TextProcessorOptions {
  text: string;
  className?: string;
  difficulty?: "beginner" | "easy" | "medium" | "hard" | "expert";
  userInfo?: UserInfo;
  isPremium?: boolean;
  userId?: string;
  highlightedWordIndex?: number;
  isMobile?: boolean;
}

/**
 * Unified text processor that handles both mobile and desktop rendering
 * with consistent highlighting and word flow
 */
export const processTextWithConsistentFlow = ({
  text,
  className = "",
  difficulty = "easy",
  userInfo,
  isPremium,
  userId,
  highlightedWordIndex,
  isMobile = false
}: TextProcessorOptions): React.ReactNode[] => {
  // Split text by spaces but preserve punctuation attached to words
  const words = text.split(/(\s+)/);
  
  // Create array of only actual words (not whitespace) with their indices
  const wordOnlyArray = words
    .map((word, originalIndex) => ({ word, originalIndex }))
    .filter(item => item.word.trim().length > 0);
  
  return words.map((word, index) => {
    // If it's just whitespace, return as plain text to maintain natural flow
    if (/^\s+$/.test(word)) {
      return word;
    }
    
    // If it's empty, skip
    if (!word.trim()) {
      return null;
    }

    // Find the word-only index for this word
    const wordOnlyIndex = wordOnlyArray.findIndex(item => item.originalIndex === index);
    const isHighlighted = highlightedWordIndex !== undefined && 
                         highlightedWordIndex !== -1 && 
                         highlightedWordIndex === wordOnlyIndex;
    
    // Consistent highlighting classes for both mobile and desktop
    const highlightClasses = isHighlighted 
      ? 'bg-yellow-200/80 dark:bg-yellow-800/60 animate-pulse transition-all duration-500 shadow-md rounded-sm' 
      : 'transition-all duration-300';
    
    const finalClassName = `inline ${className} ${highlightClasses}`;
    
    // Always use modal (no hover tooltips across devices)
    return (
      <MobileOptimizedInteractiveWord
        key={`${index}-${word}`}
        word={word}
        className={finalClassName}
        difficulty={difficulty}
        userInfo={userInfo}
        isPremium={isPremium}
        sentenceContext={text}
        userId={userId}
        forceModal={isMobile}
      />
    );
  }).filter(Boolean);
};