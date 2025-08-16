import { useState, useRef, useEffect, forwardRef, useImperativeHandle } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

import { Play, Square, Crown, Mic, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { ToastAction } from "@/components/ui/toast";
import { useIsMobile } from "@/hooks/use-mobile";
import { audioSyncService } from "@/services/audioSyncService";
import { VoiceCommandController } from "@/components/VoiceCommandController";
import type { VoiceCommandControllerHandle } from "@/components/VoiceCommandController";
import type { UserInfo } from "@/types";
import { supabase } from "@/integrations/supabase/client";
import { VocabularyTrackingService } from "@/services/vocabularyTrackingService";
import { tokenizeForHighlighting } from "@/utils/tokenize";
import TTSDebugOverlay from "@/components/TTSDebugOverlay";

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
  contentHash?: string;
  onAudioStateChange?: (isPlaying: boolean) => void;
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
  onWordHighlight,
  contentHash,
  onAudioStateChange
}: ElevenLabsAudioProps, ref) => {
  const { t } = useTranslation();
  const { isMobileOrTablet, isCapacitor, hasTouchCapability } = useIsMobile();
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [voiceCommandsEnabled, setVoiceCommandsEnabled] = useState(false);
  const [isStabilizing, setIsStabilizing] = useState(false);
  const vcRef = useRef<VoiceCommandControllerHandle | null>(null);
  const restoredRef = useRef(false);
  const voiceEnabledRef = useRef(false);
  const restartTimeoutRef = useRef<number | null>(null);
  // Use audioSyncService for enhanced word highlighting
  const [hasPlayedThisPage, setHasPlayedThisPage] = useState(false);
  const { toast, dismiss } = useToast();
  const voiceTipsShownRef = useRef(false);
  const speedMultiplierRef = useRef(1);
  const [vcStatus, setVcStatus] = useState<'idle'|'listening'|'processing'>('idle');
  const [vcLevel, setVcLevel] = useState(0);
  const burstCounterRef = useRef(0);
  const lastBurstTsRef = useRef(0);
  const mismatchSinceRef = useRef<number | null>(null);
  const audioRetryRef = useRef<boolean>(false);
  const lastTapRef = useRef<number>(0);
  const emitStatus = (s: 'idle'|'listening'|'processing') =>
    window.dispatchEvent(new CustomEvent('voice:status', { detail: { status: s } }));

  // Per-page audio access for free users (no hard cap)
  const canUseAudio = isPremium || !hasPlayedThisPage;
  const shouldShowCrown = !isPremium && hasPlayedThisPage;

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
      audioSyncService.getPlaybackStatus(); // This will trigger mobile audio initialization
    }
  }, [isMobileOrTablet]);

  // Expose current user name for vocabulary storage key standardization
  useEffect(() => {
    (window as any).__currentUserName = userInfo?.name || 'guest';
  }, [userInfo?.name]);

// Stop audio on text or page change to avoid stale playback and apply reduced stabilization
useEffect(() => {
  // Immediate state update
  setIsPlaying(false);
  setIsLoading(false);
  
  // Stop audio service
  try { 
    audioSyncService.stopAudio(); 
  } catch (error) {
    console.warn('Error stopping audio on page change:', error);
  }
  
  setIsStabilizing(true);
  // Reduced stabilization timing: 500ms for optimal performance
  const delay = 500;
  const to = window.setTimeout(() => setIsStabilizing(false), delay);
  return () => clearTimeout(to);
}, [text, currentPage]);

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
      try { audioSyncService.stopAudio(); } catch {}
      try { vcRef.current?.stop?.(); } catch {}
      try { emitStatus('idle'); } catch {}
    };
  }, []);

  // Restore voice command state from session
  useEffect(() => {
    try {
      const saved = sessionStorage.getItem('t2r_voice_commands');
      const userDisabled = (window as any).__t2r_vc_user_disabled === true;
      if (isPremium && saved === '1' && !userDisabled && !restoredRef.current) {
        (window as any).__t2r_vc_user_disabled = false;
        // Voice commands not supported by audioSyncService
        setVoiceCommandsEnabled(true);
        voiceEnabledRef.current = true;
        restoredRef.current = true;
      }
    } catch {}
  }, [isPremium]);

  useEffect(() => {
    if (voiceCommandsEnabled && vcStatus === 'listening' && !voiceTipsShownRef.current) {
      toast({
        title: t("audioReading.voiceCommandsEnabled", "Voice Commands Enabled"),
        description: t("audioReading.voiceCommandsHint", "Try: 'next page', 'pause', 'continue', 'read slower'"),
        duration: 3500,
        action: (
          <ToastAction altText={t('audioReading.openVoiceHelp','Open voice commands help')} onClick={() => { window.location.href = '/pricing#voice'; }}>
            {t('audioReading.fullList','Full list')}
          </ToastAction>
        ),
      });
      voiceTipsShownRef.current = true;
    }
  }, [voiceCommandsEnabled, vcStatus, toast, t]);

  // Reset free-play flag when page or content changes
  useEffect(() => {
    setHasPlayedThisPage(false);
  }, [currentPage, contentHash]);

  // Support global voice events (toggle and hard stop)
  useEffect(() => {
    const toggleHandler = () => toggleVoiceCommands();
    const stopHandler = () => {
      if (voiceCommandsEnabled) {
        try { sessionStorage.setItem('t2r_voice_commands', '0'); } catch {}
        ;(window as any).__t2r_vc_user_disabled = true;
        ;(window as any).__t2r_voice_force_off = true;
        voiceEnabledRef.current = false;
        setVoiceCommandsEnabled(false);
        emitStatus('idle');
        setVcStatus('idle');
        setVcLevel(0);
        try { window.dispatchEvent(new CustomEvent('voice:level', { detail: { level: 0 } })); } catch {}
        try { vcRef.current?.stop?.(); } catch {}
        // Voice commands not available in audioSyncService
      }
    };
    window.addEventListener('voice:toggle', toggleHandler as EventListener);
    window.addEventListener('voice:stop', stopHandler as EventListener);
    return () => {
      window.removeEventListener('voice:toggle', toggleHandler as EventListener);
      window.removeEventListener('voice:stop', stopHandler as EventListener);
    };
  }, [voiceCommandsEnabled]);

  // Enhanced audio playback with unlimited hash mismatch recovery
  const playAudio = async () => {
    if (!isPremium && hasPlayedThisPage) {
      return;
    }

    setIsLoading(true);

    // Debounce rapid taps
    const now = Date.now();
    if (now - (lastTapRef.current || 0) < 350) { setIsLoading(false); return; }
    lastTapRef.current = now;

    try {
      await playWithHashValidation();

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

  // Unlimited hash mismatch recovery for all users
  const playWithHashValidation = async (retryCount = 0): Promise<void> => {
    // Validate hash before attempting playback
    const currentUIHash = (window as any).__pageContentHash;
    
    if (contentHash && currentUIHash && currentUIHash !== contentHash) {
      console.log(`🔄 Hash mismatch detected (attempt ${retryCount + 1}): UI=${currentUIHash?.slice(0,10)}, Audio=${contentHash?.slice(0,10)}`);
      
      // Show user feedback with retry counter
      toast({
        title: "Syncing audio...",
        description: retryCount === 0 ? "Ensuring audio matches current page" : `Retry attempt ${retryCount + 1}`,
        duration: 1500,
      });
      
      // Wait 500ms for stability, then retry
      await new Promise(r => setTimeout(r, 500));
      return playWithHashValidation(retryCount + 1);
    }

    // Enhanced stabilization with reduced timing (500ms instead of 3-4 seconds)
    if (isStabilizing) {
      console.log('🕐 Audio playback waiting for stabilization...');
      if (retryCount === 0) {
        toast({
          title: t("audioReading.stabilizing", "Preparing audio..."),
          description: t("audioReading.stabilizingDesc", "Please wait while we prepare the best reading experience."),
          duration: 2000,
        });
      }
      
      // Wait for stabilization to complete
      while (isStabilizing) {
        await new Promise(r => setTimeout(r, 100));
      }
    }

    const speed = getBaseSpeed() * speedMultiplierRef.current;
    const playSnapshot = { text, page: currentPage, contentHash };

    await audioSyncService.playText({
      text,
      voice: 'XB0fDUnXU5powFXDhCwa', // Charlotte voice
      model: 'eleven_turbo_v2_5',
      speed,
      userInfo,
      onWordHighlight: (wordIndex: number) => {
        console.log(`🎯 ElevenLabs: Highlighting word ${wordIndex}`);
        try {
          const { wordsOnly } = tokenizeForHighlighting(text);
          const w = wordsOnly[wordIndex];
          if (w) (window as any).__currentHighlightedWord = w;
        } catch {}
        onWordHighlight?.(wordIndex);
      },
      onStateChange: (isPlayingNow: boolean) => {
        // Direct state callback from audio service for immediate UI updates
        setIsPlaying(isPlayingNow);
        // Also notify parent component
        onAudioStateChange?.(isPlayingNow);
      }
    });

    // Guard: if page or text changed during load, stop and bail
    if (playSnapshot.page !== currentPage || playSnapshot.text !== text || playSnapshot.contentHash !== contentHash) {
      console.warn('🛑 TTS aborted due to page/text/hash change during load');
      try { audioSyncService.stopAudio(); } catch {}
      toast({ title: t('audioReading.pageChanged', 'Page changed'), description: t('audioReading.refreshAudio', 'Audio refreshed for the new page.'), duration: 1800 });
      return;
    }

    setIsPlaying(true);
  };


  const stopAudio = () => {
    // Immediate state update for responsive UI
    setIsPlaying(false);
    setIsLoading(false);
    
    // Notify parent component immediately
    onAudioStateChange?.(false);
    
    // Then cleanup audio service
    try {
      audioSyncService.stopAudio();
    } catch (error) {
      console.warn('Error stopping audio:', error);
    }
  };

// Premium voice commands toggle
const toggleVoiceCommands = () => {
  // Debounce rapid taps to avoid race conditions
  const now = Date.now();
  if (now - (lastBurstTsRef.current || 0) < 350) return;
  lastBurstTsRef.current = now;

  if (!isPremium) {
    onUpgrade?.();
    return;
  }

  if (voiceCommandsEnabled) {
    // Turn OFF: set flags first to prevent any late onstart from flipping UI back
    try { sessionStorage.setItem('t2r_voice_commands', '0'); } catch {}
    ;(window as any).__t2r_vc_user_disabled = true;
    ;(window as any).__t2r_voice_force_off = true;
    voiceEnabledRef.current = false;
    setVoiceCommandsEnabled(false);
    emitStatus('idle');
    setVcStatus('idle');
    setVcLevel(0);
    try { window.dispatchEvent(new CustomEvent('voice:level', { detail: { level: 0 } })); } catch {}
    try { window.dispatchEvent(new CustomEvent('voice:stop')); } catch {}
    if (restartTimeoutRef.current) {
      clearTimeout(restartTimeoutRef.current);
      restartTimeoutRef.current = null;
    }
    try { vcRef.current?.stop?.(); } catch {}
    // Voice commands not available in audioSyncService
    return;
  }

  const hasWebSpeech = typeof window !== 'undefined' && ((('webkitSpeechRecognition' in window) || ('SpeechRecognition' in window)));
  const pointerFine = typeof window !== 'undefined' && typeof window.matchMedia === 'function' ? window.matchMedia('(pointer: fine)').matches : false;
  const isHybridDesktop = hasTouchCapability && !isMobileOrTablet && pointerFine;
  const useWebSpeech = hasWebSpeech && !isMobileOrTablet && (pointerFine || !hasTouchCapability);

  if (useWebSpeech) {
    try { sessionStorage.setItem('t2r_voice_commands', '1'); } catch {}
    ;(window as any).__t2r_vc_user_disabled = false;
    ;(window as any).__t2r_voice_force_off = false;
    setVoiceCommandsEnabled(true);
    voiceEnabledRef.current = true;
    emitStatus('listening');
    setVcStatus('listening');
    // Voice commands not available in audioSyncService
    return;
  }

  // Headless Whisper path (no modal)
  try { sessionStorage.setItem('t2r_voice_commands', '1'); } catch {}
  ;(window as any).__t2r_vc_user_disabled = false;
  ;(window as any).__t2r_voice_force_off = false;
  setVoiceCommandsEnabled(true);
  voiceEnabledRef.current = true;
  emitStatus('listening');
  setVcStatus('listening');
  vcRef.current?.start?.();
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
    // Voice command processing not available in audioSyncService
    const result = null;
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

  // Event-driven audio state monitoring instead of polling
  useEffect(() => {
    const handleAudioStateChange = (event: CustomEvent) => {
      const newIsPlaying = event.detail.isPlaying;
      if (newIsPlaying !== isPlaying) {
        console.log(`🔄 Audio state sync: ${isPlaying} → ${newIsPlaying}`);
        setIsPlaying(newIsPlaying);
        onAudioStateChange?.(newIsPlaying);
      }
    };

    // Listen for audio state changes from audioSyncService
    window.addEventListener('audio:statechange', handleAudioStateChange as EventListener);
    
    // Also check current status on mount
    const status = audioSyncService.getPlaybackStatus();
    if (status.isPlaying !== isPlaying) {
      setIsPlaying(status.isPlaying);
      onAudioStateChange?.(status.isPlaying);
    }

    return () => {
      window.removeEventListener('audio:statechange', handleAudioStateChange as EventListener);
    };
  }, [isPlaying, onAudioStateChange]);

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
        // Use SimpleAudioEngine for word pronunciation
        const { SimpleAudioEngine } = await import('@/services/SimpleAudioEngine');
        await SimpleAudioEngine.getInstance().playText({ 
          text: cleanWord,
          voiceId: 'XB0fDUnXU5powFXDhCwa' // Charlotte
        });
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
            // Use SimpleAudioEngine for definitions
            const { SimpleAudioEngine } = await import('@/services/SimpleAudioEngine');
            await SimpleAudioEngine.getInstance().playText({ 
              text: definition,
              voiceId: 'XB0fDUnXU5powFXDhCwa' // Charlotte
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
}, [userInfo, difficulty, toast, t]);

// Voice command playback controls
useEffect(() => {
  const onPause = () => {
    try { audioSyncService.pauseAudio(); } catch {}
    setIsPlaying(false);
  };
  const onResume = async () => {
    try { await audioSyncService.resumeAudio(); setIsPlaying(true); }
    catch { try { await playAudio(); } catch {} }
  };
  const onRepeat = async () => {
    try { stopAudio(); await playAudio(); } catch {}
  };
  const onSpeed = async (evt: Event) => {
    const e = evt as CustomEvent<{ delta?: number }>;
    const delta = Number(e?.detail?.delta ?? 0);
    const next = Math.max(0.6, Math.min(1.3, speedMultiplierRef.current + delta));
    speedMultiplierRef.current = next;
    if (isPlaying) {
      try { stopAudio(); await playAudio(); } catch {}
    }
  };
  window.addEventListener('audio:pause', onPause as EventListener);
  window.addEventListener('audio:resume', onResume as EventListener);
  window.addEventListener('audio:repeat', onRepeat as EventListener);
  window.addEventListener('audio:speed', onSpeed as EventListener);
  return () => {
    window.removeEventListener('audio:pause', onPause as EventListener);
    window.removeEventListener('audio:resume', onResume as EventListener);
    window.removeEventListener('audio:repeat', onRepeat as EventListener);
    window.removeEventListener('audio:speed', onSpeed as EventListener);
  };
}, [isPlaying, playAudio]);

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <div className="relative">
        <Button
          id="elevenlabs-play-toggle"
          onClick={isPlaying ? stopAudio : playAudio}
          disabled={isLoading || isStabilizing || (!isPlaying && shouldShowCrown)}
          variant="outline"
          size={isMobileOrTablet ? "default" : "sm"}
          className={`gap-2 ${isMobileOrTablet ? 'min-h-[44px] px-4' : ''} ${shouldShowCrown && !isPlaying ? 'opacity-50' : ''}`}
          aria-live="polite"
          aria-pressed={isPlaying}
          title={isStabilizing ? 'Stabilizing page…' : undefined}
        >
          {isLoading ? (
            <div className="w-4 h-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          ) : isPlaying ? (
            <Square className="w-4 h-4" />
          ) : (
            <Play className="w-4 h-4" />
          )}
          {isLoading ? t("audioReading.generating", "Generating...") : isPlaying ? (isMobileOrTablet ? t("audioReading.stop", "Stop") : "Stop Reading") : (isMobileOrTablet ? t("audioReading.playAudio", "Play Audio") : "Read Story")}
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
          variant="outline"
          size={isMobileOrTablet ? "default" : "sm"}
          className={`gap-2 ${isMobileOrTablet ? 'min-h-[44px] px-4' : ''} ${voiceCommandsEnabled && vcStatus === 'listening' ? 'bg-[hsl(var(--warning))] text-white hover:bg-[hsl(var(--warning))]/90' : ''}`}
          style={voiceCommandsEnabled && vcStatus === 'listening' ? { boxShadow: `0 0 ${4 + vcLevel * 10}px hsl(var(--primary))`, opacity: 0.9 } : undefined}
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
          {vcStatus === 'listening' ? 'Stop Talking' : 'Talk to Buddy'}
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
                  Talk to Buddy
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
                Upgrade to Premium for unlimited audio plays per page
              </p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )}

{/* Headless voice controller (no UI) */}
<VoiceCommandController ref={vcRef} headless onCommand={handleHeadlessCommand} />
{typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('ttsdebug') === '1' && (
  <TTSDebugOverlay />
)}
    </div>
  );
});