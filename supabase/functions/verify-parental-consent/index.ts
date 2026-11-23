// Sends the COPPA consent email for one of the signed-in parent's own child profiles.
// The rules live in ./handler.ts (pure); this file only wires Supabase and Resend.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.4?target=deno";
import { handleConsentRequest } from "./handler.ts";
import { clientIp, sha256Short } from "../_shared/paidCallGuard.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const FROM = "Time-2-Read <hello@time-2-read.com>";
const REPLY_TO = "st@time-2-read.com";

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  const db = createClient(Deno.env.get("SUPABASE_URL") ?? "", Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "", {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const resendKey = Deno.env.get("RESEND_API_KEY") ?? "";
  const ip = clientIp(req);

  return handleConsentRequest(req, {
    async getUser(token) {
      const { data, error } = await db.auth.getUser(token);
      return error || !data?.user
        ? null
        : { id: data.user.id, email: data.user.email ?? null, emailConfirmed: !!data.user.email_confirmed_at };
    },
    async hit(buckets, windows, limits) {
      const { data, error } = await db.rpc("paid_call_hit", { p_buckets: buckets, p_windows: windows, p_limits: limits });
      if (error) throw new Error(error.message);
      return (data as string | null) ?? null;
    },
    async loadChild(id) {
      const { data, error } = await db.from("child_profiles")
        .select("id, parent_user_id, display_name").eq("id", id).maybeSingle();
      if (error) throw new Error(error.message);
      return data;
    },
    async insertConsent(row) {
      const { data, error } = await db.from("parental_consents")
        .insert({ ...row, consent_status: "pending" }).select("id").single();
      if (error) throw new Error(error.message);
      return data.id as string;
    },
    async sendEmail({ to, subject, html }) {
      const res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: { Authorization: `Bearer ${resendKey}`, "Content-Type": "application/json" },
        body: JSON.stringify({ from: FROM, reply_to: REPLY_TO, to: [to], subject, html }),
      });
      if (!res.ok) throw new Error(`Resend ${res.status}: ${(await res.text()).slice(0, 200)}`);
    },
    async audit(details) {
      await db.from("security_audit_log").insert({
        event_type: "parental_consent_verification_sent",
        details,
        ip_address: ip === "unknown" ? null : ip,
        user_agent: req.headers.get("user-agent"),
      });
    },
    mailConfigured: resendKey.length > 0,
    siteUrl: Deno.env.get("SITE_URL") || "https://time-2-read.com",
    clientIp: ip === "unknown" ? null : ip,
    networkKey: await sha256Short(ip),
  }, corsHeaders);
});
