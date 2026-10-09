// Free-story allowance: a signed-in account without an active subscription gets
// FREE_STORY_LIMIT new stories in total, then the paywall (7-day trial checkout).
//
// The count lives in the user's auth `app_metadata.free_story_keys` (one key per
// story session). Only the service role can write app_metadata, so a client
// cannot reset it, and no database migration is needed.
//
// Mirrored by src/lib/freeStoryAllowance.ts and pinned by
// src/test/guards/free-story-paywall.test.ts.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.4?target=deno";

import { FREE_STORY_LIMIT, FREE_LIMIT_CODE, isNewStoryRequest } from "./freeStoryRules.ts";

export { FREE_STORY_LIMIT, FREE_LIMIT_CODE, isNewStoryRequest };

export type AllowanceResult =
  | { allowed: true; reason: "guest" | "paid" | "free" | "same-story" | "unchecked"; used?: number; limit: number }
  | { allowed: false; reason: "limit"; used: number; limit: number };

function hasPaidAccess(row: any): boolean {
  if (!row) return false;
  const now = new Date();
  const subscribed = !!row.subscribed && (!row.subscription_end || new Date(row.subscription_end) > now);
  const override = !!row.override_premium && (!row.override_end || new Date(row.override_end) > now);
  return subscribed || override;
}

export async function checkFreeStoryAllowance(req: Request, body: any): Promise<AllowanceResult> {
  const limit = FREE_STORY_LIMIT;
  if (!isNewStoryRequest(body)) return { allowed: true, reason: "same-story", limit };

  const token = (req.headers.get("Authorization") || "").replace(/^Bearer\s+/i, "");
  const anonKey = Deno.env.get("SUPABASE_ANON_KEY");
  // Logged-out guests run the client-side sample (6 pages) and are not accounts.
  if (!token || token === anonKey) return { allowed: true, reason: "guest", limit };

  const url = Deno.env.get("SUPABASE_URL");
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!url || !serviceKey) {
    console.warn("[free-story] service role missing; allowance unchecked");
    return { allowed: true, reason: "unchecked", limit };
  }

  try {
    const admin = createClient(url, serviceKey, { auth: { persistSession: false } });
    const { data: userData, error: userError } = await admin.auth.getUser(token);
    const user = userData?.user;
    // A non-user JWT (e.g. a service call) is not an account.
    if (userError || !user) return { allowed: true, reason: "guest", limit };

    const { data: sub } = await admin
      .from("subscribers")
      .select("subscribed, subscription_end, override_premium, override_end")
      .eq("user_id", user.id)
      .maybeSingle();
    if (hasPaidAccess(sub)) return { allowed: true, reason: "paid", limit };

    const meta = (user.app_metadata ?? {}) as Record<string, unknown>;
    const keys = Array.isArray(meta.free_story_keys) ? (meta.free_story_keys as string[]) : [];
    const storyKey = String(body?.config?.sessionId || crypto.randomUUID()).slice(0, 100);

    if (keys.includes(storyKey)) return { allowed: true, reason: "same-story", used: keys.length, limit };
    if (keys.length >= limit) return { allowed: false, reason: "limit", used: keys.length, limit };

    const next = [...keys, storyKey];
    const { error: updateError } = await admin.auth.admin.updateUserById(user.id, {
      app_metadata: { ...meta, free_story_keys: next },
    });
    if (updateError) console.warn("[free-story] could not record story", updateError.message);
    return { allowed: true, reason: "free", used: next.length, limit };
  } catch (err) {
    // An auth/database outage must not lock paying families out; log it loudly.
    console.error("[free-story] allowance check failed; allowing", err instanceof Error ? err.message : err);
    return { allowed: true, reason: "unchecked", limit };
  }
}

export function freeLimitResponse(result: { used: number; limit: number }, corsHeaders: Record<string, string>): Response {
  return new Response(
    JSON.stringify({
      success: false,
      code: FREE_LIMIT_CODE,
      error: `You've read your ${result.limit} free stories. Start your 7-day free trial to keep reading.`,
      used: result.used,
      limit: result.limit,
    }),
    { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } },
  );
}
