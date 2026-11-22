import { uiText } from "@/i18n/uiText";
import { useState, useRef, useEffect, forwardRef, useImperativeHandle } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useVoiceIntegration } from "@/hooks/useVoiceIntegration";

import { Play, Square, Crown, Mic, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useIsMobile } from "@/hooks/use-mobile";
import type { UserInfo } from "@/types";
import { supabase } from "@/integrations/supabase/client";
import { VocabularyTrackingService } from "@/services/vocabularyTrackingService";
import { tokenizeForHighlighting } from "@/utils/tokenize";
// TTSDebugOverlay integrated into UnifiedDebugMonitor
import { DebugLogger } from "@/services/DebugLogger";

// Import consolidated audio hook
import { useAudioControls } from "@/hooks/useAudioControls";
import { charlotteVoiceService } from "@/services/CharlotteVoiceService";
import { browserTTSService } from "@/services/BrowserTTSService";
import type { DifficultyLevel } from "@/types";

interface ElevenLabsAudioProps {
  text: string;
  userInfo: UserInfo;
  isPremium?: boolean;
  onUpgrade?: () => void;
  currentPage?: number;
  totalPages?: number;
  isExtendedPage?: boolean; // True if this page was added beyond the original 10
  difficulty?: DifficultyLevel;
  onWordHighlight?: (wordIndex: number) => void;
  contentHash?: string;
  onAudioStateChange?: (isPlaying: boolean) => void;
}

export interface ElevenLabsAudioHandle {
  play: () => Promise<void> | void;
  stop: () => void;
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
  const { isMobileOrTablet, isCapacitor } = useIsMobile();
  const { handleVoiceToggle, isConnected: voiceConnected, isConnecting: voiceConnecting } = useVoiceIntegration();
  const { toast, dismiss } = useToast();

  // Use consolidated audio hook
  const { 
    isPlaying, 
    isLoading, 
    isStabilizing, 
    playAudio: playAudioCore, 
    stopAudio: stopAudioCore,
    speedMultiplierRef,
    canUseAudio,
    shouldShowCrown,
    markPageAsPlayed,
    validateHashSync
  } = useAudioControls({
    text,
    userInfo,
    currentPage,
    contentHash,
    difficulty,
    onWordHighlight,
    onAudioStateChange,
    isPremium
  });

  // The Buddy conversation's live mic state, for its button.
  const [vcStatus, setVcStatus] = useState<'idle'|'listening'|'processing'>('idle');
  const [vcLevel, setVcLevel] = useState(0);
  

  // Enhanced playAudio that checks permissions and marks pages
  const playAudio = async () => {
    if (!canUseAudio) {
      return;
    }

      try {
        await playAudioCore(validateHashSync);
        
        // Use Charlotte's story completion tracking
        if (!isPremium) {
          markPageAsPlayed();
        }
      } catch (error) {
        DebugLogger.error('audio', '🎙️ Charlotte story playback failed', error);
      }
  };

  // Enhanced stop audio with comprehensive audio system stopping
  const stopAudio = () => {
    try {
      // 1. Stop core audio system
      stopAudioCore();
      
      // 2. Stop Charlotte's voice service
      charlotteVoiceService.stop();
      
      // 3. Stop browser TTS 
      browserTTSService.stop();
      
      // 4. Dispatch audio coordinator events
      window.dispatchEvent(new CustomEvent('audio:stop'));
      window.dispatchEvent(new CustomEvent('charlotte:stop'));
      window.dispatchEvent(new CustomEvent('audio:statechange', { 
        detail: { isPlaying: false, source: 'main-stop-button' } 
      }));
      
      DebugLogger.log('audio', 'Comprehensive audio stop completed from main app');
    } catch (error) {
      DebugLogger.error('audio', 'Error in comprehensive audio stop', error);
    }
  };

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


  // Expose imperative methods to parent (e.g., bottom dock)
  useImperativeHandle(ref, () => ({
    play: playAudio,
    stop: stopAudio,
    get isPlaying() { return isPlaying; }
  }), [isPlaying]);


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
        // Use Charlotte's unified voice service instead of SimplifiedAudioEngine
        await charlotteVoiceService.charlotteInteractiveAudio({
          text: cleanWord,
          context: 'interactive'
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
              // Use Charlotte for English, browser TTS for other languages
              if (userLang === 'en') {
                await charlotteVoiceService.charlotteExplainWord(cleanWord, userLang);
              } else {
                await browserTTSService.speakExplanation(definition, userLang as any);
              }
            } catch (e) {
              DebugLogger.warn('audio', 'Charlotte definition TTS failed', e);
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
        DebugLogger.error('audio', 'voice:vocab handler error', err);
        toast({ title: t('vocab.error', 'Vocabulary error'), description: String(err), variant: 'destructive' });
      }
    };
    window.addEventListener('voice:vocab', onVocab as EventListener);
    return () => window.removeEventListener('voice:vocab', onVocab as EventListener);
  }, [userInfo, difficulty, toast, t]);

  // Voice command playback controls
  useEffect(() => {
    const onPause = () => {
      // Use Charlotte's unified service for pause
      try { charlotteVoiceService.stop(); } catch {}
    };
    const onResume = async () => {
      // Use Charlotte's unified service for resume
      try { await playAudio(); } catch {}
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
          {isLoading ? t("audioReading.generating", "Generating...") : isPlaying ? (isMobileOrTablet ? t("audioReading.stop", "Stop") : "Stop Reading") : (isMobileOrTablet ? t("audioReading.playAudio", "Play Audio") : uiText("Read Story"))}
        </Button>
        {shouldShowCrown && (
          <Crown className="w-4 h-4 absolute -top-1 -right-1 text-[hsl(var(--warning))]" />
        )}
      </div>

      {/* Voice Commands Button */}
      {isPremium ? (
        <Button
          id="elevenlabs-voice-toggle"
          onClick={handleVoiceToggle}
          variant="outline"
          size={isMobileOrTablet ? "default" : "sm"}
          className={`gap-2 ${isMobileOrTablet ? 'min-h-[44px] px-4' : ''} ${voiceConnected && vcStatus === 'listening' ? 'bg-[hsl(var(--warning))] text-white hover:bg-[hsl(var(--warning))]/90' : ''}`}
          style={voiceConnected && vcStatus === 'listening' ? { boxShadow: `0 0 ${4 + vcLevel * 10}px hsl(var(--primary))`, opacity: 0.9 } : undefined}
          disabled={voiceConnecting}
        >
          <span className="relative inline-flex items-center">
            <Mic 
              className={`w-4 h-4 transition-transform`} 
              style={{ transform: vcStatus === 'listening' ? `scale(${1 + vcLevel * 0.05})` : undefined }}
            />
            {(vcStatus === 'processing' || voiceConnecting) && (
              <Loader2 className="w-3.5 h-3.5 absolute -right-3 -top-2 animate-spin text-muted-foreground" />
            )}
          </span>
          {voiceConnected ? uiText("Stop Talking") : voiceConnecting ? uiText("Connecting...") : uiText("Talk to Buddy")}
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
                   {uiText("Talk to Buddy")} </Button>
              </span>
            </TooltipTrigger>
            <TooltipContent>
               {uiText("Talking with Buddy is a Premium feature")} </TooltipContent>
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
                 {uiText("Upgrade to Premium for unlimited audio plays per page")} </p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )}

{/* TTSDebugOverlay integrated into UnifiedDebugMonitor */}
    </div>
  );
});

ElevenLabsAudio.displayName = "ElevenLabsAudio";