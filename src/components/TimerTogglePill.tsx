import { Clock } from "lucide-react";
import { cn } from "@/lib/utils";

interface TimerTogglePillProps {
  enabled: boolean;
  timeRemaining: number;
  onToggle: () => void;
}

export const TimerTogglePill: React.FC<TimerTogglePillProps> = ({ enabled, timeRemaining, onToggle }) => {
  const format = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${sec.toString().padStart(2, '0')}`;
  };

  return (
    <button
      onClick={onToggle}
      className={cn(
        "fixed z-[70] rounded-full border px-3 py-1.5 shadow-md backdrop-blur-sm",
        "bg-background/95 border-border text-foreground",
        "left-4",
        "bottom-24 md:bottom-12"
      )}
      aria-label={enabled ? "Turn off timer" : "Turn on timer"}
    >
      <span className="inline-flex items-center gap-2 text-sm">
        <Clock className="w-4 h-4" />
        {enabled ? format(timeRemaining) : "Timer Off"}
      </span>
    </button>
  );
};
