// The parent incident notice (Privacy.tsx: "parents are notified"). Owner only; the rules live
// in ./handler.ts (pure). How to run it: docs/OPERATIONS.md "Parent incident notice".
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.4?target=deno";
import { adminIdsFrom } from "../_shared/callerCheck.ts";
import { handleIncidentNotice, NOTICE_FROM, PRIVACY_INBOX } from "./handler.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const must = <T>(r: { data: T; error: { message: string } | null }, what: string): T => {
  if (r.error) throw new Error(`${what}: ${r.error.message}`);
  return r.data;
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
  const db = createClient(Deno.env.get("SUPABASE_URL") ?? "", serviceKey, { auth: { persistSession: false, autoRefreshToken: false } });
  const resendKey = Deno.env.get("RESEND_API_KEY") ?? "";

  return handleIncidentNotice(req, {
    adminIds: adminIdsFrom(Deno.env.get("ADMIN_USER_IDS")),
    serviceKey,
    async getUser(token) {
      const { data, error } = await db.auth.getUser(token);
      return error || !data?.user ? null : { id: data.user.id, email: data.user.email ?? null };
    },
    async childrenByIds(ids) {
      return must(await db.from("child_profiles").select("id, parent_user_id, display_name").in("id", ids), "child_profiles") ?? [];
    },
    async childrenOfParents(parentIds) {
      return must(await db.from("child_profiles").select("id, parent_user_id, display_name").in("parent_user_id", parentIds), "child_profiles") ?? [];
    },
    async accountEmail(userId) {
      const { data, error } = await db.auth.admin.getUserById(userId);
      if (error) {
        if (/not.?found|404/i.test(`${error.status ?? ""} ${error.message}`)) return null;
        throw new Error(`auth user: ${error.message}`);
      }
      return data?.user?.email ?? null;
    },
    async logIncident(incident, parentsAffected) {
      must(await db.from("data_breach_log").upsert({
        incident_key: incident.incidentId,
        breach_description: `${incident.whenItHappened}: ${incident.whatHappened}`,
        data_types_affected: incident.dataInvolved,
        severity: incident.severity,
        remediation_steps: incident.whatWeAreDoing,
        users_affected_count: parentsAffected,
        status: "notifying_parents",
        logged_by: "notify-data-breach",
      }, { onConflict: "incident_key", ignoreDuplicates: true }), "data_breach_log");
    },
    async claim(incidentId, parentId) {
      return String(must(await db.rpc("incident_notice_claim", { p_incident: incidentId, p_parent: parentId }), "claim")) as "claimed" | "sent" | "sending";
    },
    async record(incidentId, parentId, result) {
      must(await db.from("incident_notices").update({
        status: result.status,
        provider_id: result.status === "sent" ? result.providerId : null,
        last_error: result.status === "failed" ? result.error : null,
        sent_at: result.status === "sent" ? new Date().toISOString() : null,
        updated_at: new Date().toISOString(),
      }).eq("incident_id", incidentId).eq("parent_user_id", parentId), "incident_notices");
    },
    async sendEmail({ to, subject, html, text, idempotencyKey }) {
      const res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: { Authorization: `Bearer ${resendKey}`, "Content-Type": "application/json", "Idempotency-Key": idempotencyKey },
        body: JSON.stringify({ from: NOTICE_FROM, to: [to], reply_to: PRIVACY_INBOX, subject, html, text }),
      });
      if (!res.ok) throw new Error(`Resend ${res.status}: ${(await res.text()).slice(0, 200)}`);
      return ((await res.json().catch(() => ({}))) as { id?: string }).id ?? null;
    },
    mailConfigured: resendKey.length > 0,
  }, corsHeaders);
});
