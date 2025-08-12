import React from "react";
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
}) => {
  const { t } = useTranslation();
  const label = labelOverride ?? t("common.newStory", "New Story");
  const isLocked = !isPremium;

  const [showSparkle, setShowSparkle] = React.useState(false);
  const [showCoach, setShowCoach] = React.useState(false);

  React.useEffect(() => {
    if (!isPremium) return;
    try {
      const reduceMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches;
      const seen = sessionStorage.getItem("newstory_cta_seen");
      if (!seen) {
        sessionStorage.setItem("newstory_cta_seen", "1");
        setShowCoach(true);
        if (!reduceMotion) setShowSparkle(true);
        const coachTimer = setTimeout(() => setShowCoach(false), 6000);
        const sparkleTimer = setTimeout(() => setShowSparkle(false), 2000);
        return () => {
          clearTimeout(coachTimer);
          clearTimeout(sparkleTimer);
        };
      }
    } catch {
      // no-op
    }
  }, [isPremium, iconOnly]);

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
      if (document.visibilityState === "visible") {
        reset();
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

  const handleClick = () => {
    if (isLocked) {
      onUpgrade?.();
    } else {
      onNewStory?.();
    }
  };

  const iconSize = size === "sm" ? 20 : size === "lg" ? 34 : 28;

  const buttonEl = (
    <span className="relative inline-flex">
      <Button
        onClick={handleClick}
        variant={iconOnly ? "ghost" : "fun"}
        size={iconOnly ? "sm" : "default"}
        className={cn(
          iconOnly
            ? "min-h-[36px] min-w-[36px] rounded-full p-0 bg-gradient-primary text-primary-foreground"
            : "bg-gradient-primary text-primary-foreground rounded-full",
          !iconOnly && "hover-scale",
          wandPulse && "ring-2 ring-primary/40",
          isLocked && "opacity-50 cursor-not-allowed",
          className
        )}
        aria-label={isLocked ? `${label} (${t("badges.premium", "Premium")})` : label}
        disabled={isLocked}
        aria-disabled={isLocked}
      >
        <span className={cn("relative inline-flex items-center", !iconOnly && "mr-1 md:mr-2")}>
          <MagicRefreshIcon
            size={iconSize}
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
        </span>
        {!iconOnly && label}
      </Button>
      {showCoach && (
        <span className="absolute top-1/2 -translate-y-1/2 left-0 -translate-x-[calc(100%+8px)] flex items-center gap-1.5 md:gap-2 pointer-events-none z-30 motion-safe:animate-enter">
          <span className="rounded-full bg-primary/90 text-primary-foreground text-[10px] md:text-xs font-semibold px-2 py-0.5 md:px-2.5 md:py-1 shadow-sm">
            {t("labels.startHere", "Start here!")}
          </span>
          {/* Mobile/Tablet arrow */}
          <svg
            className="h-8 w-[56px] md:hidden text-destructive drop-shadow-sm"
            viewBox="0 0 90 48"
            aria-hidden="true"
            focusable="false"
          >
            <defs>
              <marker id="arrowhead-sm" markerWidth="8" markerHeight="8" refX="5" refY="4" orient="auto" markerUnits="strokeWidth">
                <path d="M0,0 L8,4 L0,8 Z" fill="currentColor" />
              </marker>
            </defs>
            <path
              d="M6,34 C 30,50 54,50 78,34"
              fill="none"
              stroke="currentColor"
              strokeWidth="3.5"
              strokeLinecap="round"
              markerEnd="url(#arrowhead-sm)"
            />
          </svg>
          {/* Desktop arrow */}
          <svg
            className="hidden md:block h-10 w-[84px] text-destructive drop-shadow-sm"
            viewBox="0 0 110 56"
            aria-hidden="true"
            focusable="false"
          >
            <defs>
              <marker id="arrowhead-lg" markerWidth="10" markerHeight="10" refX="6" refY="5" orient="auto" markerUnits="strokeWidth">
                <path d="M0,0 L10,5 L0,10 Z" fill="currentColor" />
              </marker>
            </defs>
            <path
              d="M8,38 C 40,60 72,60 104,38"
              fill="none"
              stroke="currentColor"
              strokeWidth="4.5"
              strokeLinecap="round"
              markerEnd="url(#arrowhead-lg)"
            />
          </svg>
        </span>
      )}
      <SparkleAnimation
        isActive={showSparkle}
        intensity="high"
        isPremium={isPremium}
        className="absolute inset-0 pointer-events-none z-10"
      />
    </span>
  );

  const defaultIconOnlyTooltip = isLocked
    ? t("tooltips.newStoryPremium", "Premium only. Refresh story")
    : t("tooltips.newStory", "Start a fresh story");
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
