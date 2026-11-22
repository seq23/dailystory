import { uiText } from "@/i18n/uiText";
import React from "react";
import { globalResizeService } from '@/services/GlobalResizeService';
import { performanceManager } from '@/services/PerformanceManager';
import { Button } from "@/components/ui/button";
import MagicRefreshIcon from "@/components/icons/MagicRefreshIcon";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { SparkleAnimation } from "@/components/SparkleAnimation";

import { cn } from "@/lib/utils";
import { useTranslation } from "react-i18next";

interface NewStoryCTAProps {
  isPremium: boolean;
  iconOnly?: boolean;
  onNewStory: () => void;
  onUpgrade: () => void;
  className?: string;
  size?: "sm" | "md" | "lg";
  wandPulse?: boolean;
  labelOverride?: string;
  tooltipText?: string;
  showCoachOnSignIn?: boolean; // show coach only on premium home sign-in
  isGeneratingRewrite?: boolean;
  /**
   * A narrow phone row: the "Start here!" chip starts at the button's left edge instead of
   * centring under it (centred, it ran off a 320 px screen), and the sign-in sparkles stay
   * on the button (they float 45 px up, onto the story title on the line above).
   */
  narrowRow?: boolean;
}

const NewStoryCTA: React.FC<NewStoryCTAProps> = ({
  isPremium,
  iconOnly = false,
  onNewStory,
  onUpgrade,
  className,
  size = "md",
  wandPulse = false,
  labelOverride,
  tooltipText,
  showCoachOnSignIn = true,
  isGeneratingRewrite = false,
  narrowRow = false,
}) => {
  const { t } = useTranslation();
  const label = labelOverride ?? t("common.newStory", "New Story");
  const isLocked = !isPremium;

  const [showSparkle, setShowSparkle] = React.useState(false);
  const [showCoach, setShowCoach] = React.useState(false);
  const btnRef = React.useRef<HTMLButtonElement>(null);
  const baseIcon = size === "sm" ? 20 : size === "lg" ? 34 : 28;
  const [iconPx, setIconPx] = React.useState<number>(baseIcon);
  const timersRef = React.useRef<{ coach?: NodeJS.Timeout; sparkle?: NodeJS.Timeout }>({});
  React.useEffect(() => {
    if (!isPremium || !showCoachOnSignIn) return;
    try {
      const reduceMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches;
      setShowCoach(true);
      if (!reduceMotion) setShowSparkle(true);
      timersRef.current.coach = performanceManager.setTimeout(() => setShowCoach(false), 7000, 'coach timeout');
      timersRef.current.sparkle = performanceManager.setTimeout(() => setShowSparkle(false), 2000, 'sparkle timeout');
    } catch {
      // no-op
    }
    return () => {
      if (timersRef.current.coach) clearTimeout(timersRef.current.coach);
      if (timersRef.current.sparkle) clearTimeout(timersRef.current.sparkle);
    };
  }, [isPremium, showCoachOnSignIn]);

  // Idle sparkle nudge after periods of inactivity (desktop/tab visible, premium only)
  const lastActivityRef = React.useRef<number>(Date.now());
  const idleSparkleCountRef = React.useRef<number>(0);
  const idleTimersRef = React.useRef<{ idle?: number; sparkle?: number }>({});

  React.useEffect(() => {
    if (!isPremium) return;

    let reduceMotion = false;
    try {
      reduceMotion = !!window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches;
    } catch {}
    if (reduceMotion) return;

    const scheduleIdle = (delay: number) => {
      if (document.visibilityState !== "visible") return;
      if (idleSparkleCountRef.current >= 3) return;
      idleTimersRef.current.idle = window.setTimeout(() => {
        const now = Date.now();
        const idleFor = now - lastActivityRef.current;
        if (idleFor >= delay - 50 && document.visibilityState === "visible") {
          setShowSparkle(true);
          idleSparkleCountRef.current += 1;
          idleTimersRef.current.sparkle = window.setTimeout(() => {
            setShowSparkle(false);
            if (idleSparkleCountRef.current < 3) {
              scheduleIdle(60000);
            }
          }, 1200);
        } else {
          scheduleIdle(25000);
        }
      }, delay);
    };

    const reset = () => {
      if (idleTimersRef.current.idle) {
        clearTimeout(idleTimersRef.current.idle);
        idleTimersRef.current.idle = undefined;
      }
      scheduleIdle(25000);
    };

    const onActivity = () => {
      lastActivityRef.current = Date.now();
      reset();
    };

    const activityEvents: (keyof WindowEventMap)[] = [
      "mousemove",
      "keydown",
      "pointerdown",
      "scroll",
      "touchstart",
    ];
    activityEvents.forEach((e) => window.addEventListener(e, onActivity, { passive: true }));

    const onVisibility = () => {
      // Debounce visibility changes to prevent excessive processing
      if (document.visibilityState === "visible") {
        // Only reset if we've been hidden for more than 1 second
        const timeSinceLastActivity = Date.now() - lastActivityRef.current;
        if (timeSinceLastActivity > 1000) {
          reset();
        }
      } else {
        if (idleTimersRef.current.idle) {
          clearTimeout(idleTimersRef.current.idle);
          idleTimersRef.current.idle = undefined;
        }
      }
    };
    document.addEventListener("visibilitychange", onVisibility);

    scheduleIdle(25000);

    return () => {
      activityEvents.forEach((e) => window.removeEventListener(e, onActivity));
      document.removeEventListener("visibilitychange", onVisibility);
      if (idleTimersRef.current.idle) clearTimeout(idleTimersRef.current.idle);
      if (idleTimersRef.current.sparkle) clearTimeout(idleTimersRef.current.sparkle);
    };
  }, [isPremium, iconOnly]);

  React.useLayoutEffect(() => {
    const el = btnRef.current;
    if (!el) return;
    const update = () => {
      requestAnimationFrame(() => {
        const h = el.getBoundingClientRect().height;
        if (h && !Number.isNaN(h)) {
          const factor = h <= 44 ? 0.8 : 0.92;
          setIconPx(Math.max(16, Math.floor(h * factor)));
        }
      });
    };
    update();
    const unsubscribe = globalResizeService.observe(el, update);
    return () => unsubscribe();
  }, [size]);

  const handleClick = () => {
    if (isLocked) {
      onUpgrade?.();
    } else {
      onNewStory?.();
    }
  };

  

  const buttonEl = (
    <span className="relative inline-flex overflow-visible">
      <Button
        ref={btnRef}
        onClick={handleClick}
        variant={iconOnly ? "ghost" : "fun"}
        size={iconOnly ? "sm" : "default"}
        className={cn(
          iconOnly
            ? "min-h-[36px] min-w-[36px] rounded-full p-0 bg-gradient-primary text-primary-foreground"
            : "bg-gradient-primary text-primary-foreground rounded-full",
          !iconOnly && "hover-scale",
          !iconOnly && "px-2 md:px-4",
          !iconOnly && "justify-start",
          wandPulse && "ring-2 ring-primary/40",
          isLocked && "opacity-50 cursor-not-allowed",
          className
        )}
        aria-label={isLocked ? `${label} (${t("badges.premium", "Premium")})` : label}
        disabled={isLocked || isGeneratingRewrite}
        aria-disabled={isLocked || isGeneratingRewrite}
      >
        {iconOnly ? (
          <span className={cn("relative inline-flex items-center")}
          >
            {isGeneratingRewrite ? (
              <div className="animate-spin rounded-full border-2 border-current border-t-transparent" style={{ width: iconPx, height: iconPx }} aria-label={uiText("Refreshing story")} />
            ) : (
              <MagicRefreshIcon
                size={iconPx}
                ringScale={0.92}
                wandScale={0.58}
                wandRotate={-12}
                ringRotate={0}
                ringStrokeWidth={2}
                wandStrokeWidth={2}
                absoluteStrokeWidth
                sparkleGap
                ariaLabel={label}
                ringClassName="text-current"
                wandClassName="text-current"
              />
            )}
          </span>
        ) : (
          <span className="relative inline-grid grid-cols-[auto,1fr] items-center w-full min-w-0">
            <span className="col-span-1 flex items-center justify-start md:justify-center pr-1 md:pr-2" style={{ width: iconPx }}>
              {isGeneratingRewrite ? (
                <div className="animate-spin rounded-full border-2 border-current border-t-transparent" style={{ width: iconPx, height: iconPx }} aria-label={uiText("Refreshing story")} />
              ) : (
                <MagicRefreshIcon
                  size={iconPx}
                  ringScale={0.92}
                  wandScale={0.58}
                  wandRotate={-12}
                  ringRotate={0}
                  ringStrokeWidth={2}
                  wandStrokeWidth={2}
                  absoluteStrokeWidth
                  sparkleGap
                  ariaLabel={label}
                  ringClassName="text-current"
                  wandClassName="text-current"
                />
              )}
            </span>
            <span className="col-span-1 min-w-0 text-left whitespace-nowrap text-xs sm:text-sm">{label}</span>
          </span>
        )}
      </Button>
      {showCoach && (
        // One placement at every width: under the button, pointing up. To its left it ran
        // off a phone's edge and covered long story titles on wide screens (22 Nov 2026).
        <span
          data-testid="start-here-coach"
          className={cn(
            "absolute z-30 pointer-events-none motion-safe:animate-enter flex flex-col-reverse top-full mt-1",
            narrowRow ? "left-0 items-start" : "left-1/2 -translate-x-1/2 items-center",
          )}
        >
          <span className="whitespace-nowrap rounded-full border-2 border-primary bg-background text-foreground text-xs font-semibold px-2.5 py-0.5 shadow-md">
            {t("labels.startHere", "Start here!")}
          </span>
          <svg className={cn("h-2 w-3 -mb-px text-primary", narrowRow && "ml-4")} viewBox="0 0 12 8" aria-hidden="true" focusable="false">
            <path d="M6,0 L12,8 L0,8 Z" fill="currentColor" />
          </svg>
        </span>
      )}
      <SparkleAnimation
        isActive={showSparkle}
        intensity="high"
        isPremium={isPremium}
        className={cn("absolute inset-0 pointer-events-none z-10", narrowRow && "overflow-hidden rounded-full")}
      />
    </span>
  );

  const defaultIconOnlyTooltip = isLocked
    ? t("tooltips.newStoryPremium", "Premium only. Refresh story")
    : t("tooltips.refreshStory", "Refresh story");
  const resolvedTooltip = tooltipText ?? (iconOnly ? defaultIconOnlyTooltip : undefined);

  if (resolvedTooltip) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <span className="inline-flex">{buttonEl}</span>
          </TooltipTrigger>
          <TooltipContent side="bottom">{resolvedTooltip}</TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return buttonEl;
};

export default NewStoryCTA;
