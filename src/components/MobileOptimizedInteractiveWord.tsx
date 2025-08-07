import { useState } from "react";
import { InteractiveWord } from "./InteractiveWord";
import { MobileTTSModal } from "./MobileTTSModal";
import { useIsMobile } from "@/hooks/use-mobile";
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
  const { isMobileOrTablet } = useIsMobile();
  const [showMobileModal, setShowMobileModal] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoadingWordData, setIsLoadingWordData] = useState(false);

  // For mobile devices, use click-to-open modal instead of hover
  if (isMobileOrTablet) {
    const handleClick = () => {
      setShowMobileModal(true);
    };

    const handleHearIt = async () => {
      // Simulate the pronunciation functionality
      setIsPlaying(true);
      // Add actual TTS logic here
      setTimeout(() => setIsPlaying(false), 2000);
    };

    const handleExplain = async () => {
      setIsLoadingWordData(true);
      // Add actual explanation logic here
      setTimeout(() => setIsLoadingWordData(false), 1500);
    };

    const handleSyllables = async () => {
      // Add syllable breakdown logic here
    };

    return (
      <>
        <span
          onClick={handleClick}
          className={`${props.className} inline cursor-pointer touch-manipulation select-none underline decoration-dotted decoration-2 underline-offset-2 text-primary hover:text-primary/80 active:text-primary/60 transition-colors duration-200`}
        >
          {props.word}
        </span>
        <MobileTTSModal
          isOpen={showMobileModal}
          onClose={() => setShowMobileModal(false)}
          word={props.word}
          onHearIt={handleHearIt}
          onExplain={handleExplain}
          onSyllables={handleSyllables}
          userInfo={props.userInfo}
          isPlaying={isPlaying}
          isLoadingWordData={isLoadingWordData}
        />
      </>
    );
  }

  // For desktop, use the original InteractiveWord component
  return <InteractiveWord {...props} />;
};