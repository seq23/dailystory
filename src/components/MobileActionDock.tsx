import React from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Volume2, Mic, Save, Square } from "lucide-react";
import { useTranslation } from "react-i18next";

interface MobileActionDockProps {
  isPremium: boolean;
  onPlayAudio?: () => void;
  onVoiceCommand?: () => void;
  onSave?: () => void;
  onEnd?: () => void;
  isSaving?: boolean;
  className?: string;
}

export const MobileActionDock: React.FC<MobileActionDockProps> = ({
  isPremium,
  onPlayAudio,
  onVoiceCommand,
  onSave,
  onEnd,
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
              onClick={onPlayAudio}
              aria-label={t("audioReading.playAudio", "Play audio")}
            >
              <Volume2 className="w-5 h-5" />
              <span className="text-[11px] leading-none">{t("audioReading.play", "Audio")}</span>
            </Button>

            <Button
              variant="outline"
              className="h-12 flex flex-col items-center justify-center gap-0.5 rounded-xl"
              onClick={onVoiceCommand}
              aria-label={t("audioReading.voiceCommands", "Voice")}
            >
              <Mic className="w-5 h-5" />
              <span className="text-[11px] leading-none">{t("audioReading.voice", "Voice")}</span>
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
