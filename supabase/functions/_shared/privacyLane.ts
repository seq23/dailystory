// School children's text goes only to AI routes that neither train on it nor keep it
// (Phase 8, approved 26 Oct 2026; built 31 Oct 2026).
//
// "school" lane: the signed-in account belongs to an institution (teacher or school
// admin), owns an app profile linked to a school roster child, or the request names a
// linked child profile. Decided by the database (public.institution_ai_lane, migration
// 20261031210000_institution_app_reading.sql), never by a flag the browser sends.
// "family" lane: everything else, routed exactly as before.
//
// Fail closed: a signed-in caller whose identity or institution status cannot be
// confirmed is treated as "school". A school request that no school-safe route answers
// gets the caller's backup content (Backup Mode stories, built-in quiz/definition),
// never a free or training route.
//
// Which routes are school-safe, and why: config/product_inference.json
// paid_lanes[product-inference].text_chain.school_lane. Guard:
// src/test/guards/school-privacy-lane.test.ts.
import { AsyncLocalStorage } from "node:async_hooks";

export type PrivacyLane = "family" | "school";

const laneStore = new AsyncLocalStorage<PrivacyLane>();

/** Run fn with every chatCompletionWithFallback call inside it on this lane. */
export function withPrivacyLane<T>(lane: PrivacyLane, fn: () => T): T {
  return laneStore.run(lane, fn);
}

/** The lane of the request being served, when one was set. */
export function currentPrivacyLane(): PrivacyLane | undefined {
  return laneStore.getStore();
}

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** A child profile id from a request body, when it is a real UUID (anything else is ignored). */
export function childProfileIdOf(body: unknown): string | null {
  // deno-lint-ignore no-explicit-any
  const b = (body ?? {}) as any;
  const candidates = [
    b.childProfileId, b.child_profile_id, b.childId,
    b.userInfo?.childProfileId, b.userInfo?.childId,
    b.config?.userInfo?.childProfileId, b.config?.userInfo?.childId,
  ];
  for (const c of candidates) if (typeof c === "string" && UUID.test(c)) return c;
  return null;
}

/** The JWT's role claim without verifying it (verification happens next, by Supabase Auth). */
export function jwtRole(token: string): string | null {
  try {
    const part = token.split(".")[1];
    if (!part) return null;
    const json = atob(part.replace(/-/g, "+").replace(/_/g, "/").padEnd(Math.ceil(part.length / 4) * 4, "="));
    const role = JSON.parse(json)?.role;
    return typeof role === "string" ? role : null;
  } catch {
    return null;
  }
}

export interface LaneDeps {
  /** Verified user id for the token, or throws. */
  verifyUser: (token: string) => Promise<string>;
  /** public.institution_ai_lane(p_user, p_child), or throws. */
  laneOf: (userId: string, childProfileId: string | null) => Promise<string>;
}

/**
 * The privacy lane for one request. No token, or the project's anon key (a guest), is
 * the family lane: a guest has no school record. A signed-in token is verified and
 * looked up; any failure on that path is the school lane.
 */
export async function resolvePrivacyLane(
  authorization: string | null | undefined,
  childProfileId: string | null,
  deps: LaneDeps,
): Promise<PrivacyLane> {
  const token = (authorization ?? "").replace(/^Bearer\s+/i, "").trim();
  if (!token) return childProfileId ? "school" : "family";
  const role = jwtRole(token);
  if (role === "anon") return childProfileId ? "school" : "family";
  try {
    const userId = await deps.verifyUser(token);
    const lane = await deps.laneOf(userId, childProfileId);
    return lane === "family" ? "family" : "school";
  } catch (e) {
    console.warn("privacy lane: could not confirm the account, using the school lane", e instanceof Error ? e.message : String(e));
    return "school";
  }
}

/** The production dependencies: Supabase Auth and the service-role-only lane RPC. */
export async function supabaseLaneDeps(): Promise<LaneDeps> {
  // A runtime specifier: Deno loads it; the browser build's typecheck never resolves it.
  const supabaseJs = "https://esm.sh/@supabase/supabase-js@2.57.4";
  const { createClient } = await import(supabaseJs);
  // deno-lint-ignore no-explicit-any
  const env = (n: string) => (globalThis as any).Deno?.env.get(n) as string | undefined;
  const url = env("SUPABASE_URL");
  const key = env("SUPABASE_SERVICE_ROLE_KEY");
  if (!url || !key) throw new Error("SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY missing");
  const client = createClient(url, key, { auth: { persistSession: false } });
  return {
    verifyUser: async (token) => {
      const { data, error } = await client.auth.getUser(token);
      if (error || !data?.user?.id) throw new Error(error?.message ?? "no user for token");
      return data.user.id;
    },
    laneOf: async (userId, childProfileId) => {
      const { data, error } = await client.rpc("institution_ai_lane", { p_user: userId, p_child: childProfileId });
      if (error) throw new Error(error.message);
      return String(data);
    },
  };
}

/** The lane for an incoming edge request (production wiring; fails closed). */
export async function privacyLaneForRequest(req: Request, body: unknown): Promise<PrivacyLane> {
  const child = childProfileIdOf(body);
  const auth = req.headers.get("Authorization");
  let deps: LaneDeps;
  try {
    deps = await supabaseLaneDeps();
  } catch (e) {
    // Without the database we cannot tell a school child from a family one.
    const token = (auth ?? "").replace(/^Bearer\s+/i, "").trim();
    if (!child && (!token || jwtRole(token) === "anon")) return "family";
    console.warn("privacy lane: no database client, using the school lane", e instanceof Error ? e.message : String(e));
    return "school";
  }
  return resolvePrivacyLane(auth, child, deps);
}
