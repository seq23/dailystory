// Children's names never reach a free model (26 Oct 2026, owner rule).
//
// Free endpoints (OpenRouter ":free", Workers AI free allocation) may log or train
// on inputs, and story prompts carry the child's name. Before a request leaves on
// those routes every known name is swapped for a placeholder ("Kiki"), and the
// placeholder is swapped back in the text that returns. One helper, used by every
// function on the free route through storyTextProvider.ts.
// Guard: src/test/guards/story-text-provider.test.ts (the outgoing free body
// contains no real name).

// The placeholder keeps the child's pronouns: a boy's name is never swapped for a
// name a model reads as a girl's (live 26 Oct 2026: "Kiki" made Aiden "she").
const PLACEHOLDERS = {
  boy: ["Milo", "Theo", "Remy", "Otto"],
  girl: ["Lulu", "Nina", "Pia", "Elsa"],
  neutral: ["Kiki", "Momo", "Bibi", "Zuzu"],
} as const;
export type NameGender = keyof typeof PLACEHOLDERS;
export interface PrivateName { name: string; gender?: NameGender }

/** "boy"/"male"/"he" → boy, "girl"/"female"/"she" → girl, anything else → neutral. */
export function genderOf(hint: unknown): NameGender {
  const h = String(hint ?? "").toLowerCase();
  if (/\b(boy|male|man|he|him)\b/.test(h)) return "boy";
  if (/\b(girl|female|woman|she|her)\b/.test(h)) return "girl";
  return "neutral";
}

const escape = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const wordRe = (w: string) => new RegExp(`(?<![\\p{L}\\p{N}])${escape(w)}(?![\\p{L}\\p{N}])`, "giu");

/** Names from a story prompt's `Character Info: {...}` JSON, the child's with their gender. */
export function namesFromCharacterInfo(text: string): PrivateName[] {
  const out: PrivateName[] = [];
  for (const m of text.matchAll(/Character Info:\s*(\{[^\n]*\})/g)) {
    try {
      const info = JSON.parse(m[1]);
      const gender = genderOf(info?.gender ?? info?.avatarType ?? info?.avatar?.type);
      for (const k of ["name", "displayName"]) if (typeof info?.[k] === "string") out.push({ name: info[k], gender });
      for (const k of ["parentName", "siblingName", "school", "city"]) if (typeof info?.[k] === "string") out.push({ name: info[k] });
    } catch { /* not JSON */ }
  }
  return out;
}

type NameInput = string | PrivateName | null | undefined;
const asPrivate = (n: NameInput): PrivateName | null =>
  !n ? null : typeof n === "string" ? { name: n } : n.name ? n : null;

/** The names to hide: full names, and each part of a multi-word name (3+ letters). */
export function expandNames(names: NameInput[]): string[] {
  const set = new Set<string>();
  for (const raw of names) {
    const n = (asPrivate(raw)?.name ?? "").trim();
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

export function deidentify(texts: string[], names: NameInput[]): Deidentified {
  const all = texts.join("\n");
  const pairs: Array<[string, string]> = [];
  // A gender known for a name (from any source) decides its placeholder pool.
  const genderFor = new Map<string, NameGender>();
  for (const raw of names) {
    const p = asPrivate(raw);
    if (!p) continue;
    const key = p.name.trim().toLowerCase();
    if (p.gender && p.gender !== "neutral") genderFor.set(key, p.gender);
    else if (!genderFor.has(key)) genderFor.set(key, "neutral");
  }
  const used = new Set<string>();
  const nextPlaceholder = (full: string): string => {
    const pool = PLACEHOLDERS[genderFor.get(full.toLowerCase()) ?? "neutral"];
    const ph = [...pool, ...PLACEHOLDERS.neutral].find((p) => !used.has(p) && !wordRe(p).test(all));
    const chosen = ph ?? `Kid${used.size + 1}`;
    used.add(chosen);
    return chosen;
  };
  const wanted = expandNames(names).filter((n) => wordRe(n).test(all));
  // Parts of a full name share its placeholder ("Mary Jane" and "Mary" → "Kiki").
  const assigned = new Map<string, string>();
  for (const n of wanted) {
    const parent = [...assigned.keys()].find((full) => full.split(/\s+/).some((p) => p.toLowerCase() === n.toLowerCase()));
    const ph = parent ? assigned.get(parent)! : nextPlaceholder(n);
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
