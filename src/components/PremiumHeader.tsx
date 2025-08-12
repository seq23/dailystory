import { useState, useEffect, useRef } from "react";
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
  BookOpen, 
  LogOut, 
  Crown, 
  Bug, 
  User,
  Settings,
  ChevronDown,
  PanelLeft,
  Wand
} from "lucide-react";
import type { UserInfo } from "@/types";
import { SidebarTrigger, useSidebar } from "@/components/ui/sidebar";
import { useIsMobile } from "@/hooks/use-mobile";
import { useTranslation } from "react-i18next";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { ChildQuickSwitcher } from "@/components/ChildQuickSwitcher";
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

  // Set CSS var for header height so sidebar can offset on tablets
  useEffect(() => {
    const el = headerRef.current;
    if (!el) return;
    const setVar = () => {
      const h = el.getBoundingClientRect().height;
      document.documentElement.style.setProperty('--app-header-height', `${h}px`);
    };
    setVar();
    const ro = new ResizeObserver(() => setVar());
    ro.observe(el);
    window.addEventListener('resize', setVar);
    return () => {
      ro.disconnect();
      window.removeEventListener('resize', setVar);
    };
  }, []);

  const getAvatarUrl = () => {
    if (userInfo.avatar?.type && userInfo.avatar?.skinTone) {
      // Use public folder path for proper access
      const url = `/avatar-${userInfo.avatar.type}-${userInfo.avatar.skinTone}.jpg`;
      console.log('🎭 Avatar URL generated:', url, 'for user:', userInfo.name, 'avatar:', userInfo.avatar);
      return url;
    }
    console.log('🎭 No avatar data found for user:', userInfo.name, 'avatar:', userInfo.avatar);
    return undefined;
  };

  const hasSelectedAvatar = userInfo.avatar?.type && userInfo.avatar?.skinTone;

  return (
    <header ref={headerRef} className="bg-white/95 backdrop-blur-sm shadow-sm border-b sticky top-0 z-50">
      <div className="container mx-auto px-4 pr-[env(safe-area-inset-right)] py-3">
        <div className="flex justify-between items-center gap-2 min-w-0">
          {/* Logo and Title */}
          <div className="flex items-center gap-3 min-w-0">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <SidebarTrigger className="mr-1" />
                </TooltipTrigger>
                <TooltipContent side="bottom">Open navigation</TooltipContent>
              </Tooltip>
            </TooltipProvider>
            <div className="p-2 bg-gradient-primary rounded-lg">
              <BookOpen className="w-6 h-6 text-white" />
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

          {/* User Avatar and Actions */}
          <div className="flex items-center gap-3 shrink-0">

            {/* Avatar with Dropdown + Child badge overlay */}
            <div className="relative">
              <DropdownMenu open={isDropdownOpen} onOpenChange={setIsDropdownOpen}>
                <DropdownMenuTrigger asChild>
                  <Button 
                    variant="ghost" 
                    className="relative z-10 flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors shrink-0"
                  >
                    <Avatar className="w-8 h-8">
                      <AvatarImage 
                        src={getAvatarUrl()} 
                        alt={userInfo.name}
                        onError={(e) => {
                          console.log('🎭 Avatar image failed to load:', getAvatarUrl());
                          console.log('🎭 Image error event:', e);
                        }}
                        onLoad={() => {
                          console.log('🎭 Avatar image loaded successfully:', getAvatarUrl());
                        }}
                      />
                      <AvatarFallback className="bg-gradient-primary text-white text-sm font-semibold">
                        {hasSelectedAvatar ? "" : userInfo.name.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="text-left hidden sm:block">
                      <p className="text-sm font-medium text-gray-800">{userInfo.name}</p>
                      <p className="text-xs text-gray-600">
                        {userInfo.grade === 'PreK' ? 'Pre-K' : `Grade ${userInfo.grade}`}
                      </p>
                    </div>
                    <ChevronDown className="w-4 h-4 text-gray-500" />
                  </Button>
                </DropdownMenuTrigger>
                
                <DropdownMenuContent align="end" className="w-56 z-50 bg-popover shadow-md">
                  <div className="px-3 py-2">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium">{userInfo.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {userInfo.age} years old • {userInfo.grade === 'PreK' ? 'Pre-K' : `Grade ${userInfo.grade}`}
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
              <ChildQuickSwitcher className="absolute bottom-[-14px] -left-3 z-0 md:-bottom-1 md:-left-2" size="sm" />
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};