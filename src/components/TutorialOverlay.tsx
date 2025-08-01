import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { X, ChevronRight, ChevronLeft, Sparkles, BookOpen, User, Heart, Star } from "lucide-react";

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
  onStartTimer?: () => void; // Add callback to start timer
}

export const TutorialOverlay = ({ isVisible, onComplete, onSkip, onStartTimer }: TutorialOverlayProps) => {
  const { t } = useTranslation();
  const [currentStep, setCurrentStep] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  const tutorialSteps: TutorialStep[] = [
    {
      target: "story-content",
      title: t("tutorial.step1.title", "📖 Your Story"),
      description: t("tutorial.step1.description", "This is your personalized story! Click on any highlighted word to hear it pronounced or learn what it means."),
      icon: BookOpen,
      position: "bottom"
    },
    {
      target: "timer-display",
      title: t("tutorial.step2.title", "⏰ Reading Timer"),
      description: t("tutorial.step2.description", "Keep track of your reading time here. The timer shows how much time you have left in your session."),
      icon: Sparkles,
      position: "left"
    },
    {
      target: "navigation-controls",
      title: t("tutorial.step3.title", "🎮 Story Controls"), 
      description: t("tutorial.step3.description", "Use these buttons to move between pages, go home, or start a new story. Ready to start reading?"),
      icon: Star,
      position: "top"
    }
  ];

  useEffect(() => {
    if (isVisible && currentStep < tutorialSteps.length) {
      const timer = setTimeout(() => {
        setIsAnimating(true);
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [currentStep, isVisible, tutorialSteps.length]);

  useEffect(() => {
    let autoAdvanceTimer: NodeJS.Timeout;
    
    if (isVisible && currentStep < tutorialSteps.length) {
      // Shorter auto-advance for concise tutorial - 4 seconds
      const delay = 4000;
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
      // Start timer when tutorial completes
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
    // Calculate better positioning to avoid covering content
    const element = document.getElementById(target);
    if (!element) {
      return { top: "10%", left: "20px", transform: "none" };
    }

    const rect = element.getBoundingClientRect();
    const viewportHeight = window.innerHeight;
    const viewportWidth = window.innerWidth;
    
    const tooltipWidth = 400;
    const tooltipHeight = 280; // Shorter for concise tutorial
    const margin = 30; // More margin to avoid covering content

    let style: any = {};

    // Always position away from the target element to avoid covering it
    switch (position) {
      case "bottom":
        style = {
          top: `${Math.max(rect.bottom + 40, margin)}px`,
          left: `${Math.max(margin, Math.min(rect.left + rect.width/2 - tooltipWidth/2, viewportWidth - tooltipWidth - margin))}px`,
          transform: "none"
        };
        break;
      case "top":
        style = {
          top: `${Math.max(margin, rect.top - tooltipHeight - 40)}px`,
          left: `${Math.max(margin, Math.min(rect.left + rect.width/2 - tooltipWidth/2, viewportWidth - tooltipWidth - margin))}px`,
          transform: "none"
        };
        break;
      case "right":
        style = {
          top: `${Math.max(margin, Math.min(rect.top + rect.height/2 - tooltipHeight/2, viewportHeight - tooltipHeight - margin))}px`,
          left: `${Math.max(margin, Math.min(rect.right + 40, viewportWidth - tooltipWidth - margin))}px`,
          transform: "none"
        };
        break;
      case "left":
        style = {
          top: `${Math.max(margin, Math.min(rect.top + rect.height/2 - tooltipHeight/2, viewportHeight - tooltipHeight - margin))}px`,
          left: `${Math.max(margin, rect.left - tooltipWidth - 40)}px`,
          transform: "none"
        };
        break;
      default:
        style = {
          top: "10%",
          left: "20px",
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
      {/* Overlay background */}
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 transition-opacity duration-300">
        {/* Spotlight effect */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-transparent to-secondary/20 animate-pulse"></div>
          
          {/* Floating sparkles */}
          <div className="absolute inset-0 overflow-hidden">
            {[...Array(12)].map((_, i) => (
              <div
                key={i}
                className="absolute w-2 h-2 bg-yellow-300 rounded-full animate-float opacity-70"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                  animationDelay: `${Math.random() * 3}s`,
                  animationDuration: `${3 + Math.random() * 2}s`
                }}
              />
            ))}
          </div>
        </div>

        {/* Tooltip */}
        <div 
          className={`fixed z-60 transition-all duration-300 ${isAnimating ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}
          style={tooltipStyle}
        >
          <Card className="w-80 bg-white dark:bg-gray-900 shadow-2xl border-2 border-primary/30 rounded-2xl overflow-hidden">
            {/* Big Fun Arrow pointing to target */}
            <div className="absolute -z-10">
              <div 
                className="w-0 h-0 animate-bounce"
                style={{
                  borderLeft: '16px solid transparent',
                  borderRight: '16px solid transparent', 
                  borderBottom: '24px solid #FFD700',
                  position: 'absolute',
                  top: step.position === 'bottom' ? '-45px' : 
                       step.position === 'top' ? 'calc(100% + 15px)' : '50%',
                  left: step.position === 'left' ? 'calc(100% + 15px)' : 
                        step.position === 'right' ? '-45px' : '50%',
                  transform: step.position === 'top' ? 'rotate(180deg)' :
                            step.position === 'left' ? 'rotate(-90deg)' :
                            step.position === 'right' ? 'rotate(90deg)' : 'none',
                  transformOrigin: 'center',
                  filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.3))'
                }}
              />
            </div>
            <CardContent className="p-0">
              {/* Header */}
              <div className="bg-gradient-primary text-white p-4 relative overflow-hidden">
                <div className="absolute inset-0 bg-white/10 animate-pulse"></div>
                <div className="relative z-10 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-white/20 rounded-full">
                      <step.icon className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-bold text-lg">{step.title}</h3>
                      <div className="text-xs opacity-80">
                        Step {currentStep + 1} of {tutorialSteps.length}
                      </div>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      onSkip();
                      // Start timer when user exits tutorial early
                      if (onStartTimer) {
                        onStartTimer();
                      }
                    }}
                    className="text-white hover:bg-white/20 p-1"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {/* Content */}
              <div className="p-6">
                <p className="text-muted-foreground text-sm leading-relaxed mb-6">
                  {step.description}
                </p>

                {/* Progress bar */}
                <div className="mb-6">
                  <div className="flex justify-between text-xs text-muted-foreground mb-2">
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

                {/* Navigation */}
                <div className="flex justify-between items-center">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handlePrevious}
                    disabled={currentStep === 0}
                    className="flex items-center gap-2"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    Previous
                  </Button>

                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        onSkip();
                        // Start timer when user skips tutorial
                        if (onStartTimer) {
                          onStartTimer();
                        }
                      }}
                      className="text-muted-foreground"
                    >
                      Skip Tutorial
                    </Button>
                    <Button
                      variant="default"
                      size="sm"
                      onClick={handleNext}
                      className="bg-gradient-primary hover:opacity-90 flex items-center gap-2"
                    >
                      {currentStep === tutorialSteps.length - 1 ? 'Get Started' : 'Next'}
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Pointer/Arrow to target */}
          <div className="absolute -z-10">
            {step.position === "bottom" && (
              <div className="absolute -bottom-3 left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-[12px] border-r-[12px] border-t-[12px] border-l-transparent border-r-transparent border-t-white dark:border-t-gray-900" />
            )}
            {step.position === "top" && (
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-[12px] border-r-[12px] border-b-[12px] border-l-transparent border-r-transparent border-b-white dark:border-b-gray-900" />
            )}
            {step.position === "left" && (
              <div className="absolute top-1/2 -left-3 transform -translate-y-1/2 w-0 h-0 border-t-[12px] border-b-[12px] border-r-[12px] border-t-transparent border-b-transparent border-r-white dark:border-r-gray-900" />
            )}
            {step.position === "right" && (
              <div className="absolute top-1/2 -right-3 transform -translate-y-1/2 w-0 h-0 border-t-[12px] border-b-[12px] border-l-[12px] border-t-transparent border-b-transparent border-l-white dark:border-l-gray-900" />
            )}
          </div>
        </div>
      </div>
    </>
  );
};