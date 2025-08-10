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
import { 
  BookOpen,
  Settings,
  CreditCard,
  User,
  Library,
  Crown,
  Sparkles,
  Clock
} from "lucide-react";
import type { UserInfo } from "@/types";
import { useIsMobile } from "@/hooks/use-mobile";
import { VocabularyCollector } from "@/components/VocabularyCollector";

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
    icon: User,
    description: "Edit your reading profile"
  },
  {
    title: "Parent Dashboard",
    url: "parent",
    icon: Settings,
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
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const { isMobile } = useIsMobile();
  const effectiveCollapsed = collapsed && !isMobile;
  const [timerEnabled, setTimerEnabled] = useState<boolean>(() => {
    try { return localStorage.getItem('readingTimerEnabled') !== '0'; } catch { return true; }
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
  return (
    <Sidebar className={`border-r bg-background/95 backdrop-blur-sm ${effectiveCollapsed ? "w-16" : "w-64"}`} collapsible="icon">
      {/* Header */}
      <div className="p-4 border-b">
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
          
        </div>
      </div>

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
                <SidebarMenuItem key={item.url}>
                  <SidebarMenuButton 
                    onClick={() => onViewChange(item.url)}
                    className={getNavClasses(item)}
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

              {/* Timer toggle as the last option */}
              {isPremium && (
                <SidebarMenuItem>
                  <SidebarMenuButton 
                    onClick={toggleTimer}
                    className="flex items-center gap-3 w-full transition-colors rounded-lg hover:bg-accent hover:text-accent-foreground"
                  >
                    <Clock className="w-5 h-5 flex-shrink-0" />
                    {!effectiveCollapsed && (
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{timerEnabled ? 'Hide Timer' : 'Show Timer'}</span>
                        </div>
                        <p className="text-xs text-muted-foreground truncate">
                          {timerEnabled ? 'Hide the floating reading timer' : 'Show the floating reading timer'}
                        </p>
                      </div>
                    )}
                  </SidebarMenuButton>
                </SidebarMenuItem>
              )}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>

          {/* Vocabulary entry below Timer (no icon) */}
          {isPremium && (
            <div className="mt-2 px-2">
              <button
                onClick={() => setVocabOpen(true)}
                className="w-full text-left px-3 py-2 rounded-lg hover:bg-accent hover:text-accent-foreground transition-colors text-sm font-medium"
              >
                Vocabulary
              </button>
            </div>
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