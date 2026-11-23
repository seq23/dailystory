// The feedback form's heads-up email. Public (verify_jwt = false) so signed-out readers'
// feedback also reaches the inbox; the rules live in ./handler.ts (pure).
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.4?target=deno";
import { FEEDBACK_FROM, handleFeedback } from "./handler.ts";
import { clientIp, sha256Short } from "../_shared/paidCallGuard.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  const db = createClient(Deno.env.get("SUPABASE_URL") ?? "", Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "", {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const resendKey = Deno.env.get("RESEND_API_KEY") ?? "";

  return handleFeedback(req, {
    async getUser(token) {
      const { data, error } = await db.auth.getUser(token);
      return error || !data?.user ? null : { id: data.user.id, email: data.user.email ?? null };
    },
    async hit(buckets, windows, limits) {
      const { data, error } = await db.rpc("paid_call_hit", { p_buckets: buckets, p_windows: windows, p_limits: limits });
      if (error) throw new Error(error.message);
      return (data as string | null) ?? null;
    },
    networkKey: await sha256Short(clientIp(req)),
    async sendEmail({ to, replyTo, subject, html }) {
      const res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: { Authorization: `Bearer ${resendKey}`, "Content-Type": "application/json" },
        body: JSON.stringify({ from: FEEDBACK_FROM, to: [to], reply_to: replyTo, subject, html }),
      });
      if (!res.ok) throw new Error(`Resend ${res.status}: ${(await res.text()).slice(0, 200)}`);
    },
    mailConfigured: resendKey.length > 0,
    inbox: (Deno.env.get("COST_REPORT_EMAIL") ?? "").trim(),
  }, corsHeaders);
});
