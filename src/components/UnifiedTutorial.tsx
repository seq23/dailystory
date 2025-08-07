import React, { useState, useEffect } from 'react';
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { X, Timer, ChevronLeft, ChevronRight, Volume2, TrendingUp, TrendingDown, Play, Pause, BookOpen, Wand2 } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";

interface TutorialStep {
  target: string;
  targetFallbacks?: string[];
  title: string;
  description: string;
  descriptionPremium?: string;
  icon: React.ComponentType<{ className?: string }>;
  position: "top" | "bottom" | "left" | "right" | "center";
  showTempMagicWand?: boolean; // For free users step 4
}

interface UnifiedTutorialProps {
  isVisible: boolean;
  onComplete: () => void;
  onSkip: () => void;
  onStartTimer?: () => void;
  onStepChange?: (step: number) => void;
  isPremium?: boolean;
}

interface Position {
  top?: string;
  left?: string;
  right?: string;
  bottom?: string;
  transform?: string;
  maxWidth?: string;
  zIndex?: string;
}

export const UnifiedTutorial: React.FC<UnifiedTutorialProps> = ({
  isVisible,
  onComplete,
  onSkip,
  onStartTimer,
  onStepChange,
  isPremium = false
}) => {
  const { t } = useTranslation();
  const { isMobile, isTablet } = useIsMobile();
  const [currentStep, setCurrentStep] = useState(0);
  const [cardPosition, setCardPosition] = useState<Position>({});
  const [highlightedElement, setHighlightedElement] = useState<Element | null>(null);
  const [highlightedRect, setHighlightedRect] = useState<DOMRect | null>(null);
  const [showTempMagicWand, setShowTempMagicWand] = useState(false);

  console.log('🎓 UnifiedTutorial render:', { isVisible, currentStep, isPremium, isMobile, isTablet });

  // Tutorial steps with conditional content
  const tutorialSteps: TutorialStep[] = [
    {
      target: "#timer-display",
      targetFallbacks: [
        "[id*='timer']", 
        ".floating-timer-container", 
        ".responsive-timer",
        "#floating-timer"
      ],
      title: t("tutorial.timer.title", "⏰ Reading Timer"),
      description: t("tutorial.timer.description", "This shows your reading time! Watch for button tooltips showing what each control does."),
      icon: Timer,
      position: "left"
    },
    {
      target: "[id*='story-navigation']",
      targetFallbacks: [
        ".story-navigation",
        "button:has([data-lucide='chevron-left'])",
        "button:has([data-lucide='chevron-right'])",
        ".story-header"
      ],
      title: t("tutorial.navigation.title", "📖 Page Navigation"),
      description: t("tutorial.navigation.description", "Use Previous and Next buttons to move between story pages. The page counter shows your current position."),
      icon: ChevronRight,
      position: "top"
    },
    {
      target: "[id*='audio']",
      targetFallbacks: [
        ".audio-controls",
        "button:has([data-lucide='volume-2'])",
        "[aria-label*='audio']",
        "[aria-label*='Audio']",
        ".lucide-volume-2"
      ],
      title: t("tutorial.audio.title", "🎵 Audio Reading"),
      description: t("tutorial.audio.description", "Click to hear the story read aloud! Perfect for following along and learning pronunciation."),
      icon: Volume2,
      position: "top"
    },
    {
      target: isPremium ? "[data-id='magic-wand']" : "#temp-tutorial-magic-wand",
      targetFallbacks: isPremium ? [
        "#magic-wand-premium",
        "button:has([data-lucide='wand'])",
        ".generate-new-story",
        ".lucide-wand2"
      ] : [],
      title: t("tutorial.magicWand.title", "🪄 Magic Wand"),
      description: isPremium 
        ? t("tutorial.magicWand.description.premium", "Click the Magic Wand anytime to generate fresh stories! Your premium power in action.")
        : t("tutorial.magicWand.description.free", "This Magic Wand will appear when you reach your story's last page. Use it to generate exciting new stories! Premium users can use it anytime."),
      icon: Wand2,
      position: "left",
      showTempMagicWand: !isPremium
    },
    {
      target: "[data-id='reading-level']",
      targetFallbacks: [
        "#reading-level-controls",
        ".reading-level-controls",
        "button:has([data-lucide='trending-up'])",
        "button:has([data-lucide='trending-down'])"
      ],
      title: t("tutorial.difficulty.title", "🎯 Reading Level"),
      description: t("tutorial.difficulty.description", "Make the story easier or harder instantly! Up arrow makes it harder, down arrow makes it easier to match your reading level."),
      icon: TrendingUp,
      position: "bottom"
    },
    {
      target: "[data-id='progress-towers']",
      targetFallbacks: [
        "#progress-towers-container",
        ".progress-towers-container",
        ".progress-towers"
      ],
      title: t("tutorial.progressTowers.title", "🏗️ Progress Towers"),
      description: t("tutorial.progressTowers.description", "Watch your reading progress grow! These towers show your words read, pages completed, and vocabulary learned."),
      icon: TrendingUp,
      position: "right"
    }
  ];

  // Handle escape key
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

  // Notify parent about step changes
  useEffect(() => {
    onStepChange?.(currentStep);
  }, [currentStep, onStepChange]);

  // Show/hide temporary magic wand for free users
  useEffect(() => {
    const step = tutorialSteps[currentStep];
    if (step?.showTempMagicWand && currentStep === 3) {
      setShowTempMagicWand(true);
    } else {
      setShowTempMagicWand(false);
    }
  }, [currentStep, tutorialSteps]);

  // Enhanced element finding with fallbacks
  const findTargetElement = (step: TutorialStep): Element | null => {
    // Try primary target first
    let element = document.querySelector(step.target);
    
    if (!element && step.targetFallbacks) {
      // Try fallback selectors
      for (const fallback of step.targetFallbacks) {
        element = document.querySelector(fallback);
        if (element) {
          console.log(`🎯 Tutorial: Found element using fallback: ${fallback}`);
          break;
        }
      }
    }

    return element;
  };

  // Smart positioning that works across all devices with better clearance
  const calculateCardPosition = (element: Element | null, step: TutorialStep): Position => {
    if (!element) {
      // Fallback to center position
      return {
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
        maxWidth: isMobile ? "90vw" : isTablet ? "400px" : "450px",
        zIndex: "9000"
      };
    }

    const rect = element.getBoundingClientRect();
    const viewportHeight = window.innerHeight;
    const viewportWidth = window.innerWidth;
    
    // Responsive card sizing
    const cardWidth = isMobile ? Math.min(320, viewportWidth - 40) : isTablet ? 360 : 400;
    const cardHeight = isMobile ? 280 : 260;
    const margin = isMobile ? 20 : 30;
    const clearance = isMobile ? 20 : 40; // Reduced clearance to keep elements visible

    // Calculate safe position with better element visibility
    let position: Position = { zIndex: "9000" };
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    if (isMobile) {
      // Mobile: Position based on element location to avoid covering
      if (centerY > viewportHeight * 0.6) {
        // Element in bottom area - position tutorial above
        position = {
          top: `${Math.max(margin, rect.top - cardHeight - clearance)}px`,
          left: `${margin}px`,
          right: `${margin}px`,
          transform: "none",
          maxWidth: `${cardWidth}px`,
          zIndex: "9000"
        };
      } else {
        // Element in top/middle area - position tutorial below
        position = {
          top: `${Math.min(rect.bottom + clearance, viewportHeight - cardHeight - margin)}px`,
          left: `${margin}px`,
          right: `${margin}px`,
          transform: "none",
          maxWidth: `${cardWidth}px`,
          zIndex: "9000"
        };
      }
    } else if (isTablet) {
      // Tablet: Smart positioning to avoid element coverage
      if (centerY > viewportHeight * 0.6) {
        // Element in bottom area - position above
        position = {
          top: `${Math.max(margin, rect.top - cardHeight - clearance)}px`,
          left: `${Math.max(margin, Math.min(centerX - cardWidth/2, viewportWidth - cardWidth - margin))}px`,
          transform: "none",
          maxWidth: `${cardWidth}px`,
          zIndex: "9000"
        };
      } else {
        // Element in top/middle area - position below
        position = {
          top: `${Math.min(rect.bottom + clearance, viewportHeight - cardHeight - margin)}px`,
          left: `${Math.max(margin, Math.min(centerX - cardWidth/2, viewportWidth - cardWidth - margin))}px`,
          transform: "none",
          maxWidth: `${cardWidth}px`,
          zIndex: "9000"
        };
      }
    } else {
      // Desktop: Intelligent positioning to avoid element coverage
      const spaceLeft = rect.left;
      const spaceRight = viewportWidth - rect.right;
      const spaceTop = rect.top;
      const spaceBottom = viewportHeight - rect.bottom;

      // Choose best position based on available space
      if (spaceRight >= cardWidth + clearance && centerY > cardHeight/2 && centerY < viewportHeight - cardHeight/2) {
        // Position to the right
        position = {
          top: `${Math.max(margin, Math.min(centerY - cardHeight/2, viewportHeight - cardHeight - margin))}px`,
          left: `${rect.right + clearance}px`,
          transform: "none",
          maxWidth: `${cardWidth}px`,
          zIndex: "9000"
        };
      } else if (spaceLeft >= cardWidth + clearance && centerY > cardHeight/2 && centerY < viewportHeight - cardHeight/2) {
        // Position to the left
        position = {
          top: `${Math.max(margin, Math.min(centerY - cardHeight/2, viewportHeight - cardHeight - margin))}px`,
          left: `${rect.left - cardWidth - clearance}px`,
          transform: "none",
          maxWidth: `${cardWidth}px`,
          zIndex: "9000"
        };
      } else if (spaceBottom >= cardHeight + clearance) {
        // Position below
        position = {
          top: `${rect.bottom + clearance}px`,
          left: `${Math.max(margin, Math.min(centerX - cardWidth/2, viewportWidth - cardWidth - margin))}px`,
          transform: "none",
          maxWidth: `${cardWidth}px`,
          zIndex: "9000"
        };
      } else if (spaceTop >= cardHeight + clearance) {
        // Position above
        position = {
          top: `${rect.top - cardHeight - clearance}px`,
          left: `${Math.max(margin, Math.min(centerX - cardWidth/2, viewportWidth - cardWidth - margin))}px`,
          transform: "none",
          maxWidth: `${cardWidth}px`,
          zIndex: "9000"
        };
      } else {
        // Fallback: center with offset to avoid element
        const offsetY = centerY < viewportHeight/2 ? 100 : -100;
        position = {
          top: `${Math.max(margin, Math.min(viewportHeight/2 + offsetY, viewportHeight - cardHeight - margin))}px`,
          left: `${Math.max(margin, Math.min(centerX - cardWidth/2, viewportWidth - cardWidth - margin))}px`,
          transform: "none",
          maxWidth: `${cardWidth}px`,
          zIndex: "9000"
        };
      }
    }

    return position;
  };

  // Element highlighting and positioning - stabilized to prevent shaking
  useEffect(() => {
    if (!isVisible || currentStep >= tutorialSteps.length) {
      clearElementHighlighting();
      setHighlightedRect(null);
      return;
    }

    const step = tutorialSteps[currentStep];
    
    // Find target element with retry mechanism
    const findAndHighlight = () => {
      const element = findTargetElement(step);
      
      if (element) {
        // Cache the rect to prevent getBoundingClientRect calls during render
        const rect = element.getBoundingClientRect();
        setHighlightedRect(rect);
        
        highlightElement(element);
        const position = calculateCardPosition(element, step);
        setCardPosition(position);
      } else {
        console.warn(`🎯 Tutorial: Element not found for step ${currentStep}: ${step.target}`);
        setHighlightedRect(null);
        // Use center fallback position
        setCardPosition({
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          maxWidth: isMobile ? "90vw" : "400px",
          zIndex: "9000"
        });
      }
    };

    // Initial attempt
    findAndHighlight();

    // Retry after a short delay for dynamic content
    const retryTimer = setTimeout(findAndHighlight, 100);

    return () => {
      clearTimeout(retryTimer);
      clearElementHighlighting();
      setHighlightedRect(null);
    };
  }, [currentStep, isVisible]);

  const highlightElement = (element: Element) => {
    clearElementHighlighting();
    
    element.classList.add(
      'tutorial-highlight',
      'ring-4',
      'ring-yellow-400',
      'ring-offset-2',
      'ring-offset-background',
      'rounded-lg',
      'shadow-2xl',
      'shadow-yellow-400/80',
      'relative'
    );
    
    // Ensure element is clearly visible and above background blur
    (element as HTMLElement).style.zIndex = '8500';
    (element as HTMLElement).style.position = 'relative';
    (element as HTMLElement).style.backgroundColor = 'hsl(var(--background))';
    (element as HTMLElement).style.transform = 'scale(1.02)';
    (element as HTMLElement).style.transition = 'all 0.3s ease';
    
    setHighlightedElement(element);
  };

  const clearElementHighlighting = () => {
    if (highlightedElement) {
      highlightedElement.classList.remove(
        'tutorial-highlight',
        'ring-4',
        'ring-yellow-400',
        'ring-offset-2',
        'ring-offset-background',
        'rounded-lg',
        'shadow-2xl',
        'shadow-yellow-400/80',
        'relative'
      );
      (highlightedElement as HTMLElement).style.zIndex = '';
      (highlightedElement as HTMLElement).style.position = '';
      (highlightedElement as HTMLElement).style.backgroundColor = '';
      (highlightedElement as HTMLElement).style.transform = '';
      (highlightedElement as HTMLElement).style.transition = '';
      setHighlightedElement(null);
    }
  };

  const handleNext = () => {
    if (currentStep < tutorialSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onComplete();
      onStartTimer?.();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  console.log('🎓 Tutorial visibility check:', { isVisible, currentStep, totalSteps: tutorialSteps.length });
  
  if (!isVisible || currentStep >= tutorialSteps.length) {
    console.log('🎓 Tutorial not showing because:', { 
      isVisible, 
      currentStep, 
      totalSteps: tutorialSteps.length,
      reason: !isVisible ? 'not visible' : 'step out of bounds'
    });
    return null;
  }

  const step = tutorialSteps[currentStep];
  const Icon = step.icon;

  console.log('🎓 About to render tutorial with step:', step.title);

  return (
    <>

      {/* Temporary Magic Wand for Free Users - positioned near tutorial card */}
      {showTempMagicWand && (
        <div 
          className="fixed z-[8600]"
          style={{
            top: cardPosition.top ? `calc(${cardPosition.top} + 20px)` : '50%',
            left: cardPosition.left ? `calc(${cardPosition.left} + ${isMobile ? '280px' : '380px'})` : '50%',
            transform: !cardPosition.left ? 'translate(-50%, -50%)' : 'none'
          }}
        >
          <Button
            id="temp-tutorial-magic-wand"
            className={cn(
              "bg-gradient-to-r from-amber-500 to-orange-500 text-white border-0",
              "hover:from-amber-600 hover:to-orange-600 transition-all duration-300",
              "rounded-full p-4 shadow-2xl shadow-amber-500/60",
              "ring-4 ring-amber-300/60 ring-offset-2 ring-offset-background"
            )}
            disabled
            aria-label="Magic Wand (Tutorial Preview)"
          >
            <Wand2 className="w-6 h-6" />
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-yellow-300 rounded-full animate-ping" />
            <div className="absolute -bottom-1 -left-1 w-2 h-2 bg-orange-300 rounded-full animate-ping delay-500" />
          </Button>
        </div>
      )}

      {/* Focused overlay that doesn't blur highlighted elements */}
      <div className="fixed inset-0 z-[8000]">
        {/* Background dimming */}
        <div className="absolute inset-0 bg-black/50" />
        {/* Spotlight effect around highlighted element - using cached rect */}
        {highlightedRect && (
          <div 
            className="absolute bg-black/20 backdrop-blur-sm"
            style={{
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              clipPath: (() => {
                const padding = 12;
                return `polygon(0% 0%, 0% 100%, ${highlightedRect.left - padding}px 100%, ${highlightedRect.left - padding}px ${highlightedRect.top - padding}px, ${highlightedRect.right + padding}px ${highlightedRect.top - padding}px, ${highlightedRect.right + padding}px ${highlightedRect.bottom + padding}px, ${highlightedRect.left - padding}px ${highlightedRect.bottom + padding}px, ${highlightedRect.left - padding}px 100%, 100% 100%, 100% 0%)`;
              })()
            }}
          />
        )}
      </div>

      {/* Tutorial Card */}
      <div 
        className="fixed z-[9000]"
        style={cardPosition}
      >
        <Card className="bg-background/95 backdrop-blur-md shadow-2xl border-2 border-primary/30 rounded-2xl">
          <CardContent className="p-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-full">
                  <Icon className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-bold text-lg text-foreground">{step.title}</h3>
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