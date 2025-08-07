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
  onStepChange?: (step: number) => void;
  sessionStartTime?: Date | null;
}

export const TutorialOverlay = ({ isVisible, onComplete, onSkip, onStartTimer, onStepChange, sessionStartTime }: TutorialOverlayProps) => {
  const { t, i18n } = useTranslation();
  const [currentStep, setCurrentStep] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [isPulseActive, setIsPulseActive] = useState(true);

  // Notify parent about step changes
  useEffect(() => {
    onStepChange?.(currentStep);
  }, [currentStep, onStepChange]);


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
      target: "magic-wand-free",
      title: t("tutorial.magicWand.title", "🪄 Magic Wand"),
      description: t("tutorial.magicWand.description.free", "Generate new stories to keep reading! Premium users can refresh anytime."),
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

  // Create pulsing highlight effect on target elements
  useEffect(() => {
    if (!isVisible || currentStep >= tutorialSteps.length) {
      console.log('🎯 Tutorial: Not running effect', { isVisible, currentStep, totalSteps: tutorialSteps.length });
      return;
    }

    const step = tutorialSteps[currentStep];
    console.log('🎯 Tutorial: Looking for target element:', { target: step.target, currentStep });
    const targetElement = document.querySelector(`#${step.target}, .${step.target}`);
    console.log('🎯 Tutorial: Found target element:', { targetElement, selector: `#${step.target}, .${step.target}` });
    
    if (targetElement) {
      console.log('🎯 Tutorial: Applying highlight to element:', targetElement);
      // Add highlighting classes with stronger visibility
      const highlightClasses = [
        'tutorial-highlight',
        'ring-4',
        'ring-yellow-400/80',
        'ring-offset-4',
        'ring-offset-white',
        'rounded-lg',
        'shadow-2xl',
        'shadow-yellow-400/50',
        'z-50',
        'relative',
        'bg-white/10' // Light background to make it more visible
      ];

      targetElement.classList.add(...highlightClasses);

      // Add enhanced animations
      (targetElement as HTMLElement).style.animation = 'shake 1.5s ease-in-out infinite, pulse 2s ease-in-out infinite';
      (targetElement as HTMLElement).style.transition = 'all 0.3s ease-out';
      
      // SPECIAL HANDLING FOR TIMER - Ensure maximum visibility
      if (step.target === "timer-display") {
        console.log('🎯 Tutorial: Special timer handling');
        const floatingTimer = document.querySelector('#floating-timer');
        const floatingTimerContainer = document.querySelector('.floating-timer-container');
        console.log('🎯 Tutorial: Timer elements found:', { floatingTimer, floatingTimerContainer });
        
        if (floatingTimer) {
          floatingTimer.classList.add(
            'z-50', 
            'relative',
            'scale-105',
            'ring-8',
            'ring-yellow-400/90',
            'rounded-3xl',
            'shadow-2xl',
            'shadow-yellow-400/60',
            'bg-white/20'
          );
          (floatingTimer as HTMLElement).style.transform = 'scale(1.05)';
          (floatingTimer as HTMLElement).style.transition = 'all 0.3s ease-out';
          (floatingTimer as HTMLElement).style.zIndex = '60';
          console.log('🎯 Tutorial: Applied timer highlighting');
        } else {
          console.warn('🎯 Tutorial: Timer element not found!');
        }
      }
    } else {
      console.warn('🎯 Tutorial: Target element not found for:', step.target);
    }

    return () => {
      if (targetElement) {
        targetElement.classList.remove(
          'tutorial-highlight',
          'animate-pulse',
          'ring-4',
          'ring-yellow-400/80',
          'ring-offset-4',
          'ring-offset-white',
          'rounded-lg',
          'shadow-2xl',
          'shadow-yellow-400/50',
          'z-50',
          'relative',
          'bg-white/10'
        );
        (targetElement as HTMLElement).style.animation = '';
        (targetElement as HTMLElement).style.transition = '';
        
        // Clean up timer special styling
        if (step.target === "timer-display") {
          const floatingTimer = document.querySelector('#floating-timer');
          if (floatingTimer) {
            floatingTimer.classList.remove(
              'z-50', 
              'relative',
              'scale-105',
              'ring-8',
              'ring-yellow-400/90',
              'rounded-3xl',
              'shadow-2xl',
              'shadow-yellow-400/60',
              'bg-white/20'
            );
            (floatingTimer as HTMLElement).style.transform = '';
            (floatingTimer as HTMLElement).style.transition = '';
            (floatingTimer as HTMLElement).style.zIndex = '';
          }
        }

        // Clean up add pages button special styling
        if (step.target === "add-pages-button") {
          targetElement.classList.remove(
            'scale-150',
            'ring-8',
            'ring-yellow-400/80',
            'ring-offset-4',
            'bg-yellow-100',
            'border-yellow-400',
            'text-yellow-800'
          );
          (targetElement as HTMLElement).style.transform = '';
          (targetElement as HTMLElement).style.transition = '';
          (targetElement as HTMLElement).style.zIndex = '';
          
          // Clean up parent container styling
          const parentContainer = targetElement.closest('.flex.flex-col.items-center.gap-2');
          if (parentContainer) {
            parentContainer.classList.remove(
              'ring-4',
              'ring-yellow-300/50',
              'rounded-xl',
              'bg-yellow-50/50',
              'p-4'
            );
          }
        }

        // Clean up progress towers special styling
        if (step.target === "progress-towers-container") {
          targetElement.classList.remove(
            'scale-110',
            'ring-8',
            'ring-yellow-400/80',
            'ring-offset-4',
            'bg-yellow-100/20',
            'border-yellow-400'
          );
          (targetElement as HTMLElement).style.transform = '';
          (targetElement as HTMLElement).style.transition = '';
          (targetElement as HTMLElement).style.zIndex = '';
        }
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

  // REMOVED AUTO-ADVANCE - Users control progression manually

  const handleNext = () => {
    if (currentStep < tutorialSteps.length - 1) {
      setIsAnimating(false);
      setTimeout(() => {
        const nextStep = currentStep + 1;
        setCurrentStep(nextStep);
        onStepChange?.(nextStep);
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
        const prevStep = currentStep - 1;
        setCurrentStep(prevStep);
        onStepChange?.(prevStep);
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
    
    // Responsive tooltip sizing
    const isMobile = viewportWidth < 768;
    const isTablet = viewportWidth >= 768 && viewportWidth < 1024;
    
    const tooltipWidth = isMobile ? Math.min(280, viewportWidth - 40) : isTablet ? 320 : 400;
    const tooltipHeight = isMobile ? 280 : 260;
    const margin = isMobile ? 20 : isTablet ? 25 : 40;
    const clearance = isMobile ? 200 : isTablet ? 180 : 200; // Increased space to avoid covering targets

    // SPECIAL HANDLING FOR TIMER STEP - Position with dynamic viewport calculations
    if (target === "timer-display") {
      console.log('TutorialOverlay: Timer positioning', { isMobile, isTablet, viewportHeight, margin });
      
      // Calculate safe positioning that never overlaps with timer or its tooltips
      const safeBottomMargin = Math.max(120, viewportHeight * 0.15); // Minimum 120px or 15% of viewport
      
      console.log('Timer positioning debug:', { safeBottomMargin, viewportHeight });
      
      if (isMobile) {
        const positioning = {
          bottom: `${safeBottomMargin}px`,
          left: `${margin}px`,
          right: `${margin}px`,
          top: "auto",
          transform: "none",
          maxWidth: `${tooltipWidth}px`,
          zIndex: 40 // Below timer tooltips
        };
        console.log('Mobile timer positioning:', positioning);
        return positioning;
      } else if (isTablet) {
        const positioning = {
          bottom: `${safeBottomMargin + 20}px`,
          left: `${margin}px`,
          right: `${margin}px`,
          top: "auto",
          transform: "none",
          maxWidth: `${tooltipWidth}px`,
          zIndex: 40
        };
        console.log('Tablet timer positioning:', positioning);
        return positioning;
      } else {
        const positioning = {
          bottom: `${safeBottomMargin + 40}px`,
          left: "50%",
          right: "auto",
          top: "auto",
          transform: "translateX(-50%)",
          maxWidth: `${tooltipWidth}px`,
          zIndex: 40
        };
        console.log('Desktop timer positioning:', positioning);
        return positioning;
      }
    }

    // SPECIAL HANDLING FOR ADD PAGES BUTTON - Place well above to avoid covering
    if (target === "add-pages-button") {
      return {
        top: `${Math.max(margin, rect.top - tooltipHeight - clearance)}px`,
        left: `${Math.max(margin, Math.min(rect.left + rect.width/2 - tooltipWidth/2, viewportWidth - tooltipWidth - margin))}px`,
        transform: "none",
        maxWidth: `${tooltipWidth}px`
      };
    }

    // SPECIAL HANDLING FOR READING LEVEL CONTROLS - Place at bottom to avoid covering
    if (target === "reading-level-controls") {
      if (isMobile) {
        return {
          bottom: `${margin + 80}px`, // Bottom positioning for mobile
          left: `${margin}px`,
          right: `${margin}px`,
          top: "auto",
          transform: "none",
          maxWidth: `${tooltipWidth}px`
        };
      } else {
        return {
          bottom: `${margin + 40}px`, // Bottom positioning for tablet/desktop too
          left: `${Math.max(margin, Math.min(rect.left + rect.width/2 - tooltipWidth/2, viewportWidth - tooltipWidth - margin))}px`,
          top: "auto",
          transform: "none",
          maxWidth: `${tooltipWidth}px`
        };
      }
    }

    // SPECIAL HANDLING FOR PROGRESS TOWERS - Position well to the left to avoid covering the button
    if (target === "progress-towers-container") {
      if (isMobile) {
        return {
          bottom: `${margin + 60}px`, // Bottom positioning for mobile
          left: `${margin}px`,
          right: `${margin + 80}px`, // Extra margin to avoid the collapsed button
          top: "auto",
          transform: "none",
          maxWidth: `${tooltipWidth}px`
        };
      } else {
        return {
          top: `${Math.max(margin, Math.min(rect.top + rect.height/2 - tooltipHeight/2, viewportHeight - tooltipHeight - margin))}px`,
          left: `${Math.max(margin, rect.left - tooltipWidth - 40)}px`, // Position to the left of towers
          transform: "none",
          maxWidth: `${tooltipWidth}px`
        };
      }
    }

    let style: any = {};

    // IMPROVED POSITIONING: Ensure tutorial never covers the target element
    switch (position) {
      case "bottom":
        // Place well below the element with extra clearance
        style = {
          top: `${Math.min(rect.bottom + clearance, viewportHeight - tooltipHeight - margin)}px`,
          left: `${Math.max(margin, Math.min(rect.left + rect.width/2 - tooltipWidth/2, viewportWidth - tooltipWidth - margin))}px`,
          transform: "none",
          maxWidth: `${tooltipWidth}px`
        };
        break;
      case "top":
        // Place well above the element with extra clearance
        style = {
          top: `${Math.max(margin, rect.top - tooltipHeight - clearance)}px`,
          left: `${Math.max(margin, Math.min(rect.left + rect.width/2 - tooltipWidth/2, viewportWidth - tooltipWidth - margin))}px`,
          transform: "none",
          maxWidth: `${tooltipWidth}px`
        };
        break;
      case "right":
        // Place well to the right with extra clearance
        style = {
          top: `${Math.max(margin, Math.min(rect.top + rect.height/2 - tooltipHeight/2, viewportHeight - tooltipHeight - margin))}px`,
          left: `${Math.min(rect.right + clearance, viewportWidth - tooltipWidth - margin)}px`,
          transform: "none",
          maxWidth: `${tooltipWidth}px`
        };
        break;
      case "left":
        // On mobile/tablet, place to the right instead of left to avoid timer overlap
        if (isMobile || isTablet) {
          style = {
            top: `${Math.max(margin, Math.min(rect.top + rect.height/2 - tooltipHeight/2, viewportHeight - tooltipHeight - margin))}px`,
            left: `${Math.min(rect.right + clearance, viewportWidth - tooltipWidth - margin)}px`,
            transform: "none",
            maxWidth: `${tooltipWidth}px`
          };
        } else {
          style = {
            top: `${Math.max(margin, Math.min(rect.top + rect.height/2 - tooltipHeight/2, viewportHeight - tooltipHeight - margin))}px`,
            left: `${Math.max(margin, rect.left - tooltipWidth - clearance)}px`,
            transform: "none",
            maxWidth: `${tooltipWidth}px`
          };
        }
        break;
      default:
        // Safe fallback position - top center to avoid timer and other elements
        style = {
          top: `${margin}px`,
          left: "50%",
          transform: "translateX(-50%)",
          maxWidth: `${tooltipWidth}px`
        };
    }
    
    return style;
  };

  // Add tutorial-active class to body for z-index management
  useEffect(() => {
    if (isVisible) {
      document.body.classList.add('tutorial-active');
    } else {
      document.body.classList.remove('tutorial-active');
    }
    
    return () => {
      document.body.classList.remove('tutorial-active');
    };
  }, [isVisible]);

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
        
        .safe-area-bottom {
          padding-bottom: env(safe-area-inset-bottom);
        }
      `}</style>

      {/* Enhanced overlay background with cutouts for highlighted elements */}
      <div className={`fixed inset-0 transition-opacity duration-500 z-30 pointer-events-none ${
        step.target === "timer-display" 
          ? 'bg-black/60 backdrop-blur-md' // Stronger dimming for timer focus
          : 'bg-black/30 backdrop-blur-sm'  // Normal dimming for other steps
      }`}>
        
        {/* Create a cutout effect for the highlighted element */}
        <div 
          className="absolute bg-transparent rounded-lg"
          style={{
            boxShadow: `0 0 0 9999px rgba(0, 0, 0, 0.3)`, // Creates cutout effect
            ...(() => {
              const element = document.querySelector(`#${step.target}, .${step.target}`);
              console.log('🎯 Tutorial: Creating cutout for element:', { target: step.target, element });
              if (!element) {
                console.warn('🎯 Tutorial: No element found for cutout!');
                return { display: 'none' };
              }
              
              const rect = element.getBoundingClientRect();
              const padding = 20; // Extra space around element
              
              const cutoutStyle = {
                left: `${rect.left - padding}px`,
                top: `${rect.top - padding}px`,
                width: `${rect.width + padding * 2}px`,
                height: `${rect.height + padding * 2}px`,
              };
              
              console.log('🎯 Tutorial: Cutout positioning:', { rect, cutoutStyle });
              return cutoutStyle;
            })()
          }}
        />
        
        {/* Subtle background elements */}
        <div className="absolute inset-0 overflow-hidden opacity-30">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="absolute w-1 h-1 bg-primary/40 rounded-full animate-float"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 4}s`,
                animationDuration: `${6 + Math.random() * 3}s`
              }}
            />
          ))}
        </div>
      </div>

      {/* Tutorial Tooltip - Desktop & Tablet */}
      <div 
        className={`fixed z-50 transition-all duration-300 ${isAnimating ? 'opacity-100 scale-100' : 'opacity-0 scale-95'} hidden sm:block`}
        style={tooltipStyle}
      >
        <Card className="w-full max-w-[320px] sm:max-w-[400px] md:w-[400px] bg-white dark:bg-gray-900 shadow-xl border-2 border-primary/30 rounded-2xl overflow-hidden">
          {/* Clean arrow pointing to target */}
          <div className="absolute -z-10">
            <div 
              className="w-0 h-0"
              style={{
                borderLeft: '16px solid transparent',
                borderRight: '16px solid transparent', 
                borderBottom: '24px solid hsl(var(--primary))',
                position: 'absolute',
                top: step.position === 'bottom' ? '-45px' : 
                     step.position === 'top' ? 'calc(100% + 15px)' : '50%',
                left: step.position === 'left' ? 'calc(100% + 15px)' : 
                      step.position === 'right' ? '-45px' : '50%',
                transform: step.position === 'top' ? 'rotate(180deg)' :
                          step.position === 'left' ? 'rotate(-90deg)' :
                          step.position === 'right' ? 'rotate(90deg)' : 'none',
                transformOrigin: 'center',
                filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.2))'
              }}
            />
          </div>

          <CardContent className="p-0">
            {/* Clean Header */}
            <div className="bg-gradient-primary text-white p-4 sm:p-6 relative overflow-hidden">
              <div className="relative z-10 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-white/20 rounded-full">
                    <step.icon className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-base sm:text-lg">{step.title}</h3>
                    <div className="text-xs sm:text-sm opacity-90">
                      {t("tutorial.step", "Tutorial")} {currentStep + 1} {t("tutorial.of", "of")} {tutorialSteps.length}
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
                  <X className="w-5 h-5" />
                </Button>
              </div>
            </div>

            {/* Content */}
            <div className="p-4 sm:p-6">
              <p className="text-gray-700 dark:text-gray-300 text-sm sm:text-base leading-relaxed mb-4 sm:mb-6">
                {step.description}
              </p>

              {/* Progress Bar */}
              <div className="mb-6">
                <div className="flex justify-between text-sm text-muted-foreground mb-2">
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

              {/* Navigation Buttons - Centered */}
              <div className="flex justify-center items-center gap-4">
                <Button
                  variant="outline"
                  size="default"
                  onClick={handlePrevious}
                  disabled={currentStep === 0}
                  className="flex items-center gap-2"
                >
                  <ChevronLeft className="w-4 h-4" />
                  {t("tutorial.previous", "Previous")}
                </Button>

                <Button
                  variant="ghost"
                  size="default"
                  onClick={() => {
                    onSkip();
                    if (onStartTimer) {
                      onStartTimer();
                    }
                  }}
                  className="text-muted-foreground"
                >
                  {t("tutorial.skip", "Skip Tutorial")}
                </Button>

                <Button
                  variant="default"
                  size="default"
                  onClick={handleNext}
                  className="bg-gradient-primary hover:opacity-90 flex items-center gap-2"
                >
                  {currentStep === tutorialSteps.length - 1 ? t("tutorial.finish", "Finish") : t("tutorial.next", "Next")}
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Mobile Tutorial Card */}
      <div className={`fixed z-50 transition-all duration-300 ${isAnimating ? 'opacity-100 scale-100' : 'opacity-0 scale-95'} sm:hidden ${
        step.target === 'timer-display' ? 'bottom-20 left-4 right-4' : 
        step.target === 'reading-level-controls' ? 'bottom-20 left-4 right-4' :
        'top-4 left-4 right-4'
      }`}>
        <Card className="bg-white dark:bg-gray-900 shadow-xl border-2 border-primary/30 rounded-2xl overflow-hidden">
          <CardContent className="p-0">
            {/* Mobile Header */}
            <div className="bg-gradient-primary text-white p-3 relative overflow-hidden">
              <div className="relative z-10 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-white/20 rounded-full">
                    <step.icon className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm">{step.title}</h3>
                    <div className="text-xs opacity-90">
                      Step {currentStep + 1} of {tutorialSteps.length}
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
                  className="text-white hover:bg-white/20 p-1.5 rounded-full"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Mobile Content */}
            <div className="p-3">
              <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed mb-3">
                {step.description}
              </p>

              {/* Mobile Progress Bar */}
              <div className="mb-3">
                <div className="flex justify-between text-xs text-muted-foreground mb-1">
                  <span>Progress</span>
                  <span>{Math.round(((currentStep + 1) / tutorialSteps.length) * 100)}%</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
                  <div 
                    className="bg-gradient-primary h-1.5 rounded-full transition-all duration-500 ease-out"
                    style={{ width: `${((currentStep + 1) / tutorialSteps.length) * 100}%` }}
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Mobile Navigation - Bottom Bar */}
      <div className="fixed bottom-0 left-0 right-0 z-50 sm:hidden">
        <div className="bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 px-4 py-3 safe-area-bottom">
          <div className="flex justify-between items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handlePrevious}
              disabled={currentStep === 0}
              className="flex items-center gap-1 text-xs px-2 py-1 h-8"
            >
              <ChevronLeft className="w-3 h-3" />
              {t("tutorial.previous")}
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                onSkip();
                if (onStartTimer) {
                  onStartTimer();
                }
              }}
              className="text-muted-foreground text-xs px-2 py-1 h-8"
            >
              {t("tutorial.skip")}
            </Button>

            <Button
              variant="default"
              size="sm"
              onClick={handleNext}
              className="bg-gradient-primary hover:opacity-90 flex items-center gap-1 text-xs px-2 py-1 h-8"
            >
              {currentStep === tutorialSteps.length - 1 ? t("tutorial.finish") : t("tutorial.next")}
              <ChevronRight className="w-3 h-3" />
            </Button>
          </div>
        </div>
      </div>
    </>
  );
};