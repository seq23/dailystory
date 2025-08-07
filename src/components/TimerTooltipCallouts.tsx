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

  const positionCallout = (targetSelector: string) => {
    const elements = document.querySelectorAll(targetSelector);
    let targetElement: Element | null = null;
    
    // Find the first visible element that matches
    for (const element of elements) {
      const rect = element.getBoundingClientRect();
      const style = window.getComputedStyle(element);
      
      if (rect.width > 0 && rect.height > 0 && style.visibility !== 'hidden' && style.display !== 'none') {
        targetElement = element;
        break;
      }
    }
    
    if (!targetElement) {
      console.warn('🎯 Timer Tutorial: No visible element found for:', targetSelector);
      return;
    }
    
    const rect = targetElement.getBoundingClientRect();
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    const cardWidth = 280;
    const cardHeight = 120;
    const offset = 20;
    
    console.log('🎯 Timer Tutorial: Positioning callout for element:', targetElement, 'rect:', rect);
    
    // Position above the button with collision detection
    let top = rect.top - cardHeight - offset;
    let left = rect.left + rect.width / 2 - cardWidth / 2;
    
    // Adjust horizontal position if it goes off screen
    if (left < 10) left = 10;
    if (left + cardWidth > viewportWidth - 10) left = viewportWidth - cardWidth - 10;
    
    // If positioning above would go off screen, position below
    if (top < 10) {
      top = rect.bottom + offset;
    }
    
    setCalloutPosition({ top, left });
    
    // Highlight the target element with maximum z-index
    targetElement.classList.add('timer-button-highlight');
    (targetElement as HTMLElement).style.zIndex = '99999';
    (targetElement as HTMLElement).style.position = 'relative';
    
    // Also ensure parent timer container is visible
    const timerContainer = targetElement.closest('.timer-container, [class*="timer"]');
    if (timerContainer) {
      (timerContainer as HTMLElement).style.zIndex = '99998';
    }
  };

  // Auto-progress through callouts with proper timing
  useEffect(() => {
    if (!isVisible || tutorialStep !== 0) return;

    // Start the first callout immediately
    if (currentCallout === 0) {
      const step = calloutSteps[currentCallout];
      if (step) {
        setTimeout(() => positionCallout(step.target), 100);
      }
    }

    const timer = setTimeout(() => {
      if (currentCallout < calloutSteps.length - 1) {
        setCurrentCallout(currentCallout + 1);
      } else {
        // Complete the callouts after the last one
        setTimeout(() => onComplete(), 1000);
      }
    }, currentCallout === 0 ? 2500 : 3000);

    return () => clearTimeout(timer);
  }, [currentCallout, isVisible, tutorialStep, onComplete]);

  // Position callout and highlight button when it changes
  useEffect(() => {
    if (!isVisible || tutorialStep !== 0 || currentCallout >= calloutSteps.length) return;
    
    const step = calloutSteps[currentCallout];
    if (step) {
      setTimeout(() => {
        positionCallout(step.target);
        console.log(`🎯 Timer Tutorial: Highlighting button ${currentCallout + 1}: ${step.title}`);
      }, 100);
      
      // Cleanup highlighting when changing steps
      return () => {
        const allButtons = document.querySelectorAll('.timer-button-highlight');
        allButtons.forEach(button => {
          button.classList.remove('timer-button-highlight');
          (button as HTMLElement).style.zIndex = '';
          (button as HTMLElement).style.position = '';
        });
      };
    }
  }, [currentCallout, isVisible, tutorialStep]);

  // Cleanup when component unmounts
  useEffect(() => {
    return () => {
      const allButtons = document.querySelectorAll('.timer-button-highlight');
      allButtons.forEach(button => {
        button.classList.remove('timer-button-highlight');
        (button as HTMLElement).style.zIndex = '';
        (button as HTMLElement).style.position = '';
      });
    };
  }, []);

  if (!isVisible || tutorialStep !== 0 || currentCallout >= calloutSteps.length) {
    return null;
  }

  const step = calloutSteps[currentCallout];
  const Icon = step.icon;

  return (
    <div 
      className="fixed z-[99999] pointer-events-none"
      style={{ 
        top: `${calloutPosition.top}px`, 
        left: `${calloutPosition.left}px` 
      }}
    >
      <Card className={cn(
        "w-72 bg-white/95 backdrop-blur-sm shadow-2xl border-2 border-primary/50 rounded-lg",
        "animate-in fade-in slide-in-from-bottom-2 duration-500 ease-out"
      )}>
        <CardContent className="p-4">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-primary/10 rounded-full">
              <Icon className="w-5 h-5 text-primary" />
            </div>
            <h4 className="font-semibold text-sm text-foreground">{step.title}</h4>
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed mb-3">
            {step.description}
          </p>
          
          {/* Progress indicator */}
          <div className="flex gap-1 justify-center">
            {calloutSteps.map((_, index) => (
              <div
                key={index}
                className={cn(
                  "w-2 h-2 rounded-full transition-colors",
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