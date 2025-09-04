import React, { useState, useEffect } from 'react';
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { StorySessionBreadcrumb } from "@/components/StorySessionBreadcrumb";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Home, TrendingUp, TrendingDown, Loader2, Wand, LogOut } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";
import type { DifficultyLevel, UserInfo } from '@/types';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import NewStoryCTA from "@/components/NewStoryCTA";
interface ResponsiveStoryHeaderProps {
  storyTitle?: string;
  currentDifficulty?: DifficultyLevel;
  userInfo?: UserInfo;
  onHome?: () => void;
  onNewStory?: () => void;
  onUpgrade?: () => void;
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
  wandPulse?: boolean;
  isGeneratingRewrite?: boolean;
}

export const ResponsiveStoryHeader = ({
  storyTitle,
  currentDifficulty = 'easy',
  userInfo,
  onHome,
  onNewStory,
  onUpgrade,
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
  wandPulse = false,
  isGeneratingRewrite = false,
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

  // Auto-compact actions on tablet when space is constrained
  const headerRowRef = React.useRef<HTMLDivElement>(null);
  const actionsRef = React.useRef<HTMLDivElement>(null);
  const [forceIconOnly, setForceIconOnly] = useState(false);
  
  useEffect(() => {
    if (!isTablet) { 
      setForceIconOnly(false); 
      return; 
    }
    
    const els = [headerRowRef.current, actionsRef.current].filter(Boolean) as HTMLElement[];
    if (els.length === 0) return;

    // Detect sidebar state (expanded/collapsed) without requiring context
    const sidebarEl = document.querySelector('div.peer[data-state]') as HTMLElement | null;
    
    // Debounce overflow checks to prevent forced reflows
    let checkTimeout: NodeJS.Timeout;
    let isChecking = false;
    
    const debouncedCheck = () => {
      if (isChecking) return;
      
      clearTimeout(checkTimeout);
      checkTimeout = setTimeout(() => {
        requestAnimationFrame(() => {
          try {
            isChecking = true;
            
            // Batch DOM reads to minimize reflows
            const measurements = els.map(el => ({
              scrollWidth: el.scrollWidth,
              clientWidth: el.clientWidth
            }));
            
            const constrained = measurements.some(m => m.scrollWidth > m.clientWidth + 2);
            const isSidebarExpanded = !!(sidebarEl && sidebarEl.getAttribute('data-state') === 'expanded');
            const active = constrained || (isTablet && isSidebarExpanded);
            
            setForceIconOnly(active);
            console.info('[Header] compact mode:', { constrained, isSidebarExpanded, active });
            
            isChecking = false;
          } catch {
            isChecking = false;
          }
        });
      }, 16); // One frame delay
    };

    debouncedCheck();

    // Use ResizeObserver for efficient resize detection
    const ros = els.map(el => {
      const ro = new ResizeObserver(() => debouncedCheck());
      ro.observe(el);
      return ro;
    });

    // Observe sidebar attribute changes (expanded/collapsed)
    let mo: MutationObserver | null = null;
    if (sidebarEl) {
      mo = new MutationObserver(() => debouncedCheck());
      try { 
        mo.observe(sidebarEl, { 
          attributes: true, 
          attributeFilter: ['data-state', 'style'] 
        }); 
      } catch {}
    }

    return () => {
      clearTimeout(checkTimeout);
      ros.forEach(ro => { 
        try { ro.disconnect(); } catch {} 
      });
      if (mo) { 
        try { mo.disconnect(); } catch {} 
      }
    };
  }, [isTablet]);

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

  const maxTitleLength = !!isPremium
    ? (isMobile ? 32 : isTablet ? 64 : 80)
    : (isMobile ? 20 : isTablet ? 40 : 60);
  const displayTitle = storyTitle ? truncateTitle(storyTitle, maxTitleLength) : '';

  // Avatar helper function
  const getAvatarUrl = () => {
    if (userInfo?.avatar?.type && userInfo?.avatar?.skinTone) {
      return `/avatar-${userInfo.avatar.type}-${userInfo.avatar.skinTone}.jpg`;
    }
    return undefined;
  };

  const hasSelectedAvatar = userInfo?.avatar?.type && userInfo?.avatar?.skinTone;

  if (!isPremium && isMobile) {
    return (
      <header className={cn(
        "w-full bg-white/95 backdrop-blur-sm border-b border-gray-200 z-30",
        "sticky top-0"
      )}>
        <div className="safe-area-padding">
          <div className="relative px-2 py-1">
            {/* Avatar + Free Trial badge pinned top-right (first row) */}
            <div className="absolute right-2 top-1 flex items-center gap-2">
              <Badge variant="guest">{t("welcomeHero.freeTrial", "Free Trial")}</Badge>
              <Avatar className="h-8 w-8">
                {hasSelectedAvatar && (
                  <AvatarImage src={getAvatarUrl()} alt={userInfo?.name || "Guest"} />
                )}
                <AvatarFallback>{userInfo?.name?.charAt(0)?.toUpperCase() || "G"}</AvatarFallback>
              </Avatar>
            </div>

            {/* Icons row (row 2): single line in this order: Home → New Story → difficulty down → level badge → difficulty up */}
            <div className="mt-8 w-full flex flex-nowrap items-center justify-center gap-1">
              {onHome && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={onHome}
                        className="min-h-[36px] min-w-[36px] rounded-full p-1"
                        aria-label={t("common.home", "Home")}
                      >
                        <Home className="w-4 h-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent side="bottom">{t("tooltips.home", "Home")}</TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}

              {onNewStory && (
                <NewStoryCTA
                  isPremium={false}
                  iconOnly
                  onNewStory={onNewStory}
                  onUpgrade={onUpgrade || (() => {})}
                  size="sm"
                  wandPulse={wandPulse}
                />
              )}
              {showLevelControls && (
                <>
                  {onDecreaseDifficulty && (
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={onDecreaseDifficulty}
                            disabled={!canDecrease || isChangingDifficulty}
                            className={cn(
                              "min-h-[36px] min-w-[36px] rounded-full p-1",
                              "transition-all duration-300",
                              buttonAnimations.decrease ? "animate-scale-in bg-secondary/20 border-secondary" : ""
                            )}
                            aria-label={t("storyDisplay.decreaseDifficulty", "Make easier")}
                          >
                            {isChangingDifficulty && changeDirection === 'decrease' ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <TrendingDown className="w-4 h-4" />
                            )}
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent side="bottom">
                          {t("storyDisplay.decreaseDifficulty", "Make easier")}
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  )}

                  <Badge
                    variant="outline"
                    className={cn(
                      "border px-2 py-1 transition-all duration-300 text-xs",
                      getDifficultyColor(currentDifficulty),
                      buttonAnimations.badge ? 'animate-[wiggle_0.5s_ease-in-out] scale-110' : ''
                    )}
                  >
                    {getDifficultyLabel(currentDifficulty)}
                  </Badge>

                  {onIncreaseDifficulty && (
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={onIncreaseDifficulty}
                            disabled={!canIncrease || isChangingDifficulty}
                            className={cn(
                              "min-h-[36px] min-w-[36px] rounded-full p-1",
                              "transition-all duration-300",
                              buttonAnimations.increase ? 'animate-[glow-pulse_0.6s_ease-in-out,_edgeBounce_0.4s_ease-out] border-primary/50 shadow-lg shadow-primary/25' : ''
                            )}
                            aria-label={t("storyDisplay.increaseDifficulty", "Make harder")}
                          >
                            {isChangingDifficulty && changeDirection === 'increase' ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <TrendingUp className="w-4 h-4" />
                            )}
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent side="bottom">
                          {t("storyDisplay.increaseDifficulty", "Make harder")}
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </header>
    );
  }
  // For premium users, only render story-specific controls as an overlay
  // PremiumHeader already handles navigation, so avoid duplicate headers
  if (isPremium) {
    return (
      <div className={cn(
        "relative bg-white/90 backdrop-blur-sm border-b border-gray-200/50 z-20",
        isMobileOrTablet && "sticky top-[--app-header-height]"
      )}>
        {/* Breadcrumb Navigation - Desktop/Tablet Premium Only */}
        {storyTitle && !isMobile && (
          <div className="border-b border-border/40 bg-background/50">
            <div className={cn(
              isMobileOrTablet ? "safe-area-padding px-4 py-2" : "max-w-7xl mx-auto px-6 py-2"
            )}>
              <StorySessionBreadcrumb
                storyTitle={storyTitle}
                onNavigateHome={onHome}
                variant={isTablet ? "minimal" : "default"}
              />
            </div>
          </div>
        )}
        
        {/* Story Controls Only - No duplicate navigation */}
        <div className={cn(
          isMobileOrTablet ? "safe-area-padding px-4 py-2" : "max-w-7xl mx-auto px-6 py-2"
        )}>
          <div className="flex items-center justify-between">
            {/* Story Title */}
            {displayTitle && (
              <h1 className={cn(
                "font-semibold truncate",
                isMobile ? "text-sm" : isTablet ? "text-base" : "text-xl"
              )}>
                {displayTitle}
              </h1>
            )}
            
            {/* Story Controls */}
            {showLevelControls && (
              <div className="flex items-center gap-2">
                 {onNewStory && (
                  <NewStoryCTA
                    isPremium={true}
                    iconOnly={true}
                    onNewStory={onNewStory}
                    onUpgrade={onUpgrade || (() => {})}
                    size={isMobileOrTablet ? "sm" : "md"}
                    wandPulse={wandPulse}
                    isGeneratingRewrite={isGeneratingRewrite}
                    tooltipText="Refresh story"
                  />
                )}
                
                {onDecreaseDifficulty && (
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={onDecreaseDifficulty}
                          disabled={!canDecrease || isChangingDifficulty}
                          className={cn(
                            "min-h-[36px] min-w-[36px] rounded-full p-1",
                            "transition-all duration-300",
                            buttonAnimations.decrease ? "animate-scale-in bg-secondary/20 border-secondary" : ""
                          )}
                        >
                          {isChangingDifficulty && changeDirection === 'decrease' ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <TrendingDown className="w-4 h-4" />
                          )}
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent side="bottom">
                        {t("storyDisplay.decreaseDifficulty", "Make easier")}
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                )}

                <Badge
                  variant="outline"
                  className={cn(
                    "border px-2 py-1 transition-all duration-300 text-xs",
                    getDifficultyColor(currentDifficulty),
                    buttonAnimations.badge ? 'animate-[wiggle_0.5s_ease-in-out] scale-110' : ''
                  )}
                >
                  {getDifficultyLabel(currentDifficulty)}
                </Badge>

                {onIncreaseDifficulty && (
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={onIncreaseDifficulty}
                          disabled={!canIncrease || isChangingDifficulty}
                          className={cn(
                            "min-h-[36px] min-w-[36px] rounded-full p-1",
                            "transition-all duration-300",
                            buttonAnimations.increase ? 'animate-[glow-pulse_0.6s_ease-in-out,_edgeBounce_0.4s_ease-out] border-primary/50 shadow-lg shadow-primary/25' : ''
                          )}
                        >
                          {isChangingDifficulty && changeDirection === 'increase' ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <TrendingUp className="w-4 h-4" />
                          )}
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent side="bottom">
                        {t("storyDisplay.increaseDifficulty", "Make harder")}
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                )}

                 {onEndSession && !isMobileOrTablet && (
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={onEndSession}
                          className="transition-all duration-300"
                        >
                          <LogOut className="w-4 h-4" />
                          {!isMobileOrTablet && <span className="ml-2">{t("nav.endSession", "End Session")}</span>}
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent side="bottom">{t("nav.endSession", "End Session")}</TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // For free users, render full header (no PremiumHeader above)
  return (
    <header className={cn(
      "w-full bg-white/95 backdrop-blur-sm border-b border-gray-200 z-30",
      isMobileOrTablet && "sticky top-0"
    )}>
      
      <div className={cn(
        isMobileOrTablet ? "safe-area-padding" : "max-w-7xl mx-auto px-6"
      )}>
         <div ref={headerRowRef} className={cn(
            "flex items-center justify-between flex-nowrap",
            isMobile && "gap-2 px-3 py-1.5",
            isTablet && "gap-3 px-5 py-2",
            !isMobileOrTablet && "gap-5 py-3"
          )}>
          {/* Left Section: User Avatar & Action Buttons */}
          <div className={cn(
            "flex-shrink-0 flex items-center",
            isMobileOrTablet ? "gap-2" : "gap-4"
          )}>
            {/* Avatar removed from subheader per design; handled in profile dropdown */}
            
            {/* Action Buttons */}
            <div className={cn(
              "flex items-center",
              isMobileOrTablet ? "gap-1" : "gap-2 ml-4"
            )}>
              {onHome && !isPremium && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
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
                    </TooltipTrigger>
                    <TooltipContent side="bottom">{t("tooltips.home", "Home")}</TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}


              {/* Inline avatar + Free Trial badge next to Home (tablet guests) */}
              {!isPremium && isTablet && (
                <div className="flex items-center gap-2 ml-1">
                  <Avatar className="h-7 w-7">
                    {hasSelectedAvatar && (
                      <AvatarImage src={getAvatarUrl()} alt={userInfo?.name || "Guest"} />
                    )}
                    <AvatarFallback>{userInfo?.name?.charAt(0)?.toUpperCase() || "G"}</AvatarFallback>
                  </Avatar>
                  <Badge variant="guest">{t("welcomeHero.freeTrial", "Free Trial")}</Badge>
                </div>
              )}

              {/* Desktop guests: show avatar + Free Trial badge */}
              {!isPremium && !isMobileOrTablet && (
                <div className="flex items-center gap-2 ml-1">
                  <Avatar className="h-8 w-8">
                    {hasSelectedAvatar && (
                      <AvatarImage src={getAvatarUrl()} alt={userInfo?.name || "Guest"} />
                    )}
                    <AvatarFallback>{userInfo?.name?.charAt(0)?.toUpperCase() || "G"}</AvatarFallback>
                  </Avatar>
                  <Badge variant="guest">{t("welcomeHero.freeTrial", "Free Trial")}</Badge>
                </div>
              )}

            </div>
          </div>

          {/* Center Section: Title */}
          <div className="flex-1 min-w-0 text-center">
            {displayTitle && (
              <h1 className={cn(
                "font-semibold truncate",
                isMobile ? "text-sm" : isTablet ? "text-base" : "text-xl max-w-md mx-auto"
              )}>
                {displayTitle}
              </h1>
            )}
          </div>

          {/* Right Section: Level Controls (icons row only for guests) */}
          <div className={cn(
            "flex items-center gap-2",
            isMobile && "w-full justify-end flex-nowrap overflow-x-auto",
            isTablet ? (!isPremium ? "flex-1 justify-center" : "flex-shrink-0") : "flex-shrink-0"
          )}>
            {showLevelControls && !isPremium && (
              <div 
                className={cn(
                  "flex items-center reading-level-controls difficulty-controls",
                  isMobileOrTablet ? "gap-1 sm:gap-2" : "gap-3 bg-gray-50 rounded-xl p-2"
                )}
                id="reading-level-controls"
                data-id="reading-level"
              >
                {onNewStory && (
                  <NewStoryCTA
                    isPremium={false}
                    iconOnly
                    onNewStory={onNewStory}
                    onUpgrade={onUpgrade || (() => {})}
                    size={isMobileOrTablet ? "sm" : "md"}
                    wandPulse={wandPulse}
                  />
                )}
                <span className={cn(
                  "text-xs sm:text-sm text-gray-600 whitespace-nowrap",
                  isMobileOrTablet ? "mr-1" : "font-medium px-2"
                )}>
                  {t("storyDisplay.readingLevel", "Reading Level")}:
                </span>

                {onDecreaseDifficulty && (
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
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
                      </TooltipTrigger>
                      <TooltipContent side="bottom">
                        {t("storyDisplay.decreaseDifficulty", "Make easier")}
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
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

                {onIncreaseDifficulty && (
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
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
                      </TooltipTrigger>
                      <TooltipContent side="bottom">
                        {t("storyDisplay.increaseDifficulty", "Make harder")}
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                )}
              </div>
            )}


          </div>

        </div>
        {isPremium && (
          <div className={cn(
            "flex items-center flex-nowrap",
            (isMobile || isTablet) ? "justify-center px-5 pb-3" : "justify-center py-2 overflow-x-auto"
          )}>
            <div className={cn("flex items-center flex-nowrap", isMobileOrTablet ? "gap-1 sm:gap-2" : "gap-3")}> 
              {(isMobile || isTablet) && (
                <div className={cn("flex items-center gap-2", isMobile ? "mr-1" : "mr-2")}>
                  {onHome && (
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size={isMobileOrTablet ? "sm" : "default"}
                            onClick={onHome}
                            className="min-h-[44px] min-w-[44px] rounded-full p-2"
                            aria-label={t("common.home", "Home")}
                          >
                            <Home className="w-4 h-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent side="bottom">{t("tooltips.home", "Home")}</TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  )}
                </div>
              )}

              {!isMobileOrTablet && (
                <div className="flex items-center gap-2">
                  {onHome && (
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
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
                        </TooltipTrigger>
                        <TooltipContent side="bottom">{t("tooltips.home", "Home")}</TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  )}

                </div>
              )}
              <div ref={actionsRef} className={cn("flex items-center", isMobileOrTablet ? "gap-1" : "gap-2")}> 
                {onNewStory && (
                  <NewStoryCTA
                    isPremium={!!isPremium}
                    iconOnly={isMobile || (isTablet && forceIconOnly)}
                    onNewStory={onNewStory}
                    onUpgrade={onUpgrade || (() => {})}
                    size={isMobileOrTablet ? "sm" : "md"}
                    wandPulse={wandPulse}
                    labelOverride={isMobile ? undefined : "Re-write this story"}
                    tooltipText={isMobile ? "Re-write this story" : "you will get to update any special requests"}
                    className={!isMobile ? "rounded-full px-6" : undefined}
                    showCoachOnSignIn={false}
                    isGeneratingRewrite={isGeneratingRewrite}
                  />
                )}
              </div>

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
                  {!isMobile && (
                    <span className={cn(
                      "text-xs sm:text-sm text-gray-600 whitespace-nowrap",
                      isMobileOrTablet ? "mr-1" : "font-medium px-2"
                    )}>
                      {t("storyDisplay.readingLevel", "Reading Level")}:
                    </span>
                  )}
                  {onDecreaseDifficulty && (
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
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
                        </TooltipTrigger>
                        <TooltipContent side="bottom">
                          {t("storyDisplay.decreaseDifficulty", "Make easier")}
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
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
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
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
                        </TooltipTrigger>
                        <TooltipContent side="bottom">
                          {t("storyDisplay.increaseDifficulty", "Make harder")}
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  )}
                </div>
              )}
              {!isMobileOrTablet && onEndSession && (
                <div className="flex items-center gap-2 order-last">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="destructive"
                          size="default"
                          onClick={onEndSession}
                          className="h-12 px-4 rounded-xl"
                          aria-label={t("nav.endSession", "End Session")}
                        >
                          {t("nav.endSession", "End Session")}
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent side="bottom">{t("tooltips.endSession", "This will end this session. You will have the option to save this story as is.")}</TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
};