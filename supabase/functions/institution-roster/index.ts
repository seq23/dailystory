import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.58.0?target=deno";
import { rosterHandler } from "./handler.ts";
serve(
  rosterHandler(
    (authorization) =>
      createClient(
        Deno.env.get("SUPABASE_URL")!,
        Deno.env.get("SUPABASE_ANON_KEY")!,
        {
          global: { headers: { Authorization: authorization } },
          auth: { persistSession: false, autoRefreshToken: false },
        },
      ),
    (key) => Deno.env.get(key),
  ),
);
