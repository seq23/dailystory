import React, { useState, useEffect } from 'react';
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
}

export const ProgressTowers: React.FC<ProgressTowersProps> = ({
  userId,
  userType = 'premium',
  currentWordsRead = 0,
  currentPagesRead = 0,
  className
}) => {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';
  const [isExpanded, setIsExpanded] = useState(false);
  const [autoCollapseTimer, setAutoCollapseTimer] = useState<NodeJS.Timeout | null>(null);

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

  return (
    <div 
      className={cn(
        "fixed top-1/2 transform -translate-y-1/2 z-30 transition-all duration-300 ease-out",
        isRTL ? "left-0" : "right-0",
        isExpanded 
          ? (isRTL ? "translate-x-0" : "translate-x-0")
          : (isRTL ? "-translate-x-[170px]" : "translate-x-[170px]"),
        className
      )}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div className={cn(
        "bg-white/95 backdrop-blur-sm shadow-xl rounded-lg border border-gray-200",
        "transition-all duration-300 ease-out",
        isExpanded ? "w-56 p-4" : "w-12 p-2",
        isRTL && "mr-2"
      )}>
        
        {/* Toggle Button */}
        <button
          onClick={handleToggle}
          className={cn(
            "absolute top-4 flex items-center justify-center w-8 h-8 bg-primary/10 hover:bg-primary/20 rounded-full transition-colors",
            isRTL ? "right-2" : "left-2",
            !isExpanded && "opacity-70 hover:opacity-100"
          )}
          aria-label={isExpanded ? t('progressTowers.collapse') : t('progressTowers.expand')}
        >
          {isExpanded ? (
            isRTL ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />
          ) : (
            isRTL ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />
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
              <div className="text-center mb-4 mt-8">
                <h3 className="text-sm font-bold text-gray-800 mb-1">
                  {t('progressTowers.title', 'Reading Progress')}
                </h3>
                <p className="text-xs text-gray-500">
                  {t('progressTowers.subtitle', 'Keep climbing!')}
                </p>
              </div>

              {/* Progress Towers Grid */}
              <div className="grid grid-cols-3 gap-3 justify-items-center">
                <ProgressTower
                  value={totalWordsRead}
                  maxValue={500}
                  label={t('progressTowers.words')}
                  icon={<BookOpen className="w-4 h-4" />}
                  color="blue"
                />
                <ProgressTower
                  value={totalPagesRead}
                  maxValue={500}
                  label={t('progressTowers.pages')}
                  icon={<FileText className="w-4 h-4" />}
                  color="green"
                />
                <ProgressTower
                  value={vocabularyLearned}
                  maxValue={500}
                  label={t('progressTowers.vocabulary')}
                  icon={<Lightbulb className="w-4 h-4" />}
                  color="gold"
                />
              </div>

              {/* Milestone Message */}
              {(totalWordsRead > 0 && totalWordsRead % 50 === 0) && (
                <div className="mt-3 p-2 bg-gradient-to-r from-yellow-100 to-orange-100 rounded-lg text-center">
                  <p className="text-xs font-medium text-orange-800">
                    🎉 {t('progressTowers.milestone')}
                  </p>
                </div>
              )}
            </>
          ) : (
            /* Collapsed Icons */
            <div className="flex flex-col items-center gap-2 mt-8">
              <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                <BookOpen className="w-3 h-3 text-white" />
              </div>
              <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                <FileText className="w-3 h-3 text-white" />
              </div>
              <div className="w-6 h-6 bg-yellow-500 rounded-full flex items-center justify-center">
                <Lightbulb className="w-3 h-3 text-white" />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};