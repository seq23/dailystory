import React, { useState, useEffect, useRef } from 'react';
import { ProgressTower } from './ProgressTower';
import { useGamification } from '@/hooks/useGamification';
import { BookOpen, FileText, Lightbulb, ChevronLeft, ChevronRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';

interface ProgressTowersProps {
  userId?: string;
  userType?: 'free' | 'premium';
  currentWordsRead?: number;
  currentPagesRead?: number;
  className?: string;
  onProgressUpdate?: (type: 'words' | 'pages' | 'vocabulary', value: number) => void;
}

export const ProgressTowers: React.FC<ProgressTowersProps> = ({
  userId,
  userType = 'premium',
  currentWordsRead = 0,
  currentPagesRead = 0,
  className,
  onProgressUpdate
}) => {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';
  const [isExpanded, setIsExpanded] = useState(false);
  const [autoCollapseTimer, setAutoCollapseTimer] = useState<NodeJS.Timeout | null>(null);
  const [animatingTowers, setAnimatingTowers] = useState<{words: boolean, pages: boolean, vocabulary: boolean}>({
    words: false,
    pages: false,
    vocabulary: false
  });
  const [celebration, setCelebration] = useState(false);
  const [hasNewProgress, setHasNewProgress] = useState(false);
  const prevValuesRef = useRef({ words: 0, pages: 0, vocabulary: 0 });

  const { userStats } = useGamification({
    userId,
    userType,
    enablePersistence: userType === 'premium'
  });

  // Auto-collapse after 5 seconds of no interaction
  useEffect(() => {
    if (isExpanded) {
      const timer = setTimeout(() => {
        setIsExpanded(false);
      }, 5000);
      setAutoCollapseTimer(timer);
    }
    
    return () => {
      if (autoCollapseTimer) {
        clearTimeout(autoCollapseTimer);
      }
    };
  }, [isExpanded]);

  const handleMouseEnter = () => {
    setIsExpanded(true);
    if (autoCollapseTimer) {
      clearTimeout(autoCollapseTimer);
    }
  };

  const handleMouseLeave = () => {
    const timer = setTimeout(() => {
      setIsExpanded(false);
    }, 2000);
    setAutoCollapseTimer(timer);
  };

  const handleToggle = () => {
    setIsExpanded(!isExpanded);
  };

  // Calculate display values (including current session)
  const totalWordsRead = userStats.totalWordsRead + currentWordsRead;
  const totalPagesRead = Math.floor(totalWordsRead / 200) + currentPagesRead; // Estimate pages from words
  const vocabularyLearned = userStats.vocabularyWordsLearned;

  // Detect progress changes and trigger animations
  useEffect(() => {
    const prevValues = prevValuesRef.current;
    const currentValues = { 
      words: totalWordsRead, 
      pages: totalPagesRead, 
      vocabulary: vocabularyLearned 
    };

    // Initialize prevValues on first render
    if (prevValues.words === 0 && prevValues.pages === 0 && prevValues.vocabulary === 0) {
      prevValuesRef.current = currentValues;
      console.log('ProgressTowers: Initialized with current values:', currentValues);
      return;
    }

    console.log('ProgressTowers: Checking for progress changes:', {
      prevValues,
      currentValues,
      currentWordsRead,
      userStats: { totalWordsRead: userStats.totalWordsRead, vocabularyWordsLearned: userStats.vocabularyWordsLearned }
    });

    // Check for increases in each tower
    const hasWordsIncrease = currentValues.words > prevValues.words;
    const hasPagesIncrease = currentValues.pages > prevValues.pages;
    const hasVocabIncrease = currentValues.vocabulary > prevValues.vocabulary;

    if (hasWordsIncrease || hasPagesIncrease || hasVocabIncrease) {
      const wordsDiff = currentValues.words - prevValues.words;
      
      console.log('ProgressTowers: Triggering animations!', {
        hasWordsIncrease,
        hasPagesIncrease, 
        hasVocabIncrease,
        wordsDiff
      });

      setHasNewProgress(true);
      setAnimatingTowers({
        words: hasWordsIncrease,
        pages: hasPagesIncrease,
        vocabulary: hasVocabIncrease
      });

      // Call progress update callback
      if (hasWordsIncrease) onProgressUpdate?.('words', currentValues.words);
      if (hasPagesIncrease) onProgressUpdate?.('pages', currentValues.pages);
      if (hasVocabIncrease) onProgressUpdate?.('vocabulary', currentValues.vocabulary);

      // Clear animations after a brief moment
      setTimeout(() => {
        setAnimatingTowers({ words: false, pages: false, vocabulary: false });
      }, 2000);

      // Keep the new progress indicator for longer duration
      setTimeout(() => setHasNewProgress(false), 5000);

      // Show celebration for story completion (significant word increase)
      if (hasWordsIncrease && wordsDiff >= 50) {
        console.log('ProgressTowers: Story completion detected! Showing celebration');
        setCelebration(true);
        setTimeout(() => setCelebration(false), 4000);
      }
    }

    prevValuesRef.current = currentValues;
  }, [totalWordsRead, totalPagesRead, vocabularyLearned, onProgressUpdate]);

  console.log('ProgressTowers component rendering...', { 
    isExpanded, 
    totalWordsRead, 
    totalPagesRead, 
    vocabularyLearned,
    userType,
    userId,
    'Component should be visible': true
  });

  return (
    <div 
      className={cn(
        "fixed top-1/2 transform -translate-y-1/2 z-40 transition-all duration-300 ease-out",
        isRTL ? "left-0" : "right-0",
        isExpanded 
          ? (isRTL ? "translate-x-0" : "translate-x-0")
          : (isRTL ? "-translate-x-[50px]" : "translate-x-[50px]"), // Less translation to keep toggle visible
        // Enhanced edge bounce animation when new progress is detected
        hasNewProgress && !isExpanded && "animate-edgeBounce",
        className
      )}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div className={cn(
        "bg-white/95 backdrop-blur-sm shadow-xl rounded-lg border border-gray-200 progress-towers-container",
        "transition-all duration-300 ease-out",
        isExpanded ? "w-56 p-4" : "w-16 p-3",
        isRTL && "mr-2",
        // Enhanced edge glow pulse when new progress is detected
        // Remove glow pulse - sparkles will handle the visual feedback
      )}>
        
        {/* Sparkle Trail Animation */}
        {hasNewProgress && !isExpanded && (
          <div className="absolute inset-0 pointer-events-none overflow-visible">
            <div className="absolute left-2 top-1/2 w-3 h-3 text-blue-400 animate-sparkleTrail1 text-lg">✨</div>
            <div className="absolute left-2 top-1/2 w-3 h-3 text-green-400 animate-sparkleTrail2 text-lg">⭐</div>
            <div className="absolute left-2 top-1/2 w-3 h-3 text-yellow-400 animate-sparkleTrail3 text-lg">💫</div>
            <div className="absolute left-2 top-1/2 w-3 h-3 text-purple-400 animate-sparkleTrail4 text-lg">✨</div>
          </div>
        )}

        {/* Toggle Button */}
        <button
          onClick={handleToggle}
          className={cn(
            "absolute top-3 flex items-center justify-center w-10 h-10 bg-primary/20 hover:bg-primary/30 rounded-full transition-all duration-200 shadow-lg border border-primary/30",
            isRTL ? "right-3" : "left-3",
            !isExpanded && "opacity-90 hover:opacity-100",
            // Enhanced breathing animation when collapsed
            !isExpanded && !hasNewProgress && "animate-[pulse_3s_ease-in-out_infinite]",
            celebration && "animate-bounce ring-4 ring-yellow-400/60"
          )}
          aria-label={isExpanded ? t('progressTowers.collapse') : t('progressTowers.expand')}
        >
          {/* Celebration sparkle */}
          {celebration && (
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-yellow-400 rounded-full animate-ping" />
          )}
          {isExpanded ? (
            isRTL ? <ChevronLeft className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />
          ) : (
            isRTL ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />
          )}
        </button>

        {/* Content */}
        <div className={cn(
          "transition-all duration-300",
          isExpanded ? "opacity-100 translate-x-0" : "opacity-0 translate-x-4",
          isRTL && !isExpanded && "-translate-x-4"
        )}>
          {isExpanded ? (
            <>
              {/* Title */}
              <div className="text-center mb-4 mt-12">
                <h3 className="text-sm font-bold text-gray-800 mb-1">
                  {t('progressTowers.title', 'Reading Progress')}
                </h3>
                <p className="text-xs text-gray-500">
                  {t('progressTowers.subtitle', 'Keep climbing!')}
                </p>
              </div>

              {/* Progress Towers Grid */}
              <div className="grid grid-cols-3 gap-3 justify-items-center relative">
                {celebration && (
                  <>
                    {/* Enhanced celebration particles */}
                    <div className="absolute inset-0 pointer-events-none overflow-visible">
                      {[...Array(12)].map((_, i) => (
                        <div
                          key={i}
                          className="absolute w-2 h-2 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full animate-[ping_1.5s_ease-out_infinite]"
                          style={{
                            left: `${10 + i * 8}%`,
                            top: `${5 + (i % 3) * 25}%`,
                            animationDelay: `${i * 0.15}s`
                          }}
                        />
                      ))}
                      {/* Sparkle effect */}
                      {[...Array(6)].map((_, i) => (
                        <div
                          key={`sparkle-${i}`}
                          className="absolute w-1 h-1 bg-white rounded-full animate-pulse"
                          style={{
                            left: `${25 + i * 12}%`,
                            top: `${15 + (i % 2) * 30}%`,
                            animationDelay: `${i * 0.2}s`,
                            boxShadow: '0 0 4px #fbbf24'
                          }}
                        />
                      ))}
                    </div>
                  </>
                )}
                
                <div className={cn(
                  "transition-all duration-500",
                  animatingTowers.words && "animate-bounce scale-110 rotate-1"
                )}>
                  <ProgressTower
                    value={totalWordsRead}
                    maxValue={500}
                    label={t('progressTowers.words')}
                    icon={<BookOpen className="w-4 h-4" />}
                    color="blue"
                    className={animatingTowers.words ? "ring-4 ring-blue-300 shadow-2xl shadow-blue-200 glow-blue" : ""}
                  />
                </div>
                
                <div className={cn(
                  "transition-all duration-500",
                  animatingTowers.pages && "animate-bounce scale-110 -rotate-1"
                )}>
                  <ProgressTower
                    value={totalPagesRead}
                    maxValue={500}
                    label={t('progressTowers.pages')}
                    icon={<FileText className="w-4 h-4" />}
                    color="green"
                    className={animatingTowers.pages ? "ring-4 ring-green-300 shadow-2xl shadow-green-200 glow-green" : ""}
                  />
                </div>
                
                <div className={cn(
                  "transition-all duration-500",
                  animatingTowers.vocabulary && "animate-bounce scale-110 rotate-1"
                )}>
                  <ProgressTower
                    value={vocabularyLearned}
                    maxValue={500}
                    label={t('progressTowers.vocabulary')}
                    icon={<Lightbulb className="w-4 h-4" />}
                    color="gold"
                    className={animatingTowers.vocabulary ? "ring-4 ring-yellow-300 shadow-2xl shadow-yellow-200 glow-gold" : ""}
                  />
                </div>
              </div>

              {/* Enhanced Milestone Message */}
              {celebration && (
                <div className="mt-3 p-3 bg-gradient-to-r from-yellow-100 via-orange-100 to-red-100 rounded-lg text-center animate-[bounce_0.5s_ease-out] border-2 border-yellow-300 shadow-lg">
                  <p className="text-sm font-bold text-orange-800 animate-pulse">
                    🎉✨ {t('progressTowers.storyComplete')} ✨🎉
                  </p>
                  <p className="text-xs text-orange-600 mt-1">
                    {t('progressTowers.keepGoing', 'Keep climbing!')}
                  </p>
                </div>
              )}
              
              {(totalWordsRead > 0 && totalWordsRead % 100 === 0) && !celebration && (
                <div className="mt-3 p-2 bg-gradient-to-r from-blue-100 to-purple-100 rounded-lg text-center">
                  <p className="text-xs font-medium text-purple-800">
                    ⭐ {t('progressTowers.milestone')}
                  </p>
                </div>
              )}
            </>
          ) : (
            /* Collapsed Icons */
            <div className="flex flex-col items-center gap-2 mt-12">
              <div className={cn(
                "w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center transition-all duration-300",
                animatingTowers.words && "animate-pulse ring-2 ring-blue-300"
              )}>
                <BookOpen className="w-3 h-3 text-white" />
              </div>
              <div className={cn(
                "w-6 h-6 bg-green-500 rounded-full flex items-center justify-center transition-all duration-300",
                animatingTowers.pages && "animate-pulse ring-2 ring-green-300"
              )}>
                <FileText className="w-3 h-3 text-white" />
              </div>
              <div className={cn(
                "w-6 h-6 bg-yellow-500 rounded-full flex items-center justify-center transition-all duration-300",
                animatingTowers.vocabulary && "animate-pulse ring-2 ring-yellow-300"
              )}>
                <Lightbulb className="w-3 h-3 text-white" />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};