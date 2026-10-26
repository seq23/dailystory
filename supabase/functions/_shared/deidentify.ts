// Children's names never reach a free model (26 Oct 2026, owner rule).
//
// Free endpoints (OpenRouter ":free", Workers AI free allocation) may log or train
// on inputs, and story prompts carry the child's name. Before a request leaves on
// those routes every known name is swapped for a placeholder ("Kiki"), and the
// placeholder is swapped back in the text that returns. One helper, used by every
// function on the free route through storyTextProvider.ts.
// Guard: src/test/guards/story-text-provider.test.ts (the outgoing free body
// contains no real name).

const PLACEHOLDERS = ["Kiki", "Lulu", "Momo", "Bibi", "Nini", "Pipa", "Tutu", "Zuzu"];

const escape = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const wordRe = (w: string) => new RegExp(`(?<![\\p{L}\\p{N}])${escape(w)}(?![\\p{L}\\p{N}])`, "giu");

/** Names from a story prompt's `Character Info: {...}` JSON. */
export function namesFromCharacterInfo(text: string): string[] {
  const out: string[] = [];
  for (const m of text.matchAll(/Character Info:\s*(\{[^\n]*\})/g)) {
    try {
      const info = JSON.parse(m[1]);
      for (const k of ["name", "displayName", "parentName", "siblingName", "school", "city"]) {
        if (typeof info?.[k] === "string") out.push(info[k]);
      }
    } catch { /* not JSON */ }
  }
  return out;
}

/** The names to hide: full names, and each part of a multi-word name (3+ letters). */
export function expandNames(names: Array<string | null | undefined>): string[] {
  const set = new Set<string>();
  for (const raw of names) {
    const n = (raw ?? "").trim();
    if (n.length < 2) continue;
    set.add(n);
    for (const part of n.split(/\s+/)) if (part.length >= 3) set.add(part);
  }
  // Longest first, so "Mary Jane" is replaced before "Mary".
  return [...set].sort((a, b) => b.length - a.length);
}

export interface Deidentified {
  /** The texts with every name replaced by a placeholder. */
  texts: string[];
  /** Put the real names back into text that came back from the model. */
  restore: (text: string) => string;
  /** The placeholder → name pairs used (empty when there was nothing to hide). */
  pairs: Array<[placeholder: string, name: string]>;
}

export function deidentify(texts: string[], names: Array<string | null | undefined>): Deidentified {
  const all = texts.join("\n");
  const pairs: Array<[string, string]> = [];
  const free = PLACEHOLDERS.filter((p) => !wordRe(p).test(all));
  const wanted = expandNames(names).filter((n) => wordRe(n).test(all));
  // Parts of a full name share its placeholder ("Mary Jane" and "Mary" → "Kiki").
  const assigned = new Map<string, string>();
  for (const n of wanted) {
    const parent = [...assigned.keys()].find((full) => full.split(/\s+/).some((p) => p.toLowerCase() === n.toLowerCase()));
    const ph = parent ? assigned.get(parent)! : free[pairs.length] ?? `Kid${pairs.length + 1}`;
    assigned.set(n, ph);
    if (!parent) pairs.push([ph, n]);
  }
  const masked = texts.map((t) => {
    let out = t;
    for (const [n, ph] of assigned) out = out.replace(wordRe(n), ph);
    return out;
  });
  return {
    texts: masked,
    pairs,
    restore: (text: string) => {
      let out = text;
      for (const [ph, n] of pairs) out = out.replace(wordRe(ph), n);
      return out;
    },
  };
}
