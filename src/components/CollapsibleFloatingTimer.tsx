import { useState, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { ChevronUp, ChevronDown, Play, Pause, Minus, Plus, X } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

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
  isPremium?: boolean; // Add premium status for enhanced free trial experience
  onIncreaseTime?: () => void; // Premium: increase time (up to 60 minutes)
  onDismiss?: () => void; // Premium: dismiss/hide timer without ending session
  onRestartTimer?: () => void; // Premium: restart a new timed session in-session
}

export const CollapsibleFloatingTimer = ({
  timeRemaining,
  isReading,
  onToggleReading,
  onReduceTime,
  onEndSession,
  onSessionEnded,
  sessionStats,
  isPremium = false,
  onIncreaseTime,
  onDismiss,
  onRestartTimer
}: CollapsibleFloatingTimerProps) => {
  const { t } = useTranslation();
  const { isMobile, isTablet, isMobileOrTablet } = useIsMobile();
const [isCollapsed, setIsCollapsed] = useState(false); // NOT auto-collapsed - consistent for all users
const [showCelebration, setShowCelebration] = useState(false);
const [showChoice, setShowChoice] = useState(false);
  // Low time pulse (one-shot) management
  const [lowTimePulse, setLowTimePulse] = useState(false);
  const wasBelowThresholdRef = useRef(false);

  useEffect(() => {
    const below = timeRemaining <= 300;
    if (!isReading || isCollapsed) {
      setLowTimePulse(false);
      wasBelowThresholdRef.current = below;
      return;
    }
    if (below && !wasBelowThresholdRef.current) {
      setLowTimePulse(true);
      const t = setTimeout(() => setLowTimePulse(false), 1600);
      return () => clearTimeout(t);
    }
    if (!below && wasBelowThresholdRef.current) {
      setLowTimePulse(false);
    }
    wasBelowThresholdRef.current = below;
  }, [timeRemaining, isReading, isCollapsed]);

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
  if (timeRemaining === 0 && !showCelebration && !showChoice) {
    setShowCelebration(true);
    setTimeout(() => {
      setShowCelebration(false);
      setShowChoice(true);
    }, 5000);
  }
}, [timeRemaining, showCelebration, showChoice]);

// Reset choice/celebration when timer is restarted
useEffect(() => {
  if (timeRemaining > 0 && (showCelebration || showChoice)) {
    setShowCelebration(false);
    setShowChoice(false);
  }
}, [timeRemaining]);

  // Responsive positioning
  const getPositionClasses = () => {
    return cn(
      "fixed z-[60]",
      isMobile ? "bottom-20 left-4" : 
      isTablet ? "bottom-16 left-6" : 
      "bottom-8 left-8"
    );
  };

  if (isCollapsed && !showCelebration && !showChoice) {
    return (
      <div className={cn(getPositionClasses())}>
        {/* Enhanced Collapsed Timer - More Prominent for Free Users */}
        <div 
          className={cn(
            "relative backdrop-blur-sm rounded-full shadow-lg border-2 cursor-pointer hover:scale-110 transition-all duration-200 group flex items-center justify-center",
            // Enhanced styling for free users when time is running low
            !isPremium && timeRemaining <= 300 && [
              "bg-gradient-to-br from-red-500/20 to-orange-500/20",
              "border-red-400/60",
              "shadow-red-500/30",
              "shadow-2xl",
              lowTimePulse && "animate-pulse ring-2 ring-red-400/40"
            ],
            !isPremium && timeRemaining > 300 && timeRemaining <= 600 && [
              "bg-gradient-to-br from-orange-500/20 to-yellow-500/20", 
              "border-orange-400/60",
              "shadow-orange-500/30"
            ],
            !isPremium && timeRemaining > 600 && [
              "bg-gradient-to-br from-purple-500/10 to-blue-500/10",
              "border-purple-300/50",
              "shadow-purple-500/20"
            ],
            isPremium && [
              "bg-background/95",
              "border-primary/20"
            ],
            isMobile ? "w-16 h-16" : isTablet ? "w-20 h-20" : "w-28 h-28"
          )}
          onClick={() => setIsCollapsed(false)}
          id="timer-display"
          role="button"
          aria-label="Expand timer controls"
        >
          {/* Time display with enhanced styling for free users */}
          <div className={cn(
            "font-bold text-center", 
            getTimerColor(),
            !isPremium && timeRemaining <= 300 && "text-red-600",
            lowTimePulse && "animate-bounce",
            isMobile ? "text-sm" : isTablet ? "text-base" : "text-lg"
          )}>
            {formatTime(timeRemaining)}
          </div>
          
          {/* Free user upgrade hint when time is low */}
          {!isPremium && timeRemaining <= 300 && (
            <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-red-600 text-white text-xs px-2 py-1 rounded-full shadow-lg whitespace-nowrap">
              🚨 Time Low!
            </div>
          )}
          
          {/* Upgrade hint for free users */}
          {!isPremium && (
            <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-purple-600 to-blue-600 text-white text-xs px-2 py-1 rounded-full shadow-lg opacity-70 whitespace-nowrap">
              ⏱️ Try Premium
            </div>
          )}
          
          {/* Enhanced expand indicator */}
          <div className={cn(
            "absolute -bottom-1 -right-1 w-4 h-4 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center",
            !isPremium ? "bg-purple-500" : "bg-primary"
          )}>
            <ChevronUp className={cn(
              "w-2 h-2",
              !isPremium ? "text-white" : "text-primary-foreground"
            )} />
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
        <div className={cn(
          "relative bg-gradient-to-br from-background to-muted/20 backdrop-blur-sm rounded-full shadow-2xl border-2 border-border flex items-center justify-center",
          isMobile ? "w-24 h-24" : isTablet ? "w-28 h-28" : "w-40 h-40"
        )}>
          <div id="timer-display" className="text-center">
            <div className={cn(
              "font-bold", 
              getTimerColor(),
              isMobile ? "text-base" : isTablet ? "text-lg" : "text-2xl"
            )}>
              {formatTime(timeRemaining)}
            </div>
            <div className={cn(
              "text-muted-foreground",
              isMobile ? "text-xs hidden" : isTablet ? "text-xs" : "text-base"
            )}>
              {!isMobile && t("floatingTimer.readingTime", "Reading Time")}
            </div>
          </div>
        </div>
      </div>

      {/* Control Buttons */}
      <TooltipProvider>
        <div className="flex items-center gap-2">
          {/* Play/Pause */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                size={isMobile ? "sm" : "default"}
                onClick={onToggleReading}
                className="min-h-[44px] min-w-[44px] rounded-full bg-background/95 backdrop-blur-sm"
                aria-label={isReading ? t("floatingTimer.pauseTimer", "Pause Timer") : t("floatingTimer.startTimer", "Start Timer")}
                id="timer-play-button"
              >
                {isReading ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              {t("floatingTimer.sequentialTooltips.startPause", "Click to start/pause your reading timer!")}
            </TooltipContent>
          </Tooltip>

          {/* Reduce Time */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                size={isMobile ? "sm" : "default"}
                onClick={onReduceTime}
                disabled={!onReduceTime || timeRemaining <= 5 * 60}
                className="min-h-[44px] min-w-[44px] rounded-full bg-background/95 backdrop-blur-sm"
                aria-label={t("floatingTimer.reduceTime", "Reduce time by 5 minutes")}
                id="timer-reduce-button"
              >
                <Minus className="w-4 h-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              {t("floatingTimer.sequentialTooltips.reduceTime", "Reduce time by 5 minutes!")}
            </TooltipContent>
          </Tooltip>

          {/* Increase Time (Premium only) */}
          {isPremium && onIncreaseTime && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size={isMobile ? "sm" : "default"}
                  onClick={onIncreaseTime}
                  disabled={!onIncreaseTime || timeRemaining >= 60 * 60}
                  className="min-h-[44px] min-w-[44px] rounded-full bg-background/95 backdrop-blur-sm"
                  aria-label={t("floatingTimer.increaseTime", "Increase time by 15 minutes")}
                  id="timer-increase-button"
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                {timeRemaining >= 60 * 60
                  ? t("floatingTimer.maxLimit", "Max Limit")
                  : t("floatingTimer.sequentialTooltips.increaseTime", "Add 15 minutes (max 60)")}
              </TooltipContent>
            </Tooltip>
          )}

          {/* X Button - End session (Free) or Dismiss (Premium) */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                size={isMobile ? "sm" : "default"}
                onClick={() => (isPremium ? onDismiss?.() : onEndSession())}
                className="min-h-[44px] min-w-[44px] rounded-full bg-background/95 backdrop-blur-sm"
                aria-label={isPremium ? t("floatingTimer.dismissTimer", "Dismiss timer") : t("floatingTimer.endSession", "End Reading Session")}
                id="timer-dismiss-x-button"
              >
                <X className="w-4 h-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              {isPremium
                ? t("floatingTimer.sequentialTooltips.dismissTimer", "Hide the timer; it keeps running")
                : t("floatingTimer.sequentialTooltips.endSession", "Click to end your reading session!")}
            </TooltipContent>
          </Tooltip>

          {/* Collapse Button */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                size={isMobile ? "sm" : "default"}
                onClick={() => setIsCollapsed(true)}
                className="min-h-[44px] min-w-[44px] rounded-full bg-background/95 backdrop-blur-sm"
                aria-label={t("floatingTimer.collapse", "Collapse timer")}
                id="timer-collapse-button"
              >
                <ChevronDown className="w-4 h-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              {t("floatingTimer.sequentialTooltips.collapse", "Collapse the timer")}
            </TooltipContent>
          </Tooltip>
        </div>
      </TooltipProvider>

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

{/* Post-celebration choice for premium users */}
{showChoice && (
  <div className="absolute inset-0 flex items-center justify-center">
    <div className="bg-background/95 backdrop-blur-md border border-border rounded-2xl shadow-2xl p-4 sm:p-6 w-[90vw] max-w-md animate-scale-in">
      <h3 className="text-lg font-bold mb-2 text-center">{t("floatingTimer.timeUp", "Time's up!")}</h3>
      <p className="text-sm text-muted-foreground text-center mb-4">
        {t("floatingTimer.chooseAction", "Would you like to stay in this story or end the session?")}
      </p>
      <div className="grid grid-cols-1 gap-2">
        {isPremium && (
          <Button
            onClick={() => {
              setShowChoice(false);
            }}
            variant="outline"
            className="w-full"
          >
            {t("floatingTimer.stayInStory", "Stay in current story")}
          </Button>
        )}
        {isPremium && (
          <Button
            onClick={() => {
              if (typeof onRestartTimer === 'function') onRestartTimer();
              setShowChoice(false);
              setIsCollapsed(false);
            }}
            className="w-full"
          >
            {t("floatingTimer.restartTimer", "Restart 20-minute Timer")}
          </Button>
        )}
        <Button
          onClick={() => onSessionEnded(sessionStats)}
          variant="secondary"
          className="w-full"
        >
          {t("floatingTimer.endSession", "End session")}
        </Button>
      </div>
    </div>
  </div>
)}

    </div>
  );
};
