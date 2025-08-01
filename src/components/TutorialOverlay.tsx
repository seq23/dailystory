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
      target: "welcome-title",
      title: t("tutorial.step1.title", "🌟 Welcome to Time2Read!"),
      description: t("tutorial.step1.description", "Hi there! Let's take a quick tour to help you create amazing personalized stories. I'll point to each important button and explain what it does. This will only take a minute!"),
      icon: Sparkles,
      position: "bottom"
    },
    {
      target: "basic-info-section",
      title: t("tutorial.step2.title", "👤 Step 1: Tell Us About Your Child"),
      description: t("tutorial.step2.description", "👈 Look here! Fill in your child's name, age, and reading level. This section helps us create stories that are just right for your child's abilities."),
      icon: User,
      position: "right"
    },
    {
      target: "favorites-section", 
      title: t("tutorial.step3.title", "❤️ Step 2: Share Their Favorites"),
      description: t("tutorial.step3.description", "👉 Look over here! Add favorite animals, colors, and foods to make the story extra special. Kids love seeing their favorites in their stories!"),
      icon: Heart,
      position: "left"
    },
    {
      target: "special-request-section",
      title: t("tutorial.step4.title", "⭐ Step 3: Special Story Ideas"),
      description: t("tutorial.step4.description", "👆 Look up here! Want a story about space, dinosaurs, or princesses? This is where you can request special themes and topics for the story!"),
      icon: Star,
      position: "top"
    },
    {
      target: "create-story-button",
      title: t("tutorial.step5.title", "📚 Step 4: Create Your Story!"),
      description: t("tutorial.step5.description", "👆 This is the magic button! Once you've filled everything out, click this big button to create your personalized reading adventure. The timer will start automatically!"),
      icon: BookOpen,
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
      // Auto-advance after 5 seconds for first step, 6 seconds for others (longer for kids)
      const delay = currentStep === 0 ? 5000 : 6000;
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
    // Position calculations based on target element
    const positions = {
      "welcome-title": { top: "120px", left: "50%", transform: "translateX(-50%)" },
      "basic-info-section": { top: "50%", left: "60%", transform: "translateY(-50%)" },
      "favorites-section": { top: "50%", right: "60%", transform: "translateY(-50%)" },
      "special-request-section": { bottom: "180px", left: "50%", transform: "translateX(-50%)" },
      "create-story-button": { bottom: "120px", right: "50px" }
    };
    
    return positions[target as keyof typeof positions] || { top: "50%", left: "50%", transform: "translate(-50%, -50%)" };
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
          className={`absolute z-60 transition-all duration-300 ${isAnimating ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}
          style={tooltipStyle}
        >
          <Card className="w-96 sm:w-[440px] md:w-[500px] bg-white dark:bg-gray-900 shadow-2xl border-2 border-primary/30 rounded-2xl overflow-hidden">
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