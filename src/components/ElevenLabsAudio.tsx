import { useState, useRef, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Play, Square, Crown, Mic } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useIsMobile } from "@/hooks/use-mobile";
import { EnhancedAudioService } from "@/services/enhancedAudioService";
import type { UserInfo } from "@/types";

interface ElevenLabsAudioProps {
  text: string;
  userInfo: UserInfo;
  isPremium?: boolean;
  onUpgrade?: () => void;
  currentPage?: number;
  totalPages?: number;
  isExtendedPage?: boolean; // True if this page was added beyond the original 10
  difficulty?: 'beginner' | 'easy' | 'medium' | 'hard' | 'expert';
  onWordHighlight?: (wordIndex: number) => void;
}

export const ElevenLabsAudio = ({ 
  text, 
  userInfo, 
  isPremium = false, 
  onUpgrade, 
  currentPage = 0, 
  totalPages = 1,
  isExtendedPage = false,
  difficulty = 'easy',
  onWordHighlight 
}: ElevenLabsAudioProps) => {
  const { t } = useTranslation();
  const { isMobileOrTablet, isCapacitor } = useIsMobile();
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [voiceCommandsEnabled, setVoiceCommandsEnabled] = useState(false);
  const [audioService] = useState(() => new EnhancedAudioService());
  const [hasPlayedThisPage, setHasPlayedThisPage] = useState(false);
  const { toast } = useToast();

  // Enhanced audio service handles free limits internally
  const maxFreePages = 10;
  const isWithinFreeLimit = currentPage < maxFreePages;
  const isAfterFreeLimit = currentPage >= maxFreePages;
  const canUseAudio = isPremium || isWithinFreeLimit;
  const shouldShowCrown = !isPremium && (hasPlayedThisPage || isAfterFreeLimit);

  // Mobile audio initialization
  useEffect(() => {
    if (isMobileOrTablet) {
      // Initialize mobile audio on component mount
      audioService.getPlaybackStatus(); // This will trigger mobile audio initialization
    }
  }, [audioService, isMobileOrTablet]);

  // Enhanced audio playback using new service
  const playAudio = async () => {
    if (!isPremium && isAfterFreeLimit) {
      // Don't play, just show upgrade UI
      return;
    }

    if (!isPremium && hasPlayedThisPage) {
      // Don't play second time on same page for free users
      return;
    }

    setIsLoading(true);
    
    try {
      await audioService.playText({
        text,
        difficulty,
        userInfo,
        isPremium,
        enableHighlighting: onWordHighlight !== undefined,
        onWordHighlight: (wordIndex: number) => {
          console.log(`🎯 ElevenLabs: Highlighting word ${wordIndex}`);
          onWordHighlight?.(wordIndex);
        },
        currentPage
      });
      
      setIsPlaying(true);
      
      // Mark page as played for free users
      if (!isPremium) {
        setHasPlayedThisPage(true);
      }
    } catch (error) {
      console.error('Enhanced audio playback error:', error);
      
      toast({
        title: t("audioReading.audioError", "Audio Error"),
        description: isMobileOrTablet ? 
          t("audioReading.mobileAudioError", "Could not play audio. On mobile devices, ensure sound is enabled and try again.") :
          t("audioReading.audioPlayError", "Could not play audio. Please try again."),
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };


  const stopAudio = () => {
    audioService.stopAudio();
    setIsPlaying(false);
  };

  // Premium voice commands toggle
  const toggleVoiceCommands = () => {
    if (!isPremium) {
      onUpgrade?.();
      return;
    }

    if (voiceCommandsEnabled) {
      audioService.stopVoiceCommands();
      setVoiceCommandsEnabled(false);
      toast({
        title: t("audioReading.voiceCommandsDisabled", "Voice Commands Disabled"),
        description: t("audioReading.voiceCommandsOff", "Voice commands are now off"),
        duration: 2000,
      });
    } else {
      audioService.startVoiceCommands();
      setVoiceCommandsEnabled(true);
      toast({
        title: t("audioReading.voiceCommandsEnabled", "Voice Commands Enabled"), 
        description: t("audioReading.voiceCommandsInstructions", "Try saying 'next page', 'read slower', or 'what does [word] mean?'"),
        duration: 4000,
      });
    }
  };

  // Reset page play tracking when moving to a new page
  useEffect(() => {
    setHasPlayedThisPage(false);
  }, [currentPage]);

  // Enhanced audio service status monitoring with better frequency
  useEffect(() => {
    const checkStatus = () => {
      const status = audioService.getPlaybackStatus();
      if (status.isPlaying !== isPlaying) {
        console.log(`🔄 Audio state sync: ${isPlaying} → ${status.isPlaying}`);
        setIsPlaying(status.isPlaying);
      }
    };

    const interval = setInterval(checkStatus, 500); // Check more frequently
    return () => clearInterval(interval);
  }, [audioService, isPlaying]);

  useEffect(() => {
    return () => {
      audioService.stopAudio();
      audioService.stopVoiceCommands();
    };
  }, [audioService]);

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <div className="relative">
        <Button
          id="elevenlabs-play-toggle"
          onClick={isPlaying ? stopAudio : playAudio}
          disabled={isLoading || shouldShowCrown}
          variant="outline"
          size={isMobileOrTablet ? "default" : "sm"}
          className={`gap-2 ${isMobileOrTablet ? 'min-h-[44px] px-4' : ''} ${shouldShowCrown ? 'opacity-50' : ''}`} // iOS/Android touch target size
        >
          {isLoading ? (
            <div className="w-4 h-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          ) : isPlaying ? (
            <Square className="w-4 h-4" />
          ) : (
            <Play className="w-4 h-4" />
          )}
          {isLoading ? t("audioReading.generating", "Generating...") : isPlaying ? t("audioReading.stop", "Stop") : t("audioReading.playAudio", "Play Audio")}
        </Button>
        {shouldShowCrown && (
          <Crown className="w-4 h-4 absolute -top-1 -right-1 text-yellow-500" />
        )}
      </div>

      {/* Premium Voice Commands Button */}
      {isPremium && (
        <Button
          id="elevenlabs-voice-toggle"
          onClick={toggleVoiceCommands}
          variant={voiceCommandsEnabled ? "default" : "outline"}
          size={isMobileOrTablet ? "default" : "sm"}
          className={`gap-2 ${isMobileOrTablet ? 'min-h-[44px] px-4' : ''}`}
        >
          <Mic className={`w-4 h-4 ${voiceCommandsEnabled ? 'animate-pulse' : ''}`} />
          Voice Commands
        </Button>
      )}

      {!isPremium && shouldShowCrown && (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                onClick={() => onUpgrade ? onUpgrade() : (window.location.href = '/auth')} 
                variant="outline" 
                size={isMobileOrTablet ? "default" : "sm"}
                className={isMobileOrTablet ? 'min-h-[44px] px-4' : ''}
              >
                {t("audioReading.upgrade", "Upgrade")}
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>
                {isAfterFreeLimit 
                  ? "More than 10 audio plays require Premium upgrade" 
                  : "Upgrade to Premium for unlimited audio plays per page"
                }
              </p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )}
    </div>
  );
};