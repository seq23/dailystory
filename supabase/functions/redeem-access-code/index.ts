// Redeem an access code (e.g. HOMESCHOOL15) for Premium at once, no card.
// Called right after sign-up (the code typed on the form travels in the request
// body and in user_metadata.access_code), on first load of the app when the
// metadata still holds an unredeemed code, and from My Account ("Have a code?").
// Rules: ../_shared/accessCodeRules.ts (decideGrant). Direct REST calls only.
// Pinned by src/test/guards/access-code-grant.test.ts.
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import {
  ACCESS_CODE_MESSAGES,
  ACCESS_CODE_UNAVAILABLE,
  decideGrant,
  normalizeAccessCode,
} from "../_shared/accessCodeRules.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { ...corsHeaders, "Content-Type": "application/json" } });

interface AuthUser {
  id: string;
  email: string;
  user_metadata?: Record<string, unknown>;
}

async function verifyUser(url: string, anonKey: string, authHeader: string): Promise<AuthUser | null> {
  try {
    const r = await fetch(`${url}/auth/v1/user`, { headers: { apikey: anonKey, Authorization: authHeader } });
    if (!r.ok) return null;
    const u = await r.json();
    return u?.id && u?.email ? u : null;
  } catch {
    return null;
  }
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { status: 204, headers: corsHeaders });
  const path = new URL(req.url).pathname;
  if ((req.method === "GET" || req.method === "HEAD") && (path === "/" || path === "/health")) {
    return req.method === "HEAD" ? new Response(null, { status: 204, headers: corsHeaders }) : json({ ok: true });
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  const anonKey = Deno.env.get("SUPABASE_ANON_KEY") || serviceKey;
  if (!supabaseUrl || !serviceKey) {
    return json({ activated: false, error: ACCESS_CODE_UNAVAILABLE, message: ACCESS_CODE_MESSAGES[ACCESS_CODE_UNAVAILABLE] }, 503);
  }
  const authHeader = req.headers.get("Authorization");
  const user = authHeader ? await verifyUser(supabaseUrl, anonKey!, authHeader) : null;
  if (!user) return json({ activated: false, error: "NOT_SIGNED_IN", message: "Please sign in, then try the code again." }, 401);

  const svc = { apikey: serviceKey, Authorization: `Bearer ${serviceKey}`, "Content-Type": "application/json" };
  const rest = (p: string, init: RequestInit = {}) =>
    fetch(`${supabaseUrl}/rest/v1/${p}`, { ...init, headers: { ...svc, ...(init.headers || {}) } });

  try {
    let bodyCode: unknown = null;
    try {
      bodyCode = (await req.json())?.accessCode ?? null;
    } catch {
      /* no body: use the code saved at sign-up */
    }
    const rawCode = normalizeAccessCode(bodyCode) ? bodyCode : user.user_metadata?.access_code;
    const code = normalizeAccessCode(rawCode);
    if (!code) return json({ activated: false, error: "NO_CODE", message: "Type your code first." }, 400);

    const [codeResp, grantResp, subResp] = await Promise.all([
      rest(`access_codes?code=eq.${encodeURIComponent(code)}&active=eq.true&select=id,code,trial_days,label,active`),
      rest(`access_code_redemptions?user_id=eq.${user.id}&status=eq.granted&select=code,expires_at`),
      rest(`subscribers?user_id=eq.${user.id}&select=subscribed,subscription_end`),
    ]);
    if (!codeResp.ok || !grantResp.ok || !subResp.ok) {
      return json({ activated: false, error: ACCESS_CODE_UNAVAILABLE, message: ACCESS_CODE_MESSAGES[ACCESS_CODE_UNAVAILABLE] }, 503);
    }
    const row = (await codeResp.json())[0] ?? null;
    const existing = (await grantResp.json())[0] ?? null;
    const sub = (await subResp.json())[0] ?? null;

    const now = new Date();
    if (sub?.subscribed === true && (!sub.subscription_end || new Date(sub.subscription_end) > now)) {
      return json({ activated: false, alreadyPremium: true, premium_until: sub.subscription_end ?? null, message: "You already have Premium." });
    }

    const decision = decideGrant({ rawCode: code, row, existing, now });
    if (!decision.ok) return json({ activated: false, error: decision.error, message: decision.message }, 400);

    if (!decision.alreadyActive) {
      const grant = await rest("access_code_redemptions", {
        method: "POST",
        headers: { Prefer: "return=minimal" },
        body: JSON.stringify({
          access_code_id: row.id,
          code,
          trial_days: decision.trialDays,
          user_id: user.id,
          status: "granted",
          expires_at: decision.premiumUntil,
          completed_at: now.toISOString(),
        }),
      });
      if (!grant.ok) {
        console.error("[redeem-access-code] grant insert failed", grant.status, await grant.text());
        return json({ activated: false, error: ACCESS_CODE_UNAVAILABLE, message: ACCESS_CODE_MESSAGES[ACCESS_CODE_UNAVAILABLE] }, 503);
      }
    }

    // Premium itself lives on subscribers (override), which every gate already reads.
    const write = await rest("subscribers?on_conflict=email", {
      method: "POST",
      headers: { Prefer: "resolution=merge-duplicates,return=minimal" },
      body: JSON.stringify({
        user_id: user.id,
        email: user.email,
        subscription_tier: "premium",
        override_premium: true,
        override_tier: "premium",
        override_end: decision.premiumUntil,
        override_reason: `Access code: ${code}`,
        override_set_by: "system",
        updated_at: now.toISOString(),
      }),
    });
    if (!write.ok) {
      console.error("[redeem-access-code] subscriber write failed", write.status, await write.text());
      return json({ activated: false, error: ACCESS_CODE_UNAVAILABLE, message: ACCESS_CODE_MESSAGES[ACCESS_CODE_UNAVAILABLE] }, 503);
    }

    console.log(`[redeem-access-code] ${code} → premium until ${decision.premiumUntil} (user ${user.id})`);
    return json({
      activated: true,
      code,
      trial_days: decision.trialDays,
      premium_until: decision.premiumUntil,
      message: `Code accepted. Premium is on for ${decision.trialDays} days.`,
    });
  } catch (e) {
    console.error("[redeem-access-code] error", e);
    return json({ activated: false, error: ACCESS_CODE_UNAVAILABLE, message: ACCESS_CODE_MESSAGES[ACCESS_CODE_UNAVAILABLE] }, 500);
  }
});
