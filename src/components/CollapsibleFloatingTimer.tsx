import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { ChevronUp, ChevronDown, Play, Pause, Minus, X } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";

interface CollapsibleFloatingTimerProps {
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
}

export const CollapsibleFloatingTimer = ({
  timeRemaining,
  isReading,
  onToggleReading,
  onReduceTime,
  onEndSession,
  onSessionEnded,
  tutorialStep = 0,
  sessionStats,
  showTutorial = false
}: CollapsibleFloatingTimerProps) => {
  const { t } = useTranslation();
  const { isMobile, isTablet, isMobileOrTablet } = useIsMobile();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);

  // Auto-collapse on mobile when not in tutorial
  useEffect(() => {
    if (isMobile && !showTutorial) {
      setIsCollapsed(true);
    }
  }, [isMobile, showTutorial]);

  // Format time for display
  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  // Get timer color based on time remaining
  const getTimerColor = () => {
    if (timeRemaining <= 300) return "text-red-600";
    if (timeRemaining <= 600) return "text-orange-600";
    return "text-green-600";
  };

  // Handle timer completion
  useEffect(() => {
    if (timeRemaining === 0 && !showCelebration) {
      setShowCelebration(true);
      setTimeout(() => {
        onSessionEnded(sessionStats);
      }, 2000);
    }
  }, [timeRemaining, showCelebration, onSessionEnded, sessionStats]);

  const isTutorialTimerStep = showTutorial && tutorialStep === 0;

  // Mobile-optimized positioning
  const getPositionClasses = () => {
    if (isTutorialTimerStep) {
      return "fixed top-[35%] right-4 z-50";
    }
    
    if (isMobile) {
      return "fixed bottom-4 left-4 z-40";
    }
    
    if (isTablet) {
      return "fixed bottom-6 left-6 z-40";
    }
    
    return "fixed bottom-8 left-8 z-40";
  };

  if (isCollapsed && !isTutorialTimerStep) {
    return (
      <div className={cn(getPositionClasses(), "flex flex-col items-center gap-2")}>
        {/* Collapsed Timer Display */}
        <div 
          className="bg-white/95 backdrop-blur-sm rounded-full shadow-lg border-2 border-primary/20 p-3 cursor-pointer hover:scale-105 transition-transform"
          onClick={() => setIsCollapsed(false)}
          id="timer-display"
        >
          <div className={cn("text-sm font-bold", getTimerColor())}>
            {formatTime(timeRemaining)}
          </div>
        </div>
        
        {/* Quick Controls */}
        <div className="flex gap-1">
          <Button
            size="sm"
            variant="outline"
            onClick={onToggleReading}
            className="w-8 h-8 p-0 rounded-full bg-white/95 backdrop-blur-sm"
          >
            {isReading ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
          </Button>
          
          <Button
            size="sm"
            variant="outline"
            onClick={() => setIsCollapsed(false)}
            className="w-8 h-8 p-0 rounded-full bg-white/95 backdrop-blur-sm"
          >
            <ChevronUp className="w-3 h-3" />
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className={cn(getPositionClasses(), "flex flex-col items-center gap-3")}>
      {/* Expanded Timer Display */}
      <div className="relative">
        {/* Main Timer Circle */}
        <div className="relative w-20 h-20 sm:w-24 sm:h-24 md:w-32 md:h-32 bg-gradient-to-br from-white to-gray-50 backdrop-blur-sm rounded-full shadow-2xl border-2 border-white/80 flex items-center justify-center">
          <div id="timer-display" className="text-center">
            <div className={cn("text-sm sm:text-base md:text-xl font-bold", getTimerColor())}>
              {formatTime(timeRemaining)}
            </div>
            <div className="text-xs text-muted-foreground hidden sm:block">
              {t("floatingTimer.readingTime", "Reading Time")}
            </div>
          </div>
        </div>
      </div>

      {/* Control Buttons */}
      <div className="flex items-center gap-2">
        {/* Play/Pause */}
        <Button
          variant="outline"
          size={isMobile ? "sm" : "default"}
          onClick={onToggleReading}
          className="min-h-[44px] min-w-[44px] rounded-full bg-white/95 backdrop-blur-sm"
          aria-label={isReading ? t("floatingTimer.pause", "Pause reading") : t("floatingTimer.play", "Start reading")}
        >
          {isReading ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
        </Button>

        {/* Reduce Time */}
        {onReduceTime && (
          <Button
            variant="outline"
            size={isMobile ? "sm" : "default"}
            onClick={onReduceTime}
            disabled={timeRemaining <= 5 * 60}
            className="min-h-[44px] min-w-[44px] rounded-full bg-white/95 backdrop-blur-sm"
            aria-label={t("floatingTimer.reduceTime", "Reduce time by 5 minutes")}
          >
            <Minus className="w-4 h-4" />
          </Button>
        )}

        {/* End Session */}
        <Button
          variant="outline"
          size={isMobile ? "sm" : "default"}
          onClick={onEndSession}
          className="min-h-[44px] min-w-[44px] rounded-full bg-white/95 backdrop-blur-sm"
          aria-label={t("floatingTimer.endSession", "End reading session")}
        >
          <X className="w-4 h-4" />
        </Button>

        {/* Collapse Button - Only show on mobile/tablet */}
        {isMobileOrTablet && !isTutorialTimerStep && (
          <Button
            variant="outline"
            size={isMobile ? "sm" : "default"}
            onClick={() => setIsCollapsed(true)}
            className="min-h-[44px] min-w-[44px] rounded-full bg-white/95 backdrop-blur-sm"
          >
            <ChevronDown className="w-4 h-4" />
          </Button>
        )}
      </div>

      {/* Celebration Animation */}
      {showCelebration && (
        <div className="absolute inset-0 pointer-events-none">
          <div className="flex items-center justify-center h-full">
            <div className="bg-white rounded-xl shadow-2xl p-4 text-center animate-scale-in">
              <div className="text-4xl mb-2">🎉</div>
              <h3 className="text-lg font-bold text-green-600">
                {t("floatingTimer.congratulations", "Congratulations!")}
              </h3>
              <p className="text-sm text-gray-600">
                {t("floatingTimer.sessionComplete", "Reading session complete!")}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};