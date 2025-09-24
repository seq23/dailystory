import { useEffect, useRef } from 'react';
import { charlotteVoiceService } from '@/services/CharlotteVoiceService';
import { supabase } from '@/integrations/supabase/client';
import { contextualPronunciation } from '@/services/contextualPronunciation';
import phonicsMiniDict from '@/data/phonicsMiniDict';
import { AudioPermissions } from '@/utils/audioPermissions';
import { DebugLogger } from '@/services/DebugLogger';

interface VoiceHoverControllerProps {
  isPremium: boolean;
}

/**
 * DEPRECATED: Voice Hover Controller
 * This component is being phased out in favor of PremiumHoverController
 * Keeping for backwards compatibility during transition
 */
export const VoiceHoverController = ({ isPremium }: VoiceHoverControllerProps) => {
  const lastProcessedWordRef = useRef<string>('');
  const processingRef = useRef<boolean>(false);
  const hoverTimeoutRef = useRef<number | null>(null);
  const vcStatusRef = useRef<'idle' | 'listening' | 'processing'>('idle');

  useEffect(() => {
    // Update permission context when premium status changes
    AudioPermissions.updateContext({ isPremium });
  }, [isPremium]);

  useEffect(() => {
    // Listen for voice command status changes
    const handleVoiceStatus = (event: CustomEvent<{ status: 'idle' | 'listening' | 'processing' }>) => {
      vcStatusRef.current = event.detail.status;
      AudioPermissions.updateContext({ vcStatus: event.detail.status });
    };

    window.addEventListener('voice:status', handleVoiceStatus as EventListener);

    const handleWordHover = async (event: CustomEvent<{ word: string; action: 'hear' | 'explain' | 'syllables'; source?: string }>) => {
      const { word, action, source } = event.detail;
      
      // CRITICAL: Ignore events from direct button clicks - only handle voice command events
      if (source === 'direct-button' || source === 'interactive-word') {
        DebugLogger.log('audio', `VoiceHoverController: Ignoring ${source} event for "${word}"`);
        return;
      }
      
      if (!word || processingRef.current) return;

      // Check permissions before processing
      if (!AudioPermissions.canUseVoiceHover()) {
        const reason = AudioPermissions.getBlockReason('voice-hover');
        DebugLogger.log('audio', `Voice hover blocked: ${reason}`);
        return;
      }
      
      // Only process if voice commands are active
      if (vcStatusRef.current === 'idle') {
        DebugLogger.log('audio', 'VoiceHoverController: Voice commands not active, ignoring event');
        return;
      }
      
      // Debounce rapid hover events
      if (lastProcessedWordRef.current === word) return;
      lastProcessedWordRef.current = word;
      processingRef.current = true;

      try {
        const cleanWord = word.replace(/[.,!?;:'"()]/g, '').trim();

        switch (action) {
          case 'hear':
            const processedWord = contextualPronunciation.processTextForPronunciation(cleanWord, false);
            await charlotteVoiceService.charlotteHearWord(processedWord);
            break;

          case 'explain':
            try {
              const { data: definition } = await supabase.functions.invoke('word-dictionary', {
                body: { 
                  word: cleanWord.toLowerCase(),
                  language: 'en'
                }
              });

              if (definition?.definition) {
                await charlotteVoiceService.charlotteInteractiveAudio({ 
                  text: definition.definition, 
                  context: 'conversation' 
                });
              }
            } catch (error) {
              DebugLogger.error('audio', 'Failed to get word definition', { error });
            }
            break;

          case 'syllables':
            const cleanWordForSyllables = cleanWord.toLowerCase().replace(/[^a-z]/g, '');
            const syllables = phonicsMiniDict[cleanWordForSyllables] || [cleanWord];
            if (syllables && syllables.length > 0) {
              const syllableText = syllables.join(' - ');
              await charlotteVoiceService.charlotteInteractiveAudio({ 
                text: syllableText,
                context: 'conversation'
              });
            }
            break;
        }
      } catch (error) {
        DebugLogger.error('audio', 'Voice hover action failed', { error });
      } finally {
        // Clear processing flag after a delay to prevent spam
        setTimeout(() => {
          processingRef.current = false;
          lastProcessedWordRef.current = '';
        }, 1000);
      }
    };

    // Listen for voice command word hover events
    window.addEventListener('voice:hover:word', handleWordHover as EventListener);

    return () => {
      window.removeEventListener('voice:hover:word', handleWordHover as EventListener);
      window.removeEventListener('voice:status', handleVoiceStatus as EventListener);
      if (hoverTimeoutRef.current) {
        clearTimeout(hoverTimeoutRef.current);
      }
    };
  }, []);

  // This component doesn't render anything - it's just for event handling
  return null;
};