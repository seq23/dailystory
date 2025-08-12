import React, { useMemo } from "react";
import { useChildProfiles } from "@/hooks/useChildProfiles";

import { useTranslation } from "react-i18next";

import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

import { Plus } from "lucide-react";

interface ChildQuickSwitcherProps {
  className?: string;
  size?: 'sm' | 'md';
}

function getInitial(fullName?: string | null) {
  if (!fullName) return "";
  const first = fullName.trim().split(/\s+/)[0] || "";
  return first.charAt(0).toUpperCase();
}

export function ChildQuickSwitcher({ className, size = 'md' }: ChildQuickSwitcherProps) {
  const { children, activeChild, loading } = useChildProfiles();
  
  const { t } = useTranslation();
  

  const activeInitial = useMemo(() => getInitial(activeChild?.display_name), [activeChild?.display_name]);
  const activeFullName = activeChild?.display_name || "";


  const openParentControls = () => {
    try {
      window.dispatchEvent(new Event('open-parent-controls'));
    } catch {}
  };

  const hasChildren = children && children.length > 0;

  return (
    <div className={cn("flex items-center", className)}>
      <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              {hasChildren ? (
                <button
                  type="button"
                  onClick={openParentControls}
                  aria-label={t('header.quickChildSwitcher.readingAs', { defaultValue: 'Reading as' }) + (activeFullName ? `: ${activeFullName}` : '')}
                      className={cn(
                        "rounded-full inline-flex items-center justify-center font-black leading-none ring-2 ring-offset-1 ring-offset-background select-none tracking-tight drop-shadow-sm z-10",
                        size === "sm"
                          ? "h-8 w-8 text-[1.68rem] leading-[0.9]"
                          : "h-9 w-9 md:h-9 md:w-9 text-[1.6rem] md:text-[1.7rem]",
                        "ring-background bg-primary text-primary-foreground hover:bg-primary/90 transition",
                        loading && "opacity-70",
                      )}
                >
                  {activeInitial || "–"}
                </button>
              ) : (
                <button
                  type="button"
                  onClick={openParentControls}
                  className={cn(
                    "rounded-full inline-flex items-center justify-center font-semibold",
                    size === "sm" ? "h-7 w-7" : "h-9 w-9",
                    "border border-dashed text-muted-foreground hover:bg-muted/20 transition",
                  )}
                  aria-label={t('header.quickChildSwitcher.add', { defaultValue: 'Add child' })}
                >
                  <Plus className="h-4 w-4" />
                </button>
              )}
            </TooltipTrigger>
            <TooltipContent sideOffset={8}>
              <span>
                {t('header.quickChildSwitcher.readingAs', { defaultValue: 'Reading as' })}
                {activeFullName ? `: ${activeFullName}` : ''}
              </span>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
    </div>
  );
}
