import * as React from "react";
import { RefreshCcw, Wand2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface MagicRefreshIconProps extends React.HTMLAttributes<HTMLSpanElement> {
  size?: number;
  className?: string;
  // Fine-tuning controls
  ringScale?: number; // size of the circular arrows relative to overall size
  wandScale?: number; // size of the wand relative to overall size
  wandRotate?: number; // rotation in degrees for the wand
  ringStrokeWidth?: number;
  wandStrokeWidth?: number;
  ringClassName?: string;
  wandClassName?: string;
  absoluteStrokeWidth?: boolean;
  ariaLabel?: string;
}

// A composite icon: circular refresh arrows with a magic wand centered
export const MagicRefreshIcon: React.FC<MagicRefreshIconProps> = ({
  size = 20,
  className,
  ringScale = 0.92,
  wandScale = 0.58,
  wandRotate = -12,
  ringStrokeWidth = 2,
  wandStrokeWidth = 2,
  ringClassName,
  wandClassName,
  absoluteStrokeWidth = true,
  ariaLabel = "Magic refresh",
  ...props
}) => {
  const ringSize = Math.round(size * ringScale);
  const wandSize = Math.round(size * wandScale);

  return (
    <span
      className={cn("relative inline-block", className)}
      style={{ width: size, height: size }}
      role="img"
      aria-label={ariaLabel}
      {...props}
    >
      <RefreshCcw
        className={cn(
          "absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2",
          ringClassName
        )}
        width={ringSize}
        height={ringSize}
        strokeWidth={ringStrokeWidth}
        absoluteStrokeWidth={absoluteStrokeWidth}
        aria-hidden="true"
      />
      <Wand2
        className={cn(
          "absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2",
          wandClassName
        )}
        width={wandSize}
        height={wandSize}
        strokeWidth={wandStrokeWidth}
        absoluteStrokeWidth={absoluteStrokeWidth}
        style={{ transform: `translate(-50%, -50%) rotate(${wandRotate}deg)` }}
        aria-hidden="true"
      />
      <span className="sr-only">{ariaLabel}</span>
    </span>
  );
};

export default MagicRefreshIcon;
