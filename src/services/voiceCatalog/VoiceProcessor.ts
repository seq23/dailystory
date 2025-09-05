/**
 * Voice Processor
 * Resolves voice definitions using the global codebook
 */

import { CodebookService } from './CodebookService';
import type { VoiceDefinition, ProcessedVoice } from './types';

export class VoiceProcessor {
  /**
   * Process a voice definition by resolving all codebook references
   */
  static processVoice(voice: VoiceDefinition): ProcessedVoice {
    const resolvedElements = {
      tones: CodebookService.resolveIndexes('tones', voice.vf.tone),
      hooks: CodebookService.resolveIndexes('hooks', voice.st.hk),
      transitions: CodebookService.resolveIndexes('trans', voice.st.tr),
      pauses: CodebookService.resolveIndexes('pauses', voice.st.pz),
      continuations: CodebookService.resolveIndexes('conts', voice.st.ct),
      twists: CodebookService.resolveIndexes('twists', voice.st.tw),
      endings: CodebookService.resolveIndexes('ends', voice.st.en),
      helpers: CodebookService.resolveIndexes('helpers', voice.ch.hp),
      dialogStyles: CodebookService.resolveIndexes('dialog', voice.ch.dlg),
      emotions: CodebookService.resolveIndexes('emote', voice.ch.arc),
      settings: CodebookService.resolveIndexes('setting', voice.wd.set),
      themes: CodebookService.resolveIndexes('themes', voice.tg),
      sounds: this.resolveSounds(voice.rd.ono)
    };

    return {
      ...voice,
      resolvedElements
    };
  }

  /**
   * Process multiple voices
   */
  static processVoices(voices: VoiceDefinition[]): ProcessedVoice[] {
    return voices.map(voice => this.processVoice(voice));
  }

  /**
   * Resolve sound references (can be indexes or direct strings)
   */
  private static resolveSounds(soundRefs: (string | number)[]): string[] {
    if (!Array.isArray(soundRefs)) {
      return [];
    }

    return soundRefs.map(ref => {
      if (typeof ref === 'string') {
        return ref; // Direct string value
      }
      
      if (typeof ref === 'number') {
        const sounds = CodebookService.getArray('snd');
        return sounds[ref] || `unknown_sound_${ref}`;
      }
      
      return String(ref);
    }).filter(Boolean);
  }

  /**
   * Create a story generation bundle from a processed voice
   */
  static createStoryBundle(processedVoice: ProcessedVoice, userInfo: any) {
    const { resolvedElements } = processedVoice;
    
    return {
      voiceId: processedVoice.id,
      voiceName: processedVoice.pn,
      
      // Core voice characteristics
      tones: resolvedElements.tones,
      narrative: CodebookService.resolveIndexes('narr', [processedVoice.vf.nar]),
      warmth: processedVoice.vf.warm,
      humor: processedVoice.vf.hum,
      cadence: processedVoice.vf.cad,
      
      // Story structure elements
      hooks: resolvedElements.hooks,
      transitions: resolvedElements.transitions,
      pauses: resolvedElements.pauses,
      twists: resolvedElements.twists,
      endings: resolvedElements.endings,
      
      // Character elements
      helpers: resolvedElements.helpers,
      dialogStyles: resolvedElements.dialogStyles,
      pointOfView: processedVoice.ch.pov,
      
      // World building
      settings: resolvedElements.settings,
      scale: processedVoice.wd.sc,
      moralApproach: processedVoice.wd.mor,
      
      // Reading specs
      soundEffects: resolvedElements.sounds,
      alliteration: processedVoice.rd.aa === 1,
      sentenceLength: processedVoice.rd.sl,
      
      // User integration guidelines
      userInputRules: processedVoice.uig,
      
      // Themes and inspiration
      themes: resolvedElements.themes,
      sourceInspiration: processedVoice.src,
      
      // Meta information
      level: this.inferLevel(processedVoice.id),
      processingTimestamp: Date.now()
    };
  }

  /**
   * Infer difficulty level from voice ID
   */
  private static inferLevel(voiceId: string): string {
    if (voiceId.includes('_beg_')) return 'beginner';
    if (voiceId.includes('_easy_')) return 'easy';
    if (voiceId.includes('_med_')) return 'medium';
    if (voiceId.includes('_hard_')) return 'hard';
    if (voiceId.includes('_exp_')) return 'expert';
    return 'unknown';
  }

  /**
   * Get voice statistics for debugging
   */
  static getVoiceStats(processedVoice: ProcessedVoice) {
    const { resolvedElements } = processedVoice;
    
    return {
      id: processedVoice.id,
      name: processedVoice.pn,
      level: this.inferLevel(processedVoice.id),
      elementCounts: {
        tones: resolvedElements.tones.length,
        hooks: resolvedElements.hooks.length,
        transitions: resolvedElements.transitions.length,
        settings: resolvedElements.settings.length,
        themes: resolvedElements.themes.length,
        sounds: resolvedElements.sounds.length
      },
      characteristics: {
        warmth: processedVoice.vf.warm,
        humor: processedVoice.vf.hum,
        cadence: processedVoice.vf.cad,
        pointOfView: processedVoice.ch.pov
      }
    };
  }
}