// The reader's names travel with every AI request (R-KID-01, 22 Nov 2026), so the server
// can mask them before any model sees the text. A signed-in account's names are also
// looked up on the server (supabase/functions/_shared/privacyLane.ts); a guest has no
// account, so the names the browser holds are the only way the server learns them.
// They ride in the JSON body as `readerNames`, added by the Supabase client's fetch
// (src/integrations/supabase/client.ts), so no call site can forget them.

/** Edge functions that send text to an AI model. */
export const AI_TEXT_FUNCTIONS = [
  "generate-adaptive-story",
  "generate-quiz",
  "word-dictionary",
  "translate-universal",
  "correct-spelling",
  "runware-generate-image",
] as const;

const MAX_NAMES = 20;
// The name being typed in the form: each keystroke replaces it, so a half-typed name is not kept.
let typed: string | null = null;

const clean = (v: unknown): string | null => {
  if (typeof v !== "string") return null;
  const n = v.trim().slice(0, 60);
  return n.length >= 2 && n.toLowerCase() !== "guest" ? n : null;
};

/** The name typed in the form's Child's Name field, for this page's AI requests. */
export function rememberReaderName(name: unknown): void {
  typed = clean(name);
}

/** Every reader name this browser holds right now. */
export function readerNames(): string[] {
  const out = new Set<string>(typed ? [typed] : []);
  // deno-lint-ignore no-explicit-any
  const w = (typeof window !== "undefined" ? window : {}) as any;
  const current = clean(w.__currentUserName);
  if (current) out.add(current);
  try {
    const stored = clean(localStorage.getItem("user_display_name"));
    if (stored) out.add(stored);
  } catch {
    // storage blocked: the typed name still goes
  }
  return [...out].slice(0, MAX_NAMES);
}

/** Forget the typed name (tests). */
export function forgetReaderNames(): void {
  typed = null;
}

const aiFunctionOf = (url: string): string | null => {
  const m = /\/functions\/v1\/([a-z0-9-]+)(?:[/?#]|$)/i.exec(url);
  return m && (AI_TEXT_FUNCTIONS as readonly string[]).includes(m[1]) ? m[1] : null;
};

/** A fetch that adds `readerNames` to the JSON body of every AI function call. */
export function withReaderNames(baseFetch: typeof fetch): typeof fetch {
  return (async (input: RequestInfo | URL, init?: RequestInit) => {
    const url = typeof input === "string" ? input : input instanceof URL ? input.href : (input as Request).url;
    const names = readerNames();
    if (!names.length || !aiFunctionOf(url) || typeof init?.body !== "string") return baseFetch(input, init);
    try {
      const body = JSON.parse(init.body);
      if (!body || typeof body !== "object" || Array.isArray(body)) return baseFetch(input, init);
      const given = Array.isArray(body.readerNames) ? body.readerNames : [];
      return baseFetch(input, { ...init, body: JSON.stringify({ ...body, readerNames: [...given, ...names].slice(0, MAX_NAMES) }) });
    } catch {
      return baseFetch(input, init);
    }
  }) as typeof fetch;
}
