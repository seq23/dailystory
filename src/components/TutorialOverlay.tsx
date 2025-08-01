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
}

export const TutorialOverlay = ({ isVisible, onComplete, onSkip, onStartTimer }: TutorialOverlayProps) => {
  const { t } = useTranslation();
  const [currentStep, setCurrentStep] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

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

  useEffect(() => {
    let autoAdvanceTimer: NodeJS.Timeout;
    
    if (isVisible && currentStep < tutorialSteps.length) {
      // Auto-advance after 5 seconds for better comprehension
      const delay = 5000;
      autoAdvanceTimer = setTimeout(() => {
        handleNext();
      }, delay);
    }

    return () => {
      if (autoAdvanceTimer) {
        clearTimeout(autoAdvanceTimer);
      }
    };
  }, [currentStep, isVisible]);

  const handleNext = () => {
    if (currentStep < tutorialSteps.length - 1) {
      setIsAnimating(false);
      setTimeout(() => {
        setCurrentStep(prev => prev + 1);
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
        setCurrentStep(prev => prev - 1);
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
    
    const tooltipWidth = 480; // Larger tooltips as requested
    const tooltipHeight = 320;
    const margin = 40;

    let style: any = {};

    switch (position) {
      case "bottom":
        style = {
          top: `${Math.min(rect.bottom + 50, viewportHeight - tooltipHeight - margin)}px`,
          left: `${Math.max(margin, Math.min(rect.left + rect.width/2 - tooltipWidth/2, viewportWidth - tooltipWidth - margin))}px`,
          transform: "none"
        };
        break;
      case "top":
        style = {
          top: `${Math.max(margin, rect.top - tooltipHeight - 50)}px`,
          left: `${Math.max(margin, Math.min(rect.left + rect.width/2 - tooltipWidth/2, viewportWidth - tooltipWidth - margin))}px`,
          transform: "none"
        };
        break;
      case "right":
        style = {
          top: `${Math.max(margin, Math.min(rect.top + rect.height/2 - tooltipHeight/2, viewportHeight - tooltipHeight - margin))}px`,
          left: `${Math.min(rect.right + 50, viewportWidth - tooltipWidth - margin)}px`,
          transform: "none"
        };
        break;
      case "left":
        style = {
          top: `${Math.max(margin, Math.min(rect.top + rect.height/2 - tooltipHeight/2, viewportHeight - tooltipHeight - margin))}px`,
          left: `${Math.max(margin, rect.left - tooltipWidth - 50)}px`,
          transform: "none"
        };
        break;
      default:
        style = {
          top: "20%",
          left: "50%",
          transform: "translateX(-50%)"
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

      {/* Semi-transparent overlay */}
      <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 transition-opacity duration-500">
        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="absolute w-3 h-3 bg-yellow-300/60 rounded-full animate-float opacity-80"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 4}s`,
                animationDuration: `${4 + Math.random() * 3}s`
              }}
            />
          ))}
        </div>
      </div>

      {/* Large Tutorial Tooltip */}
      <div 
        className={`fixed z-50 transition-all duration-500 ${isAnimating ? 'opacity-100 scale-100' : 'opacity-0 scale-90'}`}
        style={tooltipStyle}
      >
        <Card className="w-[480px] bg-white dark:bg-gray-900 shadow-2xl border-4 border-yellow-400/50 rounded-3xl overflow-hidden animate-bounce">
          {/* Dramatic arrow pointing to target */}
          <div className="absolute -z-10">
            <div 
              className="w-0 h-0 animate-pulse"
              style={{
                borderLeft: '24px solid transparent',
                borderRight: '24px solid transparent', 
                borderBottom: '36px solid #FFD700',
                position: 'absolute',
                top: step.position === 'bottom' ? '-60px' : 
                     step.position === 'top' ? 'calc(100% + 20px)' : '50%',
                left: step.position === 'left' ? 'calc(100% + 20px)' : 
                      step.position === 'right' ? '-60px' : '50%',
                transform: step.position === 'top' ? 'rotate(180deg)' :
                          step.position === 'left' ? 'rotate(-90deg)' :
                          step.position === 'right' ? 'rotate(90deg)' : 'none',
                transformOrigin: 'center',
                filter: 'drop-shadow(0 8px 16px rgba(0,0,0,0.4))',
                zIndex: -1
              }}
            />
          </div>

          <CardContent className="p-0">
            {/* Vibrant Header */}
            <div className="bg-gradient-to-r from-yellow-400 via-orange-400 to-red-400 text-white p-8 relative overflow-hidden">
              <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-shimmer"></div>
              
              <div className="relative z-10 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-white/30 rounded-full animate-bounce">
                    <step.icon className="w-8 h-8" />
                  </div>
                  <div>
                    <h3 className="font-bold text-2xl mb-1">{step.title}</h3>
                    <div className="text-sm opacity-90 font-medium">
                      Tutorial Step {currentStep + 1} of {tutorialSteps.length}
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
                  <X className="w-6 h-6" />
                </Button>
              </div>
            </div>

            {/* Large Content Area */}
            <div className="p-8">
              <p className="text-gray-700 dark:text-gray-300 text-lg leading-relaxed mb-8 font-medium">
                {step.description}
              </p>

              {/* Prominent Progress Bar */}
              <div className="mb-8">
                <div className="flex justify-between text-sm text-muted-foreground mb-3">
                  <span className="font-semibold">Tutorial Progress</span>
                  <span className="font-bold text-lg">{Math.round(((currentStep + 1) / tutorialSteps.length) * 100)}%</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-4 shadow-inner">
                  <div 
                    className="bg-gradient-to-r from-yellow-400 to-orange-500 h-4 rounded-full transition-all duration-700 ease-out shadow-lg"
                    style={{ width: `${((currentStep + 1) / tutorialSteps.length) * 100}%` }}
                  />
                </div>
              </div>

              {/* Large Navigation Buttons */}
              <div className="flex justify-between items-center">
                <Button
                  variant="outline"
                  size="lg"
                  onClick={handlePrevious}
                  disabled={currentStep === 0}
                  className="flex items-center gap-2 px-6 py-3 text-lg font-semibold border-2 hover:scale-105 transition-transform"
                >
                  <ChevronLeft className="w-5 h-5" />
                  Previous
                </Button>

                <div className="flex items-center gap-4">
                  <Button
                    variant="ghost"
                    size="lg"
                    onClick={() => {
                      onSkip();
                      if (onStartTimer) {
                        onStartTimer();
                      }
                    }}
                    className="text-muted-foreground hover:text-red-600 px-6 py-3 text-lg"
                  >
                    Skip Tutorial
                  </Button>
                  <Button
                    variant="default"
                    size="lg"
                    onClick={handleNext}
                    className="bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white shadow-lg hover:scale-105 transition-all flex items-center gap-2 px-8 py-3 text-lg font-bold"
                  >
                    {currentStep === tutorialSteps.length - 1 ? '🚀 Start Reading!' : 'Next Step'}
                    <ChevronRight className="w-5 h-5" />
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
};