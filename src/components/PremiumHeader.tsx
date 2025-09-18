import { useState, useEffect, useRef, useMemo } from "react";
import { globalResizeService } from '@/services/GlobalResizeService';
import { DebugLogger } from '@/services/DebugLogger';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { 
  Clock, 
  LogOut, 
  Crown, 
  Bug, 
  User,
  Settings,
  ChevronDown
} from "lucide-react";
import type { UserInfo } from "@/types";
import { SidebarTrigger, useSidebar } from "@/components/ui/sidebar";
import { useIsMobile } from "@/hooks/use-mobile";
import { useTranslation } from "react-i18next";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { ChildQuickSwitcher } from "@/components/ChildQuickSwitcher";
import { useChildProfiles } from "@/hooks/useChildProfiles";
import { AvatarUtils } from "@/utils/avatarUtils";
interface PremiumHeaderProps {
  userInfo: UserInfo;
  isPremium: boolean;
  devTestMode: boolean;
  subscriptionTier?: string;
  onSignOut: () => void;
  onToggleDevMode: () => void;
  onProfileClick: () => void;
}

export const PremiumHeader = ({ 
  userInfo, 
  isPremium, 
  devTestMode, 
  subscriptionTier, 
  onSignOut, 
  onToggleDevMode,
  onProfileClick 
}: PremiumHeaderProps) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const headerRef = useRef<HTMLElement | null>(null);
  const { activeChild } = useChildProfiles();

  const { open, openMobile, isMobile } = useSidebar();
  const isSidebarOpen = isMobile ? openMobile : open;

  // Set CSS var for header height so sidebar can offset on tablets
  useEffect(() => {
    const el = headerRef.current;
    if (!el) return;
    
    // Cache height to avoid repeated measurements
    let cachedHeight = 0;
    
    const setVar = () => {
      requestAnimationFrame(() => {
        const h = el.getBoundingClientRect().height;
        if (Math.abs(h - cachedHeight) > 1) { // Only update if significantly changed
          cachedHeight = h;
          document.documentElement.style.setProperty('--app-header-height', `${h}px`);
        }
      });
    };
    
    // Initial measurement
    setVar();
    
    // Use ResizeObserver for efficient resize detection
    const unsubscribe = globalResizeService.observe(el, () => setVar());
    
    return () => {
      unsubscribe();
    };
  }, []);

  const getAvatarUrl = useMemo(() => {
    return AvatarUtils.getAvatarUrlWithFallback(
      activeChild?.avatar,
      userInfo.avatar
    );
  }, [activeChild?.avatar, userInfo.avatar]);

  const getDisplayName = useMemo(() => {
    return activeChild ? activeChild.display_name : userInfo.name;
  }, [activeChild?.display_name, userInfo.name]);

  const getDisplayGrade = useMemo(() => {
    return activeChild ? activeChild.grade_level : userInfo.grade;
  }, [activeChild?.grade_level, userInfo.grade]);

  const getDisplayAge = useMemo(() => {
    if (activeChild) {
      const currentYear = new Date().getFullYear();
      const currentMonth = new Date().getMonth() + 1; // JavaScript months are 0-indexed
      const birthYear = activeChild.birth_year;
      const birthMonth = activeChild.birth_month;
      
      let age = currentYear - birthYear;
      if (currentMonth < birthMonth) {
        age--;
      }
      return age;
    }
    return userInfo.age;
  }, [activeChild?.birth_year, activeChild?.birth_month, userInfo.age]);

  const getInitial = useMemo(() => {
    const displayName = activeChild ? activeChild.display_name : userInfo.name;
    return displayName.charAt(0).toUpperCase();
  }, [activeChild?.display_name, userInfo.name]);

  const hasSelectedAvatar = useMemo(() => {
    return AvatarUtils.hasValidAvatarData(activeChild?.avatar) || 
           AvatarUtils.hasValidAvatarData(userInfo.avatar);
  }, [activeChild?.avatar, userInfo.avatar]);

  return (
    <header ref={headerRef} className="bg-white/95 backdrop-blur-sm shadow-sm border-b sticky top-0 z-[70]">
      <div className="container mx-auto px-4 pr-[env(safe-area-inset-right)] py-3">
        <div className="flex justify-between items-center gap-2 min-w-0">
          {/* Logo and Title */}
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            {/* Enhanced Mobile Sidebar Toggle */}
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <SidebarTrigger 
                    aria-label={isSidebarOpen ? "Close navigation" : "Open navigation"} 
                    className="mr-1 md:hidden h-9 w-9 hover:bg-muted/50 rounded-md transition-colors" 
                  />
                </TooltipTrigger>
                <TooltipContent side="bottom">{isSidebarOpen ? 'Close navigation' : 'Open navigation'}</TooltipContent>
              </Tooltip>
            </TooltipProvider>
            {/* Enhanced Desktop/Tablet trigger */}
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <SidebarTrigger 
                    aria-label={isSidebarOpen ? "Close navigation" : "Open navigation"} 
                    className="hidden md:inline-flex mr-2 h-9 w-9 hover:bg-muted/50 rounded-md transition-colors" 
                  />
                </TooltipTrigger>
                <TooltipContent side="bottom">{isSidebarOpen ? 'Close navigation' : 'Open navigation'}</TooltipContent>
              </Tooltip>
            </TooltipProvider>
            <div className="p-2 bg-gradient-primary rounded-lg">
              <Clock className="w-6 h-6 text-white" />
            </div>
            <div>
              <button
                onClick={() => (window.location.href = '/')}
                className="text-left text-xl font-bold text-gray-800 truncate max-w-[50vw] sm:max-w-none hover:underline story-link"
                aria-label="Go to Time2Read Home"
              >
                Time2Read
              </button>
              <div className="flex items-center gap-2">
                <p className="hidden sm:block text-sm text-gray-600">Welcome back!</p>
                {devTestMode && (
                  <Badge variant="outline" className="border-orange-500 text-orange-600 text-xs">
                    <Bug className="w-3 h-3 mr-1" />
                    Test Mode
                  </Badge>
                )}
              </div>
            </div>
          </div>

          {/* Enhanced User Avatar and Actions */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">

            {/* Enhanced Avatar with Dropdown + Child badge overlay */}
            <div className="relative">
              <DropdownMenu open={isDropdownOpen} onOpenChange={setIsDropdownOpen}>
                <DropdownMenuTrigger asChild>
                  <Button 
                    variant="ghost" 
                    className="relative z-10 flex items-center gap-2 sm:gap-3 px-2 sm:px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors shrink-0"
                  >
                    <Avatar className="w-7 h-7 sm:w-8 sm:h-8">
                      <AvatarImage 
                        src={getAvatarUrl} 
                        alt={getDisplayName}
                        onError={(e) => {
                          DebugLogger.warn('ui', 'Avatar image failed to load', { url: getAvatarUrl, error: e });
                        }}
                        onLoad={() => {
                          DebugLogger.log('ui', 'Avatar image loaded successfully', { url: getAvatarUrl });
                        }}
                      />
                      <AvatarFallback className="bg-gradient-primary text-white text-sm font-semibold">
                        {hasSelectedAvatar ? "" : getInitial}
                      </AvatarFallback>
                    </Avatar>
                    <div className="text-left hidden sm:block">
                      <p className="text-sm font-medium text-gray-800 truncate max-w-[120px]">{getDisplayName}</p>
                      <p className="text-xs text-gray-600 truncate max-w-[120px]">
                        {getDisplayGrade === 'PreK' ? 'Pre-K' : `Grade ${getDisplayGrade}`}
                      </p>
                    </div>
                    <ChevronDown className="w-3 h-3 sm:w-4 sm:h-4 text-gray-500 transition-transform data-[state=open]:rotate-180" />
                  </Button>
                </DropdownMenuTrigger>
                
                <DropdownMenuContent align="end" className="w-56 z-[75] bg-popover shadow-md">
                  <div className="px-3 py-2">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium">{getDisplayName}</p>
                        <p className="text-xs text-muted-foreground">
                          {getDisplayAge} years old • {getDisplayGrade === 'PreK' ? 'Pre-K' : `Grade ${getDisplayGrade}`}
                        </p>
                      </div>
                      {isPremium && (
                        <div className="flex items-center text-primary" aria-label="Premium">
                          <Crown className="w-4 h-4" />
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <DropdownMenuSeparator />
                  
                  <DropdownMenuItem onClick={onProfileClick} className="cursor-pointer">
                    <User className="w-4 h-4 mr-2" />
                    Edit Profile
                  </DropdownMenuItem>
                  
                  <DropdownMenuItem onClick={onToggleDevMode} className="cursor-pointer">
                    <Bug className="w-4 h-4 mr-2" />
                    {devTestMode ? 'Disable' : 'Enable'} Test Mode
                  </DropdownMenuItem>
                  
                  <DropdownMenuSeparator />
                  
                  <DropdownMenuItem onClick={onSignOut} className="cursor-pointer text-red-600">
                    <LogOut className="w-4 h-4 mr-2" />
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              <ChildQuickSwitcher className="absolute bottom-[-14px] -left-5 z-0 md:-bottom-1 md:-left-4" size="sm" />
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};