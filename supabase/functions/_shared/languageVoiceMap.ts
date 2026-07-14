// Mirror of src/services/tts/languageVoiceMap.ts for edge-function use.
// Keep the two files in sync when changing defaults.

export type SupportedLanguage =
  | 'en' | 'ur' | 'hi' | 'ar' | 'es' | 'fr' | 'zh' | 'pt' | 'sw' | 'ru' | 'tr';

const CHARLOTTE_ID = 'XB0fDUnXU5powFXDhCwa';
const DEFAULT_MODEL = 'eleven_turbo_v2_5';

export const LANGUAGE_VOICE_MAP: Record<string, { voiceId: string; modelId: string }> = {
  en: { voiceId: CHARLOTTE_ID, modelId: DEFAULT_MODEL },
  ur: { voiceId: CHARLOTTE_ID, modelId: DEFAULT_MODEL },
  hi: { voiceId: CHARLOTTE_ID, modelId: DEFAULT_MODEL },
  ar: { voiceId: CHARLOTTE_ID, modelId: DEFAULT_MODEL },
  es: { voiceId: CHARLOTTE_ID, modelId: DEFAULT_MODEL },
  fr: { voiceId: CHARLOTTE_ID, modelId: DEFAULT_MODEL },
  zh: { voiceId: CHARLOTTE_ID, modelId: DEFAULT_MODEL },
  pt: { voiceId: CHARLOTTE_ID, modelId: DEFAULT_MODEL },
  sw: { voiceId: CHARLOTTE_ID, modelId: DEFAULT_MODEL },
  ru: { voiceId: CHARLOTTE_ID, modelId: DEFAULT_MODEL },
  tr: { voiceId: CHARLOTTE_ID, modelId: DEFAULT_MODEL },
};

export const CHARLOTTE_FALLBACK_ID = CHARLOTTE_ID;
export const DEFAULT_ELEVENLABS_MODEL = DEFAULT_MODEL;

// Hard cap on characters per TTS request (cost guardrail).
export const TTS_MAX_CHARACTERS = 4000;