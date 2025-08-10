import React from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ChevronLeft, ChevronRight, Save, Square } from "lucide-react";
import { useTranslation } from "react-i18next";

interface MobileActionDockProps {
  isPremium: boolean;
  onPrev: () => void;
  onNext: () => void;
  onSave?: () => void;
  onEnd?: () => void;
  canPrev?: boolean;
  canNext?: boolean;
  isSaving?: boolean;
  className?: string;
}

export const MobileActionDock: React.FC<MobileActionDockProps> = ({
  isPremium,
  onPrev,
  onNext,
  onSave,
  onEnd,
  canPrev = true,
  canNext = true,
  isSaving = false,
  className,
}) => {
  const { t } = useTranslation();

  return (
    <nav
      className={cn(
        "fixed bottom-0 left-0 right-0 z-40",
        "bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80",
        "border-t border-border",
        "px-3 pt-2 pb-[calc(env(safe-area-inset-bottom)+8px)]",
        "shadow-[0_-6px_24px_hsl(var(--foreground)/0.06)]",
        className
      )}
      aria-label={t("common.navigation", "Navigation")}
    >
      <div className="mx-auto max-w-7xl">
        <div className="grid grid-cols-4 gap-2">
          <Button
            variant="outline"
            className="h-12 flex flex-col items-center justify-center gap-0.5 rounded-xl"
            onClick={onPrev}
            disabled={!canPrev}
            aria-label={t("nav.prev", "Back")}
          >
            <ChevronLeft className="w-5 h-5" />
            <span className="text-[11px] leading-none">{t("nav.prev", "Back")}</span>
          </Button>

          <Button
            className="h-12 flex flex-col items-center justify-center gap-0.5 rounded-xl"
            onClick={onNext}
            disabled={!canNext}
            aria-label={t("nav.next", "Next")}
          >
            <ChevronRight className="w-5 h-5" />
            <span className="text-[11px] leading-none">{t("nav.next", "Next")}</span>
          </Button>

          {isPremium && onSave && (
            <Button
              variant="secondary"
              className="h-12 flex flex-col items-center justify-center gap-0.5 rounded-xl"
              onClick={onSave}
              disabled={isSaving}
              aria-label={t("nav.save", "Save")}
            >
              <Save className="w-5 h-5" />
              <span className="text-[11px] leading-none">{t("nav.save", "Save")}</span>
            </Button>
          )}

          {isPremium && onEnd && (
            <Button
              variant="destructive"
              className="h-12 flex flex-col items-center justify-center gap-0.5 rounded-xl"
              onClick={onEnd}
              aria-label={t("nav.endSession", "End Session")}
            >
              <Square className="w-5 h-5" />
              <span className="text-[11px] leading-none">{t("nav.end", "End")}</span>
            </Button>
          )}
        </div>
      </div>
    </nav>
  );
};

export default MobileActionDock;
