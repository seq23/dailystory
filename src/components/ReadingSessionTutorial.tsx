import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { X, Sparkles, Timer, Play, Plus, BookOpen, ChevronUp, Home } from "lucide-react";

interface ReadingSessionTutorialProps {
  isVisible: boolean;
  onComplete: () => void;
  onSkip: () => void;
}

export const ReadingSessionTutorial = ({ isVisible, onComplete, onSkip }: ReadingSessionTutorialProps) => {
  const { t } = useTranslation();
  const [currentStep, setCurrentStep] = useState(0);

  const tutorialMessages = [
    {
      icon: Sparkles,
      title: t("readingTutorial.step1.title", "Welcome to Your Reading Adventure!"),
      description: t("readingTutorial.step1.description", "Let me show you the amazing controls that make reading fun and interactive. This will only take 10 seconds!")
    },
    {
      icon: Timer,
      title: t("readingTutorial.step2.title", "Your Reading Timer"),
      description: t("readingTutorial.step2.description", "The floating timer on the left tracks your reading time. Use the play/pause button in the center to control it!")
    },
    {
      icon: Plus,
      title: t("readingTutorial.step3.title", "Add Time & Pages"),
      description: t("readingTutorial.step3.description", "Need more time? Click the green + button! Want more story? Use the book icon to add 5 more pages!")
    },
    {
      icon: ChevronUp,
      title: t("readingTutorial.step4.title", "Perfect Difficulty"),
      description: t("readingTutorial.step4.description", "Use the up/down arrows to make text easier or harder. Previous/Next buttons move between pages!")
    },
    {
      icon: BookOpen,
      title: t("readingTutorial.step5.title", "Ready to Read!"),
      description: t("readingTutorial.step5.description", "You're all set! Start your reading timer and enjoy your personalized story adventure!")
    }
  ];

  useEffect(() => {
    if (!isVisible) return;

    const timer = setTimeout(() => {
      if (currentStep < tutorialMessages.length - 1) {
        setCurrentStep(prev => prev + 1);
      } else {
        onComplete();
      }
    }, 2000); // 2 seconds per step = 10 seconds total

    return () => clearTimeout(timer);
  }, [currentStep, isVisible, onComplete, tutorialMessages.length]);

  if (!isVisible) return null;

  const message = tutorialMessages[currentStep];

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      {/* Floating sparkles */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute w-2 h-2 bg-yellow-300 rounded-full animate-float opacity-60"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${3 + Math.random() * 2}s`
            }}
          />
        ))}
      </div>

      <Card className="w-full max-w-md bg-white dark:bg-gray-900 shadow-2xl border-2 border-primary/30 rounded-2xl overflow-hidden animate-scale-in">
        <CardContent className="p-0">
          {/* Header */}
          <div className="bg-gradient-primary text-white p-6 relative overflow-hidden">
            <div className="absolute inset-0 bg-white/10 animate-pulse"></div>
            <div className="relative z-10 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white/20 rounded-full">
                  <message.icon className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-xl">{message.title}</h3>
                  <div className="text-sm opacity-80">
                    Step {currentStep + 1} of {tutorialMessages.length}
                  </div>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={onSkip}
                className="text-white hover:bg-white/20 p-2"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>
          </div>

          {/* Content */}
          <div className="p-6">
            <p className="text-muted-foreground text-base leading-relaxed mb-6">
              {message.description}
            </p>

            {/* Progress bar */}
            <div className="mb-6">
              <div className="flex justify-between text-sm text-muted-foreground mb-2">
                <span>Tutorial Progress</span>
                <span>{Math.round(((currentStep + 1) / tutorialMessages.length) * 100)}%</span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                <div 
                  className="bg-gradient-primary h-3 rounded-full transition-all duration-500 ease-out"
                  style={{ width: `${((currentStep + 1) / tutorialMessages.length) * 100}%` }}
                />
              </div>
            </div>

            {/* Auto-advance indicator */}
            <div className="text-center">
              <p className="text-sm text-muted-foreground mb-4">
                {currentStep < tutorialMessages.length - 1 ? "Auto-advancing in 2 seconds..." : "Ready to start!"}
              </p>
              
              <div className="flex gap-3 justify-center">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onSkip}
                  className="text-muted-foreground"
                >
                  Skip Tutorial
                </Button>
                {currentStep === tutorialMessages.length - 1 && (
                  <Button
                    variant="default"
                    size="sm"
                    onClick={onComplete}
                    className="bg-gradient-primary hover:opacity-90"
                  >
                    Start Reading!
                  </Button>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};