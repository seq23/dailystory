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
  
  console.log('🖥️ ResponsiveTimer: Device detection:', {
    isMobile,
    isTablet, 
    isMobileOrTablet,
    hasTouchCapability,
    windowWidth: typeof window !== 'undefined' ? window.innerWidth : 'unknown',
    selectedTimer: isMobileOrTablet ? 'CollapsibleFloatingTimer' : 'FloatingTimer'
  });

  if (isMobileOrTablet) {
    return <CollapsibleFloatingTimer {...props} />;
  }

  return <FloatingTimer {...props} />;
};