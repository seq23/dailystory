// The parent incident notice (Privacy.tsx: "parents are notified"). Owner only; the rules live
// in ./handler.ts (pure). How to run it: docs/OPERATIONS.md "Parent incident notice".
// Starts through ../_shared/serve.ts: only our own sites get a CORS grant.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.4?target=deno";
import { adminIdsFrom } from "../_shared/callerCheck.ts";
import { serve } from "../_shared/serve.ts";
import { type Claim, handleIncidentNotice, sendViaResend } from "./handler.ts";

const corsHeaders = {
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const must = <T>(r: { data: T; error: { message: string } | null }, what: string): T => {
  if (r.error) throw new Error(`${what}: ${r.error.message}`);
  return r.data;
};

/** PostgREST answers at most 1000 rows and a long id list overflows the URL: read in chunks. */
async function inChunks<T>(ids: string[], read: (chunk: string[]) => Promise<T[]>): Promise<T[]> {
  const out: T[] = [];
  for (let i = 0; i < ids.length; i += 200) out.push(...await read(ids.slice(i, i + 200)));
  return out;
}

serve(async (req) => {
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
      return inChunks(ids, async (c) => must(await db.from("child_profiles").select("id, parent_user_id, display_name").in("id", c), "child_profiles") ?? []);
    },
    async childrenOfParents(parentIds) {
      return inChunks(parentIds, async (c) => must(await db.from("child_profiles").select("id, parent_user_id, display_name").in("parent_user_id", c), "child_profiles") ?? []);
    },
    async accountEmail(userId) {
      const { data, error } = await db.auth.admin.getUserById(userId);
      if (error) {
        if (/not.?found|404/i.test(`${error.status ?? ""} ${error.message}`)) return null;
        throw new Error(`auth user: ${error.message}`);
      }
      return data?.user?.email ?? null;
    },
    async noticeVersions(incidentId) {
      const rows = must(await db.from("incident_notice_versions").select("notice_version, version_no").eq("incident_id", incidentId), "incident_notice_versions") ?? [];
      return rows.map((r: { notice_version: string; version_no: number }) => ({ version: r.notice_version, versionNo: r.version_no }));
    },
    async parentsSentEarlier(incidentId, version, parentIds) {
      const rows = await inChunks(parentIds, async (c) => must(await db.from("incident_notices").select("parent_user_id")
        .eq("incident_id", incidentId).eq("status", "sent").neq("notice_version", version).in("parent_user_id", c), "incident_notices") ?? []);
      return rows.map((r: { parent_user_id: string }) => r.parent_user_id);
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
    async addVersion(incidentId, version, content) {
      return Number(must(await db.rpc("incident_notice_version", { p_incident: incidentId, p_version: version, p_content: content }), "version"));
    },
    async claim(incidentId, version, parentId, resendUnsure) {
      const r = must(await db.rpc("incident_notice_claim", { p_incident: incidentId, p_version: version, p_parent: parentId, p_resend_unsure: resendUnsure }), "claim") as { status: string; key: number } | null;
      if (!r || !["claimed", "sent", "sending", "unsure"].includes(r.status) || !Number.isInteger(r.key)) throw new Error("claim: unexpected answer");
      return r as Claim;
    },
    async record(incidentId, version, parentId, result) {
      const now = new Date().toISOString();
      const rows = must(await db.from("incident_notices").update({
        status: result.status,
        provider_id: result.status === "sent" ? result.providerId : null,
        last_error: result.status === "sent" ? null : result.error,
        sent_at: result.status === "sent" ? now : null,
        updated_at: now,
      }).eq("incident_id", incidentId).eq("notice_version", version).eq("parent_user_id", parentId).eq("status", "sending")
        .select("parent_user_id"), "incident_notices");
      // Only the run holding the claim writes the outcome; no row changed means it lost it.
      if (!rows?.length) throw new Error("record: the claim was no longer held");
    },
    async setIncidentDone(incidentId, done) {
      const now = new Date().toISOString();
      must(await db.from("data_breach_log").update({ status: done ? "parents_notified" : "notifying_parents", updated_at: now })
        .eq("incident_key", incidentId), "data_breach_log");
      // The first time every parent had it; a later version keeps that date.
      if (done) {
        must(await db.from("data_breach_log").update({ users_notified_at: now }).eq("incident_key", incidentId).is("users_notified_at", null), "data_breach_log");
      }
    },
    sendEmail: sendViaResend(fetch, resendKey),
    mailConfigured: resendKey.length > 0,
  }, corsHeaders);
});
