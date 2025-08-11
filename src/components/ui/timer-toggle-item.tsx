import React from "react";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";

interface TimerToggleItemProps {
  checked: boolean;
  onToggle: () => void;
  label: string;
  description?: string;
  icon?: React.ReactNode;
  className?: string;
  ariaLabel?: string;
}

// Pill-style toggle row, consistent with mobile design
export function TimerToggleItem({
  checked,
  onToggle,
  label,
  description,
  icon,
  className,
  ariaLabel,
}: TimerToggleItemProps) {
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-label={ariaLabel || label}
      className={cn(
        "group w-full overflow-visible z-50",
        "rounded-full border border-border bg-card",
        "px-3 py-2 flex items-center justify-between gap-3",
        "hover:bg-accent hover:text-accent-foreground transition-colors",
        className
      )}
    >
      <span className="flex items-center gap-3 min-w-0">
        {icon && <span className="shrink-0">{icon}</span>}
        <span className="flex-1 min-w-0 text-left">
          <span className="block font-medium leading-tight truncate">{label}</span>
          {description && (
            <span className="block text-xs text-muted-foreground truncate">{description}</span>
          )}
        </span>
      </span>
      <span onClick={(e) => e.stopPropagation()} className="shrink-0">
        <Switch
          checked={checked}
          onCheckedChange={onToggle}
          aria-label={ariaLabel || label}
        />
      </span>
    </button>
  );
}

export default TimerToggleItem;
