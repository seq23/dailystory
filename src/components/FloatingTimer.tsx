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
  const maxTime = 20 * 60; // Maximum 20 minutes for free version
  const currentSessionTime = timeRemaining > 15 * 60 ? 20 * 60 : 
                            timeRemaining > 10 * 60 ? 15 * 60 :
                            timeRemaining > 5 * 60 ? 10 * 60 : 5 * 60;
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
      
      // No toast notification for timer completion

      // Navigate to session ended page after 5 seconds
      setTimeout(() => {
        onSessionEnded();
      }, 5000);
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
      <div className="fixed bottom-6 right-6 sm:right-8 z-30 flex flex-col items-center gap-6" data-tutorial-target={tutorialTarget} style={{ marginRight: 'max(1rem, env(safe-area-inset-right))', marginBottom: 'max(1rem, env(safe-area-inset-bottom))' }}>
        
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
            <div className="relative z-10 text-center">
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
        <div className="relative w-48 sm:w-56 h-24 sm:h-28">
          {/* Play/Pause Button - Center Bottom */}
          <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="lg"
                  onClick={onToggleReading}
                  className="bg-gradient-to-b from-white to-gray-50 backdrop-blur-sm border-2 border-primary/30 text-primary hover:bg-primary hover:text-primary-foreground shadow-xl w-16 h-16 sm:w-20 sm:h-20 rounded-full p-0 transition-all duration-300 hover:scale-110 hover:shadow-2xl hover:border-primary/50"
                >
                  {isReading ? <Pause className="w-6 h-6 sm:w-8 sm:h-8" /> : <Play className="w-6 h-6 sm:w-8 sm:h-8 ml-1" />}
                </Button>
              </TooltipTrigger>
              <TooltipContent side="top" className="bg-primary text-primary-foreground border-primary/30 font-medium">
                {isReading ? t("floatingTimer.pauseTimer") : t("floatingTimer.resumeTimer")}
              </TooltipContent>
            </Tooltip>
          </div>
          
          {/* Add Time Button - Left Curve */}
          <div className="absolute bottom-4 sm:bottom-6 left-2 sm:left-4">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="lg"
                  onClick={onAddTime}
                  className="bg-gradient-to-b from-white to-green-50 backdrop-blur-sm border-2 border-green-400/50 text-green-600 hover:bg-green-500 hover:text-white shadow-lg w-12 h-12 sm:w-16 sm:h-16 rounded-full p-0 transition-all duration-300 hover:scale-110 hover:shadow-xl"
                >
                  <Plus className="w-5 h-5 sm:w-6 sm:h-6" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="top" className="bg-green-600 text-white border-green-500 font-medium">
                {t("floatingTimer.addTime")}
              </TooltipContent>
            </Tooltip>
          </div>

          {/* Subtract Time Button - Right Curve */}
          {onSubtractTime && (
            <div className="absolute bottom-4 sm:bottom-6 right-2 sm:right-4">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    size="lg"
                    onClick={onSubtractTime}
                    disabled={timeRemaining <= 10 * 60}
                    className="bg-gradient-to-b from-white to-orange-50 backdrop-blur-sm border-2 border-orange-400/50 text-orange-600 hover:bg-orange-500 hover:text-white shadow-lg w-12 h-12 sm:w-16 sm:h-16 rounded-full p-0 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 hover:scale-110 hover:shadow-xl"
                  >
                    <Minus className="w-5 h-5 sm:w-6 sm:h-6" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="top" className="bg-orange-600 text-white border-orange-500 font-medium">
                  {t("floatingTimer.reduceTime")}
                </TooltipContent>
              </Tooltip>
            </div>
          )}

          {/* Add Pages Button - Top Left Curve */}
          <div className="absolute top-0 left-8 sm:left-12">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="lg"
                  onClick={onAddPages}
                  className={`bg-gradient-to-b from-white to-blue-50 backdrop-blur-sm border-2 border-blue-400/50 text-blue-600 hover:bg-blue-500 hover:text-white shadow-lg w-12 h-12 sm:w-16 sm:h-16 rounded-full p-0 transition-all duration-300 hover:scale-110 hover:shadow-xl ${
                    shouldShakeTooltip ? 'animate-bounce border-amber-400 bg-gradient-to-b from-amber-50 to-amber-100 text-amber-700' : ''
                  }`}
                >
                  <BookOpen className="w-5 h-5 sm:w-6 sm:h-6" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="top" className={`font-medium ${shouldShakeTooltip ? 'bg-amber-600 text-white border-amber-500' : 'bg-blue-600 text-white border-blue-500'}`}>
                {shouldShakeTooltip ? '⏰ Add more pages!' : 'Add More Pages'}
              </TooltipContent>
            </Tooltip>
          </div>

          {/* Status Indicator - Top Right Curve */}
          <div className="absolute top-0 right-8 sm:right-12">
            <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-gradient-to-b from-white to-gray-50 border-2 border-gray-300/50 shadow-lg flex items-center justify-center">
              <div className="text-center">
                <div className="text-xs sm:text-sm font-bold text-gray-700">
                  {pagesRemaining}
                </div>
                <div className="text-[10px] sm:text-xs text-gray-500 font-medium">
                  pages
                </div>
              </div>
            </div>
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