// The real I/O behind LifecycleDeps: the service-role Supabase client and Resend.
// Used by lifecycle-emails (the sweep) and stripe-webhook (the welcome, at once).
import type { LifecycleDeps, OutgoingEmail, SendResult } from "./core.ts";
import type { EmailKind } from "./rules.ts";

// deno-lint-ignore no-explicit-any
type Client = any;

const LOCAL = /^https?:\/\/(kong|localhost|127\.0\.0\.1|host\.docker\.internal)(:\d+)?(\/|$)/;

/** True only inside the local private copy (Supabase CLI), never on the hosted project. */
export function isLocalProject(url: string | undefined): boolean {
  return !!url && LOCAL.test(url);
}

export function lifecycleDeps(db: Client, env: { get(name: string): string | undefined }, now = new Date()): LifecycleDeps {
  const supabaseUrl = env.get("SUPABASE_URL") ?? "";
  const local = isLocalProject(supabaseUrl);
  const resendKey = env.get("RESEND_API_KEY");
  // Overrides that only the local private copy honours: a capture endpoint and one allowed recipient.
  const resendBase = (local && env.get("LIFECYCLE_RESEND_BASE")) || "https://api.resend.com";
  const localRecipientOnly = local ? (env.get("LIFECYCLE_LOCAL_RECIPIENT") ?? null) : null;
  const publicUrl = (local && env.get("LIFECYCLE_PUBLIC_FUNCTIONS_URL")) || `${supabaseUrl}/functions/v1`;

  // deno-lint-ignore no-explicit-any
  const must = (r: { data: any; error: { message: string } | null }, what: string): any => {
    if (r.error) throw new Error(`${what}: ${r.error.message}`);
    return r.data;
  };

  return {
    now,
    mailingAddress: env.get("LIFECYCLE_MAILING_ADDRESS")?.trim() || null,
    unsubscribeEndpoint: `${publicUrl}/lifecycle-unsubscribe`,
    ...(env.get("LIFECYCLE_SITE_URL") ? { siteUrl: env.get("LIFECYCLE_SITE_URL")! } : {}),
    localRecipientOnly,

    async paused() {
      const row = must(await db.from("lifecycle_email_settings").select("paused").eq("id", 1).maybeSingle(), "settings");
      return row ? !!row.paused : false;
    },
    async account(userId) {
      const { data, error } = await db.auth.admin.getUserById(userId);
      if (error || !data?.user) return null;
      return { email: data.user.email ?? null, meta: { ...(data.user.user_metadata ?? {}) } };
    },
    async lane(userId) {
      return String(must(await db.rpc("institution_ai_lane", { p_user: userId, p_child: null }), "institution_ai_lane"));
    },
    async prefs(userId) {
      must(await db.from("lifecycle_email_prefs").upsert({ user_id: userId }, { onConflict: "user_id", ignoreDuplicates: true }), "prefs upsert");
      const row = must(await db.from("lifecycle_email_prefs").select("unsubscribe_token, opted_out_at, is_test").eq("user_id", userId).single(), "prefs");
      return { token: row.unsubscribe_token, optedOut: !!row.opted_out_at, isTest: !!row.is_test };
    },
    async subscriber(userId) {
      return must(await db.from("subscribers")
        .select("user_id, subscribed, subscription_tier, subscription_end, trial_start, trial_end, cancel_at_period_end, cancelled_at, override_premium, override_end, stripe_livemode")
        .eq("user_id", userId).maybeSingle(), "subscriber");
    },
    async alreadySent(userId, kind: EmailKind) {
      const row = must(await db.from("lifecycle_email_log").select("user_id").eq("user_id", userId).eq("email_kind", kind).maybeSingle(), "log");
      return !!row;
    },
    async claim(userId, kind) {
      const { error } = await db.from("lifecycle_email_log").insert({ user_id: userId, email_kind: kind });
      if (!error) return true;
      if (error.code === "23505") return false;
      throw new Error(`log claim: ${error.message}`);
    },
    async release(userId, kind) {
      await db.from("lifecycle_email_log").delete().eq("user_id", userId).eq("email_kind", kind);
    },
    async recordProviderId(userId, kind, id) {
      await db.from("lifecycle_email_log").update({ provider_id: id }).eq("user_id", userId).eq("email_kind", kind);
    },
    async children(userId) {
      const rows = must(await db.from("child_profiles").select("id, display_name, created_at").eq("parent_user_id", userId).order("created_at"), "children") ?? [];
      // deno-lint-ignore no-explicit-any
      return rows.filter((r: any) => r.display_name).map((r: any) => ({ id: r.id, name: (String(r.display_name).trim().split(/\s+/)[0] ?? "").slice(0, 40) }));
    },
    async readings(userId, since) {
      let q = db.from("reading_sessions").select("child_profile_id, completed_at, pages_read, started_at").eq("user_id", userId);
      if (since) q = q.gte("started_at", since.toISOString());
      return must(await q.limit(2000), "readings") ?? [];
    },
    async quizzes(userId, since) {
      let q = db.from("quiz_attempts").select("child_profile_id").eq("user_id", userId);
      if (since) q = q.gte("created_at", since.toISOString());
      return must(await q.limit(2000), "quizzes") ?? [];
    },
    async subscribersForSweep() {
      const trialFrom = new Date(now.getTime() - 3 * 86_400_000).toISOString();
      const cancelFrom = new Date(now.getTime() - 22 * 86_400_000).toISOString();
      return must(await db.from("subscribers")
        .select("user_id, subscribed, subscription_tier, subscription_end, trial_start, trial_end, cancel_at_period_end, cancelled_at")
        .or(`trial_end.gte.${trialFrom},cancelled_at.gte.${cancelFrom}`).limit(1000), "sweep subscribers") ?? [];
    },
    async recentFreeCompleters(since) {
      const rows = must(await db.from("reading_sessions").select("user_id").gte("completed_at", since.toISOString()).limit(5000), "recent completions") ?? [];
      // deno-lint-ignore no-explicit-any
      const users = [...new Set(rows.map((r: any) => r.user_id).filter(Boolean))] as string[];
      if (!users.length) return [];
      const sent = must(await db.from("lifecycle_email_log").select("user_id").eq("email_kind", "free_stories_used").in("user_id", users), "free log") ?? [];
      // deno-lint-ignore no-explicit-any
      const done = new Set(sent.map((r: any) => r.user_id));
      return users.filter((u) => !done.has(u));
    },
    async send(email: OutgoingEmail): Promise<SendResult> {
      if (!resendKey) return { ok: false, status: 0, error: "RESEND_API_KEY is not set" };
      const res = await fetch(`${resendBase}/emails`, {
        method: "POST",
        headers: { authorization: `Bearer ${resendKey}`, "content-type": "application/json" },
        body: JSON.stringify({ ...email, to: [email.to] }),
      });
      const body = await res.text();
      if (!res.ok) return { ok: false, status: res.status, error: body.slice(0, 300) };
      try { return { ok: true, id: JSON.parse(body).id ?? null }; } catch { return { ok: true, id: null }; }
    },
  };
}
