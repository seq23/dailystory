import CleanStoryDisplay from "@/components/CleanStoryDisplay";
import type { UserInfo, SessionStats } from "@/types";

interface FreeReadingSessionProps {
  userInfo: UserInfo;
  onUpgrade: () => void;
  onCreateAccount: () => void;
  onHome?: () => void;
  onNewStory?: () => void;
  onSessionEnded?: (stats: SessionStats) => void;
  isPremium?: boolean;
}

export const FreeReadingSession: React.FC<FreeReadingSessionProps> = ({
  userInfo,
  onUpgrade,
  onCreateAccount,
  onHome,
  onNewStory,
  onSessionEnded,
  isPremium = false,
}) => {
  console.log('🎬 FreeReadingSession: Using new CleanStoryDisplay architecture');
  
  return (
    <CleanStoryDisplay
      userInfo={userInfo}
      isPremium={isPremium}
      onSessionEnded={onSessionEnded || (() => {})}
      onHome={onHome || (() => {})}
      onUpgrade={onUpgrade}
      onNewStory={onNewStory || (() => {})}
    />
  );
};