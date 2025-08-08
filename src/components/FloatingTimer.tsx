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
  sessionStats?: any; // Session data to pass to end page
  isPremium?: boolean; // Add premium status for enhanced free trial experience
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
  sessionStats,
  isPremium = false
}: FloatingTimerProps) => {
  const { t } = useTranslation();
  const [showCelebration, setShowCelebration] = useState(false);
  const { toast } = useToast();

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
      {/* Floating Timer Container - Mobile optimized */}
      <div 
        className="fixed z-30 flex flex-col items-center gap-3 sm:gap-4 md:gap-6"
        id="floating-timer" 
        style={{
          bottom: '1.5rem',
          left: '1.5rem',
          marginLeft: 'max(1rem, env(safe-area-inset-left))', 
          marginBottom: 'max(1rem, env(safe-area-inset-bottom))',
          transform: 'none',
          zIndex: 40
        }}
      >
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
          
          {/* Main Timer Circle - Mobile responsive */}
          <div className="relative w-24 h-24 sm:w-32 sm:h-32 md:w-40 md:h-40 bg-gradient-to-br from-white to-gray-50 backdrop-blur-sm rounded-full shadow-2xl border-2 sm:border-4 border-white/80 flex items-center justify-center ring-2 sm:ring-4 ring-primary/20">
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
                className="text-sm sm:text-lg md:text-2xl font-bold tracking-tight" 
                style={{ color: getTimerColor() }}
              >
                {formatTime(timeRemaining)}
              </div>
              {timeRemaining >= 20 * 60 && (
                <div className="text-xs sm:text-sm text-muted-foreground font-medium mt-1 hidden sm:block">
                  {t("floatingTimer.maxLimit", "Max Limit")}
                </div>
              )}
              <div className="text-xs sm:text-sm text-muted-foreground font-medium hidden sm:block">
                {t("floatingTimer.readingTime", "Reading Time")}
              </div>
            </div>
          </div>
        </div>
        
        {/* Control Buttons in Curved U-Shape */}
        <div className="relative w-28 sm:w-36 md:w-44 h-16 sm:h-20 md:h-24">
          {/* Play/Pause Button - Center Bottom */}
          <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2">
            <Tooltip>
              <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    size="lg"
                    onClick={onToggleReading}
                    className="bg-gradient-to-b from-white to-gray-50 backdrop-blur-sm border-2 border-primary/30 text-primary hover:bg-primary hover:text-primary-foreground shadow-xl w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20 rounded-full p-0 transition-all duration-300 hover:scale-110 hover:shadow-2xl hover:border-primary/50 touch-manipulation"
                    style={{ touchAction: 'manipulation' }}
                  >
                    <div className="flex items-center justify-center w-full h-full relative">
                      {/* Use direct SVG instead of Lucide for iOS reliability */}
                      {isReading ? (
                        <svg className="w-4 h-4 sm:w-6 sm:h-6 md:w-8 md:h-8 text-current" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/>
                        </svg>
                      ) : (
                        <svg className="w-4 h-4 sm:w-6 sm:h-6 md:w-8 md:h-8 ml-1 text-current" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <polygon points="5,3 19,12 5,21"/>
                        </svg>
                      )}
                    </div>
                </Button>
              </TooltipTrigger>
              <TooltipContent 
                side="top" 
                className="font-medium text-lg bg-primary text-primary-foreground border-primary/30"
              >
                {isReading ? t("floatingTimer.pauseTimer", "Pause Timer") : t("floatingTimer.startTimer", "Start Timer")}
              </TooltipContent>
            </Tooltip>
          </div>
          

          {/* Reduce Time Button - Left Curve */}
          <div className="absolute bottom-2 sm:bottom-4 md:bottom-6 left-1 sm:left-2 md:left-4">
            <Tooltip>
              <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    size="lg"
                    onClick={onReduceTime}
                    disabled={timeRemaining <= 5 * 60}
                    className="bg-gradient-to-b from-white to-orange-50 backdrop-blur-sm border-2 border-orange-400/50 text-orange-600 hover:bg-orange-500 hover:text-white shadow-lg w-8 h-8 sm:w-12 sm:h-12 md:w-16 md:h-16 rounded-full p-0 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 hover:scale-110 hover:shadow-xl"
                  >
                    <svg className="w-3 h-3 sm:w-5 sm:h-5 md:w-6 md:h-6 text-current" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M5 12h14"/>
                    </svg>
                </Button>
              </TooltipTrigger>
              <TooltipContent 
                side="top" 
                className="font-medium text-lg bg-orange-600 text-white border-orange-500"
              >
                {t("floatingTimer.reduceTime", "Reduce 5 Minutes")}
              </TooltipContent>
            </Tooltip>
          </div>

          {/* End Session Button - Right Curve */}
          <div className="absolute bottom-2 sm:bottom-4 md:bottom-6 right-1 sm:right-2 md:right-4">
            <Tooltip>
              <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    size="lg"
                    onClick={handleEndSession}
                    className="bg-gradient-to-b from-white to-red-50 backdrop-blur-sm border-2 border-red-400/50 text-red-600 hover:bg-red-500 hover:text-white shadow-lg w-8 h-8 sm:w-12 sm:h-12 md:w-16 md:h-16 rounded-full p-0 transition-all duration-300 hover:scale-110 hover:shadow-xl"
                  >
                    <svg className="w-3 h-3 sm:w-5 sm:h-5 md:w-6 md:h-6 text-current" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="m18 6-12 12"/><path d="m6 6 12 12"/>
                    </svg>
                </Button>
              </TooltipTrigger>
              <TooltipContent 
                side="top" 
                className="font-medium text-lg bg-red-600 text-white border-red-500"
              >
                {t("floatingTimer.endSession", "End Reading Session")}
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
               <h2 className="text-3xl font-bold text-amber-600 mb-2">{t("floatingTimer.congratulations")}</h2>
               <p className="text-lg text-gray-600">{t("floatingTimer.sessionComplete")}</p>
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