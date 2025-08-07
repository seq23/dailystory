import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Home, TrendingUp, TrendingDown, RefreshCw } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";

interface MobileOptimizedHeaderProps {
  storyTitle?: string;
  currentDifficulty?: 'beginner' | 'easy' | 'medium' | 'hard' | 'expert';
  onHome?: () => void;
  onNewStory?: () => void;
  onIncreaseDifficulty?: () => void;
  onDecreaseDifficulty?: () => void;
  showLevelControls?: boolean;
}

export const MobileOptimizedHeader = ({
  storyTitle,
  currentDifficulty = 'easy',
  onHome,
  onNewStory,
  onIncreaseDifficulty,
  onDecreaseDifficulty,
  showLevelControls = true
}: MobileOptimizedHeaderProps) => {
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
    <header className="w-full bg-white/95 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-30">
      <div className="safe-area-padding">
        <div className={cn(
          "flex items-center justify-between gap-2 p-3",
          isMobile && "px-4 py-2",
          isTablet && "px-6 py-3"
        )}>
          {/* Left Section: Home & New Story Buttons */}
          <div className="flex-shrink-0 flex items-center gap-1">
            {onHome && (
              <Button
                variant="ghost"
                size={isMobile ? "sm" : "default"}
                onClick={onHome}
                className={cn(
                  "min-h-[44px] min-w-[44px] rounded-full",
                  isMobile && "p-2"
                )}
                aria-label={t("common.home", "Home")}
              >
                <Home className={cn("w-5 h-5", isMobile && "w-4 h-4")} />
              </Button>
            )}
            
            {onNewStory && (
              <Button
                variant="ghost"
                size={isMobile ? "sm" : "default"}
                onClick={onNewStory}
                className={cn(
                  "min-h-[44px] rounded-full",
                  isMobile ? "px-2 py-2" : "px-3 py-2"
                )}
                aria-label={t("common.newStory", "New Story")}
              >
                <RefreshCw className={cn("w-4 h-4", isMobile && "w-3 h-3 mr-1")} />
                {!isMobile && (
                  <span className="ml-1 text-sm">
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
                isMobile ? "text-sm" : isTablet ? "text-base" : "text-lg"
              )}>
                {displayTitle}
              </h1>
            )}
          </div>

          {/* Right Section: Level Controls */}
          <div className="flex-shrink-0">
            {showLevelControls && (
              <div 
                className="flex items-center gap-1 sm:gap-2"
                id="reading-level-controls"
                data-id="reading-level"
              >
                {/* Level Label - Hidden on very small screens */}
                {!isMobile && (
                  <span className="text-sm text-gray-600 mr-1">
                    {t("storyDisplay.level", "Level")}:
                  </span>
                )}

                {/* Decrease Difficulty */}
                {onDecreaseDifficulty && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={onDecreaseDifficulty}
                    disabled={currentDifficulty === 'beginner'}
                    className="min-h-[44px] min-w-[44px] rounded-full p-2"
                    aria-label={t("storyDisplay.decreaseDifficulty", "Make easier")}
                  >
                    <TrendingDown className="w-4 h-4" />
                  </Button>
                )}

                {/* Current Difficulty Badge */}
                <Badge 
                  variant="outline" 
                  className={cn(
                    "border px-2 py-1",
                    isMobile ? "text-xs" : "text-sm",
                    getDifficultyColor(currentDifficulty)
                  )}
                >
                  {getDifficultyLabel(currentDifficulty)}
                </Badge>

                {/* Increase Difficulty */}
                {onIncreaseDifficulty && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={onIncreaseDifficulty}
                    disabled={currentDifficulty === 'expert'}
                    className="min-h-[44px] min-w-[44px] rounded-full p-2"
                    aria-label={t("storyDisplay.increaseDifficulty", "Make harder")}
                  >
                    <TrendingUp className="w-4 h-4" />
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