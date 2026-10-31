import { uiText, useUiLanguage } from "@/i18n/uiText";
import { useState, useEffect } from "react";
import { premiumUntilLabel } from "@/lib/accessCode";
import { 
  Sidebar, 
  SidebarContent, 
  SidebarGroup, 
  SidebarGroupContent, 
  SidebarGroupLabel, 
  SidebarMenu, 
  SidebarMenuButton, 
  SidebarMenuItem,
  useSidebar 
} from "@/components/ui/sidebar";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";

import { 
  BookOpen,
  Settings,
  CreditCard,
  User,
  Library,
  Crown,
  Sparkles,
  Clock,
  Bookmark,
  Trophy,
  X,
  ChevronLeft,
  ChevronRight,
  Home,
  BarChart3,
  
  Image
} from "lucide-react";
import type { UserInfo } from "@/types";
import { useIsMobile } from "@/hooks/use-mobile";
import { Link, useLocation } from 'react-router-dom';
import { VocabularyCollector } from "@/components/VocabularyCollector";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useChildProfiles } from "@/hooks/useChildProfiles";
import { childAvatarUrl } from "@/components/children/childInfo";

interface PremiumSidebarProps {
  currentView: string;
  onViewChange: (view: string) => void;
  userInfo: UserInfo;
  isPremium: boolean;
  /** Real Premium (paid or code), for the badge. isPremium only gates the menu. */
  hasPremium?: boolean;
  /** When Premium ends (paid period or code), for the quiet "Premium active until …" line. */
  premiumUntil?: string | null;
  /** The plan has loaded without error. The Premium upsell shows only when we KNOW the account is free. */
  planKnown?: boolean;
}

// Two calm groups: what the child uses, and what the grown-up manages.
const GROUP_LABELS: Record<string, string> = {
  child: "For your child",
  grownup: "For grown-ups",
};

const sidebarItems = [
  { title: uiText("My Stories"), url: "stories", icon: BookOpen, description: uiText("Read or start a new story"), premium: false, group: "child" },
  { title: uiText("Story Library"), url: "library", icon: Library, description: uiText("Saved stories"), premium: true, group: "child" },
  { title: uiText("Progress"), url: "progress", icon: BarChart3, description: uiText("Stories read and words learned"), premium: false, group: "child" },
  { title: uiText("Grown-up settings"), url: "account", icon: CreditCard, description: uiText("Children, plan, code, sign-in"), premium: false, group: "grownup" },
  { title: uiText("Reading settings"), url: "profile", icon: Settings, description: uiText("Story language and reading level"), premium: false, group: "grownup" },
  { title: uiText("Parent dashboard"), url: "parent", icon: User, description: uiText("Reports, word lists, controls"), premium: false, group: "grownup" },
  { title: uiText("Help"), url: "home", icon: Home, description: uiText("How it works and questions"), premium: false, group: "grownup" },
];

export const PremiumSidebar = ({ currentView, onViewChange, userInfo, isPremium, hasPremium, premiumUntil, planKnown = false }: PremiumSidebarProps) => {
  useUiLanguage();
  const { activeChild } = useChildProfiles();
  const { state, toggleSidebar, openMobile, setOpenMobile } = useSidebar();
  const location = useLocation();
  const collapsed = state === "collapsed";
  const { isMobileOrTablet } = useIsMobile();
  const effectiveCollapsed = collapsed && !isMobileOrTablet;
  const [timerEnabled, setTimerEnabled] = useState<boolean>(() => {
    try { return localStorage.getItem('readingTimerEnabled') !== '0'; } catch { return true; }
  });
  const [towersEnabled, setTowersEnabled] = useState<boolean>(() => {
    try { return localStorage.getItem('progressTowersEnabled') !== '0'; } catch { return true; }
  });
  const [imagesEnabled, setImagesEnabled] = useState<boolean>(() => {
    try { return localStorage.getItem('storyImagesEnabled') !== '0'; } catch { return true; }
  });
  const [imageToggleFeedback, setImageToggleFeedback] = useState(false);
  const [vocabOpen, setVocabOpen] = useState(false);
  const [toolsOpen, setToolsOpen] = useState(false);

  useEffect(() => {
    const handler = (e: any) => {
      const enabled = !!(e as CustomEvent).detail;
      setTimerEnabled(enabled);
    };
    window.addEventListener('readingTimerToggle', handler as EventListener);
    return () => window.removeEventListener('readingTimerToggle', handler as EventListener);
  }, []);

  useEffect(() => {
    const handler = (e: any) => {
      const enabled = !!(e as CustomEvent).detail;
      setTowersEnabled(enabled);
    };
    window.addEventListener('progressTowersToggle', handler as EventListener);
    return () => window.removeEventListener('progressTowersToggle', handler as EventListener);
  }, []);

  useEffect(() => {
    const handler = (e: any) => {
      const enabled = !!(e as CustomEvent).detail;
      setImagesEnabled(enabled);
    };
    window.addEventListener('storyImagesToggle', handler as EventListener);
    return () => window.removeEventListener('storyImagesToggle', handler as EventListener);
  }, []);

  // Enhanced active state detection
  const isActive = (itemUrl: string) => {
    return currentView === itemUrl;
  };

  // Group items by category
  const groupedItems = sidebarItems.reduce((acc, item) => {
    if (!acc[item.group]) acc[item.group] = [];
    acc[item.group].push(item);
    return acc;
  }, {} as Record<string, typeof sidebarItems>);

  const getNavClasses = (item: any) => {
    const baseClasses = "flex items-center gap-3 w-full transition-colors rounded-lg";
    if (isActive(item.url)) {
      return `${baseClasses} bg-primary/10 text-primary border-r-2 border-primary font-medium`;
    }
    if (item.premium && !isPremium) {
      return `${baseClasses} opacity-60 hover:opacity-80`;
    }
    return `${baseClasses} hover:bg-accent hover:text-accent-foreground`;
  };

  const toggleTimer = () => {
    const next = !timerEnabled;
    setTimerEnabled(next);
    try { localStorage.setItem('readingTimerEnabled', next ? '1' : '0'); } catch {}
    window.dispatchEvent(new CustomEvent('readingTimerToggle', { detail: next }));
  };

  const toggleTowers = () => {
    const next = !towersEnabled;
    setTowersEnabled(next);
    try { localStorage.setItem('progressTowersEnabled', next ? '1' : '0'); } catch {}
    window.dispatchEvent(new CustomEvent('progressTowersToggle', { detail: next }));
  };

  const toggleImages = () => {
    const next = !imagesEnabled;
    setImagesEnabled(next);
    try { localStorage.setItem('storyImagesEnabled', next ? '1' : '0'); } catch {}
    window.dispatchEvent(new CustomEvent('storyImagesToggle', { detail: next }));
    
    // Trigger feedback animation
    setImageToggleFeedback(true);
    setTimeout(() => setImageToggleFeedback(false), 600);
  };
  return (
    <Sidebar side={document.documentElement.dir === "rtl" ? "right" : "left"} className={`border-r bg-background/95 backdrop-blur-sm ${effectiveCollapsed ? "w-16 md:top-[var(--app-header-height)] md:h-[calc(100svh-var(--app-header-height))]" : "w-64"}`} collapsible="icon">
      {/* Header */}
      <div className={`border-b relative overflow-visible z-30 ${effectiveCollapsed ? "px-2 pt-2 pb-3" : "p-4"}`}>
        <div className="flex items-center gap-3">
          {!effectiveCollapsed && (
            <>
              <img src="/icon-192.png" alt="" className="h-10 w-10" />
              <div className="flex-1">
                <h2 className="font-bold text-lg">{uiText("Time-2-Read")}</h2>
                {hasPremium && (
                  <Badge variant="secondary" className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white text-xs">
                    <Crown className="w-3 h-3 mr-1" />
                    {uiText("Premium")}
                  </Badge>
                )}
              </div>
            </>
          )}
          
          {isMobileOrTablet && (
            <Button
              aria-label={uiText("Close navigation")}
              onClick={(e) => {
                e.stopPropagation();
                toggleSidebar();
              }}
              size="icon"
              variant="secondary"
              className="absolute z-50 rounded-full shadow-sm top-2 right-2 h-8 w-8"
            >
              <X className="h-4 w-4" />
            </Button>
          )}

          
          
        </div>
      </div>

      <SidebarContent className="p-2">
        <Link to="/schools" className="px-4 py-2 text-sm underline">School workspace</Link>
        {/* Who is reading now */}
        {!effectiveCollapsed && activeChild && (
          <div className="px-3 py-3 mb-2 flex items-center gap-3">
            <img src={childAvatarUrl(activeChild)} alt="" className="w-10 h-10 rounded-full object-cover ring-2 ring-primary" />
            <div className="min-w-0">
              <p className="text-xs text-muted-foreground">{uiText("Reading now")}</p>
              <p className="font-bold text-primary truncate">{activeChild.display_name}</p>
            </div>
          </div>
        )}

        {/* Enhanced Navigation Menu with Groups */}
        {Object.entries(groupedItems).map(([groupName, items]) => (
          <SidebarGroup key={groupName}>
            <SidebarGroupLabel className={effectiveCollapsed ? "sr-only" : "text-xs font-semibold text-muted-foreground uppercase tracking-wider px-2 py-2"}>
              {uiText(GROUP_LABELS[groupName] ?? groupName)}
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {items.map((item) => (
                  <SidebarMenuItem key={item.url} className={effectiveCollapsed ? "my-1" : ""}>
                    <SidebarMenuButton 
                      onClick={() => {
                        onViewChange(item.url);
                        // On a phone or iPad the menu covers the page: close it so the parent sees where they went.
                        if (isMobileOrTablet) {
                          if (openMobile) setOpenMobile(false);
                          else if (state === "expanded") toggleSidebar();
                        }
                      }}
                      className={`${getNavClasses(item)} ${effectiveCollapsed ? "justify-center gap-0 mx-auto h-10 w-10 rounded-md" : ""}`}
                      disabled={item.premium && !isPremium}
                    >
                      <item.icon className={`w-5 h-5 flex-shrink-0 transition-colors ${isActive(item.url) ? "text-primary" : ""}`} />
                      {!effectiveCollapsed && (
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="truncate">{uiText(item.title)}</span>
                            {item.premium && !isPremium && (
                              <Sparkles className="w-3 h-3 text-warning flex-shrink-0" />
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground truncate">
                            {uiText(item.description)}
                          </p>
                        </div>
                      )}
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}

          {isPremium && !effectiveCollapsed && (
            <button
              type="button"
              className="mx-2 mt-2 text-left text-sm font-medium text-muted-foreground underline"
              aria-expanded={toolsOpen}
              onClick={() => setToolsOpen((v) => !v)}
              data-testid="reading-tools-toggle"
            >
              {toolsOpen ? uiText("Hide reading page options ▴") : uiText("Reading page options (timer, towers, pictures) ▾")}
            </button>
          )}
          {isPremium && (toolsOpen || effectiveCollapsed) && (
            <SidebarGroup>
              <SidebarGroupLabel className={effectiveCollapsed ? "sr-only" : ""}>
                {uiText("Reading page options")}
              </SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  <SidebarMenuItem>
                    {effectiveCollapsed ? (
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <SidebarMenuButton
                              onClick={() => toggleTimer()}
                              className="flex items-center justify-center transition-colors rounded-lg hover:bg-accent hover:text-accent-foreground h-10 w-10 mx-auto"
                              aria-label={uiText("Toggle reading timer visibility")}
                            >
                              <Clock className="w-5 h-5 flex-shrink-0" />
                            </SidebarMenuButton>
                          </TooltipTrigger>
                          <TooltipContent>
                            {uiText("Timer:")} {timerEnabled ? uiText("On") : uiText("Off")}
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    ) : (
                      <SidebarMenuButton asChild>
                        <div
                          role="button"
                          onClick={() => toggleTimer()}
                          className="flex items-center gap-3 w-full justify-between rounded-full border border-border bg-card hover:bg-accent hover:text-accent-foreground px-3 py-2 min-w-[220px]"
                          aria-label={uiText("Toggle reading timer visibility")}
                        >
                        <div className="flex items-center gap-3">
                          <Clock className="w-5 h-5 flex-shrink-0" />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="font-medium">{timerEnabled ? uiText("Hide Timer") : uiText("Show Timer")}</span>
                            </div>
                          </div>
                        </div>
                        <Switch
                          checked={timerEnabled}
                          onCheckedChange={() => toggleTimer()}
                          onClick={(e) => e.stopPropagation()}
                          aria-label={timerEnabled ? uiText("Hide timer") : uiText("Show timer")}
                        />
                      </div>
                      </SidebarMenuButton>
                    )}
                  </SidebarMenuItem>

                  {/* Progress Towers toggle */}
                  <SidebarMenuItem>
                    {effectiveCollapsed ? (
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <SidebarMenuButton
                              onClick={() => toggleTowers()
                              }
                              className="flex items-center justify-center transition-colors rounded-lg hover:bg-accent hover:text-accent-foreground h-10 w-10 mx-auto"
                              aria-label={uiText("Toggle progress towers visibility")}
                            >
                              <Trophy className="w-5 h-5 flex-shrink-0" />
                            </SidebarMenuButton>
                          </TooltipTrigger>
                          <TooltipContent>
                            {uiText("Progress Towers:")} {towersEnabled ? uiText("On") : uiText("Off")}
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    ) : (
                      <SidebarMenuButton asChild>
                        <div
                          role="button"
                          onClick={() => toggleTowers()}
                          className="flex items-center gap-3 w-full justify-between rounded-full border border-border bg-card hover:bg-accent hover:text-accent-foreground px-3 py-2 min-w-[220px]"
                          aria-label={uiText("Toggle progress towers visibility")}
                        >
                        <div className="flex items-center gap-3">
                          <Trophy className="w-5 h-5 flex-shrink-0" />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="font-medium">{towersEnabled ? uiText("Hide Progress Towers") : uiText("Show Progress Towers")}</span>
                            </div>
                          </div>
                        </div>
                        <Switch
                          checked={towersEnabled}
                          onCheckedChange={() => toggleTowers()}
                          onClick={(e) => e.stopPropagation()}
                          aria-label={towersEnabled ? uiText("Hide progress towers") : uiText("Show progress towers")}
                        />
                      </div>
                      </SidebarMenuButton>
                    )}
                  </SidebarMenuItem>

                  {/* Story Images toggle */}
                  <SidebarMenuItem>
                    {effectiveCollapsed ? (
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <SidebarMenuButton
                              onClick={() => toggleImages()}
                              className={`flex items-center justify-center transition-colors rounded-lg hover:bg-accent hover:text-accent-foreground h-10 w-10 mx-auto ${imageToggleFeedback ? 'ring-2 ring-primary animate-pulse' : ''}`}
                              aria-label={uiText("Toggle story images")}
                            >
                              <Image className="w-5 h-5 flex-shrink-0" />
                            </SidebarMenuButton>
                          </TooltipTrigger>
                          <TooltipContent>
                            {uiText("Story Images:")} {imagesEnabled ? uiText("On") : uiText("Off")}
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    ) : (
                      <SidebarMenuButton asChild>
                        <div
                          role="button"
                          onClick={() => toggleImages()}
                          className="flex items-center gap-3 w-full justify-between rounded-full border border-border bg-card hover:bg-accent hover:text-accent-foreground px-3 py-2 min-w-[220px]"
                          aria-label={uiText("Toggle story images")}
                        >
                        <div className="flex items-center gap-3">
                          <Image className="w-5 h-5 flex-shrink-0" />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="font-medium">{imagesEnabled ? uiText("Hide Images") : uiText("Show Images")}</span>
                            </div>
                          </div>
                        </div>
                        <Switch
                          checked={imagesEnabled}
                          onCheckedChange={() => toggleImages()}
                          onClick={(e) => e.stopPropagation()}
                          aria-label={imagesEnabled ? uiText("Hide story images") : uiText("Show story images")}
                          className={imageToggleFeedback ? 'ring-2 ring-primary animate-pulse' : ''}
                        />
                      </div>
                      </SidebarMenuButton>
                    )}
                  </SidebarMenuItem>

                  <SidebarMenuItem>
                    <SidebarMenuButton
                      onClick={() => setVocabOpen(true)}
                      className={`${"flex items-center gap-3 w-full transition-colors rounded-lg hover:bg-accent hover:text-accent-foreground"} ${effectiveCollapsed ? "justify-center gap-0 h-10 w-10 mx-auto" : ""}`}
                    >
                      <Bookmark className="w-5 h-5 flex-shrink-0" />
                      {!effectiveCollapsed && (
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{uiText("My Vocabulary")}</span>
                          </div>
                          <p className="text-xs text-muted-foreground truncate">
                            {uiText("View and manage your saved words")}
                          </p>
                        </div>
                      )}
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          )}


        {/* Premium: a quiet line for a Premium account; the upsell only for a free one
            (never while the plan is loading or could not be read). */}
        {!effectiveCollapsed && hasPremium && (
          <p className="mt-auto px-4 py-3 text-xs text-muted-foreground" data-testid="sidebar-premium-until">
            {premiumUntilLabel(premiumUntil) ?? uiText("Premium is on")}
          </p>
        )}
        {!effectiveCollapsed && planKnown && !hasPremium && (
          <div className="mt-auto p-3" data-testid="sidebar-premium-upsell">
            <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-lg p-3">
              <div className="flex items-center gap-2 mb-2">
                <Crown className="w-4 h-4 text-yellow-600" />
                <span className="font-semibold text-yellow-800 text-sm">{uiText("Premium")}</span>
              </div>
              <p className="text-xs text-yellow-700 mb-3">
                {uiText("Unlimited stories, the story library and more. Have a code? Use it in Grown-up settings.")}
              </p>
              <button 
                onClick={() => { onViewChange("account"); if (isMobileOrTablet) { if (openMobile) setOpenMobile(false); else if (state === "expanded") toggleSidebar(); } }}
                className="w-full bg-gradient-to-r from-yellow-400 to-orange-500 text-white text-sm font-medium py-2 px-3 rounded-md hover:from-yellow-500 hover:to-orange-600 transition-colors"
              >
                {uiText("See plans or use a code")}
              </button>
            </div>
          </div>
        )}
      </SidebarContent>

      {/* Overlay panel so it doesn’t interrupt story */}
      <VocabularyCollector 
        userInfo={userInfo} 
        isVisible={vocabOpen} 
        onClose={() => setVocabOpen(false)} 
        enablePersistence={isPremium}
      />
    </Sidebar>
  );
};