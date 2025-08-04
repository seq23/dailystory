import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ChevronRight, ChevronLeft, ChevronUp, ChevronDown, X } from "lucide-react";
import { useTranslation } from "react-i18next";

interface InlineTutorialProps {
  isActive: boolean;
  onComplete: () => void;
}

export const InlineTutorial = ({ isActive, onComplete }: InlineTutorialProps) => {
  const { t } = useTranslation();
  const [currentStep, setCurrentStep] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    console.log('Tutorial isActive changed:', isActive);
    if (isActive) {
      setIsVisible(true);
      setCurrentStep(0);
    } else {
      setIsVisible(false);
    }
  }, [isActive]);

  const tutorialSteps = [
    {
      id: 1,
      title: t('tutorial.readingTimer.title'),
      description: t('tutorial.readingTimer.description'),
      targetSelector: "#floating-timer",
      position: { 
        top: "5%", 
        left: "50%", 
        transform: "translateX(-50%)", 
        maxWidth: "min(90vw, 320px)",
        padding: "0.5rem" 
      },
      arrow: "down"
    },
    {
      id: 2,
      title: t('tutorial.pageNavigation.title'),
      description: t('tutorial.pageNavigation.description'),
      targetSelector: "#floating-timer",
      position: { 
        top: "8%", 
        left: "50%", 
        transform: "translateX(-50%)", 
        maxWidth: "min(90vw, 320px)",
        padding: "0.5rem" 
      },
      arrow: "down"
    },
    {
      id: 3,
      title: t('tutorial.audioReading.title'),
      description: t('tutorial.audioReading.description'),
      targetSelector: ".story-navigation",
      position: { bottom: "20%", left: "50%", transform: "translateX(-50%)", maxWidth: "300px" },
      arrow: "up"
    },
    {
      id: 4,
      title: t('tutorial.addMorePages.title'),
      description: t('tutorial.addMorePages.description'),
      targetSelector: ".story-navigation",
      position: { bottom: "25%", left: "50%", transform: "translateX(-50%)", maxWidth: "300px" },
      arrow: "up"
    },
    {
      id: 5,
      title: t('tutorial.difficulty.title'),
      description: t('tutorial.difficulty.description'),
      targetSelector: ".audio-controls",
      position: { top: "60%", right: "10%", maxWidth: "300px" },
      arrow: "left"
    },
    {
      id: 6,
      title: t('tutorial.progressTowers.title'),
      description: t('tutorial.progressTowers.description'),
      targetSelector: ".progress-towers-container",
      position: { 
        top: "50%", 
        right: "18%", 
        transform: "translateY(-50%)", 
        maxWidth: "min(90vw, 320px)",
        padding: "0.5rem" 
      },
      arrow: "right"
    }
  ];

  const currentStepData = tutorialSteps[currentStep];

  const nextStep = () => {
    if (currentStep < tutorialSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      completeTutorial();
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const completeTutorial = () => {
    setIsVisible(false);
    setTimeout(() => {
      onComplete();
    }, 300);
  };

  const getArrowIcon = (direction: string) => {
    switch (direction) {
      case "right": return <ChevronRight className="w-6 h-6 text-primary" />;
      case "left": return <ChevronLeft className="w-6 h-6 text-primary" />;
      case "up": return <ChevronUp className="w-6 h-6 text-primary" />;
      case "down": return <ChevronDown className="w-6 h-6 text-primary" />;
      default: return <ChevronRight className="w-6 h-6 text-primary" />;
    }
  };

  const getArrowPosition = (direction: string) => {
    switch (direction) {
      case "right": return "left-0 top-1/2 -translate-y-1/2 -translate-x-full";
      case "left": return "right-0 top-1/2 -translate-y-1/2 translate-x-full";
      case "up": return "bottom-0 left-1/2 -translate-x-1/2 translate-y-full";
      case "down": return "top-0 left-1/2 -translate-x-1/2 -translate-y-full";
      default: return "left-0 top-1/2 -translate-y-1/2 -translate-x-full";
    }
  };

  useEffect(() => {
    if (isVisible && currentStepData) {
      const targetElement = document.querySelector(currentStepData.targetSelector);
      if (targetElement) {
        targetElement.classList.add(
          'ring-4', 
          'ring-primary', 
          'ring-opacity-75', 
          'animate-pulse',
          'rounded-lg',
          'transition-all',
          'duration-500'
        );
        
        return () => {
          targetElement.classList.remove(
            'ring-4', 
            'ring-primary', 
            'ring-opacity-75', 
            'animate-pulse',
            'rounded-lg',
            'transition-all',
            'duration-500'
          );
        };
      }
    }
  }, [currentStep, isVisible, currentStepData]);

  // Auto-advance tutorial after 30 seconds total (6 steps x 5 seconds each)
  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(() => {
        completeTutorial();
      }, 30000); // 30 seconds total
      
      return () => clearTimeout(timer);
    }
  }, [isVisible]);

  if (!isVisible || !currentStepData) return null;

  return (
    <div className="fixed inset-0 z-50 pointer-events-none">
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/20 animate-fade-in" />
      
      {/* Tutorial Popup - Smart positioning to stay on screen */}
      <div 
        className="absolute pointer-events-auto animate-scale-in"
        style={{
          ...currentStepData.position,
          // Ensure popup stays within viewport
          transform: `translate(${
            // Adjust horizontal position if too close to edges
            (currentStepData.position.left && parseFloat(currentStepData.position.left.replace('%', '')) > 75) ? '-100%' :
            (currentStepData.position.right && parseFloat(currentStepData.position.right.replace('%', '')) > 75) ? '-100%' : '0'
          }, ${
            // Adjust vertical position if too close to edges  
            (currentStepData.position.top && parseFloat(currentStepData.position.top.replace('%', '')) > 75) ? '-100%' : '0'
          })`
        }}
      >
        <div className="relative">
          {/* Arrow pointing to target */}
          <div className={`absolute ${getArrowPosition(currentStepData.arrow)} animate-bounce`}>
            {getArrowIcon(currentStepData.arrow)}
          </div>
          
          {/* Tutorial Card - Responsive sizing */}
          <div className="bg-white rounded-xl shadow-2xl border-2 border-primary/20 p-4 sm:p-6 max-w-[280px] sm:max-w-xs mx-4">
            {/* Header */}
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-base sm:text-lg font-bold text-primary pr-2">{currentStepData.title}</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={completeTutorial}
                className="h-6 w-6 p-0 hover:bg-gray-100"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
            
            {/* Description */}
            <p className="text-sm text-gray-600 mb-4 leading-relaxed">
              {currentStepData.description}
            </p>
            
            {/* Progress */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex space-x-1">
                {tutorialSteps.map((_, index) => (
                  <div
                    key={index}
                    className={`w-2 h-2 rounded-full transition-colors ${
                      index <= currentStep ? 'bg-primary' : 'bg-gray-200'
                    }`}
                  />
                ))}
              </div>
              <span className="text-xs text-gray-500">
                {currentStep + 1} of {tutorialSteps.length}
              </span>
            </div>
            
            {/* Navigation */}
            <div className="flex justify-between">
              <Button
                variant="outline"
                size="sm"
                onClick={prevStep}
                disabled={currentStep === 0}
                className="text-xs"
              >
                Previous
              </Button>
              <Button
                size="sm"
                onClick={nextStep}
                className="text-xs"
              >
                {currentStep === tutorialSteps.length - 1 ? 'Finish' : 'Next'}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};