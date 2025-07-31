import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ChevronRight, ChevronLeft, ChevronUp, ChevronDown, X } from "lucide-react";

interface InlineTutorialProps {
  isActive: boolean;
  onComplete: () => void;
}

export const InlineTutorial = ({ isActive, onComplete }: InlineTutorialProps) => {
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
      title: "Timer Controls",
      description: "Use these buttons to control your reading timer. Play/pause to start reading, and add time when you need more!",
      targetSelector: "#floating-timer",
      position: { top: "50%", left: "20%" },
      arrow: "right"
    },
    {
      id: 2,
      title: "Story Navigation",
      description: "Navigate through your story pages using these arrow buttons. Go back or forward at your own pace!",
      targetSelector: ".story-navigation",
      position: { top: "85%", left: "45%" },
      arrow: "up"
    },
    {
      id: 3,
      title: "Audio Playback",
      description: "Listen to the story being read aloud! Click play and adjust the reading speed to your preference.",
      targetSelector: ".audio-controls",
      position: { top: "20%", right: "20%" },
      arrow: "left"
    },
    {
      id: 4,
      title: "Reading Levels",
      description: "Choose your reading level! Start with Easy mode and work your way up as you improve.",
      targetSelector: ".reading-level-controls",
      position: { top: "15%", left: "50%" },
      arrow: "down"
    },
    {
      id: 5,
      title: "Add More Pages",
      description: "Running out of story? Click here to add 5 more pages to keep the adventure going!",
      targetSelector: "#floating-timer",
      position: { top: "35%", left: "15%" },
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

  // Auto-advance tutorial after 10 seconds
  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(() => {
        completeTutorial();
      }, 10000);
      
      return () => clearTimeout(timer);
    }
  }, [isVisible]);

  if (!isVisible || !currentStepData) return null;

  return (
    <div className="fixed inset-0 z-50 pointer-events-none">
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/20 animate-fade-in" />
      
      {/* Tutorial Popup */}
      <div 
        className="absolute pointer-events-auto animate-scale-in"
        style={currentStepData.position}
      >
        <div className="relative">
          {/* Arrow pointing to target */}
          <div className={`absolute ${getArrowPosition(currentStepData.arrow)} animate-bounce`}>
            {getArrowIcon(currentStepData.arrow)}
          </div>
          
          {/* Tutorial Card */}
          <div className="bg-white rounded-xl shadow-2xl border-2 border-primary/20 p-6 max-w-xs">
            {/* Header */}
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-bold text-primary">{currentStepData.title}</h3>
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