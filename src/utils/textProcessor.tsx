import { MobileOptimizedInteractiveWord } from "@/components/MobileOptimizedInteractiveWord";

// Function to process text and wrap words in InteractiveWord components
export const processTextForPhonetics = (
  text: string, 
  className: string = "", 
  difficulty: "beginner" | "easy" | "medium" | "hard" | "expert" = "easy",
  userInfo?: any, // Add userInfo parameter
  isPremium?: boolean, // Add isPremium parameter
  userId?: string, // Add userId parameter
  highlightedWordIndex?: number // Add highlighted word index
): React.ReactNode[] => {
  // Split text by spaces but preserve punctuation attached to words
  const words = text.split(/(\s+)/);
  
  // Create array of only actual words (not whitespace) with their indices
  const wordOnlyArray = words
    .map((word, originalIndex) => ({ word, originalIndex }))
    .filter(item => item.word.trim().length > 0);
  
  return words.map((word, index) => {
    // If it's just whitespace, return as is
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
        className={`${className} ${isHighlighted ? 'bg-yellow-200/80 dark:bg-yellow-800/60 animate-pulse transition-all duration-500 shadow-md rounded-sm' : 'transition-all duration-300'} word-index-${index}`}
        difficulty={difficulty}
        userInfo={userInfo}
        isPremium={isPremium}
        sentenceContext={text}
        userId={userId}
      />
    );
  }).filter(Boolean);
};