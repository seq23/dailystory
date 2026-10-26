// End-of-story comprehension quiz (26 Oct 2026).
//
// Before: one call to a gateway model banned for children's services, the child's
// name sent as is, no check of what came back, and a 500 when the gateway was down.
// Now: the same text chain as the story pages (../_shared/storyTextProvider.ts: free
// OpenRouter models first, Workers AI, OpenRouter paid, OpenAI last), names masked on
// every free/third-party route, every question checked against the story
// (../_shared/quiz.ts), and a quiz written from the story text itself when no model
// gives a usable one. A child always gets a quiz; the answer says where it came from.
// Guard: src/test/guards/story-quiz.test.ts.
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { chatCompletionWithFallback } from "../_shared/storyTextProvider.ts";
import {
  buildQuizMessages,
  finalizeQuiz,
  parseQuizJson,
  quizShapeForGrade,
  storySeed,
  quizAnswerProblem,
  QUIZ_STORY_MAX_CHARS,
} from "../_shared/quiz.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};
const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { ...corsHeaders, "Content-Type": "application/json" } });

/** The OpenAI-tier model; the other tiers swap in their own (toCompatibleBody). */
const OPENAI_QUIZ_MODEL = "gpt-4o-mini";

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  let body: Record<string, unknown> = {};
  try {
    body = await req.json();
  } catch {
    return json({ error: "Invalid JSON" }, 400);
  }
  const storyText = typeof body.storyText === "string" ? body.storyText.replace(/\s+/g, " ").trim() : "";
  if (storyText.length < 20) return json({ error: "Invalid story text" }, 400);

  const story = storyText.slice(0, QUIZ_STORY_MAX_CHARS);
  const practiceWords = Array.isArray(body.practiceWords) ? (body.practiceWords as unknown[]).filter((w): w is string => typeof w === "string") : [];
  const shape = quizShapeForGrade(body.grade, body.age, storySeed(story), practiceWords);
  const privateNames = [body.childName, body.displayName]
    .filter((n): n is string => typeof n === "string" && n.trim().length >= 2)
    .slice(0, 4);

  let raw: unknown = null;
  let provider = "none";
  try {
    const { response, provider: p, attempts } = await chatCompletionWithFallback(
      {
        model: OPENAI_QUIZ_MODEL,
        messages: buildQuizMessages(story, shape),
        max_tokens: 1800,
        temperature: 0.4,
      },
      // Output check: planning, cut-off or non-quiz JSON → next model (../_shared/quiz.ts).
      { privateNames, accept: (content, finishReason) => quizAnswerProblem(content, finishReason) },
    );
    console.log("generate-quiz provider", { provider: p, attempts: attempts.map((a) => `${a.provider} ${a.model ?? ""} ${a.status ?? "-"}`) });
    if (response.ok) {
      const data = await response.json();
      raw = parseQuizJson(data?.choices?.[0]?.message?.content ?? "");
      provider = p;
    }
  } catch (e) {
    console.error("generate-quiz: text chain failed", e instanceof Error ? e.message : String(e));
  }

  const { questions, source } = finalizeQuiz(raw, story, shape);
  if (!questions.length) return json({ error: "Story too short for a quiz", questions: [], source }, 422);
  return json({ questions, source, provider: source === "fallback" ? "story-text" : provider, grade: shape.grade });
});
