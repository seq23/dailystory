import { uiText, useUiLanguage } from "@/i18n/uiText";
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
  DropdownMenuLabel,
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
  ChevronDown,
  Loader2,
  Plus
} from "lucide-react";
import type { UserInfo } from "@/types";
import { SidebarTrigger, useSidebar } from "@/components/ui/sidebar";
import { useIsMobile } from "@/hooks/use-mobile";
import { useTranslation } from "react-i18next";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useChildProfiles } from "@/hooks/useChildProfiles";
import { childAvatarUrl, childSummary } from "@/components/children/childInfo";
import { openChildDialog } from "@/components/children/ChildDialog";
import { toast } from "sonner";

interface PremiumHeaderProps {
  userInfo: UserInfo;
  isPremium: boolean;
  devTestMode: boolean;
  /** Developer menu items (Test Mode): dev builds and admins only. */
  showDevTools?: boolean;
  /** Real paid/code Premium, for the crown. */
  hasPremium?: boolean;
  subscriptionTier?: string;
  onSignOut: () => void;
  onToggleDevMode: () => void;
  onProfileClick: () => void;
  /** Open the grown-up's settings (plan, code, children, email). */
  onGrownUpSettings?: () => void;
}

export const PremiumHeader = ({ 
  userInfo, 
  isPremium, 
  devTestMode, 
  showDevTools = false,
  hasPremium,
  subscriptionTier, 
  onSignOut, 
  onToggleDevMode,
  onProfileClick,
  onGrownUpSettings = onProfileClick,
}: PremiumHeaderProps) => {
  useUiLanguage();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const headerRef = useRef<HTMLElement | null>(null);

  const { open, openMobile, isMobile, toggleSidebar } = useSidebar();
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

  const { children, activeChild, setActiveChild, loading: childrenLoading, switchingToId } = useChildProfiles();

  return (
    <header ref={headerRef} className="bg-white/95 backdrop-blur-sm shadow-sm border-b sticky top-0 z-[70]">
      <div className="container mx-auto px-3 sm:px-4 pr-[env(safe-area-inset-right)] py-2 sm:py-3">
        <div className="flex justify-between items-center gap-2 min-w-0">
          {/* Logo and Title */}
          <div className="flex items-center gap-1.5 sm:gap-3 min-w-0">
            {/* Labelled menu button (no bare icons) */}
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={toggleSidebar}
              aria-expanded={isSidebarOpen}
              aria-label={isSidebarOpen ? uiText("Close menu") : uiText("Open menu")}
              className="h-10 px-2 sm:px-3 shrink-0 gap-0"
              data-testid="menu-button"
            >
              <span aria-hidden className="text-lg leading-none">☰</span>
              <span className="ml-1 text-xs sm:text-sm">{uiText("Menu")}</span>
            </Button>
            <a href="/" className="flex items-center gap-1 sm:gap-2 min-w-0" aria-label={uiText("Time-2-Read home")}>
              <img src="/icon-192.png" alt="" className="h-8 w-8 sm:h-9 sm:w-9 shrink-0" />
              <span className="text-sm sm:text-xl font-bold text-gray-900 whitespace-nowrap">{uiText("Time-2-Read")}</span>
            </a>
            {showDevTools && devTestMode && (
              <Badge variant="outline" className="border-orange-500 text-orange-600 text-xs">
                <Bug className="w-3 h-3 mr-1" />
                {uiText("Test Mode")}
              </Badge>
            )}
          </div>

          {/* Enhanced User Avatar and Actions */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">

            {/* "Reading as: Maya ▾": every child, + Add a child, Grown-up settings */}
            <DropdownMenu open={isDropdownOpen} onOpenChange={setIsDropdownOpen}>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="flex items-center gap-1.5 sm:gap-2 px-1.5 sm:px-3 py-1.5 sm:py-2 h-auto rounded-lg border hover:bg-gray-100 shrink-0"
                  data-testid="reader-switcher"
                  aria-label={activeChild ? `Reading as ${activeChild.display_name}. Tap to switch child` : uiText("Add a child")}
                >
                  {switchingToId ? (
                    <span className="w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center ring-2 ring-primary" aria-hidden><Loader2 className="w-4 h-4 animate-spin" /></span>
                  ) : activeChild ? (
                    <img src={childAvatarUrl(activeChild)} alt="" className="w-7 h-7 sm:w-8 sm:h-8 rounded-full object-cover ring-2 ring-primary" />
                  ) : (
                    <span className="w-8 h-8 rounded-full border border-dashed flex items-center justify-center"><Plus className="w-4 h-4" /></span>
                  )}
                  <span className="text-left leading-tight">
                    <span className="block text-[11px] text-gray-600" aria-live="polite" data-testid="reader-status">{switchingToId ? uiText("Switching…") : activeChild ? uiText("Reading as") : childrenLoading ? uiText("Loading…") : uiText("Who's reading?")}</span>
                    <span className="block text-sm font-semibold text-gray-900 max-w-[5.5rem] sm:max-w-[10rem] truncate" data-testid="reader-name">
                      {activeChild ? activeChild.display_name : childrenLoading ? "" : uiText("Add a child")}
                    </span>
                  </span>
                  <ChevronDown className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-500" aria-hidden />
                </Button>
              </DropdownMenuTrigger>

              {/* Scrolls inside the screen (27 Oct 2026: with many children, "Add another child" and
                  "Grown-up settings" fell below a phone screen and could not be reached).
                  Guard: src/test/guards/menu-back.test.ts. */}
              <DropdownMenuContent align="end" collisionPadding={8} className="w-72 z-[75] bg-popover shadow-md max-h-[var(--radix-dropdown-menu-content-available-height)] overflow-y-auto overscroll-contain" data-testid="reader-menu">
                <DropdownMenuLabel>{uiText("Who's reading?")}</DropdownMenuLabel>
                {children.map((c) => {
                  const current = activeChild?.id === c.id;
                  return (
                    <DropdownMenuItem
                      key={c.id}
                      className="cursor-pointer gap-3 py-2"
                      data-testid="reader-option"
                      onSelect={async (e) => {
                        if (current) return;
                        // The name changes at once and the button says "Switching…" while it
                        // saves (27 Oct 2026, live: seconds with no sign anything was happening).
                        setIsDropdownOpen(false);
                        try {
                          await setActiveChild(c.id);
                          toast.success(`${c.display_name} is reading now`);
                        } catch (err) {
                          toast.error(err instanceof Error ? err.message : "Please try again.");
                        }
                      }}
                    >
                      <img src={childAvatarUrl(c)} alt="" className={`w-9 h-9 rounded-full object-cover ${current ? "ring-2 ring-primary" : ""}`} />
                      <span className="flex-1 min-w-0">
                        <span className="block font-medium truncate">{c.display_name}</span>
                        {childSummary(c) && <span className="block text-xs text-muted-foreground">{childSummary(c)}</span>}
                      </span>
                      {switchingToId === c.id ? (
                        <Loader2 className="w-4 h-4 animate-spin" aria-label={uiText("Switching")} />
                      ) : current ? (
                        <span className="text-primary font-bold" aria-label={uiText("Reading now")}>✓</span>
                      ) : null}
                    </DropdownMenuItem>
                  );
                })}
                <DropdownMenuItem className="cursor-pointer" onSelect={() => openChildDialog()} data-testid="header-add-child">
                  <Plus className="w-4 h-4 mr-2" />
                  {children.length ? uiText("Add another child") : uiText("Add a child")}
                </DropdownMenuItem>

                <DropdownMenuSeparator />
                <DropdownMenuLabel className="text-xs font-normal text-muted-foreground">
                  {uiText("Grown-up")}{(hasPremium ?? isPremium) ? uiText(" · Premium") : ""}
                </DropdownMenuLabel>
                <DropdownMenuItem onSelect={onGrownUpSettings} className="cursor-pointer">
                  <Settings className="w-4 h-4 mr-2" />
                  {uiText("Grown-up settings (plan, code, children)")}
                </DropdownMenuItem>

                {showDevTools && (
                  <DropdownMenuItem onClick={onToggleDevMode} className="cursor-pointer">
                    <Bug className="w-4 h-4 mr-2" />
                    {devTestMode ? uiText("Disable") : uiText("Enable")} {uiText("Test Mode")}
                  </DropdownMenuItem>
                )}

                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={onSignOut} className="cursor-pointer text-red-600">
                  <LogOut className="w-4 h-4 mr-2" />
                  {uiText("Sign out")}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </header>
  );
};