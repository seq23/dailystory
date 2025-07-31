import { useState, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Play, Pause, Plus, Minus, BookOpen } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface FloatingTimerProps {
  timeRemaining: number;
  isReading: boolean;
  onToggleReading: () => void;
  onAddTime: () => void;
  onSubtractTime?: () => void;
  onAddPages: () => void;
  pagesRemaining?: number;
  currentParagraph?: number;
  onSessionEnded: () => void;
  tutorialTarget?: string;
}

export const FloatingTimer = ({ 
  timeRemaining, 
  isReading, 
  onToggleReading, 
  onAddTime,
  onSubtractTime,
  onAddPages,
  pagesRemaining = 0,
  currentParagraph = 0,
  onSessionEnded,
  tutorialTarget
}: FloatingTimerProps) => {
  const { t } = useTranslation();
  const [showCelebration, setShowCelebration] = useState(false);
  const [showAddPagesAlert, setShowAddPagesAlert] = useState(false);
  const [hasShownAddPagesAlert, setHasShownAddPagesAlert] = useState(false);
  const { toast } = useToast();
  
  // Flash "add more pages" alert for 3 seconds when 1 page left (only once per session)
  useEffect(() => {
    if (timeRemaining > 1 * 60 && pagesRemaining === 1 && !hasShownAddPagesAlert && !showAddPagesAlert) {
      setHasShownAddPagesAlert(true);
      setShowAddPagesAlert(true);
      
      const timer = setTimeout(() => {
        setShowAddPagesAlert(false);
      }, 3000);
      
      return () => clearTimeout(timer);
    }
  }, [timeRemaining, pagesRemaining, hasShownAddPagesAlert, showAddPagesAlert]);
  
  // Reset the flag when more pages are added or we move away from the last page
  useEffect(() => {
    if (pagesRemaining > 1) {
      setHasShownAddPagesAlert(false);
    }
  }, [pagesRemaining]);
  
  // Check if we should encourage adding pages (5+ minutes left, 1 page remaining)
  const shouldShakeTooltip = showAddPagesAlert;
  
  // Calculate progress for circular progress (based on current session time)
  const maxTime = 30 * 60; // Maximum 30 minutes
  const currentSessionTime = timeRemaining > 20 * 60 ? 30 * 60 : 
                            timeRemaining > 15 * 60 ? 20 * 60 :
                            timeRemaining > 10 * 60 ? 15 * 60 : 10 * 60;
  const progress = ((currentSessionTime - timeRemaining) / currentSessionTime) * 100;
  const circumference = 2 * Math.PI * 42; // radius of 42
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  // Format time for display
  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  // Handle timer completion
  useEffect(() => {
    if (timeRemaining === 0 && !showCelebration) {
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
      
      // Show toast notification
      toast({
        title: t("floatingTimer.celebration.title"),
        description: t("floatingTimer.celebration.description"),
        duration: 5000,
      });

      // Navigate to session ended page after 6 seconds
      setTimeout(() => {
        onSessionEnded();
      }, 6000);
    }
  }, [timeRemaining, showCelebration, toast, onSessionEnded]);

  // Color based on time remaining
  const getTimerColor = () => {
    if (timeRemaining <= 300) return "#dc2626"; // red
    if (timeRemaining <= 600) return "#ea580c"; // orange
    return "#16a34a"; // green
  };

  return (
    <TooltipProvider>
      {/* Floating Timer Container */}
      <div className="fixed bottom-8 right-8 z-50 flex flex-col items-center gap-4" data-tutorial-target={tutorialTarget} style={{ marginRight: 'max(1rem, env(safe-area-inset-right))', marginBottom: 'max(1rem, env(safe-area-inset-bottom))' }}>
        {/* Circular Timer */}
        <div className="relative">
          {/* Celebration Animation */}
          {showCelebration && (
            <div className="absolute inset-0 pointer-events-none">
              {/* Confetti particles */}
              {[...Array(12)].map((_, i) => (
                <div
                  key={i}
                  className="absolute w-3 h-3 rounded-full animate-bounce"
                  style={{
                    backgroundColor: ['#fbbf24', '#f59e0b', '#d97706', '#92400e'][i % 4],
                    left: `${Math.cos((i * 30) * Math.PI / 180) * 50 + 45}px`,
                    top: `${Math.sin((i * 30) * Math.PI / 180) * 50 + 45}px`,
                    animationDelay: `${i * 0.1}s`,
                    animationDuration: '2s'
                  }}
                />
              ))}
              
              {/* Sparkle effect */}
              <div className="absolute inset-0 animate-spin">
                {[...Array(8)].map((_, i) => (
                  <div
                    key={i}
                    className="absolute w-2 h-2 bg-yellow-400 rounded-full animate-ping"
                    style={{
                      left: `${Math.cos((i * 45) * Math.PI / 180) * 60 + 42}px`,
                      top: `${Math.sin((i * 45) * Math.PI / 180) * 60 + 42}px`,
                      animationDelay: `${i * 0.2}s`
                    }}
                  />
                ))}
              </div>
            </div>
          )}
          
          {/* Main Timer Circle */}
          <div className="relative w-36 h-36 bg-white/95 backdrop-blur-sm rounded-full shadow-2xl border-4 border-amber-300/60 flex items-center justify-center">
            {/* Progress Circle */}
            <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 100 100">
              {/* Background circle */}
              <circle
                cx="50"
                cy="50"
                r="42"
                stroke="#fbbf24"
                strokeWidth="4"
                fill="none"
                opacity="0.2"
              />
              {/* Progress circle */}
              <circle
                cx="50"
                cy="50"
                r="42"
                stroke={getTimerColor()}
                strokeWidth="4"
                fill="none"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                className="transition-all duration-1000 ease-out"
                strokeLinecap="round"
              />
            </svg>
            
            {/* Time Display */}
            <div className="relative z-10 text-center">
              <div 
                className="text-2xl font-bold" 
                style={{ color: getTimerColor() }}
              >
                {formatTime(timeRemaining)}
              </div>
              {timeRemaining >= 40 * 60 && (
                <div className="text-xs text-amber-600 font-medium mt-1">
                  {t("floatingTimer.maxLimit")}
                </div>
              )}
            </div>
          </div>
        </div>
        
        {/* Circular Control Buttons in Arc Formation */}
        <div className="relative flex items-center justify-center">
          {/* Center Play/Pause Button */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                size="lg"
                onClick={onToggleReading}
                className="bg-white/95 backdrop-blur-sm border-3 border-purple-400 text-purple-700 hover:bg-purple-50 shadow-xl w-14 h-14 rounded-full p-0 transition-all duration-200 hover:scale-105"
              >
                {isReading ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6 ml-0.5" />}
              </Button>
            </TooltipTrigger>
            <TooltipContent side="top" className="bg-purple-700 text-white border-purple-500">
              {isReading ? t("floatingTimer.pausePlay") : t("floatingTimer.pausePlay")}
            </TooltipContent>
          </Tooltip>

          {/* Surrounding Action Buttons */}
          <div className="absolute inset-0 pointer-events-none">
            {/* Add Time Button - Top Left */}
            <div className="absolute -top-4 -left-16 pointer-events-auto">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={onAddTime}
                    className="bg-white/95 backdrop-blur-sm border-2 border-green-400 text-green-700 hover:bg-green-50 shadow-lg w-14 h-14 rounded-full p-0 transition-all duration-200 hover:scale-110"
                  >
                    <Plus className="w-5 h-5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="top" className="bg-green-700 text-white border-green-500">
                  {t("floatingTimer.addTime")}
                </TooltipContent>
              </Tooltip>
            </div>

            {/* Subtract Time Button - Top Right */}
            {onSubtractTime && (
              <div className="absolute -top-4 -right-16 pointer-events-auto">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={onSubtractTime}
                      disabled={timeRemaining <= 10 * 60}
                      className="bg-white/95 backdrop-blur-sm border-2 border-orange-400 text-orange-700 hover:bg-orange-50 shadow-lg w-14 h-14 rounded-full p-0 disabled:opacity-50 transition-all duration-200 hover:scale-110"
                    >
                      <Minus className="w-5 h-5" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="top" className="bg-orange-700 text-white border-orange-500">
                    {t("floatingTimer.reduceTime")}
                  </TooltipContent>
                </Tooltip>
              </div>
            )}

          </div>
        </div>
      </div>
      
      {/* Celebration Overlay */}
      {showCelebration && (
        <div className="fixed inset-0 z-40 overflow-hidden">
          {/* Close button */}
          <button
            onClick={() => setShowCelebration(false)}
            className="absolute top-4 right-4 bg-white text-amber-600 rounded-full w-10 h-10 flex items-center justify-center text-xl font-bold hover:scale-110 transition-transform shadow-lg z-50 pointer-events-auto"
          >
            ×
          </button>
          
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