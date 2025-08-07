import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";
import { Play, Minus, X } from "lucide-react";

interface TimerButtonTooltipProps {
  targetId: string;
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  isVisible: boolean;
  delay?: number;
  onComplete?: () => void;
}

export const TimerButtonTooltip = ({
  targetId,
  title,
  description,
  icon: Icon,
  isVisible,
  delay = 0,
  onComplete
}: TimerButtonTooltipProps) => {
  const [position, setPosition] = useState({ top: 0, left: 0, show: false });

  useEffect(() => {
    if (!isVisible) {
      setPosition(prev => ({ ...prev, show: false }));
      return;
    }

    const timer = setTimeout(() => {
      const element = document.getElementById(targetId);
      if (!element) {
        console.warn(`🎯 Timer Tooltip: Element not found: ${targetId}`);
        return;
      }

      const rect = element.getBoundingClientRect();
      const tooltipWidth = 240;
      const tooltipHeight = 80;
      const offset = 15;

      // Position above the button
      let top = rect.top - tooltipHeight - offset;
      let left = rect.left + rect.width / 2 - tooltipWidth / 2;

      // Adjust for screen boundaries
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;

      if (left < 10) left = 10;
      if (left + tooltipWidth > viewportWidth - 10) {
        left = viewportWidth - tooltipWidth - 10;
      }

      if (top < 10) {
        top = rect.bottom + offset;
      }

      setPosition({ top, left, show: true });

      // Highlight the target button
      element.classList.add('timer-button-highlight');
      (element as HTMLElement).style.zIndex = '99999';
      (element as HTMLElement).style.position = 'relative';

      // Auto-complete after 4 seconds
      const completeTimer = setTimeout(() => {
        onComplete?.();
      }, 4000);

      return () => {
        clearTimeout(completeTimer);
        element.classList.remove('timer-button-highlight');
        (element as HTMLElement).style.zIndex = '';
        (element as HTMLElement).style.position = '';
      };
    }, delay);

    return () => clearTimeout(timer);
  }, [isVisible, targetId, delay, onComplete]);

  if (!position.show) return null;

  return (
    <div
      className="fixed z-[99999] pointer-events-none"
      style={{
        top: `${position.top}px`,
        left: `${position.left}px`
      }}
    >
      <div className={cn(
        "w-60 bg-white/95 backdrop-blur-sm shadow-xl border-2 border-primary/30 rounded-lg p-3",
        "animate-in fade-in slide-in-from-bottom-2 duration-300"
      )}>
        <div className="flex items-center gap-2 mb-2">
          <div className="p-1.5 bg-primary/10 rounded-full">
            <Icon className="w-4 h-4 text-primary" />
          </div>
          <h4 className="font-semibold text-sm text-foreground">{title}</h4>
        </div>
        <p className="text-xs text-muted-foreground leading-relaxed">
          {description}
        </p>
      </div>
    </div>
  );
};