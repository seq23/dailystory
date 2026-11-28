// Deno wiring for ./discountRedeem.ts: Supabase auth, the shared rate counter and the
// redeem_discount_code function, over plain REST calls with the service role.
import { handleDiscountRedeem, type RedeemRow } from "./discountRedeem.ts";
import { clientIp, sha256Short } from "./paidCallGuard.ts";

const corsHeaders = {
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

/** The request handler for a discount function; its index.ts passes it to _shared/serve.ts. */
export function discountRedeemHandler(fn: string, opts: { usePendingCode: boolean }): (req: Request) => Promise<Response> {
  return async (req) => {
    if (req.method === "OPTIONS") return new Response(null, { status: 204, headers: corsHeaders });
    const path = new URL(req.url).pathname;
    if ((req.method === "GET" || req.method === "HEAD") && (path === "/" || path === "/health")) {
      return req.method === "HEAD"
        ? new Response(null, { status: 204, headers: corsHeaders })
        : new Response(JSON.stringify({ ok: true }), { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const url = Deno.env.get("SUPABASE_URL");
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY") || serviceKey;
    if (!url || !serviceKey) {
      return new Response(JSON.stringify({ success: false, activated: false, message: "Service temporarily unavailable" }), {
        status: 503,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const svc = { apikey: serviceKey, Authorization: `Bearer ${serviceKey}`, "Content-Type": "application/json" };
    const rpc = async (name: string, args: Record<string, unknown>) => {
      const r = await fetch(`${url}/rest/v1/rpc/${name}`, { method: "POST", headers: svc, body: JSON.stringify(args) });
      if (!r.ok) throw new Error(`${name} ${r.status}: ${(await r.text()).slice(0, 200)}`);
      return r.json();
    };

    return handleDiscountRedeem(req, {
      async getUser(authHeader) {
        const r = await fetch(`${url}/auth/v1/user`, { headers: { apikey: anonKey!, Authorization: authHeader } });
        if (r.status === 401 || r.status === 403) return null;
        if (!r.ok) throw new Error(`auth ${r.status}`);
        const u = await r.json();
        return u?.id && u?.email ? { id: String(u.id), email: String(u.email) } : null;
      },
      async hit(buckets, windows, limits) {
        const over = await rpc("paid_call_hit", { p_buckets: buckets, p_windows: windows, p_limits: limits });
        return typeof over === "string" ? over : null;
      },
      networkKey: await sha256Short(clientIp(req)),
      async pendingCode(userId) {
        const r = await fetch(`${url}/rest/v1/subscribers?user_id=eq.${encodeURIComponent(userId)}&select=discount_code_pending`, { headers: svc });
        if (!r.ok) throw new Error(`subscribers ${r.status}`);
        const rows = await r.json();
        return Array.isArray(rows) ? (rows[0]?.discount_code_pending ?? null) : null;
      },
      async redeem(userId, code) {
        const rows = await rpc("redeem_discount_code", { p_user_id: userId, p_code: code });
        return (Array.isArray(rows) ? rows[0] : rows) as RedeemRow;
      },
    }, { fn, usePendingCode: opts.usePendingCode }, corsHeaders);
  };
}
