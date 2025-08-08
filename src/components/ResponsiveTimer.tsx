import { useIsMobile } from "@/hooks/use-mobile";
import { FloatingTimer } from "./FloatingTimer";
import { CollapsibleFloatingTimer } from "./CollapsibleFloatingTimer";

interface ResponsiveTimerProps {
  timeRemaining: number;
  isReading: boolean;
  onToggleReading: () => void;
  onReduceTime?: () => void;
  onEndSession: () => void;
  pagesRemaining?: number;
  currentParagraph?: number;
  onSessionEnded: (sessionStats?: any) => void;
  tutorialStep?: number;
  sessionStats?: any;
  showTutorial?: boolean;
  onTimerTooltipComplete?: () => void;
}

export const ResponsiveTimer = (props: ResponsiveTimerProps) => {
  const { isMobile, isTablet, isMobileOrTablet, hasTouchCapability } = useIsMobile();
  
  // Always use CollapsibleFloatingTimer for consistency
  return <CollapsibleFloatingTimer {...props} />;
};