import { useEffect, useRef } from 'react';
import { SimplifiedAudioEngine } from '@/services/SimplifiedAudioEngine';
import { supabase } from '@/integrations/supabase/client';
import { contextualPronunciation } from '@/services/contextualPronunciation';
import { phoneticRulesEngine } from '@/services/phoneticRulesEngine';
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
        const audioEngine = SimplifiedAudioEngine.getInstance();
        const cleanWord = word.replace(/[.,!?;:'"()]/g, '').trim();

        switch (action) {
          case 'hear':
            const processedWord = contextualPronunciation.processTextForPronunciation(cleanWord, false);
            await audioEngine.playTextWithSynchronization({
              text: processedWord,
              voiceId: 'XB0fDUnXU5powFXDhCwa', // Charlotte
              contentHash: processedWord
            });
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
                const processedText = contextualPronunciation.processTextForPronunciation(definition.definition, true);
                await audioEngine.playTextWithSynchronization({
                  text: processedText,
                  voiceId: 'XB0fDUnXU5powFXDhCwa', // Charlotte
                  contentHash: definition.definition.substring(0, 20)
                });
              }
            } catch (error) {
              console.error('Failed to get word definition:', error);
            }
            break;

          case 'syllables':
            const syllables = phoneticRulesEngine.breakIntoSyllables(cleanWord);
            if (syllables && syllables.length > 0) {
              const syllableText = syllables.join(' - ');
              await audioEngine.playTextWithSynchronization({
                text: syllableText,
                voiceId: 'XB0fDUnXU5powFXDhCwa', // Charlotte
                contentHash: syllableText
              });
            }
            break;
        }
      } catch (error) {
        console.error('Voice hover action failed:', error);
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