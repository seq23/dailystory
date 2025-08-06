import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Trophy, Star, BookOpen, Clock } from "lucide-react";

interface ProgressTowerSimpleProps {
  userStats: any;
  isPremium: boolean;
  resetOnSession?: boolean;
}

export const ProgressTowerSimple = ({ userStats, isPremium, resetOnSession = false }: ProgressTowerSimpleProps) => {
  const [sessionStats, setSessionStats] = useState({
    wordsRead: 0,
    timeSpent: 0,
    storiesCompleted: 0,
    level: 1
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
    <Card className="bg-gradient-card border-primary/20">
      <CardContent className="p-4">
        <div className="flex items-center gap-2 mb-4">
          <Trophy className="w-5 h-5 text-primary" />
          <h3 className="text-lg font-bold">
            {isPremium ? "Your Progress" : "Session Progress"}
          </h3>
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
            
            return (
              <div key={index} className="text-center">
                <div className="relative mb-2">
                  <div className="w-full h-24 bg-gray-200 rounded-lg overflow-hidden">
                    <div 
                      className={`w-full bg-gradient-to-t ${
                        tower.color === 'blue' ? 'from-blue-400 to-blue-600' :
                        tower.color === 'green' ? 'from-green-400 to-green-600' :
                        'from-yellow-400 to-yellow-600'
                      } transition-all duration-500 ease-out`}
                      style={{ 
                        height: `${progress}%`,
                        transformOrigin: 'bottom'
                      }}
                    />
                  </div>
                  <div className="absolute top-2 left-1/2 transform -translate-x-1/2">
                    <IconComponent className="w-4 h-4 text-white drop-shadow-lg" />
                  </div>
                  <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2 text-white text-sm font-bold drop-shadow-lg">
                    {tower.value}
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">{tower.label}</p>
                <div className="mt-1">
                  <Progress value={progress} className="h-1" />
                </div>
              </div>
            );
          })}
        </div>
        
        {!isPremium && (
          <div className="mt-4 text-center">
            <p className="text-xs text-muted-foreground">
              Upgrade to premium to save your progress forever!
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};