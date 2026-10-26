// Writes a failed story to public.story_generation_failures (migration
// 20261026220000). Never throws: a broken log must not break a story response.
import type { ProviderAttempt } from "./storyTextProvider.ts";

export interface StoryFailure {
  stage: "edge";
  errorType: string;
  message: string;
  providerAttempts: ProviderAttempt[];
  sessionId: string | null;
  pageNumber: number | null;
}

export async function logStoryFailure(f: StoryFailure): Promise<void> {
  try {
    // deno-lint-ignore no-explicit-any
    const env = (globalThis as any).Deno?.env;
    const url = env?.get("SUPABASE_URL");
    const key = env?.get("SUPABASE_SERVICE_ROLE_KEY");
    if (!url || !key) return;
    const res = await fetch(`${url}/rest/v1/story_generation_failures`, {
      method: "POST",
      headers: { apikey: key, Authorization: `Bearer ${key}`, "Content-Type": "application/json", Prefer: "return=minimal" },
      body: JSON.stringify({
        stage: f.stage,
        error_type: f.errorType.slice(0, 60),
        message: f.message.slice(0, 500),
        provider_attempts: f.providerAttempts,
        session_id: f.sessionId ? String(f.sessionId).slice(0, 120) : null,
        page_number: typeof f.pageNumber === "number" ? f.pageNumber : null,
      }),
    });
    if (!res.ok) console.warn("story_generation_failures insert refused", res.status);
  } catch (err) {
    console.warn("story_generation_failures insert failed", String(err));
  }
}
