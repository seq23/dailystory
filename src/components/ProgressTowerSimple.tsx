import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Trophy, Star, BookOpen, Clock, Crown } from "lucide-react";
import { SparkleAnimation } from "./SparkleAnimation";

interface ProgressTowerSimpleProps {
  userStats: any;
  isPremium: boolean;
  resetOnSession?: boolean;
  onProgressUpdate?: (type: string, value: number) => void;
}

export const ProgressTowerSimple = ({ userStats, isPremium, resetOnSession = false, onProgressUpdate }: ProgressTowerSimpleProps) => {
  const [sessionStats, setSessionStats] = useState({
    wordsRead: 0,
    timeSpent: 0,
    storiesCompleted: 0,
    level: 1
  });
  
  const [previousStats, setPreviousStats] = useState({
    wordsRead: 0,
    timeSpent: 0,
    level: 1
  });
  
  const [activeAnimations, setActiveAnimations] = useState({
    wordsRead: false,
    timeSpent: false,
    level: false
  });

  // Reset stats for free users on each session
  useEffect(() => {
    if (!isPremium && resetOnSession) {
      setSessionStats({
        wordsRead: 0,
        timeSpent: 0,
        storiesCompleted: 0,
        level: 1
      });
    }
  }, [isPremium, resetOnSession]);

  const displayStats = isPremium ? userStats : sessionStats;
  const maxProgress = isPremium ? 1000 : 100; // Different scales for premium vs free
  
  // Track progress changes and trigger animations
  useEffect(() => {
    const currentStats = {
      wordsRead: displayStats.wordsRead || 0,
      timeSpent: Math.floor((displayStats.timeSpent || 0) / 60000),
      level: displayStats.level || 1
    };
    
    // Check for increases
    const hasWordsIncrease = currentStats.wordsRead > previousStats.wordsRead;
    const hasTimeIncrease = currentStats.timeSpent > previousStats.timeSpent;
    const hasLevelIncrease = currentStats.level > previousStats.level;
    
    if (hasWordsIncrease || hasTimeIncrease || hasLevelIncrease) {
      setActiveAnimations({
        wordsRead: hasWordsIncrease,
        timeSpent: hasTimeIncrease,
        level: hasLevelIncrease
      });
      
      // Trigger callbacks
      if (hasWordsIncrease) onProgressUpdate?.('words', currentStats.wordsRead);
      if (hasTimeIncrease) onProgressUpdate?.('time', currentStats.timeSpent);
      if (hasLevelIncrease) onProgressUpdate?.('level', currentStats.level);
      
      // Clear animations
      setTimeout(() => {
        setActiveAnimations({ wordsRead: false, timeSpent: false, level: false });
      }, isPremium ? 3000 : 2000);
    }
    
    setPreviousStats(currentStats);
  }, [displayStats, previousStats, isPremium, onProgressUpdate]);

  const getProgressPercentage = (value: number) => {
    return Math.min((value / maxProgress) * 100, 100);
  };

  const towers = [
    {
      icon: BookOpen,
      label: "Words Read",
      value: displayStats.wordsRead || 0,
      color: "blue",
      maxValue: isPremium ? 1000 : 100
    },
    {
      icon: Clock,
      label: "Time (min)",
      value: Math.floor((displayStats.timeSpent || 0) / 60000),
      color: "green", 
      maxValue: isPremium ? 60 : 20
    },
    {
      icon: Star,
      label: "Level",
      value: displayStats.level || 1,
      color: "gold",
      maxValue: isPremium ? 10 : 3
    }
  ];

  return (
    <Card className="bg-gradient-card border-primary/20 relative overflow-visible">
      <CardContent className="p-4">
        <div className="flex items-center gap-2 mb-4">
          {isPremium && <Crown className="w-5 h-5 text-yellow-500" />}
          <Trophy className="w-5 h-5 text-primary" />
          <h3 className="text-lg font-bold">
            {isPremium ? "Your Progress" : "Session Progress"}
          </h3>
          {isPremium && (
            <span className="text-xs bg-gradient-to-r from-yellow-100 to-orange-100 text-yellow-800 px-2 py-1 rounded-full border border-yellow-300">
              Premium
            </span>
          )}
          {!isPremium && (
            <span className="text-xs bg-orange-100 text-orange-800 px-2 py-1 rounded-full">
              Resets each session
            </span>
          )}
        </div>
        
        <div className="grid grid-cols-3 gap-4">
          {towers.map((tower, index) => {
            const IconComponent = tower.icon;
            const progress = getProgressPercentage(tower.value);
            
            const isAnimating = activeAnimations[tower.label.toLowerCase().replace(' ', '').replace('(min)', '') as keyof typeof activeAnimations];
            
            return (
              <div key={index} className="text-center relative">
                {/* Sparkle Animation */}
                <SparkleAnimation 
                  isActive={isAnimating}
                  intensity="medium"
                  isPremium={isPremium}
                />
                
                <div className="relative mb-2">
                  <div className={`w-full h-24 ${isPremium ? 'bg-gradient-to-t from-gray-100 to-gray-50' : 'bg-gray-200'} rounded-lg overflow-hidden border ${isPremium ? 'border-primary/20 shadow-sm' : 'border-gray-300'}`}>
                    <div 
                      className={`w-full bg-gradient-to-t ${
                        tower.color === 'blue' ? 
                          (isPremium ? 'from-blue-500 via-blue-600 to-blue-700' : 'from-blue-400 to-blue-600') :
                        tower.color === 'green' ? 
                          (isPremium ? 'from-green-500 via-green-600 to-green-700' : 'from-green-400 to-green-600') :
                          (isPremium ? 'from-yellow-500 via-amber-600 to-orange-500' : 'from-yellow-400 to-yellow-600')
                      } transition-all duration-500 ease-out ${isAnimating ? 'animate-pulse' : ''}`}
                      style={{ 
                        height: `${progress}%`,
                        transformOrigin: 'bottom'
                      }}
                    />
                  </div>
                  <div className={`absolute top-2 left-1/2 transform -translate-x-1/2 ${isAnimating ? 'animate-bounce' : ''}`}>
                    <IconComponent className={`w-4 h-4 text-white drop-shadow-lg ${isPremium ? 'drop-shadow-xl' : ''}`} />
                  </div>
                  <div className={`absolute bottom-1 left-1/2 transform -translate-x-1/2 text-white text-sm font-bold drop-shadow-lg ${isAnimating ? 'animate-pulse scale-110' : ''}`}>
                    {tower.value}
                  </div>
                  
                  {/* Premium milestone indicator */}
                  {isPremium && tower.value > 0 && tower.value % (tower.color === 'green' ? 10 : 25) === 0 && (
                    <div className="absolute -top-1 -right-1">
                      <Star className="w-3 h-3 text-yellow-500 animate-pulse" />
                    </div>
                  )}
                </div>
                <p className={`text-xs ${isPremium ? 'text-gray-700 font-medium' : 'text-muted-foreground'}`}>{tower.label}</p>
                <div className="mt-1">
                  <Progress value={progress} className={`h-1 ${isPremium ? 'h-2' : ''}`} />
                </div>
              </div>
            );
          })}
        </div>
        
        {!isPremium ? (
          <div className="mt-4 text-center">
            <p className="text-xs text-muted-foreground">
              Upgrade to premium to save your progress forever!
            </p>
          </div>
        ) : (
          <div className="mt-4 text-center">
            <p className="text-xs text-primary/70 font-medium">
              ✨ Progress saved automatically ✨
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};