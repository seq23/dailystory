import { useState, useRef, useEffect, forwardRef, useImperativeHandle } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

import { Play, Square, Crown, Mic, Loader2 } from "lucide-react";
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
  const restoredRef = useRef(false);
  const voiceEnabledRef = useRef(false);
  const restartTimeoutRef = useRef<number | null>(null);
  const [audioService] = useState(() => new EnhancedAudioService());
  const [hasPlayedThisPage, setHasPlayedThisPage] = useState(false);
  const { toast, dismiss } = useToast();
  const voiceTipsShownRef = useRef(false);
  const speedMultiplierRef = useRef(1);
  const [vcStatus, setVcStatus] = useState<'idle'|'listening'|'processing'>('idle');
  const [vcLevel, setVcLevel] = useState(0);
  const burstCounterRef = useRef(0);
  const lastBurstTsRef = useRef(0);
  const emitStatus = (s: 'idle'|'listening'|'processing') =>
    window.dispatchEvent(new CustomEvent('voice:status', { detail: { status: s } }));

  // Enhanced audio service handles free limits internally
  const maxFreePages = 10;
  const isWithinFreeLimit = currentPage < maxFreePages;
  const isAfterFreeLimit = currentPage >= maxFreePages;
  const canUseAudio = isPremium || isWithinFreeLimit;
  const shouldShowCrown = !isPremium && (hasPlayedThisPage || isAfterFreeLimit);

  // Speed baseline calculator (mirror of service mapping)
  const getBaseSpeed = () => {
    const map: Record<typeof difficulty, number> = {
      beginner: 0.5,
      easy: 0.75,
      medium: 0.85,
      hard: 0.9,
      expert: 1.0,
    } as const;
    const base = map[difficulty] ?? 0.85;
    const ageMultiplier = userInfo && (userInfo as any).age && (userInfo as any).age <= 8 ? 0.9 : 1.0;
    return Math.max(0.4, Math.min(1.2, base * ageMultiplier));
  };

  // Mobile audio initialization
  useEffect(() => {
    if (isMobileOrTablet) {
      // Initialize mobile audio on component mount
      audioService.getPlaybackStatus(); // This will trigger mobile audio initialization
    }
  }, [audioService, isMobileOrTablet]);

  // Expose current user name for vocabulary storage key standardization
  useEffect(() => {
    (window as any).__currentUserName = userInfo?.name || 'guest';
  }, [userInfo?.name]);

  // Listen to voice status/level for mic button live indicators
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


  // Stop voice commands on unmount
  useEffect(() => {
    return () => {
      try { audioService.stopVoiceCommands(); } catch {}
      try { vcRef.current?.stop?.(); } catch {}
      try { emitStatus('idle'); } catch {}
    };
  }, [audioService]);

  // Restore voice command state from session
  useEffect(() => {
    try {
      const saved = sessionStorage.getItem('t2r_voice_commands');
      const userDisabled = (window as any).__t2r_vc_user_disabled === true;
      if (isPremium && saved === '1' && !userDisabled && !restoredRef.current) {
        (window as any).__t2r_vc_user_disabled = false;
        audioService.startVoiceCommands();
        setVoiceCommandsEnabled(true);
        voiceEnabledRef.current = true;
        emitStatus('listening');
        restoredRef.current = true;
      }
    } catch {}
  }, [isPremium, audioService]);

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
      const speed = getBaseSpeed() * speedMultiplierRef.current;
      await audioService.playText({
        text,
        difficulty,
        userInfo,
        isPremium,
        enableHighlighting: onWordHighlight !== undefined,
        onWordHighlight: (wordIndex: number) => {
          console.log(`🎯 ElevenLabs: Highlighting word ${wordIndex}`);
          try {
            const tokens = text.split(/\s+/).map(w => w.replace(/[.,!?;:'"()]/g, '').trim()).filter(Boolean);
            const w = tokens[wordIndex];
            if (w) (window as any).__currentHighlightedWord = w;
          } catch {}
          onWordHighlight?.(wordIndex);
        },
        currentPage,
        customSpeed: speed,
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
    // Turn OFF: stop both backends and reset status
    try { audioService.stopVoiceCommands(); } catch {}
    try { vcRef.current?.stop?.(); } catch {}
    setVoiceCommandsEnabled(false);
    voiceEnabledRef.current = false;
    if (restartTimeoutRef.current) {
      clearTimeout(restartTimeoutRef.current);
      restartTimeoutRef.current = null;
    }
    try { sessionStorage.setItem('t2r_voice_commands', '0'); } catch {}
    ;(window as any).__t2r_vc_user_disabled = true;
    emitStatus('idle');
    return;
  }

  const hasWebSpeech = typeof window !== 'undefined' && ((('webkitSpeechRecognition' in window) || ('SpeechRecognition' in window)));
  const useWebSpeech = hasWebSpeech && !hasTouchCapability && !isMobileOrTablet;

  if (useWebSpeech) {
    audioService.startVoiceCommands();
    setVoiceCommandsEnabled(true);
    voiceEnabledRef.current = true;
    try { sessionStorage.setItem('t2r_voice_commands', '1'); } catch {}
    ;(window as any).__t2r_vc_user_disabled = false;
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
    return;
  }

  // Headless Whisper path (no modal)
  vcRef.current?.start?.();
  setVoiceCommandsEnabled(true);
  voiceEnabledRef.current = true;
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
      if (voiceEnabledRef.current && !(window as any).__t2r_vc_user_disabled) {
        if (restartTimeoutRef.current) {
          clearTimeout(restartTimeoutRef.current);
          restartTimeoutRef.current = null;
        }
        restartTimeoutRef.current = window.setTimeout(() => {
          if (voiceEnabledRef.current && !(window as any).__t2r_vc_user_disabled) {
            try { vcRef.current?.start?.(); } catch (e) { console.warn('Headless restart failed', e); }
          }
        }, 250);
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
    const { detail } = evt as CustomEvent<{ type: 'define'|'explain'|'pronounce'|'save'; word: string }>;
    if (!detail?.word) return;
    const raw = detail.word.replace(/[.,!?;:'"()]/g, '').trim();
      const resolveWord = (w: string | undefined) => {
        const pronouns = ['this', 'this word', 'that', 'that word', 'it', 'this one'];
        const lw = (w || '').toLowerCase();
        if (pronouns.includes(lw)) {
          const ctx = (window as any).__hoveredWord || (window as any).__lastSelectedWord || (window as any).__currentHighlightedWord;
          return typeof ctx === 'string' && ctx.trim().length > 0 ? ctx : '';
        }
        return w || '';
      };
    const resolved = resolveWord(raw);
    if (!resolved) {
      toast({ title: t('vocab.selectWord', 'Select a word first'), description: t('vocab.tapWordHint', 'Tap a word or start audio highlighting, then ask again.'), duration: 2500 });
      return;
    }
    const cleanWord = resolved;
    try {
      if (detail.type === 'pronounce') {
        await audioService.playText({ text: cleanWord, difficulty: 'easy', userInfo, isPremium, enableHighlighting: false });
        return;
      }
      const userLang = userInfo?.nativeLanguage || 'en';
      const { data, error } = await supabase.functions.invoke('word-dictionary', {
        body: { word: cleanWord, userLevel: difficulty, userLanguage: userLang }
      });
      const definition: string = (!error && data?.definition) ? data.definition : cleanWord;
      await VocabularyTrackingService.logEncounter(cleanWord, definition, difficulty);
        if (detail.type === 'define' || detail.type === 'explain') {
          toast({ title: cleanWord, description: definition, duration: 4000 });
          try {
            await audioService.playText({
              text: definition,
              difficulty: 'easy',
              userInfo,
              isPremium,
              enableHighlighting: false
            });
          } catch (e) {
            console.warn('Definition TTS failed', e);
          }
        } else if (detail.type === 'save') {
          try {
            (window as any).addToVocabulary?.({
              word: cleanWord,
              definition,
              difficulty: (difficulty === 'beginner' ? 'beginner' : 'intermediate'),
              dateAdded: new Date().toISOString(),
              timesReviewed: 0,
              mastered: false,
            });
          } catch {}
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
          className={`gap-2 ${isMobileOrTablet ? 'min-h-[44px] px-4' : ''} ${vcStatus === 'listening' ? 'bg-[hsl(var(--warning))] text-white hover:bg-[hsl(var(--warning))]/90' : ''}`}
          style={vcStatus === 'listening' ? { boxShadow: `0 0 ${4 + vcLevel * 10}px hsl(var(--primary))`, opacity: 0.9 } : undefined}
        >
          <span className="relative inline-flex items-center">
            <Mic 
              className={`w-4 h-4 transition-transform`} 
              style={{ transform: vcStatus === 'listening' ? `scale(${1 + vcLevel * 0.05})` : undefined }}
            />
            {vcStatus === 'processing' && (
              <Loader2 className="w-3.5 h-3.5 absolute -right-3 -top-2 animate-spin text-muted-foreground" />
            )}
          </span>
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