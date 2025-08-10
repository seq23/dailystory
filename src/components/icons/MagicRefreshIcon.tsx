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
  ringRotate?: number; // rotation for the refresh ring
  ringStrokeWidth?: number;
  wandStrokeWidth?: number;
  ringClassName?: string;
  wandClassName?: string;
  absoluteStrokeWidth?: boolean;
  // Sparkle safety gap to avoid visual merging between ring and wand sparkles
  sparkleGap?: boolean;
  sparkleGapPx?: number; // radius of inner gap in pixels
  sparkleGapAt?: 'top' | 'bottom' | 'both';
  // Minor offset tweaks for the wand positioning
  wandOffset?: { x?: number; y?: number };
  ariaLabel?: string;
}

// A composite icon: circular refresh arrows with a magic wand centered
export const MagicRefreshIcon: React.FC<MagicRefreshIconProps> = ({
  size = 20,
  className,
  ringScale = 0.92,
  wandScale = 0.58,
  wandRotate = -12,
  ringRotate = 0,
  ringStrokeWidth = 2,
  wandStrokeWidth = 2,
  ringClassName,
  wandClassName,
  absoluteStrokeWidth = true,
  sparkleGap = true,
  sparkleGapPx,
  sparkleGapAt = 'both',
  wandOffset = { x: 0, y: 0 },
  ariaLabel = "Magic refresh",
  ...props
}) => {
  const ringSize = Math.round(size * ringScale);
  const wandSize = Math.round(size * wandScale);
  const gapPx = sparkleGapPx ?? Math.max(2, Math.round(size * 0.12));

  const ringTransform = `translate(-50%, -50%) rotate(${ringRotate}deg)`;
  const topMaskStyles = sparkleGap && (sparkleGapAt === 'both' || sparkleGapAt === 'top')
    ? {
        WebkitMaskImage: `radial-gradient(circle at 50% 50%, transparent ${gapPx}px, black ${gapPx + 0.5}px)`,
        maskImage: `radial-gradient(circle at 50% 50%, transparent ${gapPx}px, black ${gapPx + 0.5}px)`,
      }
    : undefined;
  const bottomMaskStyles = sparkleGap && (sparkleGapAt === 'both' || sparkleGapAt === 'bottom')
    ? {
        WebkitMaskImage: `radial-gradient(circle at 50% 50%, transparent ${gapPx}px, black ${gapPx + 0.5}px)`,
        maskImage: `radial-gradient(circle at 50% 50%, transparent ${gapPx}px, black ${gapPx + 0.5}px)`,
      }
    : undefined;

  const wandTranslate = `translate(calc(-50% + ${wandOffset?.x ?? 0}px), calc(-50% + ${wandOffset?.y ?? 0}px)) rotate(${wandRotate}deg)`;

  return (
    <span
      className={cn("relative inline-block", className)}
      style={{ width: size, height: size }}
      role="img"
      aria-label={ariaLabel}
      {...props}
    >
      {/* Bottom half: sits under the wand */}
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
        style={{
          transform: ringTransform,
          clipPath: 'inset(50% 0 0 0)',
          ...(bottomMaskStyles as React.CSSProperties),
        }}
      />

      {/* Wand */}
      <Wand2
        className={cn(
          "absolute left-1/2 top-1/2",
          wandClassName
        )}
        width={wandSize}
        height={wandSize}
        strokeWidth={wandStrokeWidth}
        absoluteStrokeWidth={absoluteStrokeWidth}
        style={{ transform: wandTranslate }}
        aria-hidden="true"
      />

      {/* Top half: sits over the wand */}
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
        style={{
          transform: ringTransform,
          clipPath: 'inset(0 0 50% 0)',
          ...(topMaskStyles as React.CSSProperties),
        }}
      />

      <span className="sr-only">{ariaLabel}</span>
    </span>
  );
};

export default MagicRefreshIcon;
