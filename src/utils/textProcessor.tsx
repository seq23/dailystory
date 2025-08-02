import { InteractiveWord } from "@/components/InteractiveWord";

// Function to process text and wrap words in InteractiveWord components
export const processTextForPhonetics = (
  text: string, 
  className: string = "", 
  difficulty: "easy" | "medium" | "hard" | "expert" = "easy",
  userInfo?: any, // Add userInfo parameter
  isPremium?: boolean // Add isPremium parameter
): React.ReactNode[] => {
  // Split text by spaces but preserve punctuation attached to words
  const words = text.split(/(\s+)/);
  
  // Create context for each word (surrounding words for better pronunciation)
  const getWordContext = (index: number): string => {
    const contextRadius = 3; // 3 words before and after
    const start = Math.max(0, index - contextRadius);
    const end = Math.min(words.length, index + contextRadius + 1);
    return words.slice(start, end)
      .filter(w => !/^\s+$/.test(w) && w.trim()) // Remove whitespace
      .join(' ');
  };
  
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
      <InteractiveWord 
        key={index} 
        word={word} 
        context={getWordContext(index)} // Pass surrounding context
        className={`${className} ${
          className.includes(`word-${index}`) 
            ? 'bg-yellow-200 animate-pulse' 
            : ''
        }`}
        difficulty={difficulty}
        userInfo={userInfo}
        isPremium={isPremium}
      />
    );
  }).filter(Boolean);
};