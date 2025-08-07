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
      target: '#timer-play-button, .timer-play-button',
      icon: Play,
      title: t("tutorial.timer.playButton", "Play/Pause"),
      description: t("tutorial.timer.playDescription", "Click to start or pause your reading timer"),
      position: "top"
    },
    {
      target: '#timer-reduce-button, .timer-reduce-button',
      icon: Minus,
      title: t("tutorial.timer.reduceButton", "Reduce Time"),
      description: t("tutorial.timer.reduceDescription", "Remove 5 minutes if you need less time"),
      position: "top"
    },
    {
      target: '#timer-end-button, .timer-end-button',
      icon: X,
      title: t("tutorial.timer.endButton", "End Session"),
      description: t("tutorial.timer.endDescription", "Finish your reading session early"),
      position: "top"
    }
  ];

  // Position callout relative to target element with better collision detection
  const positionCallout = (targetSelector: string) => {
    const element = document.querySelector(targetSelector);
    if (!element) return;

    const rect = element.getBoundingClientRect();
    const calloutWidth = 220;
    const calloutHeight = 100;
    const offset = 15;
    
    // Default to top positioning
    let top = rect.top - calloutHeight - offset;
    let left = rect.left + rect.width / 2 - calloutWidth / 2;

    // Viewport collision detection
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    
    // Horizontal bounds check
    if (left < 10) left = 10;
    if (left + calloutWidth > viewportWidth - 10) {
      left = viewportWidth - calloutWidth - 10;
    }
    
    // Vertical bounds check - if not enough space on top, place below
    if (top < 10) {
      top = rect.bottom + offset;
    }
    
    // Final safety check for bottom overflow
    if (top + calloutHeight > viewportHeight - 10) {
      top = viewportHeight - calloutHeight - 10;
    }

    setCalloutPosition({ top, left });
  };

  // Auto-progress through callouts with proper timing
  useEffect(() => {
    if (!isVisible || tutorialStep !== 0) return;

    // Start the first callout immediately
    if (currentCallout === 0) {
      const step = calloutSteps[currentCallout];
      if (step) {
        setTimeout(() => positionCallout(step.target), 100); // Small delay for DOM updates
      }
    }

    const timer = setTimeout(() => {
      if (currentCallout < calloutSteps.length - 1) {
        setCurrentCallout(currentCallout + 1);
      } else {
        // Complete the callouts after the last one
        setTimeout(() => onComplete(), 1000);
      }
    }, currentCallout === 0 ? 2500 : 3000); // Shorter first tooltip, then 3s each

    return () => clearTimeout(timer);
  }, [currentCallout, isVisible, tutorialStep, onComplete]);

  // Position callout and highlight button when it changes
  useEffect(() => {
    if (!isVisible || tutorialStep !== 0 || currentCallout >= calloutSteps.length) return;
    
    const step = calloutSteps[currentCallout];
    if (step) {
      // Small delay to ensure DOM is ready
      setTimeout(() => {
        positionCallout(step.target);
        
        // Highlight the target button with pulsing animation
        const element = document.querySelector(step.target);
        if (element) {
          element.classList.add('timer-button-highlight');
          console.log(`🎯 Timer Tutorial: Highlighting button ${currentCallout + 1}: ${step.title}`);
        } else {
          console.warn(`🎯 Timer Tutorial: Button not found for step ${currentCallout + 1}: ${step.target}`);
        }
      }, 100);
      
      return () => {
        // Clean up previous highlights
        const element = document.querySelector(step.target);
        if (element) {
          element.classList.remove('timer-button-highlight');
        }
      };
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
        "w-56 bg-white/95 backdrop-blur-sm shadow-xl border-2 border-primary/30 rounded-lg",
        "animate-in fade-in slide-in-from-bottom-2 duration-500 ease-out"
      )}>
        <CardContent className="p-3">
          <div className="flex items-center gap-2 mb-2">
            <div className="p-1.5 bg-primary/10 rounded-full">
              <Icon className="w-4 h-4 text-primary" />
            </div>
            <h4 className="font-semibold text-sm text-foreground">{step.title}</h4>
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