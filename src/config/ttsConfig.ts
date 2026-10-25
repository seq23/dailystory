/**
 * TTS CONFIGURATION
 *
 * Which voice each tier gets. Read by src/services/narrationRouter.ts, which every
 * ElevenLabs entry point in CharlotteVoiceService goes through.
 *
 * Free and guest readers: the browser voice ($0). Premium: Charlotte (ElevenLabs),
 * falling back once to the browser voice when ElevenLabs refuses.
 * docs/PRICING.md states this; src/test/guards/pricing-doc.test.ts fails if the
 * doc and this file disagree.
 */

export type TTSProvider = 'elevenlabs' | 'browser';

export const TTS_CONFIG = {
  /**
   * TTS provider for guest (free) users.
   * 
   * 'browser'    = Free browser speechSynthesis API (zero cost) — the setting since 25 Oct 2026
   * 'elevenlabs' = Charlotte via ElevenLabs (spends her ElevenLabs credits)
   */
  GUEST_TTS_PROVIDER: 'browser' as TTSProvider,

  /**
   * TTS provider for premium users. Should always be 'elevenlabs'.
   */
  PREMIUM_TTS_PROVIDER: 'elevenlabs' as TTSProvider,

  /**
   * Browser TTS settings (free and guest readers, and the premium fallback)
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
 * Which TTS provider a reader gets. `isPremium` is the PAID status
 * (narrationRouter's setNarrationPremium), not the UI's "signed in" premium.
 */
export function getTTSProvider(isPremium: boolean): TTSProvider {
  return isPremium 
    ? TTS_CONFIG.PREMIUM_TTS_PROVIDER 
    : TTS_CONFIG.GUEST_TTS_PROVIDER;
}
