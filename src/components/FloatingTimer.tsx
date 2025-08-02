import { useState, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Play, Pause, Minus, X } from "lucide-react";

import { useToast } from "@/hooks/use-toast";

interface FloatingTimerProps {
  timeRemaining: number;
  isReading: boolean;
  onToggleReading: () => void;
  onReduceTime?: () => void;
  onEndSession: () => void;
  pagesRemaining?: number;
  currentParagraph?: number;
  onSessionEnded: (sessionStats?: any) => void;
  tutorialStep?: number;
  sessionStats?: any; // Session data to pass to end page
  showTutorial?: boolean;
}

export const FloatingTimer = ({ 
  timeRemaining, 
  isReading, 
  onToggleReading, 
  onReduceTime,
  onEndSession,
  pagesRemaining = 0,
  currentParagraph = 0,
  onSessionEnded,
  tutorialStep = 0,
  sessionStats,
  showTutorial = false
}: FloatingTimerProps) => {
  const { t } = useTranslation();
  const [showCelebration, setShowCelebration] = useState(false);
  const [sequentialTutorialStep, setSequentialTutorialStep] = useState(0);
  const { toast } = useToast();
  
  // Sequential tutorial showcasing each button when timer tutorial is active
  // This effect runs every time showTutorial or tutorialStep changes
  useEffect(() => {
    if (showTutorial && tutorialStep === 0) { // Only when timer tutorial is active
      // Reset to step 0 first
      setSequentialTutorialStep(0);
      
      const sequence = [
        { delay: 1000, step: 1 }, // Play/Pause button first
        { delay: 3000, step: 2 }, // Reduce Time button 
        { delay: 5000, step: 3 }, // End Session button
        { delay: 7000, step: 0 }  // Reset and loop
      ];
      
      const timeouts = sequence.map(({ delay, step }) => 
        setTimeout(() => setSequentialTutorialStep(step), delay)
      );
      
      return () => timeouts.forEach(clearTimeout);
    } else {
      setSequentialTutorialStep(0);
    }
  }, [showTutorial, tutorialStep]); // Re-run when either prop changes

  // Get tutorial classes for buttons with enhanced animations
  const getTutorialClasses = (step: number) => {
    // Only show animations when we're specifically on timer tutorial step (tutorialStep === 0)
    if (showTutorial && tutorialStep === 0) {
      const isActive = sequentialTutorialStep === step;
      return isActive 
        ? 'animate-bounce ring-4 ring-yellow-400 ring-opacity-75 border-yellow-400 scale-110 shadow-2xl shadow-yellow-400/50 z-60' 
        : 'transition-all duration-500 hover:scale-105';
    }
    return '';
  };

  // Calculate progress for circular progress (based on current session time)
  const maxTime = 20 * 60; // Maximum 20 minutes for free version
  const currentSessionTime = timeRemaining > 15 * 60 ? 20 * 60 : 
                            timeRemaining > 10 * 60 ? 15 * 60 :
                            timeRemaining > 5 * 60 ? 10 * 60 : 5 * 60;
  const progress = ((currentSessionTime - timeRemaining) / currentSessionTime) * 100;
  
  // Format time for display
  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  // Function to trigger celebration animation
  const triggerCelebration = () => {
    setShowCelebration(true);
    
    // Play celebration sound 3 times
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    
    // Create a pleasant celebration melody
    const playNote = (frequency: number, startTime: number, duration: number) => {
      const osc = audioContext.createOscillator();
      const gain = audioContext.createGain();
      
      osc.connect(gain);
      gain.connect(audioContext.destination);
      
      osc.frequency.setValueAtTime(frequency, startTime);
      gain.gain.setValueAtTime(0, startTime);
      gain.gain.linearRampToValueAtTime(0.1, startTime + 0.1);
      gain.gain.linearRampToValueAtTime(0, startTime + duration);
      
      osc.start(startTime);
      osc.stop(startTime + duration);
    };
    
    // Play the melody 3 times with delays
    const playMelody = (startOffset: number) => {
      const now = audioContext.currentTime + startOffset;
      playNote(523.25, now, 0.2); // C5
      playNote(659.25, now + 0.2, 0.2); // E5
      playNote(783.99, now + 0.4, 0.2); // G5
      playNote(1046.50, now + 0.6, 0.4); // C6 - slightly longer for ending
    };
    
    // Play 3 times with 1-second gaps
    playMelody(0);        // First play
    playMelody(1.5);      // Second play after 1.5 seconds
    playMelody(3);        // Third play after 3 seconds
    
    // Clean up audio context after all melodies complete
    setTimeout(() => {
      audioContext.close().catch(() => {
        // Ignore errors if context is already closed
      });
    }, 6000);
    
    // Navigate to session ended page after 3 seconds
    setTimeout(() => {
      onSessionEnded(sessionStats);
    }, 3000);
  };

  // Handle timer completion
  useEffect(() => {
    if (timeRemaining === 0 && !showCelebration) {
      triggerCelebration();
    }
  }, [timeRemaining, showCelebration, onSessionEnded]);

  // Handle manual end session
  const handleEndSession = () => {
    triggerCelebration();
  };

  // Color based on time remaining
  const getTimerColor = () => {
    if (timeRemaining <= 300) return "#dc2626"; // red
    if (timeRemaining <= 600) return "#ea580c"; // orange
    return "#16a34a"; // green
  };

  return (
      <TooltipProvider>
      {/* Floating Timer Container - Fixed positioning to avoid overlap */}
      <div className="fixed bottom-6 left-6 sm:left-8 z-30 flex flex-col items-center gap-6" id="floating-timer" style={{ marginLeft: 'max(1rem, env(safe-area-inset-left))', marginBottom: 'max(1rem, env(safe-area-inset-bottom))' }}>
        
        {/* Main Timer Circle - Professional & Larger */}
        <div className="relative">
          {/* Celebration Animation */}
          {showCelebration && (
            <div className="absolute inset-0 pointer-events-none">
              {/* Confetti particles */}
              {[...Array(16)].map((_, i) => (
                <div
                  key={i}
                  className="absolute w-3 h-3 sm:w-4 sm:h-4 rounded-full animate-bounce"
                  style={{
                    backgroundColor: ['#fbbf24', '#f59e0b', '#d97706', '#92400e'][i % 4],
                    left: `${Math.cos((i * 22.5) * Math.PI / 180) * 80 + 80}px`,
                    top: `${Math.sin((i * 22.5) * Math.PI / 180) * 80 + 80}px`,
                    animationDelay: `${i * 0.1}s`,
                    animationDuration: '2s'
                  }}
                />
              ))}
              
              {/* Sparkle effect */}
              <div className="absolute inset-0 animate-spin">
                {[...Array(12)].map((_, i) => (
                  <div
                    key={i}
                    className="absolute w-2 h-2 sm:w-3 sm:h-3 bg-yellow-400 rounded-full animate-ping"
                    style={{
                      left: `${Math.cos((i * 30) * Math.PI / 180) * 90 + 75}px`,
                      top: `${Math.sin((i * 30) * Math.PI / 180) * 90 + 75}px`,
                      animationDelay: `${i * 0.15}s`
                    }}
                  />
                ))}
              </div>
            </div>
          )}
          
          {/* Main Timer Circle - Much Larger & Professional */}
          <div className="relative w-32 h-32 sm:w-40 sm:h-40 bg-gradient-to-br from-white to-gray-50 backdrop-blur-sm rounded-full shadow-2xl border-4 border-white/80 flex items-center justify-center ring-4 ring-primary/20">
            {/* Outer glow ring */}
            <div className="absolute inset-0 rounded-full bg-gradient-to-br from-primary/10 to-transparent animate-pulse"></div>
            
            {/* Progress Circle */}
            <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 160 160">
              {/* Background circle */}
              <circle
                cx="80"
                cy="80"
                r="70"
                stroke="hsl(var(--muted))"
                strokeWidth="8"
                fill="none"
                opacity="0.3"
              />
              {/* Progress circle */}
              <circle
                cx="80"
                cy="80"
                r="70"
                stroke={getTimerColor()}
                strokeWidth="8"
                fill="none"
                strokeDasharray={2 * Math.PI * 70}
                strokeDashoffset={2 * Math.PI * 70 - (progress / 100) * 2 * Math.PI * 70}
                className="transition-all duration-1000 ease-out filter drop-shadow-lg"
                strokeLinecap="round"
              />
            </svg>
            
            {/* Time Display */}
            <div id="timer-display" className="relative z-10 text-center">
              <div 
                className="text-lg sm:text-2xl font-bold tracking-tight" 
                style={{ color: getTimerColor() }}
              >
                {formatTime(timeRemaining)}
              </div>
              {timeRemaining >= 20 * 60 && (
                <div className="text-xs sm:text-sm text-muted-foreground font-medium mt-1">
                  {t("floatingTimer.maxLimit")}
                </div>
              )}
              <div className="text-xs sm:text-sm text-muted-foreground font-medium">
                Reading Time
              </div>
            </div>
          </div>
        </div>
        
        {/* Control Buttons in Curved U-Shape */}
        <div className="relative w-36 sm:w-44 h-20 sm:h-24">
          {/* Play/Pause Button - Center Bottom */}
          <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2">
            <Tooltip open={showTutorial && tutorialStep === 0 && sequentialTutorialStep === 1}>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="lg"
                  onClick={onToggleReading}
                  className={`bg-gradient-to-b from-white to-gray-50 backdrop-blur-sm border-2 border-primary/30 text-primary hover:bg-primary hover:text-primary-foreground shadow-xl w-16 h-16 sm:w-20 sm:h-20 rounded-full p-0 transition-all duration-300 hover:scale-110 hover:shadow-2xl hover:border-primary/50 ${getTutorialClasses(1)}`}
                >
                  {isReading ? <Pause className="w-6 h-6 sm:w-8 sm:h-8" /> : <Play className="w-6 h-6 sm:w-8 sm:h-8 ml-1" />}
                </Button>
              </TooltipTrigger>
              <TooltipContent 
                side="top" 
                className={`font-medium text-lg ${sequentialTutorialStep === 1 ? 'bg-yellow-500 text-yellow-900 border-yellow-400 shadow-lg' : 'bg-primary text-primary-foreground border-primary/30'}`}
              >
                {sequentialTutorialStep === 1 ? "🎯 Click to start/pause your reading timer!" : 
                 tutorialStep === 1 ? "🎯 Click to start/pause your reading timer!" : 
                 (isReading ? "Pause Timer" : "Start Timer")}
              </TooltipContent>
            </Tooltip>
          </div>
          

          {/* Reduce Time Button - Left Curve */}
          <div className="absolute bottom-4 sm:bottom-6 left-2 sm:left-4">
            <Tooltip open={showTutorial && tutorialStep === 0 && sequentialTutorialStep === 2}>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="lg"
                  onClick={onReduceTime}
                  disabled={timeRemaining <= 5 * 60}
                  className={`bg-gradient-to-b from-white to-orange-50 backdrop-blur-sm border-2 border-orange-400/50 text-orange-600 hover:bg-orange-500 hover:text-white shadow-lg w-12 h-12 sm:w-16 sm:h-16 rounded-full p-0 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 hover:scale-110 hover:shadow-xl ${getTutorialClasses(2)}`}
                >
                  <Minus className="w-5 h-5 sm:w-6 sm:h-6" />
                </Button>
              </TooltipTrigger>
              <TooltipContent 
                side="top" 
                className={`font-medium text-lg ${sequentialTutorialStep === 2 ? 'bg-yellow-500 text-yellow-900 border-yellow-400 shadow-lg' : 'bg-orange-600 text-white border-orange-500'}`}
              >
                {sequentialTutorialStep === 2 ? "⏰ Reduce time by 5 minutes!" : 
                 tutorialStep === 2 ? "⏰ Reduce time by 5 minutes!" : 
                 "Reduce 5 Minutes"}
              </TooltipContent>
            </Tooltip>
          </div>

          {/* End Session Button - Right Curve */}
          <div className="absolute bottom-4 sm:bottom-6 right-2 sm:right-4">
            <Tooltip open={showTutorial && tutorialStep === 0 && sequentialTutorialStep === 3}>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="lg"
                  onClick={handleEndSession}
                  className={`bg-gradient-to-b from-white to-red-50 backdrop-blur-sm border-2 border-red-400/50 text-red-600 hover:bg-red-500 hover:text-white shadow-lg w-12 h-12 sm:w-16 sm:h-16 rounded-full p-0 transition-all duration-300 hover:scale-110 hover:shadow-xl ${getTutorialClasses(3)}`}
                >
                  <X className="w-5 h-5 sm:w-6 sm:h-6" />
                </Button>
              </TooltipTrigger>
              <TooltipContent 
                side="top" 
                className={`font-medium text-lg ${sequentialTutorialStep === 3 ? 'bg-yellow-500 text-yellow-900 border-yellow-400 shadow-lg' : 'bg-red-600 text-white border-red-500'}`}
              >
                {sequentialTutorialStep === 3 ? "🔚 Click to end your reading session!" : 
                 "End Reading Session"}
              </TooltipContent>
            </Tooltip>
          </div>
        </div>
      </div>
      
      {/* Celebration Overlay */}
      {showCelebration && (
        <div className="fixed inset-0 z-40 overflow-hidden bg-black/20 backdrop-blur-sm">
          {/* Congratulations Message */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="bg-white rounded-2xl shadow-2xl p-8 text-center animate-scale-in border-4 border-amber-200">
              <div className="text-6xl mb-4">🎉</div>
              <h2 className="text-3xl font-bold text-amber-600 mb-2">Congratulations!</h2>
              <p className="text-lg text-gray-600">Great reading session!</p>
            </div>
          </div>
          
          {/* Celebration animations - pointer-events-none for all animated elements */}
          <div className="pointer-events-none">
            {/* Golden confetti rain */}
            {[...Array(30)].map((_, i) => (
              <div
                key={i}
                className="absolute w-2 h-2 bg-yellow-400 rounded-full animate-bounce"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `-10px`,
                  animationDelay: `${Math.random() * 3}s`,
                  animationDuration: `${2 + Math.random() * 2}s`,
                  transform: `translateY(${window.innerHeight + 50}px) rotate(${Math.random() * 360}deg)`
                }}
              />
            ))}
            
            {/* Sparkle shower */}
            {[...Array(20)].map((_, i) => (
              <div
                key={`sparkle-${i}`}
                className="absolute text-yellow-300 text-2xl animate-ping"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                  animationDelay: `${Math.random() * 3}s`,
                  animationDuration: '1s'
                }}
              >
                ✨
              </div>
            ))}
          </div>
        </div>
      )}
      </TooltipProvider>
  );
};