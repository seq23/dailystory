import React from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Volume2, Mic, Save, Square } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
interface MobileActionDockProps {
  isPremium: boolean;
  onPlayAudio?: () => void;
  onVoiceCommand?: () => void;
  onSave?: () => void;
  onEnd?: () => void;
  isSaving?: boolean;
  audioDisabled?: boolean;
  className?: string;
}

export const MobileActionDock: React.FC<MobileActionDockProps> = ({
  isPremium,
  onPlayAudio,
  onVoiceCommand,
  onSave,
  onEnd,
  isSaving = false,
  audioDisabled = false,
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
            <TooltipProvider>
              {/* Audio */}
              <Tooltip>
                <TooltipTrigger asChild>
                  <span className="inline-flex">
                    <Button
                      variant="outline"
                      className="h-12 flex flex-col items-center justify-center gap-0.5 rounded-xl"
                      onClick={onPlayAudio}
                      disabled={audioDisabled}
                      aria-label={t("audioReading.playAudio", "Play audio")}
                    >
                      <Volume2 className="w-5 h-5" />
                      <span className="text-[11px] leading-none">{t("audioReading.play", "Audio")}</span>
                    </Button>
                  </span>
                </TooltipTrigger>
                <TooltipContent side="top">
                  {audioDisabled
                    ? t("audioReading.audioUsedTooltip", "Audio used (1x per page for free users)")
                    : t("tooltips.dock.play", "Play the current page with narration")}
                </TooltipContent>
              </Tooltip>

              {/* Voice Commands */}
              <Tooltip>
                <TooltipTrigger asChild>
                  <span className="inline-flex">
                    <Button
                      variant="outline"
                      className="h-12 flex flex-col items-center justify-center gap-0.5 rounded-xl"
                      onClick={onVoiceCommand}
                      disabled={!isPremium || !onVoiceCommand}
                      aria-label={t("audioReading.voiceCommands", "Voice")}
                    >
                      <Mic className="w-5 h-5" />
                      <span className="text-[11px] leading-none">{t("audioReading.voice", "Voice")}</span>
                    </Button>
                  </span>
                </TooltipTrigger>
                <TooltipContent side="top">
                  {!isPremium
                    ? t("tooltips.dock.voicePremium", "Premium only. Voice commands / feedback.")
                    : t("tooltips.dock.voice", "Use voice commands like 'next page' or 'repeat")}
                </TooltipContent>
              </Tooltip>

              {/* Save */}
              <Tooltip>
                <TooltipTrigger asChild>
                  <span className="inline-flex">
                    <Button
                      variant="secondary"
                      className="h-12 flex flex-col items-center justify-center gap-0.5 rounded-xl"
                      onClick={onSave}
                      disabled={!isPremium || isSaving || !onSave}
                      aria-label={t("nav.save", "Save")}
                    >
                      <Save className="w-5 h-5" />
                      <span className="text-[11px] leading-none">{t("nav.save", "Save")}</span>
                    </Button>
                  </span>
                </TooltipTrigger>
                <TooltipContent side="top">
                  {!isPremium
                    ? t("tooltips.dock.savePremium", "Premium only. Save to Library.")
                    : t("tooltips.dock.save", "Save your story to the Library")}
                </TooltipContent>
              </Tooltip>

              {/* End Session */}
              <Tooltip>
                <TooltipTrigger asChild>
                  <span className="inline-flex">
                    <Button
                      variant="destructive"
                      className="h-12 flex flex-col items-center justify-center gap-0.5 rounded-xl"
                      onClick={onEnd}
                      disabled={!isPremium || !onEnd}
                      aria-label={t("nav.endSession", "End Session")}
                    >
                      <Square className="w-5 h-5" />
                      <span className="text-[11px] leading-none">{t("nav.end", "End")}</span>
                    </Button>
                  </span>
                </TooltipTrigger>
                <TooltipContent side="top">
                  {!isPremium
                    ? t("tooltips.dock.endPremium", "Premium only. End session without timer")
                    : t("tooltips.dock.end", "End the session and view stats")}
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
      </div>
    </nav>
  );
};

export default MobileActionDock;
