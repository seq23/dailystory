// Parent lifecycle emails: the sweep (hourly, .github/workflows/lifecycle-emails.yml) and the
// kill switch. Approved by Sequoia 1 Nov 2026. Rules: _shared/lifecycleEmail/rules.ts.
// Called only with the LIFECYCLE_CRON_SECRET header (verify_jwt = false in config.toml).
//
// POST {"action":"sweep"}   send whatever is due (welcome, trial ending, 3 free stories, come back)
// POST {"action":"pause"}   kill switch on: nothing is sent until resumed
// POST {"action":"resume"}  kill switch off
// POST {"action":"status"}  paused?, mailing address present?, sent counts
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.4?target=deno";
import { runLifecycleSweep } from "../_shared/lifecycleEmail/core.ts";
import { lifecycleDeps } from "../_shared/lifecycleEmail/deps.ts";

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json" } });

function sameSecret(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let d = 0;
  for (let i = 0; i < a.length; i++) d |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return d === 0;
}

serve(async (req) => {
  if (req.method !== "POST") return json({ error: "POST only" }, 405);
  const secret = Deno.env.get("LIFECYCLE_CRON_SECRET");
  if (!secret) return json({ stop: "NAMED STOP LIFECYCLE_CRON_SECRET: the sweep secret is not set on the project; nothing runs." }, 503);
  if (!sameSecret(req.headers.get("x-lifecycle-secret") ?? "", secret)) return json({ error: "forbidden" }, 403);

  const { action = "sweep" } = await req.json().catch(() => ({}));
  const db = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!, { auth: { persistSession: false } });

  try {
    if (action === "pause" || action === "resume") {
      const { error } = await db.from("lifecycle_email_settings")
        .upsert({ id: 1, paused: action === "pause", updated_at: new Date().toISOString() });
      if (error) throw new Error(error.message);
      console.log(`[LIFECYCLE] kill switch ${action === "pause" ? "ON (paused)" : "OFF (sending)"}`);
      return json({ paused: action === "pause" });
    }
    const deps = lifecycleDeps(db, Deno.env);
    if (action === "status") {
      const { data: log, error } = await db.from("lifecycle_email_log").select("email_kind");
      if (error) throw new Error(error.message);
      const sent: Record<string, number> = {};
      for (const r of log ?? []) sent[r.email_kind] = (sent[r.email_kind] ?? 0) + 1;
      return json({ paused: await deps.paused(), mailing_address_set: !!deps.mailingAddress, sent });
    }
    if (action !== "sweep") return json({ error: "unknown action" }, 400);

    const { outcomes, stop } = await runLifecycleSweep(deps);
    const summary: Record<string, number> = {};
    for (const o of outcomes) {
      const k = o.status === "skipped" ? `skipped:${o.reason}` : o.status === "stopped" ? `stopped:${o.stop}` : `sent:${o.kind}`;
      summary[k] = (summary[k] ?? 0) + 1;
    }
    console.log(`[LIFECYCLE] sweep ${JSON.stringify(summary)}${stop ? ` ${stop}` : ""}`);
    return json({ paused: await deps.paused(), summary, stop, considered: outcomes.length });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    console.error(`[LIFECYCLE] error ${msg}`);
    return json({ error: msg.slice(0, 300) }, 500);
  }
});

