// word-dictionary never answers "Unable to get definition" (26 Oct 2026, when OpenAI
// had no credit). Order: OpenAI → Lovable AI gateway (storyTextProvider.ts) →
// the free dictionary at dictionaryapi.dev (English, no key) → a kind built-in entry.
// Guard: src/test/guards/story-text-provider.test.ts.

export interface WordEntry {
  word: string;
  definition: string;
  phonetic: string;
  sampleSentence: string;
  difficulty: "easy" | "medium" | "hard";
  partOfSpeech: string;
}

/** Models sometimes wrap JSON in ```json fences or add a line of text around it. */
export function parseModelJson<T = unknown>(content: string): T {
  const fenced = content.match(/```(?:json)?\s*([\s\S]*?)```/i);
  const body = fenced ? fenced[1] : content;
  const start = body.indexOf("{");
  const end = body.lastIndexOf("}");
  return JSON.parse(start >= 0 && end > start ? body.slice(start, end + 1) : body) as T;
}

export const FREE_DICTIONARY_URL = "https://api.dictionaryapi.dev/api/v2/entries/en/";

type FetchLike = (url: string, init?: RequestInit) => Promise<Response>;

/** English only. Returns null when the free dictionary has no entry or is down. */
export async function freeDictionaryLookup(word: string, fetchImpl: FetchLike = (u, i) => fetch(u, i)): Promise<WordEntry | null> {
  try {
    const res = await fetchImpl(FREE_DICTIONARY_URL + encodeURIComponent(word));
    if (!res.ok) return null;
    // deno-lint-ignore no-explicit-any
    const data: any = await res.json();
    const entry = Array.isArray(data) ? data[0] : null;
    // deno-lint-ignore no-explicit-any
    const meaning = entry?.meanings?.find((m: any) => m?.definitions?.[0]?.definition);
    const def = meaning?.definitions?.[0];
    if (!def?.definition) return null;
    return {
      word,
      definition: String(def.definition),
      phonetic: String(entry.phonetic || entry.phonetics?.find((p: { text?: string }) => p?.text)?.text || `/${word}/`),
      sampleSentence: String(def.example || `Can you find "${word}" in the story?`),
      difficulty: word.length <= 5 ? "easy" : word.length <= 8 ? "medium" : "hard",
      partOfSpeech: String(meaning.partOfSpeech || "word"),
    };
  } catch {
    return null;
  }
}

const BUILT_IN: Record<string, (w: string) => { definition: string; sentence: string }> = {
  en: (w) => ({ definition: `"${w}" is a word in your story. Read the sentence around it — the words nearby are clues to what it means.`, sentence: `Let's say "${w}" out loud together.` }),
  es: (w) => ({ definition: `"${w}" es una palabra de tu cuento. Lee la oración: las palabras cercanas son pistas de lo que significa.`, sentence: `Digamos "${w}" en voz alta.` }),
  fr: (w) => ({ definition: `« ${w} » est un mot de ton histoire. Lis la phrase autour : les mots voisins sont des indices.`, sentence: `Disons « ${w} » à voix haute.` }),
  pt: (w) => ({ definition: `"${w}" é uma palavra da sua história. Leia a frase: as palavras próximas são pistas do significado.`, sentence: `Vamos dizer "${w}" em voz alta.` }),
  zh: (w) => ({ definition: `"${w}" 是故事里的一个词。读一读它前后的句子，旁边的词就是线索。`, sentence: `我们一起大声读 "${w}"。` }),
  hi: (w) => ({ definition: `"${w}" आपकी कहानी का एक शब्द है। आसपास का वाक्य पढ़ें — पास के शब्द इसके अर्थ के सुराग हैं।`, sentence: `आइए "${w}" ज़ोर से बोलें।` }),
  ar: (w) => ({ definition: `"${w}" كلمة من قصتك. اقرأ الجملة حولها، فالكلمات القريبة تدل على معناها.`, sentence: `لنقل "${w}" بصوت عالٍ.` }),
};

/** Last resort: never an error, never "Unable to get definition". */
export function builtInWordEntry(word: string, language = "en"): WordEntry {
  const t = (BUILT_IN[language] ?? BUILT_IN.en)(word);
  return {
    word,
    definition: t.definition,
    phonetic: `/${word}/`,
    sampleSentence: t.sentence,
    difficulty: word.length <= 5 ? "easy" : word.length <= 8 ? "medium" : "hard",
    partOfSpeech: "word",
  };
}
