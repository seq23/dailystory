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
  sessionStats?: any;
}

export const CollapsibleFloatingTimer = ({
  timeRemaining,
  isReading,
  onToggleReading,
  onReduceTime,
  onEndSession,
  onSessionEnded,
  sessionStats
}: CollapsibleFloatingTimerProps) => {
  const { t } = useTranslation();
  const { isMobile, isTablet, isMobileOrTablet } = useIsMobile();
  const [isCollapsed, setIsCollapsed] = useState(isMobile);
  const [showCelebration, setShowCelebration] = useState(false);

  // Auto-collapse on mobile
  useEffect(() => {
    if (isMobile) {
      setIsCollapsed(true);
    }
  }, [isMobile]);

  // Format time for display
  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  // Get timer color based on time remaining
  const getTimerColor = () => {
    if (timeRemaining <= 300) return "text-destructive";
    if (timeRemaining <= 600) return "text-amber-600";
    return "text-emerald-600";
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



  // Simplified positioning - mobile first
  const getPositionClasses = () => {
    return cn(
      "fixed z-40",
      isMobile ? "bottom-20 left-4" : "bottom-8 left-8"
    );
  };

  if (isCollapsed) {
    return (
      <div className={cn(getPositionClasses())}>
        {/* Truly Collapsed - Only Timer Circle */}
        <div 
          className="relative w-16 h-16 bg-background/95 backdrop-blur-sm rounded-full shadow-lg border-2 border-primary/20 cursor-pointer hover:scale-110 transition-all duration-200 group flex items-center justify-center"
          onClick={() => setIsCollapsed(false)}
          id="timer-display"
          role="button"
          aria-label="Expand timer controls"
        >
          {/* Time display */}
          <div className={cn("text-sm font-bold", getTimerColor())}>
            {formatTime(timeRemaining)}
          </div>
          
          {/* Subtle expand indicator - only visible on hover */}
          <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-primary rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
            <ChevronUp className="w-2 h-2 text-primary-foreground" />
          </div>
          
          {/* Reading state indicator */}
          {isReading && (
            <div className="absolute -top-1 -left-1 w-3 h-3 bg-green-500 rounded-full animate-pulse" />
          )}
        </div>
      </div>
    );
  }

  return (
    <div className={cn(getPositionClasses(), "flex flex-col items-center gap-3")}>
      {/* Expanded Timer Display */}
      <div className="relative">
        {/* Main Timer Circle */}
        <div className="relative w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 bg-gradient-to-br from-background to-muted/20 backdrop-blur-sm rounded-full shadow-2xl border-2 border-border flex items-center justify-center">
          <div id="timer-display" className="text-center">
            <div className={cn("text-sm sm:text-base md:text-lg font-bold", getTimerColor())}>
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
          className="min-h-[44px] min-w-[44px] rounded-full bg-background/95 backdrop-blur-sm"
          aria-label={isReading ? t("floatingTimer.pause", "Pause reading") : t("floatingTimer.play", "Start reading")}
          id="timer-play-button"
        >
          {isReading ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
        </Button>

        {/* Always show Reduce Time */}
        <Button
          variant="outline"
          size={isMobile ? "sm" : "default"}
          onClick={onReduceTime}
          disabled={timeRemaining <= 5 * 60}
          className="min-h-[44px] min-w-[44px] rounded-full bg-background/95 backdrop-blur-sm"
          aria-label={t("floatingTimer.reduceTime", "Reduce time by 5 minutes")}
          id="timer-reduce-button"
        >
          <Minus className="w-4 h-4" />
        </Button>

        {/* End Session */}
        <Button
          variant="outline"
          size={isMobile ? "sm" : "default"}
          onClick={onEndSession}
          className="min-h-[44px] min-w-[44px] rounded-full bg-background/95 backdrop-blur-sm"
          aria-label={t("floatingTimer.endSession", "End reading session")}
          id="timer-end-button"
        >
          <X className="w-4 h-4" />
        </Button>

        {/* Collapse Button - Only show on mobile/tablet */}
        {isMobileOrTablet && (
          <Button
            variant="outline"
            size={isMobile ? "sm" : "default"}
            onClick={() => setIsCollapsed(true)}
            className="min-h-[44px] min-w-[44px] rounded-full bg-background/95 backdrop-blur-sm"
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