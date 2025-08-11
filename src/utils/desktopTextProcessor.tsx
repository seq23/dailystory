import { MobileOptimizedInteractiveWord } from "@/components/MobileOptimizedInteractiveWord";
import type { UserInfo } from "@/types";

// Desktop-specific text processor that uses the MobileOptimizedInteractiveWord with modal behavior
export const processTextForDesktop = (
  text: string, 
  className: string = "", 
  difficulty: "beginner" | "easy" | "medium" | "hard" | "expert" = "easy",
  userInfo?: UserInfo, 
  isPremium?: boolean, 
  userId?: string, 
  highlightedWordIndex?: number
): React.ReactNode[] => {
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
    const isHighlighted = highlightedWordIndex !== undefined && highlightedWordIndex !== -1 && highlightedWordIndex === wordOnlyIndex;
    
    return (
      <MobileOptimizedInteractiveWord 
        key={`${index}-${word}`} 
        word={word} 
        className={`${className} ${isHighlighted ? 'bg-yellow-200/80 dark:bg-yellow-800/60 animate-pulse transition-all duration-500 shadow-md rounded-sm' : 'transition-all duration-300'}`}
        difficulty={difficulty}
        userInfo={userInfo}
        isPremium={isPremium}
        sentenceContext={text}
        userId={userId}
        forceModal={true}
      />
    );
  }).filter(Boolean);
};