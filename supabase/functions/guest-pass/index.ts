// Guest pass (3 Nov 2026): a short-lived signed pass that lets the signed-out sample
// story use the paid functions (reading voice, spelling, translation, quiz) without the
// anon key alone being enough. Each pass is rate limited on its own and per IP
// (supabase/functions/_shared/paidCallGuard.ts); this function limits how many passes
// one IP can take. The app fetches and caches it: src/lib/guestPass.ts.
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { PAID_CALL_LIMITS, clientIp, issueGuestPass, sha256Short } from "../_shared/paidCallGuard.ts";
import { paidCallDeps } from "../_shared/paidCallGuardDeno.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const json = (status: number, body: unknown, extra: Record<string, string> = {}) =>
  new Response(JSON.stringify(body), { status, headers: { ...corsHeaders, "Content-Type": "application/json", ...extra } });

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { status: 204, headers: corsHeaders });
  if (req.method !== "POST") return json(405, { error: "Method not allowed" });
  const deps = paidCallDeps();
  try {
    const ipHash = await sha256Short(clientIp(req));
    let over: string | null = null;
    try {
      over = await deps.hit([`guestpass:${ipHash}|3600`], [3600], [PAID_CALL_LIMITS.guestPassPerIpHour]);
    } catch (e) {
      console.error(`[guest-pass] RATE_CHECK_UNAVAILABLE: ${e instanceof Error ? e.message : e}`);
    }
    if (over) {
      return json(429, { error: "Please try again in a little while.", code: "RATE_LIMITED", retry_after: 3600 }, { "Retry-After": "3600" });
    }
    const { pass, expiresAt } = await issueGuestPass(deps.serviceKey);
    return json(200, { pass, expires_at: expiresAt });
  } catch (e) {
    console.error("[guest-pass] failed:", e instanceof Error ? e.message : e);
    return json(500, { error: "Guest pass unavailable" });
  }
});
