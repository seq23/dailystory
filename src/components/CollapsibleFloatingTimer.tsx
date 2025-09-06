import { useState, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { ChevronUp, ChevronDown, Play, Pause, Minus, Plus, X, Volume2, VolumeX } from "lucide-react";
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
  onKeepReadingUntimed?: () => void; // Premium: keep reading with timer off
  onSaveStoryNow?: () => void; // Premium: save the current story now
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
  onRestartTimer,
  onKeepReadingUntimed,
  onSaveStoryNow
}: CollapsibleFloatingTimerProps) => {
  const { t } = useTranslation();
  const { isMobile, isTablet, isMobileOrTablet } = useIsMobile();
  const [isCollapsed, setIsCollapsed] = useState(false); // NOT auto-collapsed - consistent for all users
  const [showCelebration, setShowCelebration] = useState(false);
  const [showChoice, setShowChoice] = useState(false);
  const [expiredAcknowledged, setExpiredAcknowledged] = useState(false); // Prevent re-trigger loop at 0s
  // Celebration sound mute preference
  const [muted, setMuted] = useState<boolean>(() => {
    try { return localStorage.getItem('celebrationMuted') === '1'; } catch { return false; }
  });
  
  // Mobile tooltip state
  const [mobileTooltip, setMobileTooltip] = useState<string>('');
  
  // Long press state for timer circle
  const [longPressTimer, setLongPressTimer] = useState<NodeJS.Timeout | null>(null);
  useEffect(() => {
    try {
      if (muted) localStorage.setItem('celebrationMuted','1'); else localStorage.removeItem('celebrationMuted');
    } catch {}
  }, [muted]);
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
  if (timeRemaining === 0 && !expiredAcknowledged && !showCelebration && !showChoice) {
    setShowCelebration(true);
    if (!muted) {
      // Use direct audio creation to avoid preload warnings
      try {
        const audio = new Audio('/audio/celebration.mp3');
        audio.volume = 0.5;
        audio.play().catch(() => {});
      } catch {
        // Silently handle audio failures
      }
    }
    const timeout = setTimeout(() => {
      setShowCelebration(false);
      if (isPremium) {
        setShowChoice(true);
      } else {
        onSessionEnded(sessionStats);
      }
    }, 5000);
    return () => clearTimeout(timeout);
  }
}, [timeRemaining, showCelebration, showChoice, isPremium, onSessionEnded, sessionStats, muted, expiredAcknowledged]);

// Reset choice/celebration when timer is restarted
useEffect(() => {
  if (timeRemaining > 0 && (showCelebration || showChoice || expiredAcknowledged)) {
    setShowCelebration(false);
    setShowChoice(false);
    setExpiredAcknowledged(false);
  }
}, [timeRemaining, showCelebration, showChoice, expiredAcknowledged]);

  // Responsive positioning
  const getPositionClasses = () => {
    return cn(
      "fixed z-[60]",
      isMobile ? "bottom-28 left-4" : 
      isTablet ? "bottom-24 left-6" : 
      "bottom-16 left-8"
    );
  };

  if (isCollapsed && !showCelebration && !showChoice) {
    return (
      <div className={cn(getPositionClasses())}>
        {/* Enhanced Collapsed Timer - More Prominent for Free Users */}
        <div 
          className={cn(
            "relative backdrop-blur-sm rounded-full shadow-lg border-2 cursor-pointer hover:scale-110 transition-all duration-200 group flex items-center justify-center",
            // Paused state - yellow pulsing outline
            !isReading && [
              "border-yellow-400/80",
              "shadow-yellow-500/40",
              "shadow-xl",
              "animate-pulse ring-2 ring-yellow-400/50"
            ],
            // Enhanced styling for free users when time is running low
            isReading && !isPremium && timeRemaining <= 300 && [
              "bg-gradient-to-br from-red-500/20 to-orange-500/20",
              "border-red-400/60",
              "shadow-red-500/30",
              "shadow-2xl",
              lowTimePulse && "animate-pulse ring-2 ring-red-400/40"
            ],
            isReading && !isPremium && timeRemaining > 300 && timeRemaining <= 600 && [
              "bg-gradient-to-br from-orange-500/20 to-yellow-500/20", 
              "border-orange-400/60",
              "shadow-orange-500/30"
            ],
            isReading && !isPremium && timeRemaining > 600 && [
              "bg-gradient-to-br from-purple-500/10 to-blue-500/10",
              "border-purple-300/50",
              "shadow-purple-500/20"
            ],
            isReading && isPremium && [
              "bg-background/95",
              "border-primary/20"
            ],
            !isReading && [
              "bg-gradient-to-br from-yellow-500/10 to-orange-500/10"
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
        <div 
          className={cn(
            "relative bg-gradient-to-br from-background to-muted/20 backdrop-blur-sm rounded-full shadow-2xl border-2 flex items-center justify-center cursor-pointer",
            // Paused state - yellow pulsing outline
            !isReading && [
              "border-yellow-400/80",
              "shadow-yellow-500/40", 
              "shadow-xl",
              "animate-pulse ring-2 ring-yellow-400/50"
            ],
            isReading && "border-border",
            isMobile ? "w-24 h-24" : isTablet ? "w-28 h-28" : "w-40 h-40"
          )}
          onClick={() => {
            if (!isMobileOrTablet) {
              setIsCollapsed(true);
            }
          }}
          onTouchStart={() => {
            if (isMobileOrTablet) {
              const timer = setTimeout(() => {
                setIsCollapsed(true);
              }, 2000);
              setLongPressTimer(timer);
            }
          }}
          onTouchEnd={() => {
            if (longPressTimer) {
              clearTimeout(longPressTimer);
              setLongPressTimer(null);
            }
          }}
          onTouchCancel={() => {
            if (longPressTimer) {
              clearTimeout(longPressTimer);
              setLongPressTimer(null);
            }
          }}
        >
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
          <Tooltip open={isMobileOrTablet ? mobileTooltip === 'play' : undefined}>
            <TooltipTrigger asChild>
               <Button
                 variant="outline"
                 size={isMobile ? "sm" : "default"}
                 onClick={() => {
                   if (isMobileOrTablet) {
                     setMobileTooltip('play');
                     setTimeout(() => setMobileTooltip(''), 3000);
                   }
                   console.log('🔥 TIMER BUTTON CLICKED! Current state:', { isReading, timeRemaining });
                   onToggleReading();
                 }}
                 className="min-h-[44px] min-w-[44px] rounded-full bg-background/95 backdrop-blur-sm"
                 aria-label={isReading ? t("floatingTimer.pauseTimer", "Pause Timer") : t("floatingTimer.startTimer", "Start Timer")}
                 id="timer-play-button"
               >
                {isReading ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom">
              {t("floatingTimer.sequentialTooltips.startPause", "Click to start/pause your reading timer!")}
            </TooltipContent>
          </Tooltip>

          {/* Reduce Time */}
          <Tooltip open={isMobileOrTablet ? mobileTooltip === 'reduce' : undefined}>
            <TooltipTrigger asChild>
               <Button
                 variant="outline"
                 size={isMobile ? "sm" : "default"}
                 onClick={() => {
                   if (isMobileOrTablet) {
                     setMobileTooltip('reduce');
                     setTimeout(() => setMobileTooltip(''), 3000);
                   }
                   onReduceTime?.();
                 }}
                disabled={!onReduceTime || timeRemaining <= 5 * 60}
                className="min-h-[44px] min-w-[44px] rounded-full bg-background/95 backdrop-blur-sm"
                aria-label={t("floatingTimer.reduceTime", "Reduce time by 5 minutes")}
                id="timer-reduce-button"
              >
                <Minus className="w-4 h-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom">
              {t("floatingTimer.sequentialTooltips.reduceTime", "Reduce time by 5 minutes!")}
            </TooltipContent>
          </Tooltip>

           {/* Increase Time (+15 min) - Premium only */}
           {isPremium && onIncreaseTime && (
             <Tooltip open={isMobileOrTablet ? mobileTooltip === 'increase' : undefined}>
               <TooltipTrigger asChild>
                 <Button
                   variant="outline"
                   size={isMobile ? "sm" : "default"}
                   onClick={() => {
                     if (isMobileOrTablet) {
                       setMobileTooltip('increase');
                       setTimeout(() => setMobileTooltip(''), 3000);
                     }
                     onIncreaseTime?.();
                   }}
                  className="min-h-[44px] min-w-[44px] rounded-full bg-background/95 backdrop-blur-sm"
                  aria-label={t("floatingTimer.increaseTime", "Add 15 minutes of reading time")}
                  id="timer-increase-button"
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="bottom">
                {t("floatingTimer.increaseTimeHint", "Add 15 min of reading time")}
              </TooltipContent>
            </Tooltip>
          )}

           {/* X Button - Dismiss timer for premium, end session for guests */}
           <Tooltip open={isMobileOrTablet ? mobileTooltip === 'dismiss' : undefined}>
             <TooltipTrigger asChild>
               <Button
                 variant="outline"
                 size={isMobile ? "sm" : "default"}
                 onClick={() => {
                   if (isMobileOrTablet) {
                     setMobileTooltip('dismiss');
                     setTimeout(() => setMobileTooltip(''), 3000);
                   }
                   if (isPremium) {
                     onKeepReadingUntimed?.();
                     onDismiss?.();
                   } else {
                     onEndSession();
                   }
                 }}
                 className="min-h-[44px] min-w-[44px] rounded-full bg-background/95 backdrop-blur-sm border-2 border-red-500 text-red-500 hover:bg-red-50 hover:border-red-600"
                aria-label={isPremium ? t("floatingTimer.dismissTimer", "Dismiss timer for unlimited reading") : t("floatingTimer.endSession", "End Reading Session")}
                id="timer-dismiss-x-button"
              >
                <X className="w-4 h-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom">
              {isPremium ? t("floatingTimer.dismissNowHint", "Dismiss timer for unlimited reading") : t("floatingTimer.endNowHint", "End session now")}
            </TooltipContent>
          </Tooltip>

           {/* Collapse Button */}
           <Tooltip open={isMobileOrTablet ? mobileTooltip === 'collapse' : undefined}>
             <TooltipTrigger asChild>
               <Button
                 variant="outline"
                 size={isMobile ? "sm" : "default"}
                 onClick={() => {
                   if (isMobileOrTablet) {
                     setMobileTooltip('collapse');
                     setTimeout(() => setMobileTooltip(''), 3000);
                   }
                   setIsCollapsed(true);
                 }}
                className="min-h-[44px] min-w-[44px] rounded-full bg-background/95 backdrop-blur-sm"
                aria-label={t("floatingTimer.collapse", "Collapse timer")}
                id="timer-collapse-button"
              >
                <ChevronDown className="w-4 h-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom">
              {t("floatingTimer.sequentialTooltips.collapse", "Collapse the timer")}
            </TooltipContent>
          </Tooltip>
        </div>
      </TooltipProvider>

{/* Celebration Animation */}
{showCelebration && (
  <div className="fixed inset-0 z-[100] flex items-center justify-center" role="dialog" aria-labelledby="celebration-title" aria-live="polite">
    <div className="absolute inset-0 bg-background/70 backdrop-blur-sm" />
    <div className="relative z-[101] bg-background border border-border rounded-2xl shadow-2xl p-6 text-center animate-scale-in">
      <button
        className="absolute top-3 right-3 text-muted-foreground hover:text-foreground"
        aria-label={muted ? t('audio.muted','Muted') : t('audio.unmuted','Sound on')}
        onClick={() => setMuted((m) => !m)}
      >
        {muted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
      </button>
      <div className="text-5xl mb-3">🎉</div>
      <h3 id="celebration-title" className="text-xl font-bold text-emerald-600">
        {t("floatingTimer.congratulations", "Congratulations!")}
      </h3>
      <p className="text-sm text-muted-foreground" role="status" aria-live="polite">
        {t('timer.celebration.caption', 'Amazing work! Wrapping up your session…')}
      </p>
      <div className="mt-4 flex items-center justify-center gap-2">
        <Button
          variant="secondary"
          size="sm"
          onClick={() => {
            setShowCelebration(false);
            if (isPremium) {
              setShowChoice(true);
            } else {
              onSessionEnded(sessionStats);
            }
          }}
        >
          {t('timer.celebration.skip', 'Skip')}
        </Button>
      </div>
    </div>
  </div>
)}

{/* Post-celebration choice for premium users */}
{showChoice && (
  <div className="fixed inset-0 z-[105] flex items-center justify-center" role="dialog" aria-labelledby="timer-choice-title">
    <div className="absolute inset-0 bg-background/70 backdrop-blur-sm" />
    <div className="relative z-[106] bg-background/95 backdrop-blur-md border border-border rounded-2xl shadow-2xl p-4 sm:p-6 w-[90vw] max-w-md animate-scale-in">
      <h3 id="timer-choice-title" className="text-lg font-bold mb-2 text-center">{t('timer.expired.title', "Time's up!")}</h3>
      <p className="text-sm text-muted-foreground text-center mb-4">
        {t('timer.expired.subtitle', 'Choose what you\'d like to do next:')}
      </p>
      <div className="grid grid-cols-1 gap-2">
        {isPremium && (
          <Button
            onClick={() => {
              // Start voice quiz
              setShowChoice(false);
              setExpiredAcknowledged(true);
              onSessionEnded({ ...sessionStats, startVoiceQuiz: true });
            }}
            className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white"
          >
            🎤 {t('timer.expired.quizWithBuddy', 'Quiz with Buddy')}
          </Button>
        )}
        {isPremium && (
          <Button
            onClick={() => {
              onKeepReadingUntimed?.();
              setExpiredAcknowledged(true);
              setShowChoice(false);
            }}
            variant="outline"
            className="w-full"
          >
            {t('timer.expired.keepUntimed', 'Keep reading untimed')}
          </Button>
        )}
        {isPremium && (
          <Button
            onClick={async () => {
              await onSaveStoryNow?.();
              setShowChoice(false);
              onSessionEnded(sessionStats);
            }}
            className="w-full"
          >
            {t('timer.expired.saveAndEnd', 'Save & end session')}
          </Button>
        )}
        <Button
          onClick={() => onSessionEnded(sessionStats)}
          variant="secondary"
          className="w-full"
        >
          {t('timer.expired.endNow', 'End without saving')}
        </Button>
      </div>
    </div>
  </div>
)}

    </div>
  );
};
