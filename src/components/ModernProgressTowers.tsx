import React, { useState, useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';
import { ProgressTower } from '@/components/ui/progress-tower';
import { AchievementPopup } from '@/components/ui/achievement-popup';
import { useGamification } from '@/hooks/useGamification';
import { useTranslation } from 'react-i18next';
import { useIsMobile } from '@/hooks/use-mobile';
import { 
  BookOpen, 
  FileText, 
  Lightbulb, 
  Clock,
  ChevronLeft, 
  ChevronRight,
  Trophy,
  Sparkles
} from 'lucide-react';

interface ModernProgressTowersProps {
  userId?: string;
  userType?: 'free' | 'premium';
  currentWordsRead?: number;
  currentPagesRead?: number;
  vocabularyLearned?: number;
  timeSpent?: number;
  className?: string;
  onProgressUpdate?: (type: string, value: number) => void;
}

interface TowerData {
  key: string;
  icon: React.ComponentType<any>;
  label: string;
  color: 'blue' | 'green' | 'gold' | 'purple';
  getValue: (stats: any, current: any) => number;
  getMaxValue: (isPremium: boolean) => number;
}

export const ModernProgressTowers: React.FC<ModernProgressTowersProps> = ({
  userId,
  userType = 'premium',
  currentWordsRead = 0,
  currentPagesRead = 0,
  vocabularyLearned = 0,
  timeSpent = 0,
  className,
  onProgressUpdate
}) => {
  const { t } = useTranslation();
  const { isMobile } = useIsMobile();
  const [isExpanded, setIsExpanded] = useState(false);
  const [activeAchievement, setActiveAchievement] = useState<any>(null);
  const [previousValues, setPreviousValues] = useState<Record<string, number>>({});
  const [animatingTowers, setAnimatingTowers] = useState<Record<string, boolean>>({});
  const [celebrationMode, setCelebrationMode] = useState(false);
  
  const autoCollapseRef = useRef<NodeJS.Timeout>();

  const { 
    userStats, 
    updateActivity,
    newAchievements,
    hasNewAchievements,
    getNextAchievement,
    clearNewAchievements
  } = useGamification({
    userId,
    userType,
    enablePersistence: userType === 'premium'
  });

  // Define tower configurations
  const towers: TowerData[] = [
    {
      key: 'words',
      icon: BookOpen,
      label: t('progress.words', 'Words Read'),
      color: 'blue',
      getValue: (stats, current) => stats.totalWordsRead + current.words,
      getMaxValue: (isPremium) => isPremium ? 2000 : 500
    },
    {
      key: 'pages',
      icon: FileText,
      label: t('progress.pages', 'Pages Read'),
      color: 'green',
      getValue: (stats, current) => Math.floor((stats.totalWordsRead + current.words) / 200) + current.pages,
      getMaxValue: (isPremium) => isPremium ? 500 : 100
    },
    {
      key: 'vocabulary',
      icon: Lightbulb,
      label: t('progress.vocabulary', 'Vocabulary'),
      color: 'gold',
      getValue: (stats, current) => current.vocabulary || stats.vocabularyWordsLearned,
      getMaxValue: (isPremium) => isPremium ? 1000 : 200
    },
    {
      key: 'time',
      icon: Clock,
      label: t('progress.time', 'Minutes'),
      color: 'purple',
      getValue: (stats, current) => Math.floor((stats.totalTimeSpent + current.time) / 60000),
      getMaxValue: (isPremium) => isPremium ? 120 : 30
    }
  ];

  const currentValues = {
    words: currentWordsRead,
    pages: currentPagesRead,
    vocabulary: vocabularyLearned,
    time: timeSpent
  };

  // Handle progress changes and animations
  useEffect(() => {
    const newValues: Record<string, number> = {};
    const newAnimations: Record<string, boolean> = {};
    let hasChanges = false;

    towers.forEach(tower => {
      const currentValue = tower.getValue(userStats, currentValues);
      const previousValue = previousValues[tower.key] || 0;
      
      newValues[tower.key] = currentValue;
      
      if (currentValue > previousValue && previousValue > 0) {
        newAnimations[tower.key] = true;
        hasChanges = true;
        
        // Trigger progress update callback
        onProgressUpdate?.(tower.key, currentValue);
        
        // Check for significant progress (story completion)
        if (tower.key === 'words' && currentValue - previousValue >= 100) {
          setCelebrationMode(true);
          setTimeout(() => setCelebrationMode(false), 3000);
        }
      }
    });

    if (hasChanges) {
      setPreviousValues(newValues);
      setAnimatingTowers(newAnimations);
      
      // Clear animations after delay
      setTimeout(() => {
        setAnimatingTowers({});
      }, 2000);
      
      // Auto-expand to show progress
      if (!isExpanded) {
        setIsExpanded(true);
        scheduleAutoCollapse();
      }
    } else if (Object.keys(previousValues).length === 0) {
      // Initialize previous values
      setPreviousValues(newValues);
    }
  }, [userStats, currentWordsRead, currentPagesRead, vocabularyLearned, timeSpent]);

  // Handle new achievements
  useEffect(() => {
    if (hasNewAchievements) {
      const achievement = getNextAchievement();
      if (achievement) {
        setActiveAchievement(achievement);
      }
    }
  }, [hasNewAchievements, getNextAchievement]);

  const scheduleAutoCollapse = () => {
    if (autoCollapseRef.current) {
      clearTimeout(autoCollapseRef.current);
    }
    
    autoCollapseRef.current = setTimeout(() => {
      setIsExpanded(false);
    }, 8000);
  };

  const handleToggle = () => {
    setIsExpanded(!isExpanded);
    if (!isExpanded) {
      scheduleAutoCollapse();
    }
  };

  const handleMouseEnter = () => {
    if (!isMobile && !isExpanded) {
      setIsExpanded(true);
      scheduleAutoCollapse();
    }
  };

  const handleMouseLeave = () => {
    if (!isMobile) {
      scheduleAutoCollapse();
    }
  };

  return (
    <>
      <div
        className={cn(
          "fixed top-1/2 right-4 transform -translate-y-1/2 z-40",
          "transition-all duration-500 ease-out",
          isMobile && "scale-90",
          className
        )}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        {/* Main container */}
        <div className={cn(
          "relative overflow-hidden rounded-2xl backdrop-blur-lg",
          "bg-gradient-to-br from-white/90 via-white/80 to-white/70",
          "border border-white/20 shadow-2xl",
          "transition-all duration-500 ease-out",
          isExpanded ? "w-80 p-6" : "w-16 p-4",
          celebrationMode && "animate-pulse ring-4 ring-amber-400/50"
        )}>
          
          {/* Background effects */}
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5" />
          
          {/* Celebration particles */}
          {celebrationMode && (
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
              {[...Array(15)].map((_, i) => (
                <div
                  key={i}
                  className="absolute animate-confetti"
                  style={{
                    left: `${Math.random() * 100}%`,
                    animationDelay: `${i * 100}ms`,
                    animationDuration: '3s'
                  }}
                >
                  {['🎉', '✨', '🌟', '🎊'][i % 4]}
                </div>
              ))}
            </div>
          )}

          {/* Toggle button */}
          <button
            onClick={handleToggle}
            className={cn(
              "absolute top-4 left-4 p-2 rounded-full",
              "bg-primary/20 hover:bg-primary/30 backdrop-blur-sm",
              "border border-primary/20 transition-all duration-200",
              "hover:scale-110 focus:outline-none focus:ring-2 focus:ring-primary/50",
              isExpanded && "rotate-180"
            )}
          >
            {isExpanded ? (
              <ChevronRight className="w-4 h-4 text-primary" />
            ) : (
              <ChevronLeft className="w-4 h-4 text-primary" />
            )}
          </button>

          {/* Content */}
          <div className={cn(
            "transition-all duration-500",
            isExpanded ? "opacity-100 translate-x-0" : "opacity-0 translate-x-8"
          )}>
            {isExpanded && (
              <>
                {/* Header */}
                <div className="text-center mb-6 mt-8">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <Trophy className="w-5 h-5 text-primary" />
                    <h3 className="text-lg font-bold text-foreground">
                      {t('progress.title', 'Reading Progress')}
                    </h3>
                    {userType === 'premium' && (
                      <Sparkles className="w-4 h-4 text-amber-500" />
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {celebrationMode 
                      ? t('progress.celebration', '🎉 Amazing progress! 🎉')
                      : t('progress.subtitle', 'Keep climbing higher!')
                    }
                  </p>
                </div>

                {/* Progress towers grid */}
                <div className={cn(
                  "grid gap-4",
                  isMobile ? "grid-cols-2" : "grid-cols-2 lg:grid-cols-4"
                )}>
                  {towers.map((tower) => {
                    const currentValue = tower.getValue(userStats, currentValues);
                    const maxValue = tower.getMaxValue(userType === 'premium');
                    const previousValue = previousValues[tower.key] || 0;
                    const isActive = animatingTowers[tower.key] || false;

                    return (
                      <ProgressTower
                        key={tower.key}
                        value={currentValue}
                        maxValue={maxValue}
                        label={tower.label}
                        icon={<tower.icon className="w-full h-full" />}
                        color={tower.color}
                        isPremium={userType === 'premium'}
                        isActive={isActive}
                        previousValue={previousValue}
                        showMilestones={true}
                      />
                    );
                  })}
                </div>

                {/* Stats summary */}
                <div className="mt-6 p-4 rounded-lg bg-gradient-to-r from-primary/5 to-accent/5 border border-primary/10">
                  <div className="grid grid-cols-2 gap-4 text-center">
                    <div>
                      <p className="text-xs text-muted-foreground">Current Level</p>
                      <p className="text-lg font-bold text-primary">{userStats.currentLevel || 1}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Total Points</p>
                      <p className="text-lg font-bold text-accent">{userStats.totalPoints || 0}</p>
                    </div>
                  </div>
                </div>

                {/* Premium indicator */}
                {userType === 'premium' ? (
                  <div className="mt-4 text-center">
                    <p className="text-xs text-amber-600 font-medium">
                      ✨ Progress saved permanently ✨
                    </p>
                  </div>
                ) : (
                  <div className="mt-4 text-center">
                    <p className="text-xs text-muted-foreground">
                      Session progress • Upgrade to save forever
                    </p>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Collapsed state indicators */}
          {!isExpanded && (
            <div className="mt-8 flex flex-col items-center gap-3">
              {towers.slice(0, 3).map((tower, index) => {
                const isActive = animatingTowers[tower.key] || false;
                
                return (
                  <div
                    key={tower.key}
                    className={cn(
                      "w-8 h-8 rounded-full flex items-center justify-center",
                      "transition-all duration-300",
                      `bg-gradient-to-br ${
                        tower.color === 'blue' ? 'from-blue-400 to-blue-600' :
                        tower.color === 'green' ? 'from-green-400 to-green-600' :
                        tower.color === 'gold' ? 'from-yellow-400 to-amber-500' :
                        'from-purple-400 to-purple-600'
                      }`,
                      "text-white shadow-lg",
                      isActive && "animate-pulse ring-2 ring-primary/50 scale-110"
                    )}
                  >
                    <tower.icon className="w-4 h-4" />
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Achievement popup */}
      {activeAchievement && (
        <AchievementPopup
          achievement={activeAchievement}
          isVisible={!!activeAchievement}
          onClose={() => setActiveAchievement(null)}
        />
      )}
    </>
  );
};