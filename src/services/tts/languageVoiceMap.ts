/**
 * Language → ElevenLabs voice map (frontend defaults).
 *
 * Purpose: pick a narration voice whose English carries the native accent of
 * each supported UI language (e.g. Urdu → Pakistani-accented English).
 *
 * Runtime resolution order (see supabase/functions/elevenlabs-tts):
 *   1. Row in public.voice_overrides for the language (admin-managed)
 *   2. Hard-coded default below
 *   3. Charlotte (English) as final fallback
 *
 * Voice IDs marked as `CHARLOTTE_FALLBACK` should be replaced by the real
 * accented voice IDs via /admin/voices once selected from the ElevenLabs
 * Voice Library. Until then the app narrates in Charlotte's neutral English.
 */

export type SupportedLanguage =
  | 'en' | 'ur' | 'hi' | 'ar' | 'es' | 'fr' | 'zh' | 'pt' | 'sw' | 'ru' | 'tr';

export interface VoiceMapEntry {
  voiceId: string;
  displayName: string;
  accentNote: string;
  modelId: string;
}

const CHARLOTTE_ID = 'XB0fDUnXU5powFXDhCwa';
const DEFAULT_MODEL = 'eleven_turbo_v2_5';

export const LANGUAGE_VOICE_MAP: Record<SupportedLanguage, VoiceMapEntry> = {
  en: { voiceId: CHARLOTTE_ID, displayName: 'Charlotte (English)',       accentNote: 'Neutral English',                       modelId: DEFAULT_MODEL },
  ur: { voiceId: CHARLOTTE_ID, displayName: 'Pakistani English (pending)', accentNote: 'Pakistani / South-Asian English accent', modelId: DEFAULT_MODEL },
  hi: { voiceId: CHARLOTTE_ID, displayName: 'Indian English (pending)',    accentNote: 'Indian English accent',                 modelId: DEFAULT_MODEL },
  ar: { voiceId: CHARLOTTE_ID, displayName: 'Arabic English (pending)',    accentNote: 'Levantine/Gulf English accent',         modelId: DEFAULT_MODEL },
  es: { voiceId: CHARLOTTE_ID, displayName: 'Latino English (pending)',    accentNote: 'Latin-American English accent',         modelId: DEFAULT_MODEL },
  fr: { voiceId: CHARLOTTE_ID, displayName: 'French English (pending)',    accentNote: 'French English accent',                 modelId: DEFAULT_MODEL },
  zh: { voiceId: CHARLOTTE_ID, displayName: 'Chinese English (pending)',   accentNote: 'Mandarin-Chinese English accent',       modelId: DEFAULT_MODEL },
  pt: { voiceId: CHARLOTTE_ID, displayName: 'Brazilian English (pending)', accentNote: 'Brazilian-Portuguese English accent',   modelId: DEFAULT_MODEL },
  sw: { voiceId: CHARLOTTE_ID, displayName: 'Swahili English (pending)',   accentNote: 'East-African English accent',           modelId: DEFAULT_MODEL },
  ru: { voiceId: CHARLOTTE_ID, displayName: 'Russian English (pending)',   accentNote: 'Russian English accent',                modelId: DEFAULT_MODEL },
  tr: { voiceId: CHARLOTTE_ID, displayName: 'Turkish English (pending)',   accentNote: 'Turkish English accent',                modelId: DEFAULT_MODEL },
};

export function resolveDefaultVoice(language?: string | null): VoiceMapEntry {
  const code = (language || 'en').toLowerCase() as SupportedLanguage;
  return LANGUAGE_VOICE_MAP[code] ?? LANGUAGE_VOICE_MAP.en;
}

export const SUPPORTED_LANGUAGE_CODES: SupportedLanguage[] = [
  'en', 'ur', 'hi', 'ar', 'es', 'fr', 'zh', 'pt', 'sw', 'ru', 'tr',
];