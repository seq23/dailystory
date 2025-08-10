import React from "react";
import { Button } from "@/components/ui/button";
import MagicRefreshIcon from "@/components/icons/MagicRefreshIcon";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Lock } from "lucide-react";
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
}

const NewStoryCTA: React.FC<NewStoryCTAProps> = ({
  isPremium,
  iconOnly = false,
  onNewStory,
  onUpgrade,
  className,
  size = "md",
  wandPulse = false,
}) => {
  const { t } = useTranslation();
  const label = t("common.newStory", "New Story");
  const isLocked = !isPremium;

  const handleClick = () => {
    if (isLocked) {
      onUpgrade?.();
    } else {
      onNewStory?.();
    }
  };

  const iconSize = size === "sm" ? 16 : size === "lg" ? 22 : 18;

  const buttonEl = (
    <Button
      onClick={handleClick}
      variant={iconOnly ? "ghost" : "fun"}
      size={iconOnly ? "sm" : "default"}
      className={cn(
        iconOnly
          ? "min-h-[36px] min-w-[36px] rounded-full p-0 bg-gradient-primary text-primary-foreground"
          : "bg-gradient-primary text-primary-foreground",
        wandPulse && "animate-pulse ring-2 ring-primary/40",
        isLocked && "opacity-90",
        className
      )}
      aria-label={isLocked ? `${label} (${t("badges.premium", "Premium")})` : label}
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
        {isLocked && (
          <span className="absolute -top-1 -right-1 inline-flex h-4 w-4 items-center justify-center rounded-full bg-background/90 border border-border">
            <Lock className="h-2.5 w-2.5 text-muted-foreground" aria-hidden="true" />
          </span>
        )}
      </span>
      {!iconOnly && label}
    </Button>
  );

  if (iconOnly) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>{buttonEl}</TooltipTrigger>
          <TooltipContent>
            {isLocked ? t("tooltips.premium", "Premium feature") : t("tooltips.newStory", "Start a fresh story")}
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return buttonEl;
};

export default NewStoryCTA;
