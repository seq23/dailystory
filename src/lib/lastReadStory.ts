// The story a child just read, kept for the session-ended page (26 Oct 2026).
//
// The session-ended page offers the quiz and the games from the story text. It read
// sessionStorage 'last_story_text', which handleEndSession wrote from the story state
// at that moment. When the timer ran out while a NEW story was being written (the
// parent had gone to My Stories and asked for one), that state was empty, so the page
// said "Missing story data" and the quiz and games were dead. Now the reading page
// records the story as it is read, never overwrites it with nothing, and the
// session-ended page falls back to it. Guard: src/test/guards/session-ended-story.test.ts.

export const LAST_READ_STORY_KEY = "t2r.lastReadStory";

export interface LastReadStory {
  text: string;
  title: string;
  /** Pages the child reached (1-based count). */
  pagesRead: number;
  /** Words on the pages the child reached. */
  wordsRead: number;
  grade?: string;
  readingLevel?: string;
  savedAt: number;
}

export const countWords = (text: string | null | undefined): number => (text?.trim().match(/\S+/g) ?? []).length;

/** Pages reached and the words on them, from the pages and the page index the child is on. */
export function readingProgress(pages: readonly string[], currentPage: number): { pagesRead: number; wordsRead: number } {
  const list = Array.isArray(pages) ? pages : [];
  if (!list.length) return { pagesRead: 0, wordsRead: 0 };
  const last = Math.min(Math.max(0, currentPage), list.length - 1);
  const reached = list.slice(0, last + 1);
  return { pagesRead: reached.length, wordsRead: reached.reduce((n, p) => n + countWords(p), 0) };
}

/** Record the story being read. An empty story never replaces a real one. */
export function saveLastReadStory(entry: Omit<LastReadStory, "savedAt">, storage: Storage | undefined = globalThis.sessionStorage): void {
  if (!entry.text || !entry.text.trim()) return;
  try {
    storage?.setItem(LAST_READ_STORY_KEY, JSON.stringify({ ...entry, savedAt: Date.now() }));
  } catch { /* storage full or blocked */ }
}

export function loadLastReadStory(storage: Storage | undefined = globalThis.sessionStorage): LastReadStory | null {
  try {
    const raw = storage?.getItem(LAST_READ_STORY_KEY);
    if (!raw) return null;
    const v = JSON.parse(raw) as LastReadStory;
    return typeof v?.text === "string" && v.text.trim() ? v : null;
  } catch {
    return null;
  }
}
