/**
 * What the speech model is told about a story-page voice command clip
 * (supabase/functions/voice-to-text, mode "command").
 *
 * Whisper repeats its prompt when a clip holds no speech, so a prompt made of
 * command words ("Next page. Go back...") turned a silent tap into a page turn.
 * These prompts only say what the clip is, in the child's UI language, and hold
 * no command word: src/test/guards/story-voice-commands.test.tsx parses every
 * run of words in each one and expects no command. A transcript that is only an
 * echo of the prompt is dropped as well (commandTranscript).
 *
 * Plain TypeScript with no imports, so the edge function and vitest share it.
 */
export const VOICE_COMMAND_PROMPTS = {
  en: 'Hello. This is a short clip from a children\'s story app.',
  es: 'Hola. Esto es un clip corto de una aplicación de cuentos infantiles.',
  fr: 'Bonjour. Ceci est un court extrait d\'une application d\'histoires pour enfants.',
  pt: 'Olá. Este é um clipe curto de um aplicativo de histórias infantis.',
  zh: '你好。这是儿童故事应用里的一段短录音。',
  hi: 'नमस्ते। यह बच्चों की कहानी ऐप की एक छोटी रिकॉर्डिंग है।',
  ar: 'مرحبا. هذا مقطع قصير من تطبيق قصص للأطفال.',
  ur: 'السلام علیکم۔ یہ بچوں کی کہانیوں والی ایپ کا ایک مختصر کلپ ہے۔',
} as const;

export type VoiceCommandLanguage = keyof typeof VOICE_COMMAND_PROMPTS;

/** The UI language as Whisper's ISO-639-1 code, or null when it is not one of ours. */
export function voiceCommandLanguage(raw: unknown): VoiceCommandLanguage | null {
  if (typeof raw !== 'string') return null;
  const code = raw.trim().toLowerCase().slice(0, 2);
  return Object.prototype.hasOwnProperty.call(VOICE_COMMAND_PROMPTS, code) ? (code as VoiceCommandLanguage) : null;
}

const fold = (s: string) => s.normalize('NFKC').toLowerCase().replace(/[^\p{L}\p{M}\p{N}]+/gu, ' ').trim();

/** The transcript, or "" when it is empty or only (part of) the prompt echoed back. */
export function commandTranscript(text: unknown, prompt: string): string {
  const said = typeof text === 'string' ? text.trim() : '';
  const folded = fold(said);
  if (!folded) return '';
  return fold(prompt).includes(folded) ? '' : said;
}
