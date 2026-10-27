// Guard: a signed-out guest always gets a story (27 Oct 2026).
//
// Live on time-2-read.com a guest typed a name, pressed "Skip and create story now" and
// got "Restarting Story Magic…" with no story; "Start Adventure" re-ran the same slow
// generation and left them there. Causes, each pinned below:
//   1. Every model's answer was rejected: the best free model ends pages with "***"
//      (read as "cut off"), the rest ran to their token budget ("continue
//      indefinitely") and were rejected as truncated.
//   2. The chain ran far past the browser's 30 s request limit, the client retried, and
//      the story page's 60 s safety timer then showed the error screen.
//   3. The guest path read the profiles table (42501 for a signed-out visitor) and sent
//      an image request as a "diagnostic" before every story.
//   4. Five edge functions answered every request, CORS preflight included, with
//      503 BOOT_ERROR after a deploy that reported success.
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { storyTextProblem, wholeStoryTextProblem, completePagesOf } from "../../../supabase/functions/_shared/storyOutputCheck";
import { chatCompletionWithFallback, resetProviderCircuit, MIN_TRY_MS } from "../../../supabase/functions/_shared/storyTextProvider";

const ROOT = join(__dirname, "..", "..", "..");
const read = (p: string) => readFileSync(join(ROOT, p), "utf8");

const PAGE = "Sam flies a bright red rocket ship through the dark sky. He sees a big blue planet below him now.";

describe("1. a finished story is never rejected as cut off", () => {
  it("a trailing *** page marker is format, not a cut-off (the live nemotron answer shape)", () => {
    expect(storyTextProblem(`${PAGE}\n\n***\n${PAGE}\n***`)).toBeNull();
    expect(storyTextProblem(`${PAGE} ***`)).toBeNull();
    // A real cut-off is still rejected.
    expect(storyTextProblem(`${PAGE}\n***\nSam opens the hatch and floats out into`)).toMatch(/cut off/);
  });

  it("a whole story cut by the token budget keeps its complete pages", () => {
    const seven = Array.from({ length: 7 }, () => PAGE).join("\n***\n");
    const cut = `${seven}\n***\nSam opens the hatch and floats out into`;
    expect(storyTextProblem(cut, "length")).toMatch(/truncated/);
    expect(wholeStoryTextProblem(cut, "length")).toBeNull();
    const kept = completePagesOf(cut)!;
    expect(kept).not.toMatch(/floats out into/);
    expect(kept.split("***").filter((p) => p.trim()).length).toBe(7);
    // Fewer than 6 complete pages is still a failure.
    expect(wholeStoryTextProblem(`${PAGE}\n***\n${PAGE}\n***\nSam opens`, "length")).toMatch(/under 6/);
  });

  it("the guest prompt asks for a set number of pages and the budget fits them", () => {
    const h = read("supabase/functions/generate-adaptive-story/streamlined-handler.ts");
    expect(h).toMatch(/WHOLE STORY \(this overrides "continue indefinitely" above\): write exactly \$\{pagesWanted\} pages/);
    expect(h).toMatch(/accept: \(text, finishReason\) => isWholeStory \? wholeStoryTextProblem\(text, finishReason\)/);
    expect(h).toMatch(/maxTokens = Math\.max\(maxTokens, Math\.ceil\(\(maxWords \* 1\.6 \+ 15\) \* pages\)\)/);
  });
});

describe("2. a story request answers inside the browser's 30 s limit", () => {
  beforeEach(() => resetProviderCircuit());

  it("the request budget is under the client's fetch timeout, and the chain gets it", () => {
    const client = read("src/integrations/supabase/client.ts");
    const clientMs = Number(client.match(/createResilientFetch\((\d+)\)/)![1]);
    const h = read("supabase/functions/generate-adaptive-story/streamlined-handler.ts");
    const budget = Number(h.match(/STORY_REQUEST_BUDGET_MS = ([\d_]+)/)![1].replace(/_/g, ""));
    expect(budget).toBeLessThanOrEqual(clientMs - 3000);
    expect(h).toMatch(/deadline: requestDeadline,/);
  });

  it("no model is started past the deadline, and each try is cut to the time left", async () => {
    let clock = 1_000;
    const fetchImpl = vi.fn(async (_u: string, init: RequestInit) => {
      clock += 9_000; // each model takes 9 s and is refused
      return new Response("busy", { status: 429 });
    });
    const env = (n: string) => ({ OPENROUTER_API_KEY: "k", CLOUDFLARE_ACCOUNT_ID: "a", CLOUDFLARE_WORKERS_AI_TOKEN: "t", OPENAI_API_KEY: "o" } as Record<string, string>)[n];
    const r = await chatCompletionWithFallback({ model: "m", messages: [{ role: "user", content: "x" }] }, { fetchImpl, env, now: () => clock, deadline: 1_000 + 20_000 });
    // 20 s budget, 9 s per try: two tries, then everything else is skipped.
    expect(fetchImpl).toHaveBeenCalledTimes(2);
    expect(r.attempts.filter((a) => a.error === "skipped: request deadline reached").length).toBeGreaterThan(0);
    expect(MIN_TRY_MS).toBeGreaterThan(0);
  });
});

describe("3. the guest path never touches profiles and never traps the visitor", () => {
  it("no diagnostics on the guest path; the diagnostic never reads profiles", () => {
    const d = read("src/components/CleanStoryDisplay.tsx");
    expect(d).not.toMatch(/DiagnosticTool\.runFullDiagnostic\(/);
    expect(read("src/utils/diagnostics.ts")).not.toMatch(/from\(['"]profiles['"]\)/);
  });

  it("Start Adventure and the guest safety timer show the backup story", () => {
    const d = read("src/components/CleanStoryDisplay.tsx");
    expect(d).toMatch(/onClick=\{\(\) => \(!isPremium \? startBackupStory\(\)/);
    expect(d).toMatch(/if \(!isPremium\) \{ startBackupStory\(\); return; \}/);
    expect(d).toMatch(/if \(forceBackupRef\.current\) \{\s*forceBackupRef\.current = false;\s*throw new Error\('backup story requested'\);/);
    expect(d).toMatch(/if \(guestRun !== guestRunRef\.current\)/);
  });

  describe("driving the guest story with no session", () => {
    const tables: string[] = [];
    const fromSpy = vi.fn((t: string) => {
      tables.push(t);
      if (t === "profiles") throw new Error("a guest read profiles");
      return { insert: async () => ({ error: null }), select: () => ({ limit: async () => ({ data: [], error: null }) }) };
    });
    const invoke = vi.fn(async (name: string) => {
      if (name === "generate-adaptive-story") return new Promise(() => {}); // the model chain hangs
      if (name === "template-service") return { data: { pages: Array.from({ length: 8 }, (_, i) => `Backup page ${i + 1}. Maya walks to the park and sees a big red kite.`) }, error: null };
      if (name === "process-story-content") return { data: null, error: null };
      return { data: null, error: null };
    });

    beforeEach(() => {
      vi.useFakeTimers();
      vi.resetModules();
      vi.doMock("@/integrations/supabase/client", () => ({
        supabase: {
          functions: { invoke },
          from: fromSpy,
          auth: { getSession: async () => ({ data: { session: null }, error: null }), getUser: async () => ({ data: { user: null }, error: null }) },
          rpc: vi.fn(async () => ({ data: null, error: null })),
        },
      }));
    });
    afterEach(() => { vi.useRealTimers(); vi.doUnmock("@/integrations/supabase/client"); });

    it("a hanging model chain still gives the guest a backup story inside the deadline, and profiles is never read", async () => {
      const { NetflixStyleStoryService, GUEST_STORY_DEADLINE_MS } = await import("@/services/NetflixStyleStoryService");
      expect(GUEST_STORY_DEADLINE_MS).toBeLessThan(60_000); // the story page's safety timer
      let done: any = null;
      NetflixStyleStoryService.generateCompleteStory({ name: "Maya", age: 4, difficultyLevel: "pre-reader", avatar: { type: "girl" } } as any).then((r) => { done = r; });
      await vi.advanceTimersByTimeAsync(GUEST_STORY_DEADLINE_MS + 1_000);
      expect(done, "no story inside the deadline").not.toBeNull();
      expect(done.content.length).toBeGreaterThan(0);
      expect(done.content.join(" ")).toMatch(/Backup page|Maya/);
      expect(tables).not.toContain("profiles");
      // The Backup Mode report is written, so the fallback is visible server-side.
      expect(tables).toContain("story_generation_failures");
    });
  });
});

describe("4. every edge function boots after a deploy", () => {
  it("the deploy probes every function's CORS preflight, redeploys a non-booting one, and fails if it still does not boot", () => {
    const w = read(".github/workflows/deploy-functions.yml");
    expect(w).toMatch(/- name: Every function boots \(CORS preflight, post-deploy\)/);
    expect(w).toMatch(/for dir in supabase\/functions\/\*\/; do/);
    expect(w).toMatch(/-X OPTIONS "\$BASE_URL\/\$1"/);
    expect(w).toMatch(/supabase functions deploy "\$func" --project-ref "\$SUPABASE_PROJECT_ID"/);
    expect(w).toMatch(/::error::functions that do not boot:/);
    expect(w).toMatch(/if \[ "\$checked" -eq 0 \]; then echo "::error::no functions found to probe"; exit 1; fi/);
  });

  it("the two functions the guest page calls answer their preflight with CORS headers", () => {
    for (const f of ["correct-spelling", "clear-character-cache"]) {
      const src = read(`supabase/functions/${f}/index.ts`);
      expect(src, f).toMatch(/handleHealthAndCors\(req\)/);
    }
    expect(read("supabase/functions/_shared/healthCors.ts")).toMatch(/OPTIONS/);
  });
});
