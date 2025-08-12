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
  const SEEN_KEY = "newstory_cta_seen_v3";
  const prevPremiumRef = React.useRef<boolean>(isPremium);
  const btnRef = React.useRef<HTMLButtonElement>(null);
  const baseIcon = size === "sm" ? 20 : size === "lg" ? 34 : 28;
  const [iconPx, setIconPx] = React.useState<number>(baseIcon);
  const timersRef = React.useRef<{ coach?: number; sparkle?: number }>({});
  React.useEffect(() => {
    if (!isPremium) return;
    try {
      const reduceMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches;
      const justBecamePremium = !prevPremiumRef.current && isPremium;
      if (justBecamePremium) {
        sessionStorage.removeItem(SEEN_KEY);
      }
      const seen = sessionStorage.getItem(SEEN_KEY);
      if (!seen) {
        sessionStorage.setItem(SEEN_KEY, "1");
        setShowCoach(true);
        if (!reduceMotion) setShowSparkle(true);
        timersRef.current.coach = window.setTimeout(() => setShowCoach(false), 7000);
        timersRef.current.sparkle = window.setTimeout(() => setShowSparkle(false), 2000);
      }
      prevPremiumRef.current = isPremium;
      return () => {
        if (timersRef.current.coach) clearTimeout(timersRef.current.coach);
        if (timersRef.current.sparkle) clearTimeout(timersRef.current.sparkle);
      };
    } catch {
      // no-op
    }
  }, [isPremium]);

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

  React.useLayoutEffect(() => {
    const el = btnRef.current;
    if (!el) return;
    const update = () => {
      const h = el.getBoundingClientRect().height;
      if (h && !Number.isNaN(h)) {
        setIconPx(Math.max(16, Math.floor(h * 0.92)));
      }
    };
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
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
          wandPulse && "ring-2 ring-primary/40",
          isLocked && "opacity-50 cursor-not-allowed",
          className
        )}
        aria-label={isLocked ? `${label} (${t("badges.premium", "Premium")})` : label}
        disabled={isLocked}
        aria-disabled={isLocked}
      >
        {iconOnly ? (
          <span className={cn("relative inline-flex items-center")}
          >
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
          </span>
        ) : (
          <span className="relative inline-grid grid-cols-2 items-center w-full min-w-0">
            <span className="col-span-1 flex items-center justify-center pr-1 md:pr-2">
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
            </span>
            <span className="col-span-1 min-w-0 text-left truncate">{label}</span>
          </span>
        )}
      </Button>
      {showCoach && (
        <span className="absolute top-1/2 -translate-y-1/2 left-0 -translate-x-[calc(100%+8px)] flex items-center gap-1.5 md:gap-2 pointer-events-none z-30 motion-safe:animate-enter">
          <span className="rounded-full bg-primary/90 text-primary-foreground text-[10px] md:text-xs font-semibold px-2 py-0.5 md:px-2.5 md:py-1 shadow-sm">
            {t("labels.startHere", "Start here!")}
          </span>
          {/* Mobile/Tablet arrow */}
          <svg
            className="h-8 w-[64px] md:hidden text-destructive drop-shadow-sm overflow-visible"
            viewBox="0 0 120 60"
            aria-hidden="true"
            focusable="false"
          >
            <defs>
              <marker id="arrowhead-sm" markerWidth="6" markerHeight="6" refX="4" refY="3" orient="auto" markerUnits="strokeWidth">
                <path d="M0,0 L6,3 L0,6 Z" fill="currentColor" />
              </marker>
            </defs>
            <path
              d="M8,40 C 42,62 76,62 108,40"
              fill="none"
              stroke="currentColor"
              strokeWidth="3.2"
              strokeLinecap="round"
              markerEnd="url(#arrowhead-sm)"
            />
          </svg>
          {/* Desktop arrow */}
          <svg
            className="hidden md:block h-10 w-[96px] text-destructive drop-shadow-sm overflow-visible"
            viewBox="0 0 140 72"
            aria-hidden="true"
            focusable="false"
          >
            <defs>
              <marker id="arrowhead-lg" markerWidth="8" markerHeight="8" refX="5" refY="4" orient="auto" markerUnits="strokeWidth">
                <path d="M0,0 L8,4 L0,8 Z" fill="currentColor" />
              </marker>
            </defs>
            <path
              d="M10,48 C 54,72 98,72 132,48"
              fill="none"
              stroke="currentColor"
              strokeWidth="4.0"
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
