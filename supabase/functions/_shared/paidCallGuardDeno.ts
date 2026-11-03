// Deno wiring for paidCallGuard.ts: real Supabase auth and the paid_call_hit counter.
// Every function that pays per call imports from here. Guard: src/test/guards/paid-call-guard.test.ts.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.4?target=deno";
import {
  chargePaidCall,
  guardPaidCall,
  identifyPaidCaller,
  type IdentifyOptions,
  type PaidCallDeps,
  type PaidCaller,
} from "./paidCallGuard.ts";

export { GUEST_PASS_HEADER } from "./paidCallGuard.ts";
export type { PaidCaller };

let deps: PaidCallDeps | null = null;

export function paidCallDeps(): PaidCallDeps {
  if (deps) return deps;
  const url = Deno.env.get("SUPABASE_URL") ?? "";
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
  const anonKey = Deno.env.get("SUPABASE_ANON_KEY") ?? "";
  const admin = createClient(url, serviceKey, { auth: { persistSession: false, autoRefreshToken: false } });
  deps = {
    anonKey,
    serviceKey,
    async getUserId(token) {
      const { data, error } = await admin.auth.getUser(token);
      return error || !data?.user ? null : data.user.id;
    },
    async hit(buckets, windows, limits) {
      const { data, error } = await admin.rpc("paid_call_hit", { p_buckets: buckets, p_windows: windows, p_limits: limits });
      if (error) throw new Error(error.message);
      return (data as string | null) ?? null;
    },
  };
  return deps;
}

export function adminUserIds(): string[] {
  return (Deno.env.get("ADMIN_USER_IDS") || "").split(",").map((s) => s.trim()).filter(Boolean);
}

export const identifyCaller = (req: Request, opts?: IdentifyOptions) => identifyPaidCaller(req, paidCallDeps(), opts);
export const chargeCall = (caller: PaidCaller, fn: string, extra?: Record<string, unknown>, failClosed = false) =>
  chargePaidCall(caller, fn, paidCallDeps(), extra, failClosed);
export const guardCall = (req: Request, fn: string, opts?: IdentifyOptions) => guardPaidCall(req, fn, paidCallDeps(), opts);

/** For functions with no free cache path: the 401/403/429 to return (with CORS), or null to go ahead. */
export async function paidCallRefusal(
  req: Request,
  fn: string,
  cors: Record<string, string>,
  opts?: IdentifyOptions,
): Promise<Response | null> {
  const { refusal } = await guardCall(req, fn, opts);
  if (!refusal) return null;
  const headers = new Headers(refusal.headers);
  for (const [k, v] of Object.entries(cors)) if (!headers.has(k)) headers.set(k, v);
  return new Response(refusal.body, { status: refusal.status, headers });
}
