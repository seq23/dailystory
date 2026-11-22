/**
 * The story page's spoken commands: what a child (or the teacher beside them)
 * says to turn pages and start or stop the read-aloud.
 *
 * The transcript comes from the voice-to-text function, in whatever language the
 * child spoke. The phrases below include the ones each UI language's hint tells
 * the child to say (reader.voice.hint in src/i18n/locales/*.json), so the hint
 * and the parser cannot drift apart: src/test/guards/story-voice-commands.test.ts
 * reads every locale's hint and parses each quoted phrase.
 */
export type StoryVoiceCommand = 'next' | 'back' | 'read' | 'stop';

// Order matters: "stop reading" is stop, "read the next page" is next.
const PHRASES: Array<[StoryVoiceCommand, string[]]> = [
  ['stop', [
    'stop', 'stop reading', 'pause', 'be quiet',
    'detente', 'alto', 'pausa', // es ('para' is also "for")
    'arrete', 'arreter', 'pause', // fr
    'pare', 'parar', // pt
    '停', '停止', '暂停', // zh
    'रुको', 'रुकें', 'बंद करो', // hi
    'توقف', 'قف', // ar
    'رکو', 'بند کرو', // ur
  ]],
  ['back', [
    'back', 'go back', 'previous', 'previous page', 'page back',
    'atras', 'anterior', 'pagina anterior', 'regresa', // es
    'retour', 'precedent', 'page precedente', 'reviens', // fr
    'voltar', 'volta', 'pagina anterior', // pt
    '上一页', '返回', '后退', // zh
    'पीछे', 'पिछला', 'पिछला पेज', 'वापस', // hi
    'رجوع', 'السابق', 'الصفحة السابقة', 'ارجع', // ar
    'پیچھے', 'پچھلا', 'پچھلا صفحہ', 'واپس', // ur
  ]],
  ['next', [
    'next', 'next page', 'turn the page', 'forward', 'go on',
    'siguiente', 'pagina siguiente', 'adelante', // es
    'suivant', 'page suivante', 'suivante', // fr
    'proxima', 'proxima pagina', 'proximo', 'avancar', // pt
    '下一页', '下一个', '翻页', // zh
    'अगला', 'अगला पेज', 'आगे', // hi
    'التالي', 'الصفحة التالية', 'التالية', // ar
    'اگلا', 'اگلا صفحہ', 'آگے', // ur
  ]],
  ['read', [
    'read', 'read to me', 'read it', 'read this', 'read the page', 'read again',
    'start reading', 'play', 'repeat',
    'leeme', 'lee', 'leer', // es
    'lis moi', 'lis', 'lire', // fr
    'leia para mim', 'leia', 'ler', // pt
    '读给我听', '朗读', '读', // zh
    'पढ़कर सुनाओ', 'पढ़ो', 'पढ़िए', // hi
    'اقرأ لي', 'اقرأ', // ar
    'پڑھ کر سناؤ', 'پڑھو', // ur
  ]],
];

/** Lower case, punctuation to spaces, Latin accents dropped (Devanagari and Arabic marks kept). */
export function foldSpeech(text: string): string {
  return text
    .normalize('NFKC')
    .toLowerCase()
    .replace(/[^\p{L}\p{M}\p{N}\s]/gu, ' ')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .normalize('NFC')
    .replace(/\s+/g, ' ')
    .trim();
}

const HAN = /\p{Script=Han}/u;
// A child reading the page aloud is not a command: commands are short.
const MAX_WORDS = 6;
const MAX_HAN_CHARS = 8;

const FOLDED: Array<[StoryVoiceCommand, string[]]> = PHRASES.map(([cmd, list]) => [cmd, list.map(foldSpeech)]);

export function parseStoryVoiceCommand(transcript: string): StoryVoiceCommand | null {
  const text = foldSpeech(transcript || '');
  if (!text) return null;
  const isHan = HAN.test(text);
  if (isHan ? text.replace(/\s/g, '').length > MAX_HAN_CHARS : text.split(' ').length > MAX_WORDS) return null;
  const padded = ` ${text} `;
  for (const [cmd, phrases] of FOLDED) {
    for (const phrase of phrases) {
      if (HAN.test(phrase) ? text.includes(phrase) : padded.includes(` ${phrase} `)) return cmd;
    }
  }
  return null;
}

/** Words the speech model is primed with, so short commands are heard as commands. */
export const STORY_VOICE_PROMPT = 'Next page. Go back. Read to me. Stop.';
