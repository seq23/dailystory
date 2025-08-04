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
  return <InteractiveWord {...props} />;
};