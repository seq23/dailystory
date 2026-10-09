// The one way an edge function loads Stripe.
//
// Supabase bundles each function at deploy time and only modules reachable
// through a *literal* import specifier are included. The old resilient loader
// built the Stripe URL at runtime (a dynamic import of a variable), so the bundler never
// saw it and every call failed in ~300 ms with "Critical dependencies could not
// be loaded" — checkout and the customer portal were down. The `_vendor`
// "fallback" was a placeholder with no checkout API either.
//
// A static import here is bundled at deploy time, so it cannot fail at runtime.
// Same pinned version stripe-webhook already uses in production.
// Guarded by src/test/guards/edge-stripe-import.test.ts.
import Stripe from "https://esm.sh/stripe@14.21.0?target=deno";

export const STRIPE_API_VERSION = "2023-10-16";

export { Stripe };
export default Stripe;
