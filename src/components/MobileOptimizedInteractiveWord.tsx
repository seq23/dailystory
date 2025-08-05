import { InteractiveWord } from "./InteractiveWord";
import type { UserInfo } from "@/types";

interface MobileOptimizedInteractiveWordProps {
  word: string;
  className?: string;
  difficulty?: "beginner" | "easy" | "medium" | "hard" | "expert";
  userInfo?: UserInfo;
  isPremium?: boolean;
  sentenceContext?: string;
  userId?: string;
}

export const MobileOptimizedInteractiveWord = (props: MobileOptimizedInteractiveWordProps) => {
  // Debug which component wrapper is being used
  console.log('🔄 MobileOptimizedInteractiveWord wrapper:', {
    word: props.word,
    environment: typeof window !== 'undefined' && window.location.href.includes('preview') ? 'preview' : 'console',
    passthrough: 'Going to InteractiveWord component'
  });
  
  return <InteractiveWord {...props} />;
};