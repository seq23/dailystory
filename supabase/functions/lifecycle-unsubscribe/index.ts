// One-click unsubscribe from the parent lifecycle emails (CAN-SPAM; RFC 8058 List-Unsubscribe-Post).
// POST ?t=<token> (mail apps' one-click) or POST {"token": "..."} (the /unsubscribe page).
// The token is the account's lifecycle_email_prefs.unsubscribe_token; nothing else is accepted.
// verify_jwt = false: the person clicking is not signed in.
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.4?target=deno";

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};
const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { ...cors, "Content-Type": "application/json" } });
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { status: 204, headers: cors });
  if (req.method !== "POST") return json({ error: "POST only" }, 405);
  let token = new URL(req.url).searchParams.get("t") ?? "";
  if (!token) {
    const body = await req.json().catch(() => ({}));
    token = typeof body?.token === "string" ? body.token : "";
  }
  if (!UUID.test(token)) return json({ ok: false, error: "This unsubscribe link is not recognised." }, 400);
  const db = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!, { auth: { persistSession: false } });
  const { data, error } = await db.from("lifecycle_email_prefs")
    .update({ opted_out_at: new Date().toISOString() })
    .eq("unsubscribe_token", token).is("opted_out_at", null).select("user_id");
  if (error) return json({ ok: false, error: "Something went wrong. Please try again." }, 500);
  if (!data?.length) {
    const { data: known } = await db.from("lifecycle_email_prefs").select("user_id").eq("unsubscribe_token", token).maybeSingle();
    if (!known) return json({ ok: false, error: "This unsubscribe link is not recognised." }, 404);
  }
  console.log("[LIFECYCLE-UNSUBSCRIBE] opted out");
  return json({ ok: true });
});
