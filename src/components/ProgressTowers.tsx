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
      console.log('ProgressTowers: Triggering animations!', {
        hasWordsIncrease,
        hasPagesIncrease, 
        hasVocabIncrease,
        wordsDiff: currentValues.words - prevValues.words
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
        // Keep the new progress indicator for longer
        setTimeout(() => setHasNewProgress(false), 3000);
      }, 1500);

      // Show celebration for story completion (significant word increase)
      if (hasWordsIncrease && (currentValues.words - prevValues.words) >= 50) {
        console.log('ProgressTowers: Story completion detected! Showing celebration');
        setCelebration(true);
        setTimeout(() => setCelebration(false), 3000);
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
        className
      )}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div className={cn(
        "bg-white/95 backdrop-blur-sm shadow-xl rounded-lg border border-gray-200",
        "transition-all duration-300 ease-out",
        isExpanded ? "w-56 p-4" : "w-16 p-3",
        isRTL && "mr-2"
      )}>
        
        {/* Toggle Button */}
        <button
          onClick={handleToggle}
          className={cn(
            "absolute top-3 flex items-center justify-center w-10 h-10 bg-primary/20 hover:bg-primary/30 rounded-full transition-all duration-200 shadow-lg border border-primary/30",
            isRTL ? "right-3" : "left-3",
            !isExpanded && "opacity-90 hover:opacity-100",
            // Gentle breathing animation when collapsed, more prominent when there's new progress
            !isExpanded && !hasNewProgress && "animate-[pulse_3s_ease-in-out_infinite]",
            !isExpanded && hasNewProgress && "animate-[pulse_1s_ease-in-out_3] ring-2 ring-primary/50",
            celebration && "animate-bounce"
          )}
          aria-label={isExpanded ? t('progressTowers.collapse') : t('progressTowers.expand')}
        >
          {/* New progress indicator dot */}
          {hasNewProgress && !isExpanded && (
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-ping" />
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
                    {/* Celebration particles */}
                    <div className="absolute inset-0 pointer-events-none">
                      {[...Array(6)].map((_, i) => (
                        <div
                          key={i}
                          className="absolute w-2 h-2 bg-yellow-400 rounded-full animate-[ping_1s_ease-out_infinite]"
                          style={{
                            left: `${20 + i * 15}%`,
                            top: `${10 + (i % 2) * 20}%`,
                            animationDelay: `${i * 0.1}s`
                          }}
                        />
                      ))}
                    </div>
                  </>
                )}
                
                <div className={cn(
                  "transition-all duration-500",
                  animatingTowers.words && "animate-bounce scale-105"
                )}>
                  <ProgressTower
                    value={totalWordsRead}
                    maxValue={500}
                    label={t('progressTowers.words')}
                    icon={<BookOpen className="w-4 h-4" />}
                    color="blue"
                    className={animatingTowers.words ? "ring-2 ring-blue-300 shadow-lg shadow-blue-200" : ""}
                  />
                </div>
                
                <div className={cn(
                  "transition-all duration-500",
                  animatingTowers.pages && "animate-bounce scale-105"
                )}>
                  <ProgressTower
                    value={totalPagesRead}
                    maxValue={500}
                    label={t('progressTowers.pages')}
                    icon={<FileText className="w-4 h-4" />}
                    color="green"
                    className={animatingTowers.pages ? "ring-2 ring-green-300 shadow-lg shadow-green-200" : ""}
                  />
                </div>
                
                <div className={cn(
                  "transition-all duration-500",
                  animatingTowers.vocabulary && "animate-bounce scale-105"
                )}>
                  <ProgressTower
                    value={vocabularyLearned}
                    maxValue={500}
                    label={t('progressTowers.vocabulary')}
                    icon={<Lightbulb className="w-4 h-4" />}
                    color="gold"
                    className={animatingTowers.vocabulary ? "ring-2 ring-yellow-300 shadow-lg shadow-yellow-200" : ""}
                  />
                </div>
              </div>

              {/* Milestone Message */}
              {celebration && (
                <div className="mt-3 p-2 bg-gradient-to-r from-yellow-100 to-orange-100 rounded-lg text-center animate-fade-in">
                  <p className="text-xs font-medium text-orange-800">
                    🎉 {t('progressTowers.storyComplete')}
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