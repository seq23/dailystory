import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { X, Timer, ChevronLeft, ChevronRight, Volume2, TrendingUp, TrendingDown, Play, Pause, BookOpen } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";

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
  maxWidth?: string;
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

  // Handle escape key to exit tutorial
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isVisible) {
        onSkip();
      }
    };

    if (isVisible) {
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isVisible, onSkip]);

  const tutorialSteps: TutorialStep[] = [
    {
      target: "#timer-display",
      targetFallback: "[id*='timer'], .floating-timer-container, .responsive-timer",
      title: t("tutorial.timer.title", "⏰ Reading Timer"),
      description: t("tutorial.timer.description", "This shows your reading time! Watch for button tooltips showing what each control does."),
      icon: Timer,
      position: "left"
    },
    {
      target: "[id*='story-navigation'], .story-navigation",
      targetFallback: "button:has([data-lucide='chevron-left']), button:has([data-lucide='chevron-right']), .story-header",
      title: t("tutorial.navigation.title", "📖 Page Navigation"),
      description: t("tutorial.navigation.description", "Use Previous and Next buttons to move between story pages. The page counter shows your current position."),
      icon: ChevronRight,
      position: "top"
    },
    {
      target: "[id*='audio'], .audio-controls, button:has([data-lucide='volume-2'])",
      targetFallback: "[aria-label*='audio'], [aria-label*='Audio'], .lucide-volume-2",
      title: t("tutorial.audio.title", "🎵 Audio Reading"),
      description: t("tutorial.audio.description", "Click to hear the story read aloud! Perfect for following along and learning pronunciation."),
      icon: Volume2,
      position: "top"
    },
    {
      target: "[data-id='magic-wand'], #magic-wand-free, #magic-wand-premium, #tutorial-magic-wand",
      targetFallback: "button:has([data-lucide='wand']), .generate-new-story, .lucide-wand2, .tutorial-magic-wand",
      title: t("tutorial.magicWand.title", "🪄 Magic Wand"),
      description: t("tutorial.magicWand.description.free", "Generate new stories to keep reading! Premium users can refresh anytime."),
      icon: Play,
      position: "top"
    },
    {
      target: "[data-id='reading-level'], #reading-level-controls, .reading-level-controls",
      targetFallback: "[class*='difficulty'], .lucide-trending-up, .lucide-trending-down, .difficulty-controls",
      title: t("tutorial.difficulty.title", "🎯 Reading Level"),
      description: t("tutorial.difficulty.description", "Make the story easier or harder instantly! Up arrow makes it harder, down arrow makes it easier to match your reading level."),
      icon: TrendingUp,
      position: "bottom"
    },
    {
      target: "#progress-towers",
      targetFallback: ".progress-towers-container, [data-tutorial-target='progress-towers'], .tutorial-progress-towers, .progress-towers, .fixed.top-1\\/2.right-2",
      title: t("tutorial.progressTowers.title", "🏗️ Progress Towers"),
      description: t("tutorial.progressTowers.description", "Track your reading achievements! Click to see your progress grow."),
      icon: TrendingUp,
      position: "left"
    }
  ];

  // Calculate smart positioning for tutorial card with enhanced viewport detection
  const calculateCardPosition = (targetElement: Element, preferredPosition: string): Position => {
    const rect = targetElement.getBoundingClientRect();
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    const cardWidth = isMobile ? Math.min(280, viewportWidth - 40) : isTablet ? Math.min(320, viewportWidth - 48) : Math.min(400, viewportWidth - 48);
    const cardHeight = isMobile ? 260 : isTablet ? 240 : 250;
    const padding = isMobile ? 20 : isTablet ? 40 : 32;
    const safeMargin = isMobile ? 12 : isTablet ? 24 : 20;
    const clearance = isMobile ? 80 : isTablet ? 120 : 140; // Extra clearance to avoid covering targets
    
    let position: Position = {};

    // Handle different preferred positions with collision detection
    switch (preferredPosition) {
      case "left":
        if (rect.left > cardWidth + padding + safeMargin) {
          position = {
            top: `${Math.max(safeMargin, Math.min(viewportHeight - cardHeight - safeMargin, rect.top + rect.height / 2))}px`,
            right: `${viewportWidth - rect.left + padding}px`,
            transform: "translateY(-50%)"
          };
        } else {
          // Fallback to bottom with safe positioning
          const leftPos = Math.max(safeMargin, Math.min(viewportWidth - cardWidth - safeMargin, rect.left + rect.width / 2 - cardWidth / 2));
          position = {
            top: `${Math.min(viewportHeight - cardHeight - safeMargin, rect.bottom + padding)}px`,
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

  // Find target element with fallback and retry logic
  const findTargetElement = (step: TutorialStep): Element | null => {
    // Helper function to try multiple selectors
    const trySelectors = (selectors: string[]): Element | null => {
      for (const selector of selectors) {
        try {
          const element = document.querySelector(selector);
          if (element) return element;
        } catch (e) {
          console.warn('Invalid selector:', selector);
        }
      }
      return null;
    };

    // Try primary selector
    let element = document.querySelector(step.target);
    
    // Try fallback selector
    if (!element && step.targetFallback) {
      const fallbackSelectors = step.targetFallback.split(', ');
      element = trySelectors(fallbackSelectors);
    }
    
    // Additional fallbacks based on step content with retry logic
    if (!element) {
      switch (step.icon) {
        case Timer:
          element = trySelectors([
            '[class*="timer"]', '[id*="timer"]', '[aria-label*="timer"]',
            '.floating-timer', '.responsive-timer', '.timer-display'
          ]);
          break;
        case ChevronRight:
          element = trySelectors([
            'button[aria-label*="next"]', 'button[aria-label*="Next"]',
            '.story-navigation button', '.navigation button'
          ]);
          break;
        case Volume2:
          element = trySelectors([
            'button[aria-label*="audio"]', 'button[aria-label*="Audio"]',
            '[data-lucide="volume-2"]', '.audio-controls button'
          ]);
          break;
        case Play:
          // Magic wand - comprehensive selectors
          element = trySelectors([
            '#tutorial-magic-wand', '[data-id="magic-wand"]',
            'button[aria-label*="generate"]', 'button[aria-label*="Generate"]',
            '.generate-new-story', '[id*="magic"]', '.tutorial-magic-wand',
            'button:has([data-lucide="wand2"])'
          ]);
          break;
        case TrendingUp:
          if (step.title.includes("Reading Level")) {
            element = trySelectors([
              '[data-id="reading-level"]', '.reading-level-controls',
              '[class*="difficulty"]', '[class*="level"]',
              'button[aria-label*="difficulty"]'
            ]);
          } else {
            // Progress towers with enhanced selectors and z-index fix
            element = trySelectors([
              '#progress-towers', '.progress-towers-container', '[data-tutorial-target="progress-towers"]',
              '.tutorial-progress-towers', '.progress-towers', '.fixed.top-1\\/2.right-2',
              '[class*="progress-tower"]', '.progress-tower', '[class*="ProgressTower"]',
              '.fixed.top-1\\/2', '[id*="progress"]', '[class*="progress"]'
            ]);
            
            // Force z-index for progress towers and ensure proper highlighting
            if (element) {
              (element as HTMLElement).style.zIndex = '9999';
              const parent = element.closest('.fixed');
              if (parent) {
                (parent as HTMLElement).style.zIndex = '9999';
              }
              
              // Find the actual container to highlight
              const container = element.querySelector('.progress-towers-container') || element;
              if (container !== element) {
                element = container;
              }
            }
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

  // Handle step changes and positioning with element existence checks and retry logic
  useEffect(() => {
    if (!isVisible || currentStep >= tutorialSteps.length) return;

    const step = tutorialSteps[currentStep];
    console.log('🎯 SmartTutorial: Step', currentStep, 'targeting:', step.target);
    
    let retryCount = 0;
    const maxRetries = 3;
    
    const tryFindElement = () => {
      const targetElement = findTargetElement(step);
      console.log('🎯 SmartTutorial: Found element:', targetElement, 'retry:', retryCount);
      
      if (targetElement) {
        highlightElement(targetElement);
        
        // Calculate and set card position with enhanced anti-collision
        const position = calculateCardPosition(targetElement, step.position);
        setCardPosition(position);
      } else if (retryCount < maxRetries) {
        // Retry after a short delay
        retryCount++;
        setTimeout(tryFindElement, 500);
        return;
      } else {
        console.warn('🎯 SmartTutorial: Target element not found after retries for step', currentStep, 'target:', step.target);
        
        // Special handling for specific steps
        if (step.target.includes('magic-wand') && currentStep === 3) {
        // For magic wand step, wait longer and position tutorial to the left of magic wand
          setTimeout(() => {
            setCardPosition({
              top: "50%",
              left: "8%", 
              transform: "translateY(-50%)",
              maxWidth: "300px"
            });
          }, 100);
        } else if (step.title.includes("Progress Towers")) {
          // For progress towers, show tutorial in center with explanation
          setCardPosition({
            top: "50%",
            left: "50%", 
            transform: "translate(-50%, -50%)",
            maxWidth: "320px"
          });
        } else {
          // Auto-skip to next step
          setTimeout(() => {
            if (currentStep < tutorialSteps.length - 1) {
              setCurrentStep(currentStep + 1);
            } else {
              onComplete();
            }
          }, 1000);
          return;
        }
      }
    };
    
    tryFindElement();

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
      {/* Dark overlay with tutorial element exceptions */}
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 tutorial-overlay" style={{ backdropFilter: 'blur(4px)' }} />
      
      {/* Global tutorial highlight styles */}
      <style>{`
        .tutorial-highlight-ring {
          animation: tutorialPulse 2s ease-in-out infinite;
          box-shadow: 0 0 0 4px hsl(var(--primary) / 0.5), 0 0 20px 8px hsl(var(--primary) / 0.3);
          border-radius: 8px;
          position: relative;
          z-index: 9998 !important;
        }
        
        .tutorial-highlight-glow {
          background: hsl(var(--primary) / 0.1) !important;
        }
        
        @keyframes tutorialPulse {
          0%, 100% {
            box-shadow: 0 0 0 4px hsl(var(--primary) / 0.5), 0 0 20px 8px hsl(var(--primary) / 0.3);
          }
          50% {
            box-shadow: 0 0 0 8px hsl(var(--primary) / 0.7), 0 0 30px 12px hsl(var(--primary) / 0.5);
          }
        }
        
        /* Ensure tutorial magic wand is not blurred */
        .tutorial-overlay {
          mask: radial-gradient(circle at calc(100% - 120px) 50%, transparent 80px, black 100px);
          -webkit-mask: radial-gradient(circle at calc(100% - 120px) 50%, transparent 80px, black 100px);
        }
        
        .tutorial-magic-wand {
          z-index: 70 !important;
          backdrop-filter: none !important;
          -webkit-backdrop-filter: none !important;
        }
        
        /* Enhanced highlighting for progress towers */
        .progress-towers-container.tutorial-highlight-ring {
          border-radius: 12px !important;
        }
      `}</style>

      {/* Tutorial Card - Positioned dynamically */}
      <div 
        className="fixed z-50"
        style={cardPosition}
      >
        <Card className={cn(
          "bg-background shadow-2xl border-2 border-primary/30 rounded-2xl",
          "w-72 sm:w-80 md:w-96",
          "max-h-[90vh] overflow-auto",
          "animate-in fade-in slide-in-from-top-4 duration-300"
        )}>
          <CardContent className="p-6">
            {/* Header */}
            <div className="flex items-center gap-3 mb-4">
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

            {/* Description */}
            <p className="text-muted-foreground mb-6 leading-relaxed">
              {step.description}
            </p>

            {/* Navigation */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handlePrevious}
                  disabled={currentStep === 0}
                  className="min-w-[80px]"
                >
                  <ChevronLeft className="w-4 h-4 mr-1" />
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleNext}
                  className="min-w-[80px]"
                >
                  Next
                  <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </div>
              
              {/* Skip Tutorial Button */}
              <Button
                variant="outline"
                size="sm"
                onClick={onSkip}
                className="min-w-[60px]"
              >
                Skip
              </Button>
            </div>

            {/* Progress dots - centered below navigation */}
            <div className="flex justify-center">
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