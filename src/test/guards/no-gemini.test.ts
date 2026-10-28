// Guard (26 Oct 2026): no Gemini anywhere in the product. The Gemini API terms forbid
// services likely to be used by under-18s, and the Lovable AI gateway serves Gemini
// models. Every edge function's text goes through ../_shared/storyTextProvider.ts
// (config/product_inference.json text_chain). Fails on any code (comments aside) under
// supabase/functions that names the gateway, a Gemini model, or their keys.
//
// Scoped out, by owner decision (26 Oct 2026, "the image prompts should remain runware"):
// the Runware image path (runware-generate-image and its prompt helper
// _shared/imagePrompt.ts). That helper's scene-text step still calls a Gemini model
// through the Lovable gateway (_shared/imagePrompt.ts:396 and :404); it is left as it
// is and named here so it stays visible.
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, relative } from "node:path";
import { describe, expect, it } from "vitest";
import { quizAnswerProblem } from "../../../supabase/functions/_shared/quiz";

const ROOT = join(__dirname, "../../..");
function files(dir: string): string[] {
  return readdirSync(dir).flatMap((n) => {
    const f = join(dir, n);
    if (statSync(f).isDirectory()) return n === "_vendor" || n === "node_modules" ? [] : files(f);
    return /\.(ts|js|mjs|json|jsonc)$/.test(n) ? [f] : [];
  });
}
const RUNWARE_IMAGE_PATH = /supabase\/functions\/(runware-generate-image\/|_shared\/imagePrompt\.ts$)/;
const code = (src: string) => src.replace(/\/\*[\s\S]*?\*\//g, "").replace(/^\s*\/\/.*$/gm, "").replace(/([^:])\/\/.*$/gm, "$1");
export const BANNED = /ai\.gateway\.lovable|lovable\.dev\/v1|["'`]google\/gemini|\bgemini-[\d.]|generativelanguage\.googleapis|LOVABLE_API_KEY|GEMINI_API_KEY/i;

describe("no Gemini, no Lovable gateway in any edge function", () => {
  const all = files(join(ROOT, "supabase/functions")).filter((f) => !RUNWARE_IMAGE_PATH.test(relative(ROOT, f)));
  it("scans the real tree", () => expect(all.length).toBeGreaterThan(100));
  it("the detector catches the old calls", () => {
    expect(BANNED.test(code(`fetch('https://ai.gateway.lovable.dev/v1/chat/completions')`))).toBe(true);
    expect(BANNED.test(code(`model: 'google/gemini-3.6-flash'`))).toBe(true);
    expect(BANNED.test(code(`validateNetflixStoryWithPageMinimum()`))).toBe(false);
    expect(BANNED.test(code(`// the Lovable gateway (Gemini) is not used`))).toBe(false);
  });
  it("none found", () => {
    const hits = all.filter((f) => BANNED.test(code(readFileSync(f, "utf8")))).map((f) => relative(ROOT, f));
    expect(hits).toEqual([]);
  });
});

describe("the quiz runs on the text chain with an output check", () => {
  it("quiz answers: planning, cut-off and non-quiz JSON are rejected; a real quiz passes", () => {
    expect(quizAnswerProblem("Let me analyze the requirements carefully: the quiz needs")).toMatch(/planning/);
    expect(quizAnswerProblem('{"questions":[{"question":"Who', "stop")).toMatch(/cut off|not JSON/);
    expect(quizAnswerProblem('{"questions":[]}', "stop")).toMatch(/no questions/);
    expect(quizAnswerProblem('{"q":1}', "length")).toMatch(/truncated/);
    expect(quizAnswerProblem('<think>plan</think>{"questions":[{"question":"Who?","options":["A","B"],"correctAnswer":0}]}', "stop")).toBeNull();
    const fn = readFileSync(join(ROOT, "supabase/functions/generate-quiz/index.ts"), "utf8");
    expect(fn).toMatch(/accept: \(content, finishReason\) => quizAnswerProblem\(content, finishReason\)/);
  });
  it("the scoped-out Runware path is exactly those two files", () => {
    const skipped = files(join(ROOT, "supabase/functions")).filter((f) => RUNWARE_IMAGE_PATH.test(relative(ROOT, f))).map((f) => relative(ROOT, f));
    expect(skipped.sort()).toEqual(["supabase/functions/_shared/imagePrompt.ts", "supabase/functions/runware-generate-image/index.ts", "supabase/functions/runware-generate-image/resilientLoader.js"]);
  });

});
