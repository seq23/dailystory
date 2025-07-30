import { InteractiveWord } from "@/components/InteractiveWord";

// Function to process text and wrap words in InteractiveWord components
export const processTextForPhonetics = (
  text: string, 
  className: string = "", 
  difficulty: "easy" | "medium" | "hard" | "expert" = "easy",
  userInfo?: any // Add userInfo parameter
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
      <InteractiveWord 
        key={index} 
        word={word} 
        className={className}
        difficulty={difficulty}
        userInfo={userInfo}
      />
    );
  }).filter(Boolean);
};