import { useIsMobile } from "@/hooks/use-mobile";
import { MobileOptimizedHeader } from "./MobileOptimizedHeader";
import { DesktopHeader } from "./DesktopHeader";

interface ResponsiveHeaderProps {
  storyTitle?: string;
  currentDifficulty?: 'beginner' | 'easy' | 'medium' | 'hard' | 'expert';
  onHome?: () => void;
  onNewStory?: () => void;
  onIncreaseDifficulty?: () => void;
  onDecreaseDifficulty?: () => void;
  showLevelControls?: boolean;
}

export const ResponsiveHeader = (props: ResponsiveHeaderProps) => {
  const { isMobileOrTablet } = useIsMobile();

  if (isMobileOrTablet) {
    return <MobileOptimizedHeader {...props} />;
  }

  return <DesktopHeader {...props} />;
};