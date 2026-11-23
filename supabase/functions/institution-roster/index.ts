import { serve } from "../_shared/serve.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.58.0?target=deno";
import { rosterHandler } from "./handler.ts";
const url = Deno.env.get("SUPABASE_URL")!;
// Service role only for the shared rate counter (public.paid_call_hit); roster reads
// stay on the caller's own RLS-scoped client.
const service = createClient(url, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!, {
  auth: { persistSession: false, autoRefreshToken: false },
});
serve(
  rosterHandler(
    (authorization) =>
      createClient(url, Deno.env.get("SUPABASE_ANON_KEY")!, {
        global: { headers: { Authorization: authorization } },
        auth: { persistSession: false, autoRefreshToken: false },
      }),
    (key) => Deno.env.get(key),
    async (buckets, windows, limits) => {
      const { data, error } = await service.rpc("paid_call_hit", {
        p_buckets: buckets,
        p_windows: windows,
        p_limits: limits,
      });
      if (error) throw new Error("rate counter unavailable");
      return (data as string | null) ?? null;
    },
  ),
);
