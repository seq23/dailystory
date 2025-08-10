import React, { useState, useEffect } from 'react';
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Home, TrendingUp, TrendingDown, Wand, Loader2 } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";
import type { DifficultyLevel, UserInfo } from '@/types';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface ResponsiveStoryHeaderProps {
  storyTitle?: string;
  currentDifficulty?: DifficultyLevel;
  userInfo?: UserInfo;
  onHome?: () => void;
  onNewStory?: () => void;
  onIncreaseDifficulty?: () => void;
  onDecreaseDifficulty?: () => void;
  showLevelControls?: boolean;
  isChangingDifficulty?: boolean;
  changeDirection?: 'increase' | 'decrease' | 'badge';
  canIncrease?: boolean;
  canDecrease?: boolean;
  onEndSession?: () => void;
  onSaveStory?: () => void;
  isSaving?: boolean;
  highlightSave?: boolean;
  isPremium?: boolean;
}

export const ResponsiveStoryHeader = ({
  storyTitle,
  currentDifficulty = 'easy',
  userInfo,
  onHome,
  onNewStory,
  onIncreaseDifficulty,
  onDecreaseDifficulty,
  showLevelControls = true,
  isChangingDifficulty = false,
  changeDirection,
  canIncrease = true,
  canDecrease = true,
  onEndSession,
  onSaveStory,
  isSaving = false,
  highlightSave = false,
  isPremium,
}: ResponsiveStoryHeaderProps) => {
  const { t } = useTranslation();
  const { isMobile, isTablet, isMobileOrTablet } = useIsMobile();
  
  // Animation states for buttons
  const [buttonAnimations, setButtonAnimations] = useState({
    increase: false,
    decrease: false,
    badge: false
  });

  // Handle animation effects
  useEffect(() => {
    if (isChangingDifficulty && changeDirection) {
      setButtonAnimations(prev => ({ ...prev, [changeDirection]: true }));
      
      // Reset animation after completion
      const timer = setTimeout(() => {
        setButtonAnimations(prev => ({ ...prev, [changeDirection]: false }));
      }, 600);
      
      return () => clearTimeout(timer);
    }
  }, [isChangingDifficulty, changeDirection]);

  const getDifficultyLabel = (difficulty: string) => {
    const labels = {
      beginner: t("storyDisplay.labels.preReader", "Pre‑Reader"),
      easy: t("storyDisplay.labels.beginner", "Beginner"),
      medium: t("storyDisplay.labels.developing", "Developing"),
      hard: t("storyDisplay.labels.independent", "Independent"),
      expert: t("storyDisplay.labels.advanced", "Advanced")
    };
    return (labels as any)[difficulty] || labels.easy;
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

  const maxTitleLength = isMobile ? 20 : isTablet ? 30 : 45;
  const displayTitle = storyTitle ? truncateTitle(storyTitle, maxTitleLength) : '';

  // Avatar helper function
  const getAvatarUrl = () => {
    if (userInfo?.avatar?.type && userInfo?.avatar?.skinTone) {
      return `/avatar-${userInfo.avatar.type}-${userInfo.avatar.skinTone}.jpg`;
    }
    return undefined;
  };

  const hasSelectedAvatar = userInfo?.avatar?.type && userInfo?.avatar?.skinTone;

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
          isMobile && "gap-2 px-3 py-1.5",
          isTablet && "gap-3 px-5 py-2",
          !isMobileOrTablet && "gap-5 py-3"
        )}>
          {/* Left Section: User Avatar & Action Buttons */}
          <div className={cn(
            "flex-shrink-0 flex items-center",
            isMobileOrTablet ? "gap-2" : "gap-4"
          )}>
            {/* User Avatar - Prominent Display */}
            {userInfo && (
              <div className="flex items-center gap-2">
                <Avatar className={cn(
                  "border-2 border-white/50 shadow-lg bg-white",
                  isMobile ? "w-10 h-10" : 
                  isTablet ? "w-12 h-12" : 
                  "w-14 h-14"
                )}>
                  <AvatarImage 
                    src={getAvatarUrl()} 
                    alt={`${userInfo.name}'s avatar`}
                    className="object-cover"
                  />
                  <AvatarFallback className={cn(
                    "bg-gradient-to-br from-primary to-primary/80 text-white font-bold",
                    isMobile ? "text-sm" : 
                    isTablet ? "text-base" : 
                    "text-lg"
                  )}>
                    {userInfo.name.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                {!isMobile && (
                  <div className="text-left">
                    <p className={cn(
                      "font-semibold text-gray-800",
                      isTablet ? "text-sm" : "text-base"
                    )}>
                      {userInfo.name}
                    </p>
                    <p className={cn(
                       "text-gray-600",
                       isTablet ? "text-xs" : "text-sm"
                     )}>
                      {t(`userInfoForm.grades.${userInfo.grade}` as any, userInfo.grade === 'PreK' ? 'Pre-K' : `Grade ${userInfo.grade}`)}
                    </p>
                  </div>
                )}
              </div>
            )}
            
            {/* Action Buttons */}
            <div className={cn(
              "flex items-center",
              isMobileOrTablet ? "gap-1" : "gap-2 ml-4"
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
              
              {onNewStory && !isPremium && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size={isMobile ? "sm" : "default"}
                        onClick={onNewStory}
                        className={cn(
                          "h-10 w-10 rounded-full bg-gradient-primary text-white shadow hover-scale",
                          isMobileOrTablet ? "min-h-[40px] min-w-[40px] p-0" : "p-0"
                        )}
                        aria-label={t("common.newStory", "New Story")}
                      >
                        <Wand className={cn(
                          isMobile ? "w-4 h-4" : "w-5 h-5"
                        )} />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      {t("tooltips.newStory", "Start a fresh story")}
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
            </div>
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

          {/* Right Section: Level Controls + End Session */}
          <div className={cn("flex-shrink-0 flex items-center gap-2", isMobile && "w-full justify-end flex-wrap")}>
            {showLevelControls && !isPremium && (
              <div 
                className={cn(
                  "flex items-center reading-level-controls difficulty-controls",
                  isMobileOrTablet ? "gap-1 sm:gap-2" : "gap-3 bg-gray-50 rounded-xl p-2"
                )}
                id="reading-level-controls"
                data-id="reading-level"
              >
                {/* Level Label - always visible */}
                <span className={cn(
                  "text-xs sm:text-sm text-gray-600",
                  isMobileOrTablet ? "mr-1" : "font-medium px-2"
                )}>
                  {t("storyDisplay.readingLevel", "Reading Level")}:
                </span>

                {/* Decrease Difficulty */}
                {onDecreaseDifficulty && (
                  <Button
                    variant="outline"
                    size={isMobileOrTablet ? "sm" : "default"}
                    onClick={onDecreaseDifficulty}
                    disabled={!canDecrease || isChangingDifficulty}
                    className={cn(
                      isMobileOrTablet 
                        ? "min-h-[44px] min-w-[44px] rounded-full p-2"
                        : "h-10 w-10 rounded-lg hover:bg-red-50 hover:border-red-200",
                      "transition-all duration-300",
                      buttonAnimations.decrease 
                        ? 'animate-scale-in bg-secondary/20 border-secondary' 
                        : ''
                    )}
                    aria-label={t("storyDisplay.decreaseDifficulty", "Make easier")}
                  >
                    {isChangingDifficulty && changeDirection === 'decrease' ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <TrendingDown className={cn(
                        "w-4 h-4",
                        !isMobileOrTablet && "text-red-600"
                      )} />
                    )}
                  </Button>
                )}

                {/* Current Difficulty Badge */}
                <Badge 
                  variant="outline" 
                  className={cn(
                    "border px-2 py-1 transition-all duration-300",
                    isMobile ? "text-xs" : 
                    isMobileOrTablet ? "text-sm" :
                    "px-4 py-2 text-sm font-medium border-2 rounded-lg",
                    getDifficultyColor(currentDifficulty),
                    buttonAnimations.badge 
                      ? 'animate-[wiggle_0.5s_ease-in-out] scale-110' 
                      : ''
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
                    disabled={!canIncrease || isChangingDifficulty}
                    className={cn(
                      isMobileOrTablet 
                        ? "min-h-[44px] min-w-[44px] rounded-full p-2"
                        : "h-10 w-10 rounded-lg hover:bg-green-50 hover:border-green-200",
                      "transition-all duration-300",
                      buttonAnimations.increase 
                        ? 'animate-[glow-pulse_0.6s_ease-in-out,_edgeBounce_0.4s_ease-out] border-primary/50 shadow-lg shadow-primary/25' 
                        : ''
                    )}
                    aria-label={t("storyDisplay.increaseDifficulty", "Make harder")}
                  >
                    {isChangingDifficulty && changeDirection === 'increase' ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <TrendingUp className={cn(
                        "w-4 h-4",
                        !isMobileOrTablet && "text-green-600"
                      )} />
                    )}
                  </Button>
                )}
              </div>
            )}

            {/* Save Button (Premium) */}
            {onSaveStory && !(isPremium && isMobile) && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="default"
                      size={isMobile ? "sm" : "default"}
                      onClick={onSaveStory}
                      disabled={isSaving}
                      className={cn(highlightSave && "animate-pulse ring-2 ring-primary ring-offset-2 shadow-[0_0_0_6px_hsl(var(--primary)/0.2)]")}
                      aria-label={t("nav.save", "Save")}
                    >
                      {isSaving ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          {t("common.saving", "Saving...")}
                        </>
                      ) : (
                        t("nav.save", "Save")
                      )}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    {t("tooltips.save", "Save your story to the Library.")}
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}

            {onEndSession && !(isPremium && isMobile) && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="destructive"
                      size={isMobile ? "sm" : "default"}
                      onClick={onEndSession}
                      aria-label={t("nav.endSession", "End Session")}
                    >
                      {t("nav.endSession", "End Session")}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    {t("tooltips.endSession", "This will end this session. You will have the option to save this story as is.")}
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
          </div>

        </div>
        {isPremium && (
          <div className={cn(
            "flex items-center justify-start flex-nowrap overflow-x-auto",
            isMobile ? "px-3 pb-2" : isTablet ? "px-5 pb-3" : "py-2"
          )}>
            <div className={cn("flex items-center flex-nowrap", isMobileOrTablet ? "gap-1 sm:gap-2" : "gap-3")}> 
              {onNewStory && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size={isMobileOrTablet ? "sm" : "default"}
                        onClick={onNewStory}
                        className={cn(
                          "h-10 w-10 rounded-full bg-gradient-primary text-white shadow hover-scale",
                          isMobileOrTablet ? "min-h-[40px] min-w-[40px] p-0" : "p-0"
                        )}
                        aria-label={t("common.newStory", "New Story")}
                      >
                        <Wand className={cn(
                          isMobileOrTablet ? "w-4 h-4" : "w-5 h-5"
                        )} />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      {t("tooltips.newStory", "Start a fresh story")}
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}

              {showLevelControls && (
                <div 
                  className={cn(
                    "flex items-center reading-level-controls difficulty-controls flex-nowrap",
                    isMobileOrTablet ? "gap-1 sm:gap-2" : "gap-3 bg-gray-50 rounded-xl p-2"
                  )}
                  id="reading-level-controls"
                  data-id="reading-level"
                >
                  {/* Level Label - always visible */}
                  <span className={cn(
                    "text-xs sm:text-sm text-gray-600",
                    isMobileOrTablet ? "mr-1" : "font-medium px-2"
                  )}>
                    {t("storyDisplay.readingLevel", "Reading Level")}:
                  </span>
                  {onDecreaseDifficulty && (
                    <Button
                      variant="outline"
                      size={isMobileOrTablet ? "sm" : "default"}
                      onClick={onDecreaseDifficulty}
                      disabled={!canDecrease || isChangingDifficulty}
                      className={cn(
                        isMobileOrTablet 
                          ? "min-h-[44px] min-w-[44px] rounded-full p-2"
                          : "h-10 w-10 rounded-lg hover:bg-red-50 hover:border-red-200",
                        "transition-all duration-300",
                        buttonAnimations.decrease 
                          ? 'animate-scale-in bg-secondary/20 border-secondary' 
                          : ''
                      )}
                      aria-label={t("storyDisplay.decreaseDifficulty", "Make easier")}
                    >
                      {isChangingDifficulty && changeDirection === 'decrease' ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <TrendingDown className={cn(
                          "w-4 h-4",
                          !isMobileOrTablet && "text-red-600"
                        )} />
                      )}
                    </Button>
                  )}

                  <Badge 
                    variant="outline" 
                    className={cn(
                      "border px-2 py-1 transition-all duration-300",
                      isMobile ? "text-xs" : 
                      isMobileOrTablet ? "text-sm" :
                      "px-4 py-2 text-sm font-medium border-2 rounded-lg",
                      getDifficultyColor(currentDifficulty),
                      buttonAnimations.badge 
                        ? 'animate-[wiggle_0.5s_ease-in-out] scale-110' 
                        : ''
                    )}
                  >
                    {getDifficultyLabel(currentDifficulty)}
                  </Badge>

                  {onIncreaseDifficulty && (
                    <Button
                      variant="outline"
                      size={isMobileOrTablet ? "sm" : "default"}
                      onClick={onIncreaseDifficulty}
                      disabled={!canIncrease || isChangingDifficulty}
                      className={cn(
                        isMobileOrTablet 
                          ? "min-h-[44px] min-w-[44px] rounded-full p-2"
                          : "h-10 w-10 rounded-lg hover:bg-green-50 hover:border-green-200",
                        "transition-all duration-300",
                        buttonAnimations.increase 
                          ? 'animate-[glow-pulse_0.6s_ease-in-out,_edgeBounce_0.4s_ease-out] border-primary/50 shadow-lg shadow-primary/25' 
                          : ''
                      )}
                      aria-label={t("storyDisplay.increaseDifficulty", "Make harder")}
                    >
                      {isChangingDifficulty && changeDirection === 'increase' ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <TrendingUp className={cn(
                          "w-4 h-4",
                          !isMobileOrTablet && "text-green-600"
                        )} />
                      )}
                    </Button>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
};