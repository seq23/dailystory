import React, { useState, useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';
import { ProgressTower } from '@/components/ui/progress-tower';
import { AchievementPopup } from '@/components/ui/achievement-popup';
import { useGamification } from '@/hooks/useGamification';
import { useTranslation } from 'react-i18next';
import { useIsMobile } from '@/hooks/use-mobile';
import { Button } from '@/components/ui/button';
import { 
  BookOpen, 
  FileText, 
  Lightbulb, 
  Clock,
  ChevronLeft, 
  ChevronRight,
  Trophy,
  Sparkles,
  X,
  Star
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
  const { isMobile, isTablet } = useIsMobile();
  const [isExpanded, setIsExpanded] = useState(false);
  const [activeAchievement, setActiveAchievement] = useState<any>(null);
  const [previousValues, setPreviousValues] = useState<Record<string, number>>({});
  const [animatingTowers, setAnimatingTowers] = useState<Record<string, boolean>>({});
  const [celebrationMode, setCelebrationMode] = useState(false);
  const [sparkleMode, setSparkleMode] = useState(false);
  const [recentAchievements, setRecentAchievements] = useState<any[]>([]);
  const [enabled, setEnabled] = useState<boolean>(() => {
    try { return localStorage.getItem('progressTowersEnabled') !== '0'; } catch { return true; }
  });
  
  const autoCollapseRef = useRef<NodeJS.Timeout>();

  // Sync visibility with global toggle events
  useEffect(() => {
    const handler = (e: any) => {
      const next = !!(e as CustomEvent).detail;
      setEnabled(next);
      try { console.info('[ProgressTowers] enabled:', next); } catch {}
    };
    window.addEventListener('progressTowersToggle', handler as EventListener);
    return () => window.removeEventListener('progressTowersToggle', handler as EventListener);
  }, []);

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
      getValue: (stats, current) => {
        const totalTime = (stats.totalTimeSpent || 0) + (current.time || 0);
        return Math.floor(totalTime / 60000);
      },
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
      
      // Trigger sparkle effects instead of expanding
      setSparkleMode(true);
      setTimeout(() => {
        setSparkleMode(false);
      }, 3000);
      
      // Clear animations after delay
      setTimeout(() => {
        setAnimatingTowers({});
      }, 2000);
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
        // Only show full popup for epic/legendary achievements
        if (achievement.rarity === 'epic' || achievement.rarity === 'legendary') {
          setActiveAchievement(achievement);
        } else {
          // Add to recent achievements for display in progress towers
          setRecentAchievements(prev => [achievement, ...prev.slice(0, 4)]); // Keep only 5 most recent
        }
      }
    }
  }, [hasNewAchievements, getNextAchievement]);

  const scheduleAutoCollapse = () => {
    if (autoCollapseRef.current) {
      clearTimeout(autoCollapseRef.current);
    }
    
    autoCollapseRef.current = setTimeout(() => {
      setIsExpanded(false);
    }, 12000); // Increased from 8s to 12s for better UX
  };

  const handleToggle = () => {
    const newExpanded = !isExpanded;
    setIsExpanded(newExpanded);
    try { console.info('[ProgressTowers] toggle, isExpanded:', newExpanded); } catch {}
    if (newExpanded) {
      scheduleAutoCollapse();
    }
  };

  const handleMouseEnter = () => {
    // Only clear auto-collapse timer, no other interactions
    if (autoCollapseRef.current) {
      clearTimeout(autoCollapseRef.current);
    }
  };

  const handleMouseLeave = () => {
    // Only restart auto-collapse if expanded
    if (isExpanded) {
      scheduleAutoCollapse();
    }
  };

  // Dismiss only when expanded
  const handleDismiss = () => {
    try { localStorage.setItem('progressTowersEnabled', '0'); } catch {}
    setEnabled(false);
    try { console.info('[ProgressTowers] dismissed'); } catch {}
    window.dispatchEvent(new CustomEvent('progressTowersToggle', { detail: false }));
  };

  return (
    <>
      <div
className={cn(
          "fixed right-4 transform z-40",
          isExpanded ? "top-1/2 -translate-y-1/2" : "top-[70%] -translate-y-1/2",
          !isExpanded && isTablet && "top-[74%] -translate-y-1/2",
          !isExpanded && isMobile && "top-[78%] -translate-y-1/2",
          "transition-all duration-500 ease-out",
          isMobile && "scale-75 right-1",
          isTablet && "scale-75 right-1",
          className
        )}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        {/* Main container */}
        {!enabled && (
          <button
            onClick={() => {
              try { localStorage.setItem('progressTowersEnabled', '1'); } catch {}
              setEnabled(true);
              try { console.info('[ProgressTowers] re-enabled via trophy'); } catch {}
              window.dispatchEvent(new CustomEvent('progressTowersToggle', { detail: true }));
            }}
            className={cn(
              "absolute flex items-center justify-center",
              "w-12 h-12 rounded-full backdrop-blur-sm border transition-all duration-300",
              "bg-gradient-to-br from-primary/20 to-primary/30 border-primary/30",
              "hover:from-primary/30 hover:to-primary/40 hover:border-primary/40",
              "shadow-lg hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-primary/50",
              "group relative overflow-hidden touch-manipulation",
              "bottom-4 left-1/2 -translate-x-1/2",
              isMobile && "w-9 h-9"
            )}
            aria-label="Show progress towers"
            title="Show progress towers"
          >
            <Trophy className="w-5 h-5 text-primary group-hover:text-primary/80" />
          </button>
        )}

        <div className={cn(
          "relative overflow-hidden rounded-2xl backdrop-blur-lg",
          "bg-gradient-to-br from-white/90 via-white/80 to-white/70",
          "border border-white/20 shadow-2xl",
          "transition-all duration-500 ease-out",
          isExpanded ? "w-80 p-6" : "w-20 pt-8 pb-4 px-4",
          isMobile && !isExpanded && "w-14 pt-7 pb-2 px-2",
          isTablet && !isExpanded && "w-16 pt-7 pb-3 px-3",
          celebrationMode && "animate-pulse ring-4 ring-amber-400/50",
          sparkleMode && "relative overflow-visible",
          !enabled && "hidden"
        )}>
          
          {/* Background effects */}
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5" />
          
          {/* Sparkle effects when progress is made */}
          {sparkleMode && (
            <div className="absolute inset-0 pointer-events-none overflow-visible">
              {[...Array(8)].map((_, i) => (
                <div
                  key={`sparkle-${i}`}
                  className={cn(
                    "absolute w-2 h-2 text-amber-400",
                    i % 2 === 0 ? "animate-sparkleTrail1" : "animate-sparkleTrail2"
                  )}
                  style={{
                    left: `${20 + (i * 10)}%`,
                    top: `${10 + (i * 8)}%`,
                    animationDelay: `${i * 200}ms`,
                    animationDuration: '2s'
                  }}
                >
                  ✨
                </div>
              ))}
              {/* Additional floating sparkles around the container */}
              {[...Array(6)].map((_, i) => (
                <div
                  key={`float-sparkle-${i}`}
                  className="absolute animate-float-gentle"
                  style={{
                    left: `${-20 + (i * 25)}%`,
                    top: `${-10 + (i * 15)}%`,
                    animationDelay: `${i * 300}ms`,
                    animationDuration: '3s'
                  }}
                >
                  <Sparkles className="w-3 h-3 text-purple-400 opacity-80" />
                </div>
              ))}
            </div>
          )}
          
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

          {/* Toggle button - Aligned with colored icons */}
          <button
            onClick={handleToggle}
            className={cn(
              "absolute flex items-center justify-center",
              "w-12 h-12 rounded-full backdrop-blur-sm border transition-all duration-300",
              "bg-gradient-to-br from-primary/20 to-primary/30 border-primary/30",
              "hover:from-primary/30 hover:to-primary/40 hover:border-primary/40",
              "shadow-lg hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-primary/50",
              "group relative overflow-hidden touch-manipulation",
              isExpanded ? "top-4 right-4" : "top-5 left-1/2 -translate-x-1/2",
              isMobile && !isExpanded && "w-9 h-9",
              // Remove auto-animations, only celebration mode spins
              celebrationMode && "animate-spin [animation-duration:1s] [animation-iteration-count:1]",
              sparkleMode && "ring-2 ring-amber-400/50"
            )}
          >
            {/* Animated background ripple effect - no pulsing */}
            <div className={cn(
              "absolute inset-0 rounded-full opacity-0 group-hover:opacity-100",
              "bg-gradient-to-br from-primary/40 to-accent/40 transition-opacity duration-500"
            )} />
            
            {/* Icon with smooth transitions */}
            <div className={cn(
              "relative z-10 transition-transform duration-300",
              isExpanded && "rotate-180"
            )}>
              {isExpanded ? (
                <ChevronRight className="w-5 h-5 text-primary group-hover:text-primary/80" />
              ) : (
                <ChevronLeft className="w-5 h-5 text-primary group-hover:text-primary/80" />
              )}
            </div>
            
            {/* Progress indicator dots - sparkle instead of pulsing */}
            {!isExpanded && sparkleMode && (
              <div className="absolute -top-1 -right-1">
                <div className="w-3 h-3 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full shadow-lg animate-pulse">
                  <div className="absolute inset-0 animate-ping rounded-full bg-amber-400/50" />
                </div>
              </div>
            )}
            
            {/* Achievement indicator */}
            {!isExpanded && (hasNewAchievements || recentAchievements.length > 0) && (
              <div className="absolute -top-2 -right-2">
                <div className="w-4 h-4 bg-gradient-to-br from-yellow-400 to-amber-500 rounded-full shadow-lg animate-bounce [animation-duration:1s] [animation-iteration-count:2]">
                  <div className="w-full h-full flex items-center justify-center text-xs">🏆</div>
                </div>
              </div>
            )}
          </button>

          {/* Dismiss button (expanded only, pinned to container top-right) */}
          {isExpanded && (
            <div className="absolute top-4 right-16 z-20">
              <Button variant="ghost" size="sm" onClick={handleDismiss} aria-label="Dismiss progress towers" className="h-8">
                <X className="w-4 h-4 mr-1" />
                Dismiss
              </Button>
            </div>
          )}

          {/* Content */}
          <div className={cn(
            "transition-all duration-500",
            isExpanded ? "opacity-100 translate-x-0 mt-4" : "opacity-0 translate-x-8 pointer-events-none"
          )}>
            {isExpanded && (
              <>
                {/* Header */}
                <div className="text-center mb-6">
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
                
                {/* Recent Achievements */}
                {recentAchievements.length > 0 && (
                  <div className="mt-4 p-4 rounded-lg bg-gradient-to-r from-yellow-50 to-amber-50 border border-yellow-200/50">
                    <div className="flex items-center gap-2 mb-3">
                      <Trophy className="w-4 h-4 text-yellow-600" />
                      <h4 className="text-sm font-semibold text-yellow-700">
                        {t('progress.recentAchievements', 'Recent Achievements')}
                      </h4>
                    </div>
                    <div className="space-y-2">
                      {recentAchievements.slice(0, 3).map((achievement, index) => (
                        <div 
                          key={`${achievement.id}-${index}`}
                          className="flex items-center gap-3 p-2 bg-white/80 rounded-lg border border-yellow-200/30"
                        >
                          <div className="text-lg">{achievement.icon}</div>
                          <div className="flex-1 min-w-0">
                            <div className="text-sm font-medium text-yellow-800 truncate">
                              {achievement.title}
                            </div>
                            <div className="text-xs text-yellow-600 truncate">
                              {achievement.description}
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-xs font-bold text-yellow-700">+{achievement.points}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                    {recentAchievements.length > 3 && (
                      <div className="text-xs text-yellow-600 mt-2 text-center">
                        +{recentAchievements.length - 3} more achievements unlocked!
                      </div>
                    )}
                  </div>
                )}

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

          {/* Collapsed state indicators - Adjusted spacing for new toggle position */}
          {!isExpanded && (
            <div className="flex flex-col items-center gap-4 mt-12">
              {towers.slice(0, 3).map((tower, index) => {
                const isActive = animatingTowers[tower.key] || false;
                const currentValue = tower.getValue(userStats, currentValues);
                
                return (
                  <div key={tower.key} className="relative flex flex-col items-center">
                    <div
                      className={cn(
                        "w-10 h-10 rounded-full flex items-center justify-center",
                        "transition-all duration-300 shadow-lg border-2 border-white/50",
                        `bg-gradient-to-br ${
                          tower.color === 'blue' ? 'from-blue-400 to-blue-600' :
                          tower.color === 'green' ? 'from-green-400 to-green-600' :
                          tower.color === 'gold' ? 'from-yellow-400 to-amber-500' :
                          'from-purple-400 to-purple-600'
                        }`,
                        "text-white",
                        isMobile && "w-8 h-8",
                        isTablet && "w-9 h-9",
                        isActive && "ring-2 ring-primary/50 scale-110",
                        sparkleMode && "animate-pulse"
                      )}
                    >
                      <tower.icon className={cn(isMobile ? "w-4 h-4" : isTablet ? "w-4 h-4" : "w-5 h-5")} />
                    </div>
                    
                    {/* Value display below icon - no overlap */}
                    <div className="mt-2 text-center">
                      <div className={cn(
                        "text-xs font-bold px-2 py-1 rounded-full bg-white/90 shadow-sm border",
                        tower.color === 'blue' ? 'text-blue-600 border-blue-200' :
                        tower.color === 'green' ? 'text-green-600 border-green-200' :
                        tower.color === 'gold' ? 'text-amber-600 border-amber-200' :
                        'text-purple-600 border-purple-200',
                        isActive && "animate-pulse"
                      )}>
                        {currentValue}
                      </div>
                    </div>
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