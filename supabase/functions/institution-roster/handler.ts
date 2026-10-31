import {
  providerRosterAdapter,
  type ProviderConfig,
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
export function rosterHandler(
  createCaller: (authorization: string) => CallerDb,
  env: (key: string) => string | undefined,
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
      const body = JSON.parse(text);
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
      const connections = JSON.parse(
        env("INSTITUTION_ROSTER_CONNECTIONS") || "{}",
      ) as Record<
        string,
        { clever?: ProviderConfig; classlink?: ProviderConfig }
      >;
      const configs = connections[body.schoolId] ?? {};
      if (body.action === "status")
        return json({
          clever: providerRosterAdapter(
            "clever",
            configs.clever,
            request,
          ).status(),
          classlink: providerRosterAdapter(
            "classlink",
            configs.classlink,
            request,
          ).status(),
        });
      if (
        body.action !== "preview" ||
        !["clever", "classlink"].includes(body.provider) ||
        typeof body.providerClassId !== "string"
      )
        return json({ error: "Invalid roster request" }, 400);
      const adapter = providerRosterAdapter(
        body.provider,
        configs[body.provider as "clever" | "classlink"],
        request,
      );
      if (adapter.status() === "not_connected")
        return json(
          {
            status: "not_connected",
            error:
              "Not connected. School administrator configuration is required.",
          },
          409,
        );
      // Preview only. Browser uses the same atomic CSV import RPC to save.
      return json({ rows: await adapter.read(body.providerClassId) });
    } catch (e) {
      // Only our adapter's controlled messages leave the process; never echo a
      // provider body, auth error, configuration JSON or roster content.
      const message = e instanceof Error ? e.message : "";
      const safe =
        /^(Roster |Invalid (Clever|ClassLink|roster)|More than|Row \d|Import |Not connected|A provider class)/.test(
          message,
        );
      return json(
        {
          error: safe
            ? message
            : "Roster request failed. Check connection configuration and try again.",
        },
        400,
      );
    }
  };
}
