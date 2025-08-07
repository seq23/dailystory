import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Home, TrendingUp, TrendingDown, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";

interface DesktopHeaderProps {
  storyTitle?: string;
  currentDifficulty?: 'beginner' | 'easy' | 'medium' | 'hard' | 'expert';
  onHome?: () => void;
  onNewStory?: () => void;
  onIncreaseDifficulty?: () => void;
  onDecreaseDifficulty?: () => void;
  showLevelControls?: boolean;
}

export const DesktopHeader = ({
  storyTitle,
  currentDifficulty = 'easy',
  onHome,
  onNewStory,
  onIncreaseDifficulty,
  onDecreaseDifficulty,
  showLevelControls = true
}: DesktopHeaderProps) => {
  const { t } = useTranslation();

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

  return (
    <header className="w-full bg-white/95 backdrop-blur-sm border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between gap-6">
          {/* Left Section: Navigation */}
          <div className="flex items-center gap-4">
            {onHome && (
              <Button
                variant="ghost"
                size="default"
                onClick={onHome}
                className="h-12 px-4 rounded-xl hover:bg-gray-100"
                aria-label={t("common.home", "Home")}
              >
                <Home className="w-5 h-5 mr-2" />
                {t("common.home", "Home")}
              </Button>
            )}
            
            {onNewStory && (
              <Button
                variant="ghost"
                size="default"
                onClick={onNewStory}
                className="h-12 px-4 rounded-xl hover:bg-gray-100"
                aria-label={t("common.newStory", "New Story")}
              >
                <RefreshCw className="w-5 h-5 mr-2" />
                {t("common.newStory", "New Story")}
              </Button>
            )}
          </div>

          {/* Center Section: Title */}
          <div className="flex-1 text-center">
            {storyTitle && (
              <h1 className="text-xl font-semibold text-gray-900 max-w-md mx-auto truncate">
                {storyTitle}
              </h1>
            )}
          </div>

          {/* Right Section: Reading Level Controls */}
          <div className="flex items-center">
            {showLevelControls && (
              <div 
                className="flex items-center gap-3 bg-gray-50 rounded-xl p-2"
                id="reading-level-controls"
                data-id="reading-level"
              >
                <span className="text-sm font-medium text-gray-700 px-2">
                  {t("storyDisplay.readingLevel", "Reading Level")}:
                </span>

                {/* Decrease Difficulty */}
                {onDecreaseDifficulty && (
                  <Button
                    variant="outline"
                    size="default"
                    onClick={onDecreaseDifficulty}
                    disabled={currentDifficulty === 'beginner'}
                    className="h-10 w-10 rounded-lg hover:bg-red-50 hover:border-red-200"
                    aria-label={t("storyDisplay.decreaseDifficulty", "Make easier")}
                  >
                    <TrendingDown className="w-5 h-5 text-red-600" />
                  </Button>
                )}

                {/* Current Difficulty Badge */}
                <Badge 
                  variant="outline" 
                  className={cn(
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
                    size="default"
                    onClick={onIncreaseDifficulty}
                    disabled={currentDifficulty === 'expert'}
                    className="h-10 w-10 rounded-lg hover:bg-green-50 hover:border-green-200"
                    aria-label={t("storyDisplay.increaseDifficulty", "Make harder")}
                  >
                    <TrendingUp className="w-5 h-5 text-green-600" />
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