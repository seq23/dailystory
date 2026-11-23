// Stands in for https://esm.sh/@supabase/supabase-js in edge-function tests: auth, RPCs and
// table reads answer from edgeState(), and writes succeed without storing anything.
import { edgeState } from "./state";

type Result = { data: unknown; error: null };

function query(table: string) {
  const rows = () => edgeState().tables[table] ?? [];
  let single: "one" | "maybe" | null = null;
  const result = (): Result => ({ data: single ? rows()[0] ?? null : rows(), error: null });
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const builder: any = new Proxy(
    {},
    {
      get(_t, prop) {
        if (prop === "then") return (ok: (r: Result) => unknown, bad?: (e: unknown) => unknown) => Promise.resolve(result()).then(ok, bad);
        if (prop === "single") return () => { single = "one"; return builder; };
        if (prop === "maybeSingle") return () => { single = "maybe"; return builder; };
        return () => builder;
      },
    },
  );
  return builder;
}

export function createClient() {
  const state = edgeState();
  return {
    auth: {
      getUser: async (token: string) => {
        const id = state.userIdFor(token);
        return id ? { data: { user: { id, app_metadata: {}, user_metadata: {} } }, error: null } : { data: { user: null }, error: { message: "invalid token" } };
      },
      admin: { updateUserById: async () => ({ data: {}, error: null }) },
    },
    rpc: async (name: string) => ({ data: state.rpc[name] ?? null, error: null }),
    from: (table: string) => query(table),
    functions: { invoke: async () => ({ data: null, error: null }) },
  };
}
