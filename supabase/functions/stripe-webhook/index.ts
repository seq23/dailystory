// Stripe Webhook Handler
// Listens for checkout.session.completed to activate premium subscriptions
// NO JWT verification — Stripe sends webhooks without auth tokens
// Security: validated via Stripe webhook signature (STRIPE_WEBHOOK_SECRET)

import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { subscriptionEndFrom, subscriptionGivesAccess } from "../_shared/subscriptionEnd.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, stripe-signature",
};

const log = (step: string, details?: any) => {
  const d = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[STRIPE-WEBHOOK] ${step}${d}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  try {
    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET");

    if (!stripeKey) throw new Error("STRIPE_SECRET_KEY not configured");

    // Import Stripe
    const { default: Stripe } = await import("https://esm.sh/stripe@14.21.0?target=deno&no-check");
    const stripe = new Stripe(stripeKey, { apiVersion: "2023-10-16" });

    // Get raw body for signature verification
    const body = await req.text();
    let event: any;

    if (webhookSecret) {
      const signature = req.headers.get("stripe-signature");
      if (!signature) {
        log("ERROR: Missing stripe-signature header");
        return new Response(JSON.stringify({ error: "Missing signature" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      try {
        event = await stripe.webhooks.constructEventAsync(body, signature, webhookSecret);
        log("Signature verified", { type: event.type });
      } catch (err) {
        log("ERROR: Signature verification failed", { error: String(err) });
        return new Response(JSON.stringify({ error: "Invalid signature" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    } else {
      // No webhook secret configured — parse raw JSON (development only)
      log("WARNING: No STRIPE_WEBHOOK_SECRET set — skipping signature verification");
      event = JSON.parse(body);
    }

    // Create Supabase service client
    const { createClient } = await import("https://esm.sh/@supabase/supabase-js@2.49.4?target=deno&no-check");
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    // Handle checkout.session.completed
    if (event.type === "checkout.session.completed") {
      const session = event.data.object;
      const userId = session.metadata?.user_id;
      const plan = session.metadata?.plan || "monthly";
      const customerEmail = session.customer_email || session.customer_details?.email;
      const stripeCustomerId = session.customer;

      log("Checkout completed", { userId, plan, customerEmail, stripeCustomerId });

      if (!userId) {
        log("ERROR: No user_id in session metadata");
        return new Response(JSON.stringify({ error: "No user_id in metadata" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // Subscription end: Stripe's own date (the trial's end during a trial); a month or a year
      // from now only when Stripe cannot be read.
      const now = new Date();
      const planEnd = new Date(now);
      if (plan === "annual") {
        planEnd.setFullYear(planEnd.getFullYear() + 1);
      } else {
        planEnd.setMonth(planEnd.getMonth() + 1);
      }
      let stripeSub = null;
      if (session.subscription) {
        try {
          stripeSub = await stripe.subscriptions.retrieve(String(session.subscription));
        } catch (e) {
          log("Could not read the subscription; using the plan length", { error: String(e) });
        }
      }
      const subscriptionEnd = subscriptionEndFrom(stripeSub, planEnd);

      // Upsert subscriber record — use service role to bypass RLS
      const { error: upsertError } = await supabaseAdmin
        .from("subscribers")
        .upsert(
          {
            user_id: userId,
            email: customerEmail || "",
            subscribed: true,
            subscription_tier: plan === "annual" ? "annual" : "monthly",
            subscription_end: subscriptionEnd.toISOString(),
            stripe_customer_id: stripeCustomerId,
            updated_at: new Date().toISOString(),
          },
          { onConflict: "user_id" }
        );

      if (upsertError) {
        log("ERROR: Failed to upsert subscriber", { error: upsertError.message });
        throw new Error(`Database update failed: ${upsertError.message}`);
      }

      log("Subscriber activated successfully", { userId, plan, subscriptionEnd: subscriptionEnd.toISOString() });

      // Access-code trials: mark the code use as a completed signup (see access_code_signups).
      if (session.metadata?.access_code) {
        const { error: redemptionError } = await supabaseAdmin
          .from("access_code_redemptions")
          .update({
            status: "completed",
            completed_at: new Date().toISOString(),
            stripe_customer_id: stripeCustomerId ?? null,
            stripe_subscription_id: session.subscription ?? null,
          })
          .eq("stripe_session_id", session.id);
        if (redemptionError) log("ERROR: Failed to mark access code signup", { error: redemptionError.message });
        else log("Access code signup recorded", { accessCode: session.metadata.access_code });
      }
    }

    // Renewed, cancelled at period end, or un-cancelled: keep the stored end on Stripe's date.
    if (event.type === "customer.subscription.updated") {
      const subscription = event.data.object;
      const stripeCustomerId = subscription.customer;
      const subscriptionEnd = subscriptionEndFrom(subscription, new Date());
      const { error: updError } = await supabaseAdmin
        .from("subscribers")
        .update({
          subscribed: subscriptionGivesAccess(subscription.status),
          subscription_end: subscriptionEnd.toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq("stripe_customer_id", stripeCustomerId);
      if (updError) log("ERROR: Failed to update subscriber", { error: updError.message });
      else log("Subscription updated", { stripeCustomerId, status: subscription.status, subscriptionEnd: subscriptionEnd.toISOString() });
    }

    // Handle subscription cancelled/deleted
    if (event.type === "customer.subscription.deleted") {
      const subscription = event.data.object;
      const stripeCustomerId = subscription.customer;

      log("Subscription cancelled", { stripeCustomerId });

      // Find subscriber by stripe_customer_id and deactivate
      const { error: updateError } = await supabaseAdmin
        .from("subscribers")
        .update({
          subscribed: false,
          subscription_tier: null,
          updated_at: new Date().toISOString(),
        })
        .eq("stripe_customer_id", stripeCustomerId);

      if (updateError) {
        log("ERROR: Failed to deactivate subscriber", { error: updateError.message });
      } else {
        log("Subscriber deactivated", { stripeCustomerId });
      }
    }

    // Handle invoice payment failed
    if (event.type === "invoice.payment_failed") {
      const invoice = event.data.object;
      log("Payment failed", { customerId: invoice.customer, invoiceId: invoice.id });
      // No action needed — Stripe retries automatically
      // Could add email notification here later
    }

    return new Response(JSON.stringify({ received: true }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    log("ERROR", { message: msg });
    return new Response(JSON.stringify({ error: msg }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
