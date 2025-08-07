import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Home, TrendingUp, TrendingDown, RefreshCw } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";

interface ResponsiveStoryHeaderProps {
  storyTitle?: string;
  currentDifficulty?: 'beginner' | 'easy' | 'medium' | 'hard' | 'expert';
  onHome?: () => void;
  onNewStory?: () => void;
  onIncreaseDifficulty?: () => void;
  onDecreaseDifficulty?: () => void;
  showLevelControls?: boolean;
}

export const ResponsiveStoryHeader = ({
  storyTitle,
  currentDifficulty = 'easy',
  onHome,
  onNewStory,
  onIncreaseDifficulty,
  onDecreaseDifficulty,
  showLevelControls = true
}: ResponsiveStoryHeaderProps) => {
  const { t } = useTranslation();
  const { isMobile, isTablet, isMobileOrTablet } = useIsMobile();

  const getDifficultyLabel = (difficulty: string) => {
    const labels = {
      beginner: t("storyDisplay.beginner", "Beginner"),
      easy: t("storyDisplay.easy", "Easy"),
      medium: t("storyDisplay.medium", "Medium"),
      hard: t("storyDisplay.hard", "Hard"),
      expert: t("storyDisplay.expert", "Expert")
    };
    return labels[difficulty as keyof typeof labels] || labels.easy;
  };

  const getDifficultyColor = (difficulty: string) => {
    const colors = {
      beginner: "bg-blue-100 text-blue-800 border-blue-200",
      easy: "bg-green-100 text-green-800 border-green-200",
      medium: "bg-yellow-100 text-yellow-800 border-yellow-200",
      hard: "bg-orange-100 text-orange-800 border-orange-200",
      expert: "bg-red-100 text-red-800 border-red-200"
    };
    return colors[difficulty as keyof typeof colors] || colors.easy;
  };

  // Truncate title for mobile
  const truncateTitle = (title: string, maxLength: number) => {
    if (title.length <= maxLength) return title;
    return title.substring(0, maxLength - 3) + '...';
  };

  const maxTitleLength = isMobile ? 25 : isTablet ? 35 : 50;
  const displayTitle = storyTitle ? truncateTitle(storyTitle, maxTitleLength) : '';

  return (
    <header className={cn(
      "w-full bg-white/95 backdrop-blur-sm border-b border-gray-200 z-30",
      isMobileOrTablet && "sticky top-0"
    )}>
      <div className={cn(
        isMobileOrTablet ? "safe-area-padding" : "max-w-7xl mx-auto px-6"
      )}>
        <div className={cn(
          "flex items-center justify-between",
          isMobile && "gap-2 px-4 py-2",
          isTablet && "gap-3 px-6 py-3",
          !isMobileOrTablet && "gap-6 py-4"
        )}>
          {/* Left Section: Home & New Story Buttons */}
          <div className={cn(
            "flex-shrink-0 flex items-center",
            isMobileOrTablet ? "gap-1" : "gap-4"
          )}>
            {onHome && (
              <Button
                variant="ghost"
                size={isMobile ? "sm" : "default"}
                onClick={onHome}
                className={cn(
                  isMobileOrTablet 
                    ? "min-h-[44px] min-w-[44px] rounded-full p-2" 
                    : "h-12 px-4 rounded-xl hover:bg-gray-100"
                )}
                aria-label={t("common.home", "Home")}
              >
                <Home className={cn(
                  isMobile ? "w-4 h-4" : "w-5 h-5",
                  !isMobileOrTablet && "mr-2"
                )} />
                {!isMobileOrTablet && t("common.home", "Home")}
              </Button>
            )}
            
            {onNewStory && (
              <Button
                variant="ghost"
                size={isMobile ? "sm" : "default"}
                onClick={onNewStory}
                className={cn(
                  isMobileOrTablet 
                    ? "min-h-[44px] rounded-full px-2 py-2" 
                    : "h-12 px-4 rounded-xl hover:bg-gray-100"
                )}
                aria-label={t("common.newStory", "New Story")}
              >
                <RefreshCw className={cn(
                  isMobile ? "w-3 h-3" : "w-5 h-5",
                  !isMobileOrTablet && "mr-2"
                )} />
                {!isMobile && (
                  <span className={cn(
                    isMobileOrTablet ? "ml-1 text-sm" : ""
                  )}>
                    {t("common.newStory", "New Story")}
                  </span>
                )}
              </Button>
            )}
          </div>

          {/* Center Section: Title */}
          <div className="flex-1 min-w-0 text-center">
            {displayTitle && (
              <h1 className={cn(
                "font-semibold text-gray-900 truncate",
                isMobile ? "text-sm" : 
                isTablet ? "text-base" : 
                "text-xl max-w-md mx-auto"
              )}>
                {displayTitle}
              </h1>
            )}
          </div>

          {/* Right Section: Level Controls */}
          <div className="flex-shrink-0">
            {showLevelControls && (
              <div 
                className={cn(
                  "flex items-center",
                  isMobileOrTablet ? "gap-1 sm:gap-2" : "gap-3 bg-gray-50 rounded-xl p-2"
                )}
                id="reading-level-controls"
                data-id="reading-level"
              >
                {/* Level Label */}
                {!isMobile && (
                  <span className={cn(
                    "text-sm text-gray-600",
                    isMobileOrTablet ? "mr-1" : "font-medium px-2"
                  )}>
                    {isMobileOrTablet 
                      ? t("storyDisplay.level", "Level")
                      : t("storyDisplay.readingLevel", "Reading Level")
                    }:
                  </span>
                )}

                {/* Decrease Difficulty */}
                {onDecreaseDifficulty && (
                  <Button
                    variant="outline"
                    size={isMobileOrTablet ? "sm" : "default"}
                    onClick={onDecreaseDifficulty}
                    disabled={currentDifficulty === 'beginner'}
                    className={cn(
                      isMobileOrTablet 
                        ? "min-h-[44px] min-w-[44px] rounded-full p-2"
                        : "h-10 w-10 rounded-lg hover:bg-red-50 hover:border-red-200"
                    )}
                    aria-label={t("storyDisplay.decreaseDifficulty", "Make easier")}
                  >
                    <TrendingDown className={cn(
                      "w-4 h-4",
                      !isMobileOrTablet && "text-red-600"
                    )} />
                  </Button>
                )}

                {/* Current Difficulty Badge */}
                <Badge 
                  variant="outline" 
                  className={cn(
                    "border px-2 py-1",
                    isMobile ? "text-xs" : 
                    isMobileOrTablet ? "text-sm" :
                    "px-4 py-2 text-sm font-medium border-2 rounded-lg",
                    getDifficultyColor(currentDifficulty)
                  )}
                >
                  {getDifficultyLabel(currentDifficulty)}
                </Badge>

                {/* Increase Difficulty */}
                {onIncreaseDifficulty && (
                  <Button
                    variant="outline"
                    size={isMobileOrTablet ? "sm" : "default"}
                    onClick={onIncreaseDifficulty}
                    disabled={currentDifficulty === 'expert'}
                    className={cn(
                      isMobileOrTablet 
                        ? "min-h-[44px] min-w-[44px] rounded-full p-2"
                        : "h-10 w-10 rounded-lg hover:bg-green-50 hover:border-green-200"
                    )}
                    aria-label={t("storyDisplay.increaseDifficulty", "Make harder")}
                  >
                    <TrendingUp className={cn(
                      "w-4 h-4",
                      !isMobileOrTablet && "text-green-600"
                    )} />
                  </Button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};