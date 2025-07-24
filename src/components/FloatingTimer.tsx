import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Play, Pause, Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface FloatingTimerProps {
  timeRemaining: number;
  isReading: boolean;
  onToggleReading: () => void;
  onAddTime: () => void;
  pagesRemaining?: number;
}

export const FloatingTimer = ({ 
  timeRemaining, 
  isReading, 
  onToggleReading, 
  onAddTime,
  pagesRemaining = 0
}: FloatingTimerProps) => {
  const [showCelebration, setShowCelebration] = useState(false);
  const [showPlayTooltip, setShowPlayTooltip] = useState(false);
  const [showPlusTooltip, setShowPlusTooltip] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const { toast } = useToast();
  
  // Check if we should encourage adding pages (5+ minutes left, 1 page remaining)
  const shouldShakeTooltip = timeRemaining >= 5 * 60 && pagesRemaining === 1;
  
  // Calculate progress for circular progress (based on current session time)
  const maxTime = 40 * 60; // Maximum 40 minutes
  const currentSessionTime = timeRemaining > 30 * 60 ? 40 * 60 : 
                            timeRemaining > 20 * 60 ? 30 * 60 :
                            timeRemaining > 10 * 60 ? 20 * 60 : 10 * 60;
  const progress = ((currentSessionTime - timeRemaining) / currentSessionTime) * 100;
  const circumference = 2 * Math.PI * 45; // radius of 45
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
      
      // Play celebration sound
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
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
      
      // Play shorter celebration melody (2.5 seconds total)
      const now = audioContext.currentTime;
      playNote(523.25, now, 0.2); // C5
      playNote(659.25, now + 0.2, 0.2); // E5
      playNote(783.99, now + 0.4, 0.2); // G5
      playNote(1046.50, now + 0.6, 0.4); // C6 - slightly longer for ending
      
      // Show toast notification
      toast({
        title: "🎉 Congratulations!",
        description: "You've completed your reading session!",
        duration: 5000,
      });
      
      // Hide celebration after 3 seconds
      setTimeout(() => {
        setShowCelebration(false);
      }, 3000);
    }
  }, [timeRemaining, showCelebration, toast]);

  // Color based on time remaining
  const getTimerColor = () => {
    if (timeRemaining <= 300) return "#dc2626"; // red
    if (timeRemaining <= 600) return "#ea580c"; // orange
    return "#16a34a"; // green
  };

  return (
    <>
      {/* Floating Timer Container */}
      <div className="fixed bottom-8 right-8 z-50 flex flex-col items-center gap-3">
        {/* Circular Timer */}
        <div className="relative">
          {/* Celebration Animation */}
          {showCelebration && (
            <div className="absolute inset-0 pointer-events-none">
              {/* Confetti particles */}
              {[...Array(12)].map((_, i) => (
                <div
                  key={i}
                  className="absolute w-3 h-3 rounded-full animate-bounce-gentle"
                  style={{
                    backgroundColor: ['#fbbf24', '#f59e0b', '#d97706', '#92400e'][i % 4],
                    left: `${Math.cos((i * 30) * Math.PI / 180) * 60 + 50}px`,
                    top: `${Math.sin((i * 30) * Math.PI / 180) * 60 + 50}px`,
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
                      left: `${Math.cos((i * 45) * Math.PI / 180) * 70 + 48}px`,
                      top: `${Math.sin((i * 45) * Math.PI / 180) * 70 + 48}px`,
                      animationDelay: `${i * 0.2}s`
                    }}
                  />
                ))}
              </div>
            </div>
          )}
          
          {/* Timer Circle */}
          <div className="relative w-24 h-24 bg-white/90 backdrop-blur-sm rounded-full shadow-2xl border-4 border-amber-300/60 flex items-center justify-center">
            {/* Progress Circle */}
            <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 100 100">
              {/* Background circle */}
              <circle
                cx="50"
                cy="50"
                r="45"
                stroke="#fbbf24"
                strokeWidth="3"
                fill="none"
                opacity="0.2"
              />
              {/* Progress circle */}
              <circle
                cx="50"
                cy="50"
                r="45"
                stroke={getTimerColor()}
                strokeWidth="3"
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
                className="text-lg font-bold" 
                style={{ color: getTimerColor() }}
              >
                {formatTime(timeRemaining)}
              </div>
              {timeRemaining >= 40 * 60 && (
                <div className="text-xs text-amber-600 font-medium mt-1">
                  Max time limit
                </div>
              )}
            </div>
          </div>
        </div>
        
        {/* Control Buttons */}
        <div className="flex gap-2 relative">
          {/* Play/Pause Button */}
          <div className="relative">
            <Button
              variant="outline"
              size="sm"
              onClick={onToggleReading}
              onMouseEnter={() => setShowPlayTooltip(true)}
              onMouseLeave={() => setShowPlayTooltip(false)}
              className="bg-white/90 backdrop-blur-sm border-2 border-amber-300 text-amber-800 hover:bg-amber-50 shadow-lg w-12 h-12 p-0"
            >
              {isReading ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            </Button>
            
            {/* Custom Tooltip for Play/Pause */}
            {showPlayTooltip && (
              <div className="absolute bottom-full mb-3 left-1/2 transform -translate-x-1/2 z-60">
                <div className="bg-purple-500 text-white px-4 py-2 rounded-2xl text-lg font-bold shadow-lg border-2 border-purple-300 relative">
                  {isReading ? "⏸️ Pause Timer" : "▶️ Start Timer"}
                  {/* Bubble tail */}
                  <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-[8px] border-l-transparent border-r-[8px] border-r-transparent border-t-[8px] border-t-purple-500"></div>
                </div>
              </div>
            )}
          </div>
          
          {/* Add Time Button */}
          <div className="relative">
            <Button
              variant="outline"
              size="sm"
              onClick={onAddTime}
              onMouseEnter={() => setShowPlusTooltip(true)}
              onMouseLeave={() => setShowPlusTooltip(false)}
              className="bg-white/90 backdrop-blur-sm border-2 border-amber-300 text-amber-800 hover:bg-amber-50 shadow-lg w-12 h-12 p-0"
            >
              <Plus className="w-4 h-4" />
            </Button>
            
            {/* Custom Tooltip for Add Time */}
            {(showPlusTooltip || shouldShakeTooltip) && (
              <div className={`absolute bottom-full mb-3 left-1/2 transform -translate-x-1/2 z-60 ${shouldShakeTooltip ? 'animate-bounce' : ''}`}>
                <div className={`bg-green-500 text-white px-4 py-2 rounded-2xl text-lg font-bold shadow-lg border-2 border-green-300 relative whitespace-nowrap ${shouldShakeTooltip ? 'animate-pulse' : ''}`}>
                  ➕ Add 10 minutes & pages!
                  <div className="text-sm font-normal mt-1">(Max 40 min total)</div>
                  {shouldShakeTooltip && (
                    <div className="text-sm font-normal mt-1 text-yellow-200">
                      📖 Only 1 page left!
                    </div>
                  )}
                  {/* Bubble tail */}
                  <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-[8px] border-l-transparent border-r-[8px] border-r-transparent border-t-[8px] border-t-green-500"></div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Celebration Overlay */}
      {showCelebration && (
        <div className="fixed inset-0 pointer-events-none z-40 overflow-hidden">
          {/* Golden confetti rain */}
          {[...Array(50)].map((_, i) => (
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
          {[...Array(30)].map((_, i) => (
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
      )}
    </>
  );
};