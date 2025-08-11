import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Volume2, Mic, Save, Square, GraduationCap } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface MobileActionDockProps {
  isPremium: boolean;
  onPlayAudio?: () => void;
  onVoiceCommand?: () => void;
  onCoach?: () => void;
  onSave?: () => void;
  onEnd?: () => void;
  isSaving?: boolean;
  audioDisabled?: boolean;
  isAudioPlaying?: boolean;
  className?: string;
}

export const MobileActionDock: React.FC<MobileActionDockProps> = ({
  isPremium,
  onPlayAudio,
  onVoiceCommand,
  onCoach,
  onSave,
  onEnd,
  isSaving = false,
  audioDisabled = false,
  isAudioPlaying = false,
  className,
}) => {
  const { t } = useTranslation();

  const [vcStatus, setVcStatus] = useState<'idle'|'listening'|'processing'>('idle');
  const [vcLevel, setVcLevel] = useState(0);
  useEffect(() => {
    const onStatus = (e: any) => setVcStatus((e?.detail?.status || 'idle'));
    const onLevel = (e: any) => setVcLevel(Math.max(0, Math.min(1, Number(e?.detail?.level ?? 0))));
    window.addEventListener('voice:status', onStatus as EventListener);
    window.addEventListener('voice:level', onLevel as EventListener);
    return () => {
      window.removeEventListener('voice:status', onStatus as EventListener);
      window.removeEventListener('voice:level', onLevel as EventListener);
    };
  }, []);

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
          <div className="grid grid-flow-col auto-cols-max justify-center gap-1">
            <TooltipProvider>
              {/* Audio */}
              <Tooltip>
                <TooltipTrigger asChild>
                  <span className="inline-flex">
                    <Button
                      variant="outline"
                      className="h-12 flex flex-col items-center justify-center gap-0.5 rounded-xl"
                      onClick={onPlayAudio}
                      disabled={audioDisabled && !isAudioPlaying}
                      aria-label={isAudioPlaying ? t("audioReading.stop", "Stop") : t("audioReading.playAudio", "Read to me")}
                    >
                      {isAudioPlaying ? (
                        <Square className="w-5 h-5" />
                      ) : (
                        <Volume2 className="w-5 h-5" />
                      )}
                      <span className="text-[11px] leading-none">{isAudioPlaying ? t("audioReading.stop", "Stop") : t("audioReading.play", "Read")}</span>
                    </Button>
                  </span>
                </TooltipTrigger>
                <TooltipContent side="top">
                  {isAudioPlaying
                    ? t("tooltips.dock.stop", "Stop playback")
                    : audioDisabled
                      ? t("audioReading.audioUsedTooltip", "Audio used (1x per page for free users)")
                      : t("tooltips.dock.play", "Read this page to me")}
                </TooltipContent>
              </Tooltip>

              {/* Voice Commands */}
              <Tooltip>
                <TooltipTrigger asChild>
                  <span className="inline-flex">
                    <Button
                      variant="outline"
                      className={`h-12 flex flex-col items-center justify-center gap-0.5 rounded-xl ${vcStatus === 'listening' ? 'bg-[hsl(var(--warning))] text-white hover:bg-[hsl(var(--warning))]/90' : ''}`}
                      style={vcStatus === 'listening' ? { boxShadow: `0 0 ${4 + vcLevel * 10}px hsl(var(--primary))`, opacity: 0.95 } : undefined}
                      onClick={onVoiceCommand}
                      disabled={!isPremium || !onVoiceCommand}
                      aria-label={t("audioReading.voiceCommands", "Buddy")}
                    >
                      <Mic className="w-5 h-5 transition-transform" style={{ transform: vcStatus === 'listening' ? `scale(${1 + vcLevel * 0.05})` : undefined }} />
                      <span className="text-[11px] leading-none">{t("audioReading.voice", "Buddy")}</span>
                    </Button>
                  </span>
                </TooltipTrigger>
                <TooltipContent side="top">
                  {!isPremium
                    ? t("tooltips.dock.voicePremium", "Premium only. Voice commands / feedback.")
                    : t("tooltips.dock.voice", "Use voice commands like 'next page' or 'repeat")}
                </TooltipContent>
              </Tooltip>

              {/* Coach */}
              <Tooltip>
                <TooltipTrigger asChild>
                  <span className="inline-flex">
                    <Button
                      variant="outline"
                      className="h-12 flex flex-col items-center justify-center gap-0.5 rounded-xl"
                      onClick={onCoach}
                      disabled={!isPremium || !onCoach}
                      aria-label={t("audioReading.readingCoach", "Coach")}
                    >
                      <GraduationCap className="w-5 h-5" />
                      <span className="text-[11px] leading-none">{t("audioReading.coach", "Coach")}</span>
                    </Button>
                  </span>
                </TooltipTrigger>
                <TooltipContent side="top">
                  {!isPremium
                    ? t("tooltips.dock.coachPremium", "Premium only. Practice reading and get feedback")
                    : t("tooltips.dock.coach", "Practice reading and get feedback")}
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
                    ? t("tooltips.dock.endPremium", "Premium only. Untimed Sessions.")
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
