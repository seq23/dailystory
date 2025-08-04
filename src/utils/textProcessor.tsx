import { MobileOptimizedInteractiveWord } from "@/components/InteractiveWord";

// Function to process text and wrap words in InteractiveWord components
export const processTextForPhonetics = (
  text: string, 
  className: string = "", 
  difficulty: "beginner" | "easy" | "medium" | "hard" | "expert" = "easy",
  userInfo?: any, // Add userInfo parameter
  isPremium?: boolean, // Add isPremium parameter
  userId?: string // Add userId parameter
): React.ReactNode[] => {
  // Split text by spaces but preserve punctuation attached to words
  const words = text.split(/(\s+)/);
  
  return words.map((word, index) => {
    // If it's just whitespace, return as is
    if (/^\s+$/.test(word)) {
      return word;
    }
    
    // If it's empty, skip
    if (!word.trim()) {
      return null;
    }
    
    return (
      <MobileOptimizedInteractiveWord 
        key={index} 
        word={word} 
        className={`${className} ${
          className.includes(`word-${index}`) 
            ? 'bg-yellow-200 animate-pulse' 
            : ''
        }`}
        difficulty={difficulty}
        userInfo={userInfo}
        isPremium={isPremium}
        sentenceContext={text}
        userId={userId}
      />
    );
  }).filter(Boolean);
};