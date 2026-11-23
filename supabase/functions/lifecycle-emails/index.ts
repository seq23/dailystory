// Parent lifecycle emails: the sweep (hourly, .github/workflows/lifecycle-emails.yml) and the
// kill switch. Approved by Sequoia 1 Nov 2026. Rules: _shared/lifecycleEmail/rules.ts.
// Called only with the LIFECYCLE_CRON_SECRET header (verify_jwt = false in config.toml).
//
// POST {"action":"sweep"}   send whatever is due (welcome, trial ending, 3 free stories, come back)
// POST {"action":"pause"}   kill switch on: nothing is sent until resumed
// POST {"action":"resume"}  kill switch off
// POST {"action":"status"}  paused?, mailing address present?, sent counts
import { serve } from "../_shared/serve.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.4?target=deno";
import { runLifecycleSweep } from "../_shared/lifecycleEmail/core.ts";
import { lifecycleDeps } from "../_shared/lifecycleEmail/deps.ts";
import { cronSecretRefusal } from "../_shared/callerCheck.ts";

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json" } });

serve(async (req) => {
  // The deploy probes every function's OPTIONS preflight for a 2xx (deploy-functions.yml boot check).
  if (req.method === "OPTIONS") return new Response(null, { status: 204 });
  if (req.method !== "POST") return json({ error: "POST only" }, 405);
  const refused = cronSecretRefusal(req, { header: "x-lifecycle-secret", name: "LIFECYCLE_CRON_SECRET", value: Deno.env.get("LIFECYCLE_CRON_SECRET") });
  if (refused) return refused;

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

