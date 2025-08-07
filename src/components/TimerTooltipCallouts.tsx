import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Card, CardContent } from "@/components/ui/card";
import { Play, Pause, Minus, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface TimerTooltipCalloutsProps {
  isVisible: boolean;
  tutorialStep: number;
  onComplete: () => void;
}

interface CalloutStep {
  target: string;
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
  position: "top" | "bottom" | "left" | "right";
}

export const TimerTooltipCallouts = ({ 
  isVisible, 
  tutorialStep, 
  onComplete 
}: TimerTooltipCalloutsProps) => {
  const { t } = useTranslation();
  const [currentCallout, setCurrentCallout] = useState(0);
  const [calloutPosition, setCalloutPosition] = useState({ top: 0, left: 0 });

  const calloutSteps: CalloutStep[] = [
    {
      target: 'button[aria-label*="Start reading"], button[aria-label*="Pause reading"]',
      icon: Play,
      title: t("tutorial.timer.playButton", "Play/Pause Button"),
      description: t("tutorial.timer.playDescription", "Click to start or pause your reading timer"),
      position: "top"
    },
    {
      target: 'button[aria-label*="Reduce time"]',
      icon: Minus,
      title: t("tutorial.timer.reduceButton", "Reduce Time"),
      description: t("tutorial.timer.reduceDescription", "Remove 5 minutes if you need less time"),
      position: "top"
    },
    {
      target: 'button[aria-label*="End reading session"]',
      icon: X,
      title: t("tutorial.timer.endButton", "End Session"),
      description: t("tutorial.timer.endDescription", "Finish your reading session early"),
      position: "top"
    }
  ];

  // Position callout relative to target element
  const positionCallout = (targetSelector: string) => {
    const element = document.querySelector(targetSelector);
    if (!element) return;

    const rect = element.getBoundingClientRect();
    const calloutWidth = 200;
    const calloutHeight = 80;
    const offset = 10;

    let top = rect.top - calloutHeight - offset;
    let left = rect.left + rect.width / 2 - calloutWidth / 2;

    // Ensure callout stays within viewport
    if (left < 10) left = 10;
    if (left + calloutWidth > window.innerWidth - 10) {
      left = window.innerWidth - calloutWidth - 10;
    }
    if (top < 10) {
      top = rect.bottom + offset;
    }

    setCalloutPosition({ top, left });
  };

  // Auto-progress through callouts
  useEffect(() => {
    if (!isVisible || tutorialStep !== 0) return;

    const timer = setTimeout(() => {
      if (currentCallout < calloutSteps.length - 1) {
        setCurrentCallout(currentCallout + 1);
      } else {
        onComplete();
      }
    }, 3000); // 3 seconds per callout

    return () => clearTimeout(timer);
  }, [currentCallout, isVisible, tutorialStep, onComplete]);

  // Position callout when it changes
  useEffect(() => {
    if (!isVisible || tutorialStep !== 0) return;
    
    const step = calloutSteps[currentCallout];
    if (step) {
      positionCallout(step.target);
      
      // Highlight the target button
      const element = document.querySelector(step.target);
      if (element) {
        element.classList.add('timer-button-highlight');
        
        return () => {
          element.classList.remove('timer-button-highlight');
        };
      }
    }
  }, [currentCallout, isVisible, tutorialStep]);

  if (!isVisible || tutorialStep !== 0 || currentCallout >= calloutSteps.length) {
    return null;
  }

  const step = calloutSteps[currentCallout];
  const Icon = step.icon;

  return (
    <div 
      className="fixed z-60 pointer-events-none"
      style={{ 
        top: `${calloutPosition.top}px`, 
        left: `${calloutPosition.left}px` 
      }}
    >
      <Card className={cn(
        "w-48 bg-white/95 backdrop-blur-sm shadow-xl border-2 border-primary/30 rounded-lg",
        "animate-in fade-in slide-in-from-bottom-2 duration-300"
      )}>
        <CardContent className="p-3">
          <div className="flex items-center gap-2 mb-2">
            <div className="p-1 bg-primary/10 rounded-full">
              <Icon className="w-3 h-3 text-primary" />
            </div>
            <h4 className="font-semibold text-sm">{step.title}</h4>
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed">
            {step.description}
          </p>
          
          {/* Progress indicator */}
          <div className="flex gap-1 mt-2 justify-center">
            {calloutSteps.map((_, index) => (
              <div
                key={index}
                className={cn(
                  "w-1.5 h-1.5 rounded-full transition-colors",
                  index === currentCallout 
                    ? 'bg-primary' 
                    : index < currentCallout 
                      ? 'bg-primary/50' 
                      : 'bg-muted'
                )}
              />
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};