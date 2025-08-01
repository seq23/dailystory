import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { X, Timer, ChevronLeft, ChevronRight, Volume2, TrendingUp, TrendingDown, Play, Pause } from "lucide-react";

interface TutorialStep {
  target: string;
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  position: "top" | "bottom" | "left" | "right";
}

interface TutorialOverlayProps {
  isVisible: boolean;
  onComplete: () => void;
  onSkip: () => void;
  onStartTimer?: () => void;
  onStepChange?: (step: number) => void;
}

export const TutorialOverlay = ({ isVisible, onComplete, onSkip, onStartTimer, onStepChange }: TutorialOverlayProps) => {
  const { t, i18n } = useTranslation();
  const [currentStep, setCurrentStep] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  // Notify parent about step changes
  useEffect(() => {
    onStepChange?.(currentStep);
  }, [currentStep, onStepChange]);


  const tutorialSteps: TutorialStep[] = [
    {
      target: "timer-display",
      title: t("tutorial.timer.title", "⏰ Reading Timer"),
      description: t("tutorial.timer.description", "This shows your reading time! Click the play button to start/pause your timer. Use the minus button to reduce time if needed."),
      icon: Timer,
      position: "left"
    },
    {
      target: "story-navigation",
      title: t("tutorial.navigation.title", "📖 Page Navigation"),
      description: t("tutorial.navigation.description", "Use Previous and Next buttons to move between story pages. The page counter shows your current position."),
      icon: ChevronRight,
      position: "top"
    },
    {
      target: "audio-controls",
      title: t("tutorial.audio.title", "🎵 Audio Reading"),
      description: t("tutorial.audio.description", "Click to hear the story read aloud! Perfect for following along and learning pronunciation."),
      icon: Volume2,
      position: "top"
    },
    {
      target: "add-pages-button",
      title: t("tutorial.addPages.title", "➕ Add More Pages"),
      description: t("tutorial.addPages.description", "Want to continue the adventure? Click this button to add 5 more pages to your story!"),
      icon: Play,
      position: "top"
    },
    {
      target: "reading-level-controls",
      title: t("tutorial.difficulty.title", "🎯 Reading Level"),
      description: t("tutorial.difficulty.description", "Make the story easier or harder instantly! Up arrow makes it harder, down arrow makes it easier to match your reading level."),
      icon: TrendingUp,
      position: "bottom"
    }
  ];

  // Create pulsing highlight effect on target elements
  useEffect(() => {
    if (!isVisible || currentStep >= tutorialSteps.length) return;

    const step = tutorialSteps[currentStep];
    const targetElement = document.querySelector(`#${step.target}, .${step.target}`);
    
    if (targetElement) {
      // Add pulsing animation classes
      targetElement.classList.add(
        'tutorial-highlight',
        'animate-pulse',
        'ring-4',
        'ring-yellow-400/50',
        'ring-offset-2',
        'ring-offset-yellow-100',
        'rounded-lg',
        'shadow-2xl',
        'shadow-yellow-400/30',
        'z-50',
        'relative'
      );

      // Add shake animation
      (targetElement as HTMLElement).style.animation = 'shake 1s ease-in-out infinite, pulse 2s ease-in-out infinite';
      
      // SPECIAL HANDLING FOR TIMER - Make it pop out with enhanced focus
      if (step.target === "timer-display") {
        const floatingTimer = document.querySelector('#floating-timer');
        if (floatingTimer) {
          floatingTimer.classList.add(
            'z-50', 
            'relative',
            'scale-110',
            'ring-8',
            'ring-yellow-400/70',
            'rounded-3xl',
            'shadow-2xl',
            'shadow-yellow-400/50'
          );
          (floatingTimer as HTMLElement).style.transform = 'scale(1.1)';
          (floatingTimer as HTMLElement).style.transition = 'all 0.3s ease-out';
        }
      }

      // ENHANCED HIGHLIGHTING FOR ADD PAGES BUTTON - Make it super prominent
      if (step.target === "add-pages-button") {
        // Make the button much more prominent
        targetElement.classList.add(
          'scale-150',
          'ring-8',
          'ring-yellow-400/80',
          'ring-offset-4',
          'bg-yellow-100',
          'border-yellow-400',
          'text-yellow-800'
        );
        (targetElement as HTMLElement).style.transform = 'scale(1.5)';
        (targetElement as HTMLElement).style.transition = 'all 0.3s ease-out';
        (targetElement as HTMLElement).style.zIndex = '60';
        
        // Also highlight the parent container
        const parentContainer = targetElement.closest('.flex.flex-col.items-center.gap-2');
        if (parentContainer) {
          parentContainer.classList.add(
            'ring-4',
            'ring-yellow-300/50',
            'rounded-xl',
            'bg-yellow-50/50',
            'p-4'
          );
        }
      }
    }

    return () => {
      if (targetElement) {
        targetElement.classList.remove(
          'tutorial-highlight',
          'animate-pulse',
          'ring-4',
          'ring-yellow-400/50',
          'ring-offset-2',
          'ring-offset-yellow-100',
          'rounded-lg',
          'shadow-2xl',
          'shadow-yellow-400/30',
          'z-50',
          'relative'
        );
        (targetElement as HTMLElement).style.animation = '';
        
        // Clean up timer special styling
        if (step.target === "timer-display") {
          const floatingTimer = document.querySelector('#floating-timer');
          if (floatingTimer) {
            floatingTimer.classList.remove(
              'z-50', 
              'relative',
              'scale-110',
              'ring-8',
              'ring-yellow-400/70',
              'rounded-3xl',
              'shadow-2xl',
              'shadow-yellow-400/50'
            );
            (floatingTimer as HTMLElement).style.transform = '';
            (floatingTimer as HTMLElement).style.transition = '';
          }
        }

        // Clean up add pages button special styling
        if (step.target === "add-pages-button") {
          targetElement.classList.remove(
            'scale-150',
            'ring-8',
            'ring-yellow-400/80',
            'ring-offset-4',
            'bg-yellow-100',
            'border-yellow-400',
            'text-yellow-800'
          );
          (targetElement as HTMLElement).style.transform = '';
          (targetElement as HTMLElement).style.transition = '';
          (targetElement as HTMLElement).style.zIndex = '';
          
          // Clean up parent container styling
          const parentContainer = targetElement.closest('.flex.flex-col.items-center.gap-2');
          if (parentContainer) {
            parentContainer.classList.remove(
              'ring-4',
              'ring-yellow-300/50',
              'rounded-xl',
              'bg-yellow-50/50',
              'p-4'
            );
          }
        }
      }
    };
  }, [currentStep, isVisible, tutorialSteps]);

  useEffect(() => {
    if (isVisible && currentStep < tutorialSteps.length) {
      const timer = setTimeout(() => {
        setIsAnimating(true);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [currentStep, isVisible, tutorialSteps.length]);

  // REMOVED AUTO-ADVANCE - Users control progression manually

  const handleNext = () => {
    if (currentStep < tutorialSteps.length - 1) {
      setIsAnimating(false);
      setTimeout(() => {
        const nextStep = currentStep + 1;
        setCurrentStep(nextStep);
        onStepChange?.(nextStep);
      }, 200);
    } else {
      onComplete();
      if (onStartTimer) {
        onStartTimer();
      }
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setIsAnimating(false);
      setTimeout(() => {
        const prevStep = currentStep - 1;
        setCurrentStep(prevStep);
        onStepChange?.(prevStep);
      }, 200);
    }
  };

  const getTooltipPosition = (target: string, position: string) => {
    const element = document.querySelector(`#${target}, .${target}`);
    if (!element) {
      return { top: "20%", left: "50%", transform: "translateX(-50%)" };
    }

    const rect = element.getBoundingClientRect();
    const viewportHeight = window.innerHeight;
    const viewportWidth = window.innerWidth;
    
    const tooltipWidth = 400;
    const tooltipHeight = 280;
    const margin = 50;

    // SPECIAL HANDLING FOR TIMER STEP - Avoid floating timer area
    if (target === "timer-display") {
      // Floating timer is at bottom-left, so place tutorial at top-right
      return {
        top: `${margin}px`,
        right: `${margin}px`,
        left: "auto",
        transform: "none"
      };
    }

    let style: any = {};

    // IMPROVED POSITIONING: Ensure tutorial never covers the target element
    switch (position) {
      case "bottom":
        // Place well below the element
        style = {
          top: `${Math.min(rect.bottom + 80, viewportHeight - tooltipHeight - margin)}px`,
          left: `${Math.max(margin, Math.min(rect.left + rect.width/2 - tooltipWidth/2, viewportWidth - tooltipWidth - margin))}px`,
          transform: "none"
        };
        break;
      case "top":
        // Place well above the element
        style = {
          top: `${Math.max(margin, rect.top - tooltipHeight - 80)}px`,
          left: `${Math.max(margin, Math.min(rect.left + rect.width/2 - tooltipWidth/2, viewportWidth - tooltipWidth - margin))}px`,
          transform: "none"
        };
        break;
      case "right":
        // Place well to the right
        style = {
          top: `${Math.max(margin, Math.min(rect.top + rect.height/2 - tooltipHeight/2, viewportHeight - tooltipHeight - margin))}px`,
          left: `${Math.min(rect.right + 80, viewportWidth - tooltipWidth - margin)}px`,
          transform: "none"
        };
        break;
      case "left":
        // Place well to the right instead of left to avoid floating timer
        style = {
          top: `${Math.max(margin, Math.min(rect.top + rect.height/2 - tooltipHeight/2, viewportHeight - tooltipHeight - margin))}px`,
          left: `${Math.min(rect.right + 80, viewportWidth - tooltipWidth - margin)}px`,
          transform: "none"
        };
        break;
      default:
        // Safe fallback position - top right to avoid timer
        style = {
          top: `${margin}px`,
          right: `${margin}px`,
          left: "auto",
          transform: "none"
        };
    }
    
    return style;
  };

  if (!isVisible || currentStep >= tutorialSteps.length) {
    return null;
  }

  const step = tutorialSteps[currentStep];
  const tooltipStyle = getTooltipPosition(step.target, step.position);

  return (
    <>
      {/* Add shake animation to global styles */}
      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          10%, 30%, 50%, 70%, 90% { transform: translateX(-3px); }
          20%, 40%, 60%, 80% { transform: translateX(3px); }
        }
        
        .tutorial-highlight {
          transform-style: preserve-3d;
          backface-visibility: hidden;
        }
      `}</style>

      {/* Enhanced overlay background - darker when focusing on timer */}
      <div className={`fixed inset-0 transition-opacity duration-500 z-40 ${
        step.target === "timer-display" 
          ? 'bg-black/50 backdrop-blur-md' // Stronger dimming for timer focus
          : 'bg-black/20 backdrop-blur-sm'  // Normal dimming for other steps
      }`}>
        {/* Subtle background elements */}
        <div className="absolute inset-0 overflow-hidden">
          {[...Array(8)].map((_, i) => (
            <div
              key={i}
              className="absolute w-2 h-2 bg-primary/30 rounded-full animate-float opacity-50"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 4}s`,
                animationDuration: `${6 + Math.random() * 3}s`
              }}
            />
          ))}
        </div>
      </div>

      {/* Clean Tutorial Tooltip */}
      <div 
        className={`fixed z-50 transition-all duration-300 ${isAnimating ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}
        style={tooltipStyle}
      >
        <Card className="w-[400px] bg-white dark:bg-gray-900 shadow-xl border-2 border-primary/30 rounded-2xl overflow-hidden">
          {/* Clean arrow pointing to target */}
          <div className="absolute -z-10">
            <div 
              className="w-0 h-0"
              style={{
                borderLeft: '16px solid transparent',
                borderRight: '16px solid transparent', 
                borderBottom: '24px solid hsl(var(--primary))',
                position: 'absolute',
                top: step.position === 'bottom' ? '-45px' : 
                     step.position === 'top' ? 'calc(100% + 15px)' : '50%',
                left: step.position === 'left' ? 'calc(100% + 15px)' : 
                      step.position === 'right' ? '-45px' : '50%',
                transform: step.position === 'top' ? 'rotate(180deg)' :
                          step.position === 'left' ? 'rotate(-90deg)' :
                          step.position === 'right' ? 'rotate(90deg)' : 'none',
                transformOrigin: 'center',
                filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.2))'
              }}
            />
          </div>

          <CardContent className="p-0">
            {/* Clean Header */}
            <div className="bg-gradient-primary text-white p-6 relative overflow-hidden">
              <div className="relative z-10 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-white/20 rounded-full">
                    <step.icon className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg">{step.title}</h3>
                    <div className="text-sm opacity-90">
                      {t("tutorial.step", "Tutorial")} {currentStep + 1} {t("tutorial.of", "of")} {tutorialSteps.length}
                    </div>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    onSkip();
                    if (onStartTimer) {
                      onStartTimer();
                    }
                  }}
                  className="text-white hover:bg-white/20 p-2 rounded-full"
                >
                  <X className="w-5 h-5" />
                </Button>
              </div>
            </div>

            {/* Content */}
            <div className="p-6">
              <p className="text-gray-700 dark:text-gray-300 text-base leading-relaxed mb-6">
                {step.description}
              </p>

              {/* Progress Bar */}
              <div className="mb-6">
                <div className="flex justify-between text-sm text-muted-foreground mb-2">
                  <span>Tutorial Progress</span>
                  <span>{Math.round(((currentStep + 1) / tutorialSteps.length) * 100)}%</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div 
                    className="bg-gradient-primary h-2 rounded-full transition-all duration-500 ease-out"
                    style={{ width: `${((currentStep + 1) / tutorialSteps.length) * 100}%` }}
                  />
                </div>
              </div>

              {/* Navigation Buttons - Centered */}
              <div className="flex justify-center items-center gap-4">
                <Button
                  variant="outline"
                  size="default"
                  onClick={handlePrevious}
                  disabled={currentStep === 0}
                  className="flex items-center gap-2"
                >
                  <ChevronLeft className="w-4 h-4" />
                  {t("tutorial.previous", "Previous")}
                </Button>

                <Button
                  variant="ghost"
                  size="default"
                  onClick={() => {
                    onSkip();
                    if (onStartTimer) {
                      onStartTimer();
                    }
                  }}
                  className="text-muted-foreground"
                >
                  {t("tutorial.skip", "Skip Tutorial")}
                </Button>

                <Button
                  variant="default"
                  size="default"
                  onClick={handleNext}
                  className="bg-gradient-primary hover:opacity-90 flex items-center gap-2"
                >
                  {currentStep === tutorialSteps.length - 1 ? t("tutorial.startReading", "Start Reading!") : t("tutorial.next", "Next")}
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
};