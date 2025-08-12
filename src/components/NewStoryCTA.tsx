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
    if (!isPremium || iconOnly) return;
    try {
      const reduceMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches;
      const seen = sessionStorage.getItem("newstory_cta_seen");
      if (!seen) {
        sessionStorage.setItem("newstory_cta_seen", "1");
        setShowCoach(true);
        if (!reduceMotion) setShowSparkle(true);
        const coachTimer = setTimeout(() => setShowCoach(false), 3000);
        const sparkleTimer = setTimeout(() => setShowSparkle(false), 1200);
        return () => {
          clearTimeout(coachTimer);
          clearTimeout(sparkleTimer);
        };
      }
    } catch {
      // no-op
    }
  }, [isPremium, iconOnly]);

  const handleClick = () => {
    if (isLocked) {
      onUpgrade?.();
    } else {
      onNewStory?.();
    }
  };

  const iconSize = size === "sm" ? 16 : size === "lg" ? 22 : 18;

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
        <span className={cn("relative inline-flex items-center", !iconOnly && "mr-2")}>
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
      {!iconOnly && showCoach && (
        <span className="absolute -top-2 right-0 translate-y-[-50%] rounded-full bg-primary/90 text-primary-foreground text-xs px-2 py-0.5 shadow-sm">
          {t("labels.startHere", "Start here")}
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
