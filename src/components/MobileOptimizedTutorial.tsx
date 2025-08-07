import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { X, ChevronLeft, ChevronRight, Timer, Volume2, TrendingUp, Play } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";

interface TutorialStep {
  target: string;
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  position: "top" | "bottom" | "left" | "right" | "center";
}

interface MobileOptimizedTutorialProps {
  isVisible: boolean;
  onComplete: () => void;
  onSkip: () => void;
  onStepChange?: (step: number) => void;
}

export const MobileOptimizedTutorial = ({
  isVisible,
  onComplete,
  onSkip,
  onStepChange
}: MobileOptimizedTutorialProps) => {
  const { t } = useTranslation();
  const { isMobile, isTablet, isMobileOrTablet } = useIsMobile();
  const [currentStep, setCurrentStep] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  const tutorialSteps: TutorialStep[] = [
    {
      target: "timer-display",
      title: t("tutorial.timer.title", "⏰ Reading Timer"),
      description: t("tutorial.timer.description", "Track your reading time! Click to start/pause, or collapse on mobile to save space."),
      icon: Timer,
      position: "center"
    },
    {
      target: "story-navigation",
      title: t("tutorial.navigation.title", "📖 Story Navigation"),
      description: t("tutorial.navigation.description", "Swipe or use buttons to move between pages. Progress is automatically saved."),
      icon: ChevronRight,
      position: "bottom"
    },
    {
      target: "audio-controls",
      title: t("tutorial.audio.title", "🎵 Audio Reading"),
      description: t("tutorial.audio.description", "Listen to stories read aloud with word highlighting. Perfect for learning pronunciation!"),
      icon: Volume2,
      position: "bottom"
    },
    {
      target: "reading-level-controls",
      title: t("tutorial.difficulty.title", "🎯 Reading Level"),
      description: t("tutorial.difficulty.description", "Adjust story difficulty instantly! Text adapts to your reading level."),
      icon: TrendingUp,
      position: "center"
    },
    {
      target: "add-pages-button",
      title: t("tutorial.addPages.title", "➕ Continue Story"),
      description: t("tutorial.addPages.description", "Want more? Add pages to continue your adventure! Premium users get unlimited pages."),
      icon: Play,
      position: "top"
    }
  ];

  // Notify parent about step changes
  useEffect(() => {
    onStepChange?.(currentStep);
  }, [currentStep, onStepChange]);

  // Enhanced highlighting for mobile
  useEffect(() => {
    if (!isVisible || currentStep >= tutorialSteps.length) return;

    const step = tutorialSteps[currentStep];
    const targetElement = document.querySelector(`#${step.target}, .${step.target}`);
    
    if (targetElement) {
      // Mobile-optimized highlighting
      const highlightClasses = [
        'tutorial-highlight-mobile',
        'ring-4',
        'ring-primary/60',
        'ring-offset-2',
        'rounded-lg',
        'shadow-2xl',
        'shadow-primary/30',
        'z-50',
        'relative',
        'animate-pulse'
      ];

      targetElement.classList.add(...highlightClasses);

      // Enhanced mobile animations
      if (isMobileOrTablet) {
        (targetElement as HTMLElement).style.transform = 'scale(1.05)';
        (targetElement as HTMLElement).style.transition = 'all 0.3s ease-out';
      }
    }

    return () => {
      if (targetElement) {
        targetElement.classList.remove(
          'tutorial-highlight-mobile',
          'ring-4',
          'ring-primary/60',
          'ring-offset-2',
          'rounded-lg',
          'shadow-2xl',
          'shadow-primary/30',
          'z-50',
          'relative',
          'animate-pulse'
        );
        (targetElement as HTMLElement).style.transform = '';
        (targetElement as HTMLElement).style.transition = '';
      }
    };
  }, [currentStep, isVisible, isMobileOrTablet]);

  const handleNext = () => {
    if (currentStep < tutorialSteps.length - 1) {
      setIsAnimating(false);
      setTimeout(() => {
        setCurrentStep(currentStep + 1);
      }, 200);
    } else {
      onComplete();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setIsAnimating(false);
      setTimeout(() => {
        setCurrentStep(currentStep - 1);
      }, 200);
    }
  };

  const getCardPosition = () => {
    const step = tutorialSteps[currentStep];
    const targetElement = document.querySelector(`#${step.target}, .${step.target}`);
    
    if (!targetElement) {
      return { position: 'center' };
    }

    const rect = targetElement.getBoundingClientRect();
    const viewportHeight = window.innerHeight;
    const viewportWidth = window.innerWidth;
    
    // Mobile-first positioning
    if (isMobile) {
      // On mobile, always position cards to avoid covering targets
      const isInTopHalf = rect.top < viewportHeight / 2;
      
      return {
        position: isInTopHalf ? 'bottom' : 'top',
        style: {
          position: 'fixed' as const,
          left: '1rem',
          right: '1rem',
          [isInTopHalf ? 'bottom' : 'top']: '1rem',
          zIndex: 9999,
          maxWidth: 'calc(100vw - 2rem)'
        }
      };
    }

    if (isTablet) {
      return {
        position: step.position,
        style: {
          position: 'fixed' as const,
          left: '2rem',
          right: '2rem',
          top: '50%',
          transform: 'translateY(-50%)',
          zIndex: 9999,
          maxWidth: 'calc(100vw - 4rem)'
        }
      };
    }

    // Desktop positioning
    return {
      position: step.position,
      style: {
        position: 'fixed' as const,
        left: '50%',
        top: '50%',
        transform: 'translate(-50%, -50%)',
        zIndex: 9999,
        maxWidth: '400px'
      }
    };
  };

  const currentPositioning = getCardPosition();

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-[9998] bg-black/20 backdrop-blur-sm">
      {/* Tutorial Card */}
      <Card 
        className={cn(
          "shadow-2xl border-2 border-primary/20 bg-white/95 backdrop-blur-sm",
          isMobile && "mx-4",
          isAnimating && "animate-scale-in"
        )}
        style={currentPositioning.style}
      >
        <CardContent className="p-4 sm:p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-full">
                {React.createElement(tutorialSteps[currentStep].icon, {
                  className: "w-5 h-5 text-primary"
                })}
              </div>
              <h3 className={cn(
                "font-semibold text-gray-900",
                isMobile ? "text-base" : "text-lg"
              )}>
                {tutorialSteps[currentStep].title}
              </h3>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onSkip}
              className="text-gray-500 hover:text-gray-700"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>

          {/* Content */}
          <p className={cn(
            "text-gray-600 mb-6",
            isMobile ? "text-sm" : "text-base"
          )}>
            {tutorialSteps[currentStep].description}
          </p>

          {/* Navigation */}
          <div className="flex items-center justify-between">
            <div className="flex gap-1">
              {tutorialSteps.map((_, index) => (
                <div
                  key={index}
                  className={cn(
                    "w-2 h-2 rounded-full transition-colors",
                    index === currentStep ? "bg-primary" : "bg-gray-300"
                  )}
                />
              ))}
            </div>

            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handlePrevious}
                disabled={currentStep === 0}
                className="min-h-[44px] px-4"
              >
                <ChevronLeft className="w-4 h-4 mr-1" />
                {t("tutorial.previous", "Previous")}
              </Button>
              
              <Button
                onClick={handleNext}
                size="sm"
                className="min-h-[44px] px-4"
              >
                {currentStep === tutorialSteps.length - 1 
                  ? t("tutorial.finish", "Finish") 
                  : t("tutorial.next", "Next")
                }
                {currentStep < tutorialSteps.length - 1 && (
                  <ChevronRight className="w-4 h-4 ml-1" />
                )}
              </Button>
            </div>
          </div>

          {/* Progress */}
          <div className="mt-4">
            <div className="text-xs text-gray-500 text-center">
              {currentStep + 1} {t("tutorial.of", "of")} {tutorialSteps.length}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};