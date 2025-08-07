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

interface SimpleTutorialOverlayProps {
  isVisible: boolean;
  onComplete: () => void;
  onSkip: () => void;
  onStartTimer?: () => void;
  onStepChange?: (step: number) => void;
  sessionStartTime?: Date | null;
}

export const SimpleTutorialOverlay = ({ isVisible, onComplete, onSkip, onStartTimer, onStepChange }: SimpleTutorialOverlayProps) => {
  const { t } = useTranslation();
  const [currentStep, setCurrentStep] = useState(0);

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
    },
    {
      target: "progress-towers-container",
      title: t("tutorial.progressTowers.title", "🏗️ Progress Towers"),
      description: t("tutorial.progressTowers.description", "Watch your reading progress grow! These towers show your words read, pages completed, and vocabulary learned. Click to expand and see detailed stats."),
      icon: TrendingUp,
      position: "right"
    }
  ];

  // Notify parent about step changes
  useEffect(() => {
    onStepChange?.(currentStep);
  }, [currentStep, onStepChange]);

  // Simple element highlighting without complex cutouts
  useEffect(() => {
    if (!isVisible || currentStep >= tutorialSteps.length) return;

    const step = tutorialSteps[currentStep];
    console.log('🎯 SimpleTutorial: Highlighting element:', step.target);
    
    const targetElement = document.querySelector(`#${step.target}, .${step.target}`);
    console.log('🎯 SimpleTutorial: Found element:', targetElement);
    
    if (targetElement) {
      // Simple, strong highlighting
      targetElement.classList.add(
        'ring-4',
        'ring-yellow-400',
        'ring-offset-4',
        'ring-offset-yellow-100',
        'rounded-lg',
        'shadow-2xl',
        'shadow-yellow-400/50',
        'relative'
      );
      
      // Force high z-index
      (targetElement as HTMLElement).style.zIndex = '9999';
      (targetElement as HTMLElement).style.position = 'relative';
      
      // Special handling for timer
      if (step.target === "timer-display") {
        const timerContainer = targetElement.closest('[id="floating-timer"]');
        if (timerContainer) {
          (timerContainer as HTMLElement).style.zIndex = '9999';
          console.log('🎯 SimpleTutorial: Enhanced timer z-index');
        }
      }
    }

    return () => {
      if (targetElement) {
        targetElement.classList.remove(
          'ring-4',
          'ring-yellow-400',
          'ring-offset-4',
          'ring-offset-yellow-100',
          'rounded-lg',
          'shadow-2xl',
          'shadow-yellow-400/50',
          'relative'
        );
        (targetElement as HTMLElement).style.zIndex = '';
        (targetElement as HTMLElement).style.position = '';
        
        if (step.target === "timer-display") {
          const timerContainer = targetElement.closest('[id="floating-timer"]');
          if (timerContainer) {
            (timerContainer as HTMLElement).style.zIndex = '';
          }
        }
      }
    };
  }, [currentStep, isVisible, tutorialSteps]);

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
      {/* Simple dark overlay - lower z-index */}
      <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-30" />

      {/* Tutorial Card - positioned in center for simplicity */}
      <div className="fixed inset-0 z-40 flex items-center justify-center p-4">
        <Card className="w-full max-w-md bg-white dark:bg-gray-900 shadow-xl border-2 border-primary/30 rounded-2xl">
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
                    className={`w-2 h-2 rounded-full transition-colors ${
                      index === currentStep 
                        ? 'bg-primary' 
                        : index < currentStep 
                          ? 'bg-primary/50' 
                          : 'bg-muted'
                    }`}
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