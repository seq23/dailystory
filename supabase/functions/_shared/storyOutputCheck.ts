// Every model answer is checked before it can reach a child's page (26 Oct 2026).
//
// Live, a free reasoning model's planning text was shown as page 1 of a story:
//   "Let me analyze the requirements carefully: Continuous narrative with"
// (thinking, not story, and cut off). storyTextProvider.ts now asks OpenRouter for
// no reasoning, strips <think> blocks, and runs one of these checks on every
// answer; a rejected answer moves the chain to the next model.
// Guard: src/test/guards/story-text-provider.test.ts (that exact text is a fixture).

/** Remove reasoning a model put in its answer: <think>…</think>, or an unclosed <think> to the end. */
export function stripReasoning(text: string): string {
  return text
    .replace(/<think(?:ing)?>[\s\S]*?<\/think(?:ing)?>/gi, "")
    .replace(/<think(?:ing)?>[\s\S]*$/i, "")
    .trim();
}

/** Remove *** / ** / * page markers at the very start and end of an answer. */
export function stripPageMarkers(text: string): string {
  return (text ?? "").replace(/^(\s*\*{1,3}\s*)+/, "").replace(/(\s*\*{1,3}\s*)+$/, "").trim();
}

/**
 * A whole story cut off by the token budget (finish_reason "length"): the complete pages
 * before the last page marker, or null when fewer than minPages are complete. A budget
 * cut must not throw away a good story (27 Oct 2026: every guest story was rejected so).
 */
export function completePagesOf(text: string, minPages = 6): string | null {
  const t = stripReasoning(text ?? "");
  const cut = t.lastIndexOf("***");
  if (cut <= 0) return null;
  const head = t.slice(0, cut).trim();
  const pages = head.split(/\s*\*{3}\s*/).filter((p) => p.trim());
  return pages.length >= minPages ? `${head}\n***` : null;
}

/** For whole stories: a budget cut keeps its complete pages; then the usual checks. */
export function wholeStoryTextProblem(text: string, finishReason?: string | null): string | null {
  if (finishReason === "length") {
    const kept = completePagesOf(text);
    return kept ? storyTextProblem(kept, null) : "truncated (finish_reason length, under 6 complete pages)";
  }
  return storyTextProblem(text, finishReason);
}

const META_START = /^\s*(let me\b|let's (analy[sz]e|think|break)|okay[,.]|ok[,.]|alright[,.]|first[,]|i need to\b|i will\b|i'll\b|i'm going to\b|we need to\b|here is\b|here's\b|sure[,!.]|certainly[,!.]|the user\b|thinking\b|analysis\b)/i;
const META_ANYWHERE = /\b(as an ai|language model|the user (wants|asked|is asking)|word count|requirements?\b|analy[sz]e\b|analy[sz]ing\b|continuous narrative|the prompt|output format|constraints?\b|step \d+:|draft:)/i;
const MARKDOWN_HEADER = /^\s{0,3}#{1,6}\s/m;
const JSON_START = /^\s*[{[]/;
const ENDS_LIKE_PROSE = /[.!?…]["'”’)\]*_]*\s*$/;

/**
 * Why this text starts mid-sentence, or null when its start is a real sentence start.
 * A 6th-grade page once began "and waited…" (26 Oct 2026): a model continued the last
 * sentence of the page before. Rejected so the chain asks the next model/tier.
 * Allowed: a capital letter, a digit, an opening quote or bracket (dialogue may start
 * any way it likes), and a capitalised connector that starts a real sentence
 * ("But Kiki was brave."). Rejected: a lowercase first letter, leading punctuation
 * that only continues something ("…", ",", ";", ":", "—", "-"), and a connector
 * with no subject after it ("And waited by the door.").
 */
const OPENS_WITH_QUOTE = /^["'“‘«(\[]/;
const CONTINUATION_PUNCTUATION = /^(\.\.\.|[…,;:—–-])/;
const SUBJECTLESS_CONNECTOR = /^(and|or|nor|but|then|so)\s+[a-z]+(ed|ing)\b/i;
export function midSentenceStart(text: string): string | null {
  const t = (text ?? "").replace(/^[\s*_#>]+/, "");
  if (!t) return null;
  if (OPENS_WITH_QUOTE.test(t)) return null;
  if (CONTINUATION_PUNCTUATION.test(t)) return `starts mid-sentence: "${t.slice(0, 30)}"`;
  if (/^[a-z]/.test(t)) return `starts mid-sentence (lowercase): "${t.slice(0, 30)}"`;
  if (SUBJECTLESS_CONNECTOR.test(t)) return `starts mid-sentence (connector fragment): "${t.slice(0, 30)}"`;
  return null;
}

/**
 * Why this answer must not be a story page, or null when it may.
 * @param minChars far shorter than this is rejected (default 80).
 */
export function storyTextProblem(text: string, finishReason?: string | null, minChars = 80): string | null {
  // A page marker before or after the text is format, not a cut-off: the prompts end
  // every page with "***", so "…flight.\n***" is a finished page (27 Oct 2026: the free
  // tier's best model was rejected as "cut off" for exactly that, on every guest story).
  const t = stripPageMarkers(stripReasoning(text ?? ""));
  if (!t) return "empty";
  if (finishReason === "length") return "truncated (finish_reason length)";
  if (META_START.test(t)) return `planning text: "${t.slice(0, 60)}"`;
  const meta = t.match(META_ANYWHERE);
  if (meta) return `planning text ("${meta[0]}")`;
  if (MARKDOWN_HEADER.test(t)) return "markdown header";
  if (JSON_START.test(t)) return "JSON, not story text";
  if (!ENDS_LIKE_PROSE.test(t)) return "cut off (no ending punctuation)";
  const mid = midSentenceStart(t);
  if (mid) return mid;
  if (t.length < minChars) return `too short (${t.length} < ${minChars} chars)`;
  return null;
}

/** For JSON answers (word definitions): must parse and carry the named field. */
export function jsonAnswerProblem(field: string) {
  return (text: string, finishReason?: string | null): string | null => {
    const t = stripReasoning(text ?? "");
    if (finishReason === "length") return "truncated (finish_reason length)";
    const fenced = t.match(/```(?:json)?\s*([\s\S]*?)```/i);
    const body = fenced ? fenced[1] : t;
    const s = body.indexOf("{"), e = body.lastIndexOf("}");
    try {
      const v = JSON.parse(s >= 0 && e > s ? body.slice(s, e + 1) : body);
      const f = v?.[field];
      return typeof f === "string" && f.trim() && !META_ANYWHERE.test(f) ? null : `JSON without a usable "${field}"`;
    } catch {
      return "not JSON";
    }
  };
}

/** For short free text (translation, spelling): no reasoning, no meta talk, not cut off. */
export function plainAnswerProblem(text: string, finishReason?: string | null): string | null {
  const t = stripReasoning(text ?? "");
  if (!t) return "empty";
  if (finishReason === "length") return "truncated (finish_reason length)";
  if (META_START.test(t) && /\b(let me|i need|i will|the user|analy)/i.test(t)) return `planning text: "${t.slice(0, 60)}"`;
  if (/\b(as an ai|language model|the user (wants|asked))\b/i.test(t)) return "planning text";
  return null;
}
