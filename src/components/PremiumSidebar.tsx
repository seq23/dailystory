import { useState, useEffect } from "react";
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
  ChevronRight
} from "lucide-react";
import type { UserInfo } from "@/types";
import { useIsMobile } from "@/hooks/use-mobile";
import { VocabularyCollector } from "@/components/VocabularyCollector";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface PremiumSidebarProps {
  currentView: string;
  onViewChange: (view: string) => void;
  userInfo: UserInfo;
  isPremium: boolean;
}

const sidebarItems = [
  {
    title: "My Stories",
    url: "stories",
    icon: BookOpen,
    description: "Read and create stories"
  },
  {
    title: "Story Library", 
    url: "library",
    icon: Library,
    description: "Saved stories & collections",
    premium: true
  },
  {
    title: "Profile Settings",
    url: "profile",
    icon: Settings,
    description: "Edit your reading profile"
  },
  {
    title: "Parent Dashboard",
    url: "parent",
    icon: User,
    description: "Parent controls & reports"
  },
  {
    title: "My Account",
    url: "account",
    icon: CreditCard,
    description: "Manage subscription & settings"
  }
];

export const PremiumSidebar = ({ currentView, onViewChange, userInfo, isPremium }: PremiumSidebarProps) => {
  const { state, toggleSidebar } = useSidebar();
  const collapsed = state === "collapsed";
  const { isMobile } = useIsMobile();
  const effectiveCollapsed = collapsed && !isMobile;
  const [timerEnabled, setTimerEnabled] = useState<boolean>(() => {
    try { return localStorage.getItem('readingTimerEnabled') !== '0'; } catch { return true; }
  });
  const [towersEnabled, setTowersEnabled] = useState<boolean>(() => {
    try { return localStorage.getItem('progressTowersEnabled') !== '0'; } catch { return true; }
  });
  const [vocabOpen, setVocabOpen] = useState(false);

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

  const isActive = (itemUrl: string) => currentView === itemUrl;

  const getNavClasses = (item: any) => {
    const baseClasses = "flex items-center gap-3 w-full transition-colors rounded-lg";
    if (isActive(item.url)) {
      return `${baseClasses} bg-primary text-primary-foreground`;
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
  return (
    <Sidebar className={`border-r bg-background/95 backdrop-blur-sm ${effectiveCollapsed ? "w-16 md:top-[var(--app-header-height)] md:h-[calc(100svh-var(--app-header-height))]" : "w-64"}`} collapsible="icon">
      {/* Header */}
      <div className={`border-b relative overflow-visible z-30 ${effectiveCollapsed ? "px-2 pt-2 pb-3" : "p-4"}`}>
        <div className="flex items-center gap-3">
          {!effectiveCollapsed && (
            <>
              <div className="p-2 bg-gradient-primary rounded-lg">
                <BookOpen className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1">
                <h2 className="font-bold text-lg">Time2Read</h2>
                {isPremium && (
                  <Badge variant="secondary" className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white text-xs">
                    <Crown className="w-3 h-3 mr-1" />
                    Premium
                  </Badge>
                )}
              </div>
            </>
          )}
          
          {isMobile && (
            <Button
              aria-label={isMobile ? "Close navigation" : state === "expanded" ? "Collapse sidebar" : "Expand sidebar"}
              onClick={(e) => {
                e.stopPropagation();
                toggleSidebar();
              }}
              size="icon"
              variant="secondary"
              className={`absolute z-50 rounded-full shadow-sm ${isMobile ? "top-2 right-2 h-8 w-8" : effectiveCollapsed ? "top-1 right-1 h-4 w-4" : "top-2 right-2 h-8 w-8"}`}
            >
              {isMobile ? (
                <X className="h-4 w-4" />
              ) : state === "expanded" ? (
                <ChevronLeft className={effectiveCollapsed ? "h-3.5 w-3.5" : "h-4 w-4"} />
              ) : (
                <ChevronRight className={effectiveCollapsed ? "h-3.5 w-3.5" : "h-4 w-4"} />
              )}
            </Button>
          )}

          {!isMobile && !effectiveCollapsed && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    aria-label="Close navigation"
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleSidebar();
                    }}
                    size="icon"
                    className="hidden md:flex absolute z-50 top-2 right-2 h-8 w-8 rounded-full bg-primary text-primary-foreground hover:bg-primary/90 focus-visible:ring-2 focus-visible:ring-primary"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Close navigation</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
          
        </div>
      </div>
        {!isMobile && effectiveCollapsed && (
          <div className="hidden md:flex w-full items-center justify-center pt-1">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    aria-label="Open navigation"
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleSidebar();
                    }}
                    size="icon"
                    className="h-10 w-10 rounded-full bg-primary text-primary-foreground hover:bg-primary/90 focus-visible:ring-2 focus-visible:ring-primary"
                  >
                    <ChevronRight className="h-5 w-5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Open navigation</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        )}

      <SidebarContent className="p-2">
        {/* User Welcome */}
        {!effectiveCollapsed && (
          <div className="px-3 py-4 mb-2">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-primary rounded-full flex items-center justify-center text-white font-semibold">
                {userInfo.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <p className="font-medium text-sm">Welcome back,</p>
                <p className="font-bold text-primary">{userInfo.name}!</p>
              </div>
            </div>
          </div>
        )}

        {/* Navigation Menu */}
        <SidebarGroup>
          <SidebarGroupLabel className={effectiveCollapsed ? "sr-only" : ""}>
            Navigation
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {sidebarItems.map((item) => (
                <SidebarMenuItem key={item.url} className={effectiveCollapsed ? "my-1" : ""}>
                  <SidebarMenuButton 
                    onClick={() => onViewChange(item.url)}
                    className={`${getNavClasses(item)} ${effectiveCollapsed ? "justify-center gap-0 mx-auto h-10 w-10 rounded-md" : ""}`}
                    disabled={item.premium && !isPremium}
                  >
                    <item.icon className="w-5 h-5 flex-shrink-0" />
                    {!effectiveCollapsed && (
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{item.title}</span>
                          {item.premium && !isPremium && (
                            <Sparkles className="w-3 h-3 text-yellow-500" />
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground truncate">
                          {item.description}
                        </p>
                      </div>
                    )}
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}

              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>

          {isPremium && (
            <SidebarGroup>
              <SidebarGroupLabel className={effectiveCollapsed ? "sr-only" : ""}>
                Reading tools
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
                              aria-label="Toggle reading timer visibility"
                            >
                              <Clock className="w-5 h-5 flex-shrink-0" />
                            </SidebarMenuButton>
                          </TooltipTrigger>
                          <TooltipContent>
                            Timer: {timerEnabled ? 'On' : 'Off'}
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    ) : (
                      <SidebarMenuButton asChild>
                        <div
                          role="button"
                          onClick={() => toggleTimer()}
                          className="flex items-center gap-3 w-full justify-between rounded-full border border-border bg-card hover:bg-accent hover:text-accent-foreground px-3 py-2 min-w-[220px]"
                          aria-label="Toggle reading timer visibility"
                        >
                        <div className="flex items-center gap-3">
                          <Clock className="w-5 h-5 flex-shrink-0" />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="font-medium">{timerEnabled ? 'Hide Timer' : 'Show Timer'}</span>
                            </div>
                          </div>
                        </div>
                        <Switch
                          checked={timerEnabled}
                          onCheckedChange={() => toggleTimer()}
                          onClick={(e) => e.stopPropagation()}
                          aria-label={timerEnabled ? 'Hide timer' : 'Show timer'}
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
                              aria-label="Toggle progress towers visibility"
                            >
                              <Trophy className="w-5 h-5 flex-shrink-0" />
                            </SidebarMenuButton>
                          </TooltipTrigger>
                          <TooltipContent>
                            Progress Towers: {towersEnabled ? 'On' : 'Off'}
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    ) : (
                      <SidebarMenuButton asChild>
                        <div
                          role="button"
                          onClick={() => toggleTowers()}
                          className="flex items-center gap-3 w-full justify-between rounded-full border border-border bg-card hover:bg-accent hover:text-accent-foreground px-3 py-2 min-w-[220px]"
                          aria-label="Toggle progress towers visibility"
                        >
                        <div className="flex items-center gap-3">
                          <Trophy className="w-5 h-5 flex-shrink-0" />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="font-medium">{towersEnabled ? 'Hide Progress Towers' : 'Show Progress Towers'}</span>
                            </div>
                          </div>
                        </div>
                        <Switch
                          checked={towersEnabled}
                          onCheckedChange={() => toggleTowers()}
                          onClick={(e) => e.stopPropagation()}
                          aria-label={towersEnabled ? 'Hide progress towers' : 'Show progress towers'}
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
                            <span className="font-medium">My Vocabulary</span>
                          </div>
                          <p className="text-xs text-muted-foreground truncate">
                            View and manage your saved words
                          </p>
                        </div>
                      )}
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          )}


        {/* Premium Features Highlight */}
        {!effectiveCollapsed && !isPremium && (
          <div className="mt-auto p-3">
            <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-lg p-3">
              <div className="flex items-center gap-2 mb-2">
                <Crown className="w-4 h-4 text-yellow-600" />
                <span className="font-semibold text-yellow-800 text-sm">Upgrade to Premium</span>
              </div>
              <p className="text-xs text-yellow-700 mb-3">
                Unlock story library, learning goals, and advanced features!
              </p>
              <button 
                onClick={() => onViewChange("account")}
                className="w-full bg-gradient-to-r from-yellow-400 to-orange-500 text-white text-sm font-medium py-2 px-3 rounded-md hover:from-yellow-500 hover:to-orange-600 transition-colors"
              >
                Learn More
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