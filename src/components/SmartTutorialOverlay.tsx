import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { X, Timer, ChevronLeft, ChevronRight, Volume2, TrendingUp, TrendingDown, Play, Pause, BookOpen } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";
import { TimerTooltipCallouts } from "./TimerTooltipCallouts";

interface TutorialStep {
  target: string;
  targetFallback?: string; // Fallback selector
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  position: "top" | "bottom" | "left" | "right" | "center";
}

interface SmartTutorialOverlayProps {
  isVisible: boolean;
  onComplete: () => void;
  onSkip: () => void;
  onStartTimer?: () => void;
  onStepChange?: (step: number) => void;
  sessionStartTime?: Date | null;
}

interface Position {
  top?: string;
  left?: string;
  right?: string;
  bottom?: string;
  transform?: string;
}

export const SmartTutorialOverlay = ({ 
  isVisible, 
  onComplete, 
  onSkip, 
  onStartTimer, 
  onStepChange 
}: SmartTutorialOverlayProps) => {
  const { t } = useTranslation();
  const { isMobile, isTablet, isMobileOrTablet } = useIsMobile();
  const [currentStep, setCurrentStep] = useState(0);
  const [cardPosition, setCardPosition] = useState<Position>({});
  const [highlightedElement, setHighlightedElement] = useState<Element | null>(null);

  const tutorialSteps: TutorialStep[] = [
    {
      target: "#timer-display",
      targetFallback: "[id*='timer']",
      title: t("tutorial.timer.title", "⏰ Reading Timer"),
      description: t("tutorial.timer.description", "This shows your reading time! Watch for button tooltips showing what each control does."),
      icon: Timer,
      position: "left"
    },
    {
      target: "[id*='story-navigation'], .story-navigation",
      targetFallback: "button:has([data-lucide='chevron-left']), button:has([data-lucide='chevron-right'])",
      title: t("tutorial.navigation.title", "📖 Page Navigation"),
      description: t("tutorial.navigation.description", "Use Previous and Next buttons to move between story pages. The page counter shows your current position."),
      icon: ChevronRight,
      position: "top"
    },
    {
      target: "[id*='audio'], .audio-controls, button:has([data-lucide='volume-2'])",
      targetFallback: "[aria-label*='audio'], [aria-label*='Audio']",
      title: t("tutorial.audio.title", "🎵 Audio Reading"),
      description: t("tutorial.audio.description", "Click to hear the story read aloud! Perfect for following along and learning pronunciation."),
      icon: Volume2,
      position: "top"
    },
    {
      target: "[id*='add-pages'], .add-pages-button, button:has([data-lucide='plus'])",
      targetFallback: "button:contains('Add'), button[aria-label*='Add']",
      title: t("tutorial.addPages.title", "➕ Add More Pages"),
      description: t("tutorial.addPages.description", "Want to continue the adventure? Click this button to add 5 more pages to your story!"),
      icon: Play,
      position: "top"
    },
    {
      target: "#reading-level-controls",
      targetFallback: ".reading-level-controls, [class*='difficulty']",
      title: t("tutorial.difficulty.title", "🎯 Reading Level"),
      description: t("tutorial.difficulty.description", "Make the story easier or harder instantly! Up arrow makes it harder, down arrow makes it easier to match your reading level."),
      icon: TrendingUp,
      position: "bottom"
    },
    {
      target: ".progress-towers-container",
      targetFallback: "[class*='progress-tower'], [class*='progress'], [id*='progress']",
      title: t("tutorial.progressTowers.title", "🏗️ Progress Towers"),
      description: t("tutorial.progressTowers.description", "Watch your reading progress grow! These towers show your words read, pages completed, and vocabulary learned. Click to expand and see detailed stats."),
      icon: TrendingUp,
      position: "right"
    }
  ];

  // Calculate smart positioning for tutorial card with enhanced viewport detection
  const calculateCardPosition = (targetElement: Element, preferredPosition: string): Position => {
    const rect = targetElement.getBoundingClientRect();
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    const cardWidth = isMobile ? Math.min(300, viewportWidth - 32) : Math.min(400, viewportWidth - 48);
    const cardHeight = isMobile ? 200 : 250;
    const padding = isMobile ? 16 : 24;
    const safeMargin = isMobile ? 8 : 16; // Extra margin to prevent cutoffs
    
    let position: Position = {};

    // Handle different preferred positions with collision detection
    switch (preferredPosition) {
      case "left":
        if (rect.left > cardWidth + padding + safeMargin) {
          position = {
            top: `${rect.top + rect.height / 2}px`,
            right: `${viewportWidth - rect.left + padding}px`,
            transform: "translateY(-50%)"
          };
        } else {
          // Fallback to bottom with safe positioning
          const leftPos = Math.max(safeMargin, Math.min(viewportWidth - cardWidth - safeMargin, rect.left + rect.width / 2 - cardWidth / 2));
          position = {
            top: `${rect.bottom + padding}px`,
            left: `${leftPos}px`
          };
        }
        break;

      case "right":
        if (viewportWidth - rect.right > cardWidth + padding + safeMargin) {
          position = {
            top: `${rect.top + rect.height / 2}px`,
            left: `${rect.right + padding}px`,
            transform: "translateY(-50%)"
          };
        } else {
          // Fallback to bottom with safe positioning
          const leftPos = Math.max(safeMargin, Math.min(viewportWidth - cardWidth - safeMargin, rect.left + rect.width / 2 - cardWidth / 2));
          position = {
            top: `${rect.bottom + padding}px`,
            left: `${leftPos}px`
          };
        }
        break;

      case "top":
        if (rect.top > cardHeight + padding + safeMargin) {
          const leftPos = Math.max(safeMargin, Math.min(viewportWidth - cardWidth - safeMargin, rect.left + rect.width / 2 - cardWidth / 2));
          position = {
            bottom: `${viewportHeight - rect.top + padding}px`,
            left: `${leftPos}px`
          };
        } else {
          // Fallback to bottom with safe positioning
          const leftPos = Math.max(safeMargin, Math.min(viewportWidth - cardWidth - safeMargin, rect.left + rect.width / 2 - cardWidth / 2));
          position = {
            top: `${rect.bottom + padding}px`,
            left: `${leftPos}px`
          };
        }
        break;

      case "bottom":
        if (viewportHeight - rect.bottom > cardHeight + padding + safeMargin) {
          const leftPos = Math.max(safeMargin, Math.min(viewportWidth - cardWidth - safeMargin, rect.left + rect.width / 2 - cardWidth / 2));
          position = {
            top: `${rect.bottom + padding}px`,
            left: `${leftPos}px`
          };
        } else {
          // Fallback to top with safe positioning
          const leftPos = Math.max(safeMargin, Math.min(viewportWidth - cardWidth - safeMargin, rect.left + rect.width / 2 - cardWidth / 2));
          position = {
            bottom: `${viewportHeight - rect.top + padding}px`,
            left: `${leftPos}px`
          };
        }
        break;

      default:
        // Center fallback
        position = {
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)"
        };
    }

    return position;
  };

  // Find target element with fallback
  const findTargetElement = (step: TutorialStep): Element | null => {
    // Try primary selector
    let element = document.querySelector(step.target);
    
    // Try fallback selector
    if (!element && step.targetFallback) {
      element = document.querySelector(step.targetFallback);
    }
    
    // Additional fallbacks based on step content
    if (!element) {
      switch (step.icon) {
        case Timer:
          element = document.querySelector('[class*="timer"], [id*="timer"], [aria-label*="timer"]');
          break;
        case ChevronRight:
          element = document.querySelector('button[aria-label*="next"], button[aria-label*="Next"]');
          break;
        case Volume2:
          element = document.querySelector('button[aria-label*="audio"], button[aria-label*="Audio"]');
          break;
        case TrendingUp:
          if (step.title.includes("Reading Level")) {
            element = document.querySelector('[class*="difficulty"], [class*="level"], button[aria-label*="difficulty"]');
          } else {
            element = document.querySelector('[class*="progress"], [class*="tower"]');
          }
          break;
      }
    }
    
    return element;
  };

  // Enhanced element highlighting
  const highlightElement = (element: Element) => {
    // Clear previous highlighting
    if (highlightedElement) {
      clearElementHighlighting(highlightedElement);
    }

    // Apply enhanced highlighting
    element.classList.add(
      'tutorial-highlight-ring',
      'tutorial-highlight-shadow',
      'tutorial-highlight-glow'
    );
    
    // Force high z-index
    (element as HTMLElement).style.zIndex = '9999';
    (element as HTMLElement).style.position = 'relative';
    
    // Special handling for floating timer
    if (element.closest('[id*="timer"]') || element.id.includes('timer')) {
      const timerContainer = element.closest('[class*="fixed"], [style*="fixed"]') || element;
      (timerContainer as HTMLElement).style.zIndex = '9999';
    }
    
    setHighlightedElement(element);
  };

  const clearElementHighlighting = (element: Element) => {
    element.classList.remove(
      'tutorial-highlight-ring',
      'tutorial-highlight-shadow',
      'tutorial-highlight-glow'
    );
    (element as HTMLElement).style.zIndex = '';
    (element as HTMLElement).style.position = '';
  };

  // Handle step changes and positioning
  useEffect(() => {
    if (!isVisible || currentStep >= tutorialSteps.length) return;

    const step = tutorialSteps[currentStep];
    console.log('🎯 SmartTutorial: Step', currentStep, 'targeting:', step.target);
    
    const targetElement = findTargetElement(step);
    console.log('🎯 SmartTutorial: Found element:', targetElement);
    
    if (targetElement) {
      highlightElement(targetElement);
      
      // Calculate and set card position
      const position = calculateCardPosition(targetElement, step.position);
      setCardPosition(position);
    } else {
      console.warn('🎯 SmartTutorial: Target element not found for step', currentStep);
      // Fallback to center positioning
      setCardPosition({
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)"
      });
    }

    // Notify parent about step change
    onStepChange?.(currentStep);

    return () => {
      if (highlightedElement) {
        clearElementHighlighting(highlightedElement);
      }
    };
  }, [currentStep, isVisible]);

  const handleNext = () => {
    if (currentStep < tutorialSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onComplete();
      if (onStartTimer) {
        onStartTimer();
      }
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  if (!isVisible || currentStep >= tutorialSteps.length) {
    return null;
  }

  const step = tutorialSteps[currentStep];
  const Icon = step.icon;

  return (
    <>
      {/* Dark overlay with cutout effect */}
      <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40" />

      {/* Timer Button Callouts - Only for timer step */}
      <TimerTooltipCallouts 
        isVisible={isVisible && currentStep === 0}
        tutorialStep={currentStep}
        onComplete={() => {}}
      />

      {/* Tutorial Card - Positioned dynamically */}
      <div 
        className="fixed z-50"
        style={cardPosition}
      >
        <Card className={cn(
          "bg-white dark:bg-gray-900 shadow-2xl border-2 border-primary/30 rounded-2xl",
          isMobile ? `w-[${Math.min(300, window.innerWidth - 32)}px]` : `w-[${Math.min(400, window.innerWidth - 48)}px]`,
          "animate-in fade-in slide-in-from-top-4 duration-300"
        )}>
          <CardContent className="p-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-full">
                  <Icon className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-bold text-lg">{step.title}</h3>
                  <div className="text-sm text-muted-foreground">
                    Step {currentStep + 1} of {tutorialSteps.length}
                  </div>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={onSkip}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>

            {/* Description */}
            <p className="text-muted-foreground mb-6 leading-relaxed">
              {step.description}
            </p>

            {/* Navigation */}
            <div className="flex items-center justify-between">
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handlePrevious}
                  disabled={currentStep === 0}
                >
                  <ChevronLeft className="w-4 h-4 mr-1" />
                  Previous
                </Button>
                <Button
                  variant="default"
                  size="sm"
                  onClick={handleNext}
                >
                  {currentStep === tutorialSteps.length - 1 ? "Start Reading!" : "Next"}
                  {currentStep < tutorialSteps.length - 1 && <ChevronRight className="w-4 h-4 ml-1" />}
                </Button>
              </div>

              {/* Progress dots */}
              <div className="flex gap-1">
                {tutorialSteps.map((_, index) => (
                  <div
                    key={index}
                    className={cn(
                      "w-2 h-2 rounded-full transition-colors",
                      index === currentStep 
                        ? 'bg-primary' 
                        : index < currentStep 
                          ? 'bg-primary/50' 
                          : 'bg-muted'
                    )}
                  />
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
};