import {
  classlinkRosterAdapter,
  RosterProviderError,
  type ProviderLink,
} from "../_shared/institutionRoster.ts";
import { buildCorsHeaders } from "../_shared/healthCors.ts";
interface CallerDb {
  auth: {
    getUser: () => Promise<{
      data: { user: { id: string } | null };
      error: unknown;
    }>;
  };
  from: (table: string) => any;
}
/** public.paid_call_hit: null = allowed and counted; else the full bucket. Throws when unreachable. */
export type RateHit = (
  buckets: string[],
  windows: number[],
  limits: number[],
) => Promise<string | null>;

/**
 * Provider calls (list classes, preview a class) per school admin per hour. One
 * import is about 3 calls; 30 leaves room for a whole school's classes in an hour
 * and stops a loop from using up the shared ClassLink app quota for every school.
 */
export const ROSTER_CALLS_PER_HOUR = 30;
const HOUR = 3600;

export function rosterHandler(
  createCaller: (authorization: string) => CallerDb,
  env: (key: string) => string | undefined,
  hit: RateHit,
  request: typeof fetch = fetch,
) {
  return async (req: Request) => {
    const headers = buildCorsHeaders(req);
    headers.set("Content-Type", "application/json");
    headers.set("Cache-Control", "no-store");
    const json = (body: unknown, status = 200) =>
      new Response(JSON.stringify(body), { status, headers });
    if (req.method === "OPTIONS")
      return new Response(null, { status: 204, headers });
    if (req.method !== "POST") return json({ error: "POST required" }, 405);
    try {
      const authorization = req.headers.get("Authorization");
      if (!authorization?.startsWith("Bearer "))
        return json({ error: "Sign in required" }, 401);
      const db = createCaller(authorization);
      const {
        data: { user },
        error,
      } = await db.auth.getUser();
      if (error || !user) return json({ error: "Sign in required" }, 401);
      if (Number(req.headers.get("Content-Length")) > 4096)
        return json({ error: "Request too large" }, 413);
      const text = await req.text();
      if (text.length > 4096) return json({ error: "Request too large" }, 413);
      let body: Record<string, unknown>;
      try {
        body = JSON.parse(text) ?? {};
      } catch {
        return json({ error: "Invalid roster request" }, 400);
      }
      if (typeof body.schoolId !== "string")
        return json({ error: "School ID required" }, 400);
      // The caller-scoped client enforces RLS; service-role access is unnecessary.
      const { data: member, error: memberError } = await db
        .from("institution_members")
        .select("role")
        .eq("school_id", body.schoolId)
        .eq("user_id", user.id)
        .maybeSingle();
      if (memberError || member?.role !== "school_admin")
        return json({ error: "School admin required" }, 403);
      // Per-school ClassLink links (IDs only, operator-set) and the app's own
      // developer token. A malformed links secret reads as "not connected".
      let connections: Record<string, { classlink?: ProviderLink }> = {};
      try {
        connections = JSON.parse(env("INSTITUTION_ROSTER_CONNECTIONS") || "{}") ?? {};
      } catch {
        connections = {};
      }
      const adapter = classlinkRosterAdapter(
        connections[body.schoolId]?.classlink,
        env("CLASSLINK_ONEROSTER_TOKEN"),
        request,
      );
      if (body.action === "status") return json({ classlink: adapter.status() });
      if (
        !["classes", "preview"].includes(body.action as string) ||
        (body.action === "preview" && typeof body.providerClassId !== "string")
      )
        return json({ error: "Invalid roster request" }, 400);
      if (adapter.status() === "not_connected")
        return json(
          {
            status: "not_connected",
            error: "Not connected. School administrator configuration is required.",
          },
          409,
        );
      // Charged before any provider call; a refused call is not counted.
      let over: string | null;
      try {
        over = await hit([`roster:${user.id}|${HOUR}`], [HOUR], [ROSTER_CALLS_PER_HOUR]);
      } catch {
        return json(
          { status: "unknown", error: "Roster check is unavailable. Try again in a few minutes." },
          503,
        );
      }
      if (over) {
        headers.set("Retry-After", String(HOUR));
        return json(
          { error: "Too many roster requests. Try again in an hour; CSV import still works." },
          429,
        );
      }
      if (body.action === "classes")
        return json({ classes: await adapter.classes() });
      // Preview only. Browser uses the same atomic CSV import RPC to save.
      return json({ rows: await adapter.read(body.providerClassId as string) });
    } catch (e) {
      // Only our adapter's controlled messages leave the process; never echo a
      // provider body, auth error, configuration JSON or roster content.
      if (e instanceof RosterProviderError)
        return json({ status: "not_connected", error: e.message }, 502);
      const message = e instanceof Error ? e.message : "";
      if (/^(Roster |Invalid roster|More than|Row \d|Import |Not connected|A provider class)/.test(message))
        return json({ error: message }, 422);
      return json(
        { status: "unknown", error: "Roster request failed. Try again later; CSV import still works." },
        502,
      );
    }
  };
}
