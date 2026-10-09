// Service-role Supabase client for the payment functions.
//
// The resilient loader's payment client resolved to the _vendor supabase-js
// "bundle", a hand-written stub with no `auth` — so `auth.getUser()` threw and
// checkout could never identify the caller. A literal, pinned import is bundled
// at deploy time and is the real SDK. Guarded by
// src/test/guards/edge-stripe-import.test.ts.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.4?target=deno";

export function createPaymentServiceClient() {
  const url = Deno.env.get("SUPABASE_URL");
  const key = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!url || !key) throw new Error("Payment service misconfigured: SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY missing");
  return createClient(url, key, { auth: { persistSession: false } });
}
