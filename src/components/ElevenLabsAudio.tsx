import { useState, useRef, useEffect, forwardRef, useImperativeHandle } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

import { Play, Square, Crown, Mic } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { ToastAction } from "@/components/ui/toast";
import { useIsMobile } from "@/hooks/use-mobile";
import { EnhancedAudioService } from "@/services/enhancedAudioService";
import { VoiceCommandController } from "@/components/VoiceCommandController";
import type { VoiceCommandControllerHandle } from "@/components/VoiceCommandController";
import type { UserInfo } from "@/types";
import { supabase } from "@/integrations/supabase/client";
import { VocabularyTrackingService } from "@/services/vocabularyTrackingService";

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

export interface ElevenLabsAudioHandle {
  play: () => Promise<void> | void;
  stop: () => void;
  toggleVoiceCommands: () => void;
  isPlaying: boolean;
}

export const ElevenLabsAudio = forwardRef<ElevenLabsAudioHandle, ElevenLabsAudioProps>(({ 
  text, 
  userInfo, 
  isPremium = false, 
  onUpgrade, 
  currentPage = 0, 
  totalPages = 1,
  isExtendedPage = false,
  difficulty = 'easy',
  onWordHighlight 
}: ElevenLabsAudioProps, ref) => {
  const { t } = useTranslation();
  const { isMobileOrTablet, isCapacitor, hasTouchCapability } = useIsMobile();
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [voiceCommandsEnabled, setVoiceCommandsEnabled] = useState(false);
  const vcRef = useRef<VoiceCommandControllerHandle | null>(null);
  const [audioService] = useState(() => new EnhancedAudioService());
  const [hasPlayedThisPage, setHasPlayedThisPage] = useState(false);
  const { toast, dismiss } = useToast();
  const voiceTipsShownRef = useRef(false);
  const emitStatus = (s: 'idle'|'listening'|'processing') => window.dispatchEvent(new CustomEvent('voice:status', { detail: { status: s } }));

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

  const hasWebSpeech = typeof window !== 'undefined' && ((('webkitSpeechRecognition' in window) || ('SpeechRecognition' in window)));
  const useWebSpeech = hasWebSpeech && !hasTouchCapability && !isMobileOrTablet;

  if (useWebSpeech) {
    if (voiceCommandsEnabled) {
      audioService.stopVoiceCommands();
      setVoiceCommandsEnabled(false);
      emitStatus('idle');
      dismiss();
      toast({
        title: t("audioReading.voiceCommandsDisabled", "Voice Commands Disabled"),
        description: t("audioReading.voiceCommandsOff", "Voice commands are now off"),
        duration: 2000,
      });
    } else {
      audioService.startVoiceCommands();
      setVoiceCommandsEnabled(true);
      emitStatus('listening');
      if (!voiceTipsShownRef.current) {
        toast({
          title: t("audioReading.voiceCommandsEnabled", "Voice Commands Enabled"),
          description: "Try: 'next page', 'pause', 'resume', 'read slower'",
          duration: 3500,
          action: (
            <ToastAction altText="Open voice commands help" onClick={() => window.dispatchEvent(new CustomEvent('voice:openHelp'))}>
              Full list
            </ToastAction>
          ),
        });
        voiceTipsShownRef.current = true;
      }
    }
    return;
  }

  // Headless Whisper path (no modal)
  if (voiceCommandsEnabled) {
    vcRef.current?.stop?.();
    setVoiceCommandsEnabled(false);
    emitStatus('idle');
    dismiss();
    toast({
      title: t("audioReading.voiceCommandsDisabled", "Voice Commands Disabled"),
      description: t("audioReading.voiceCommandsOff", "Voice commands are now off"),
      duration: 2000,
    });
  } else {
    vcRef.current?.start?.();
    setVoiceCommandsEnabled(true);
    emitStatus('listening');
    if (!voiceTipsShownRef.current) {
      toast({
        title: t("audioReading.voiceCommandsEnabled", "Voice Commands Enabled"), 
        description: "Try: 'next page', 'pause', 'resume', 'read slower'",
        duration: 3500,
        action: (
          <ToastAction altText="Open voice commands help" onClick={() => window.dispatchEvent(new CustomEvent('voice:openHelp'))}>
            Full list
          </ToastAction>
        ),
      });
      voiceTipsShownRef.current = true;
    }
  }
};

  // Expose imperative methods to parent (e.g., bottom dock)
  useImperativeHandle(ref, () => ({
    play: playAudio,
    stop: stopAudio,
    toggleVoiceCommands,
    get isPlaying() { return isPlaying; }
  }), [isPlaying]);

const handleHeadlessCommand = (cmd: string) => {
  try {
    const result = (audioService as any).processVoiceCommand?.(cmd);
    console.log('🎙️ Headless voice command processed:', { cmd, result });
    if (result && result.recognized && typeof result.action === 'function') {
      window.dispatchEvent(new CustomEvent('voice:status', { detail: { status: 'processing' } }));
      try {
        result.action();
        toast({ title: t('audioReading.voiceCommandRun', 'Command executed'), description: cmd, duration: 1500 });
      } finally {
        window.dispatchEvent(new CustomEvent('voice:status', { detail: { status: 'listening' } }));
      }
    } else {
      toast({ title: t('audioReading.voiceNotRecognized', 'Not recognized'), description: t('audioReading.tryCommand', "Try 'next page' or 'pause'"), duration: 2000 });
    }
  } catch (e) {
    console.error('Headless voice processing failed', e);
    toast({ title: t('audioReading.voiceCommandError', 'Voice command error'), description: String(e), variant: 'destructive' });
  } finally {
    if (voiceCommandsEnabled) {
      setTimeout(() => vcRef.current?.start?.(), 150);
    }
  }
};

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

// Voice vocabulary events handler
useEffect(() => {
  const onVocab = async (evt: Event) => {
    const { detail } = evt as CustomEvent<{ type: 'define'|'pronounce'|'save'; word: string }>;
    if (!detail?.word) return;
    const cleanWord = detail.word.replace(/[.,!?;:'"()]/g, '').trim();
    try {
      if (detail.type === 'pronounce') {
        await audioService.playText({ text: cleanWord, difficulty: 'easy', userInfo, isPremium: false, enableHighlighting: false });
        return;
      }
      const userLang = userInfo?.nativeLanguage || 'en';
      const { data, error } = await supabase.functions.invoke('word-dictionary', {
        body: { word: cleanWord, userLevel: difficulty, userLanguage: userLang }
      });
      const definition: string = (!error && data?.definition) ? data.definition : cleanWord;
      await VocabularyTrackingService.logEncounter(cleanWord, definition, difficulty);
      if (detail.type === 'define') {
        toast({ title: cleanWord, description: definition, duration: 4000 });
      } else if (detail.type === 'save') {
        toast({ title: t('vocab.saved', 'Saved to Vocabulary'), description: cleanWord, duration: 2000 });
      }
    } catch (err) {
      console.error('voice:vocab handler error', err);
      toast({ title: t('vocab.error', 'Vocabulary error'), description: String(err), variant: 'destructive' });
    }
  };
  window.addEventListener('voice:vocab', onVocab as EventListener);
  return () => window.removeEventListener('voice:vocab', onVocab as EventListener);
}, [audioService, userInfo, difficulty, toast, t]);

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <div className="relative">
        <Button
          id="elevenlabs-play-toggle"
          onClick={isPlaying ? stopAudio : playAudio}
          disabled={isLoading || (!isPlaying && shouldShowCrown)}
          variant="outline"
          size={isMobileOrTablet ? "default" : "sm"}
          className={`gap-2 ${isMobileOrTablet ? 'min-h-[44px] px-4' : ''} ${shouldShowCrown && !isPlaying ? 'opacity-50' : ''}`} // iOS/Android touch target size
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
          <Crown className="w-4 h-4 absolute -top-1 -right-1 text-[hsl(var(--warning))]" />
        )}
      </div>

      {/* Voice Commands Button */}
      {isPremium ? (
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
      ) : (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <span>
                <Button
                  id="elevenlabs-voice-toggle"
                  disabled
                  variant="outline"
                  size={isMobileOrTablet ? "default" : "sm"}
                  className={`gap-2 ${isMobileOrTablet ? 'min-h-[44px] px-4' : ''}`}
                >
                  <Mic className="w-4 h-4" />
                  Voice Commands
                </Button>
              </span>
            </TooltipTrigger>
            <TooltipContent>
              Voice Commands are a Premium feature
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
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

{/* Headless voice controller (no UI) */}
<VoiceCommandController ref={vcRef} headless onCommand={handleHeadlessCommand} />
    </div>
  );
});