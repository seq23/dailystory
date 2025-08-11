import React, { useMemo, useState } from "react";
import { useChildProfiles } from "@/hooks/useChildProfiles";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "react-i18next";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { Separator } from "@/components/ui/separator";
import { Plus } from "lucide-react";

interface ChildQuickSwitcherProps {
  className?: string;
}

function getFirstName(fullName?: string | null) {
  if (!fullName) return "";
  const first = fullName.trim().split(/\s+/)[0] || "";
  // Trim very long first names to avoid overflow
  return first.length > 8 ? first.slice(0, 8) + "…" : first;
}

export function ChildQuickSwitcher({ className }: ChildQuickSwitcherProps) {
  const { children, activeChildId, setActiveChild, activeChild, loading } = useChildProfiles();
  const { toast } = useToast();
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);

  const activeLabel = useMemo(() => getFirstName(activeChild?.display_name), [activeChild?.display_name]);

  const handleSelect = async (id: string) => {
    try {
      await setActiveChild(id || null);
      toast({ title: t('parent.children.updated') });
      setOpen(false);
    } catch (e: any) {
      toast({ title: e?.message || t('parent.manager.toasts.failedSave'), variant: "destructive" });
    }
  };

  const openParentControls = () => {
    try {
      window.dispatchEvent(new Event('open-parent-controls'));
      setOpen(false);
    } catch {}
  };

  const hasChildren = children && children.length > 0;

  return (
    <div className={cn("flex items-center", className)}>
      <TooltipProvider>
        <Popover open={open} onOpenChange={setOpen}>
          <Tooltip>
            <TooltipTrigger asChild>
              <PopoverTrigger asChild>
                {hasChildren ? (
                  <button
                    type="button"
                    aria-label={t('header.quickChildSwitcher.readingAs', { defaultValue: 'Reading as' }) + (activeLabel ? `: ${activeLabel}` : '')}
                    className={cn(
                      "h-9 w-9 rounded-full inline-flex items-center justify-center text-xs font-semibold ring-2",
                      "ring-primary/70 bg-primary text-primary-foreground hover:bg-primary/90 transition",
                      loading && "opacity-70",
                    )}
                  >
                    {activeLabel ? activeLabel : "–"}
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={openParentControls}
                    className={cn(
                      "h-9 w-9 rounded-full inline-flex items-center justify-center text-xs font-semibold",
                      "border border-dashed text-muted-foreground hover:bg-muted/20 transition",
                    )}
                    aria-label={t('header.quickChildSwitcher.add', { defaultValue: 'Add child' })}
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                )}
              </PopoverTrigger>
            </TooltipTrigger>
            <TooltipContent sideOffset={8}>
              <span>
                {t('header.quickChildSwitcher.readingAs', { defaultValue: 'Reading as' })}
                {activeLabel ? `: ${activeLabel}` : ''}
              </span>
            </TooltipContent>
          </Tooltip>

          {hasChildren && (
            <PopoverContent className="w-64 max-h-[75vh] md:max-h-[65vh] overflow-auto z-[60] bg-popover shadow-md">
              <div className="flex flex-col">
                {children.map((c) => {
                  const first = getFirstName(c.display_name);
                  const isActive = c.id === activeChildId;
                  return (
                    <button
                      key={c.id}
                      onClick={() => handleSelect(c.id)}
                      className={cn(
                        "w-full text-left px-3 py-2 rounded-md transition",
                        "hover:bg-muted/60",
                        isActive ? "bg-primary/10" : "",
                      )}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="min-w-0">
                          <div className="truncate font-medium">{c.display_name || first || c.id}</div>
                          {/* Optional secondary info: grade */}
                          {c.grade_level ? (
                            <div className="text-xs text-muted-foreground truncate">{String(c.grade_level)}</div>
                          ) : null}
                        </div>
                        {isActive ? (
                          <span className="shrink-0 h-2.5 w-2.5 rounded-full bg-primary" aria-hidden />
                        ) : null}
                      </div>
                    </button>
                  );
                })}
              </div>
              <Separator className="my-2" />
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={openParentControls}
                  className={cn(
                    "px-3 py-1.5 text-sm rounded-md border",
                    "hover:bg-muted/40 transition",
                  )}
                >
                  {t('header.quickChildSwitcher.manage', { defaultValue: 'Manage Children' })}
                </button>
              </div>
            </PopoverContent>
          )}
        </Popover>
      </TooltipProvider>
    </div>
  );
}
