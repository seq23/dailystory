/**
 * TTS CONFIGURATION
 * 
 * Central config to control which TTS provider is used per user tier.
 * When ready to cut ElevenLabs for guests, just flip GUEST_TTS_PROVIDER to 'browser'.
 * 
 * No other code changes needed — useAudioControls reads this config.
 */

export type TTSProvider = 'elevenlabs' | 'browser';

export const TTS_CONFIG = {
  /**
   * TTS provider for guest (free) users.
   * 
   * 'elevenlabs' = Full Charlotte voice via ElevenLabs (current, expensive)
   * 'browser'    = Free browser speechSynthesis API (zero cost)
   * 
   * ⚡ FLIP THIS TO 'browser' TO SAVE ON GUEST TTS COSTS ⚡
   */
  GUEST_TTS_PROVIDER: 'elevenlabs' as TTSProvider,

  /**
   * TTS provider for premium users. Should always be 'elevenlabs'.
   */
  PREMIUM_TTS_PROVIDER: 'elevenlabs' as TTSProvider,

  /**
   * Browser TTS settings for guest users (when GUEST_TTS_PROVIDER = 'browser')
   */
  BROWSER_TTS_DEFAULTS: {
    rate: 0.8,
    pitch: 1.0,
    volume: 1.0,
    /** Use a child-friendly voice name if available */
    preferredVoiceNames: ['Samantha', 'Karen', 'Moira', 'Google UK English Female', 'Microsoft Zira'],
  },
} as const;

/**
 * Determine which TTS provider to use for the current user.
 */
export function getTTSProvider(isPremium: boolean): TTSProvider {
  return isPremium 
    ? TTS_CONFIG.PREMIUM_TTS_PROVIDER 
    : TTS_CONFIG.GUEST_TTS_PROVIDER;
}
