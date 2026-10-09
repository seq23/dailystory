// Payment Function Pattern: Tier 1 (Network CDN) + Tier 2 (Vendor) ONLY
// NO template fallback - payment requires live database access
// Returns 503 if both network and vendor fail
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { withSecurity, SecurityMiddleware } from "../_shared/security.ts"
import type { AuthenticatedUser } from "../_shared/security.ts"
import { createImportFailureResponse, createPaymentSupabaseClient, createPaymentUnavailableResponse } from "../_shared/resilientLoader.ts"
import Stripe from "../_shared/stripe.ts";

console.log("[create-premium-subscription] Function loaded successfully");

const handler = async (req: Request, user?: AuthenticatedUser): Promise<Response> => {
  const security = new SecurityMiddleware();
  
  try {
    // Load dependencies with tiered import system
    
    const { planId } = await req.json()
    
    // Use authenticated user's email instead of accepting it from request
    const email = user?.email;
    if (!email) {
      throw new Error('User email not available');
    }
    
    const stripeApiKey = Deno.env.get('STRIPE_SECRET_KEY')
    if (!stripeApiKey) {
      throw new Error('Stripe API key not configured')
    }

    const stripe = new Stripe(stripeApiKey, {
      apiVersion: '2023-10-16',
    })

    // Plan configurations
    const plans = {
      monthly: {
        priceId: 'price_monthly_premium', // Replace with actual Stripe price ID
        amount: 999, // $9.99 in cents
        name: 'Monthly Premium'
      },
      yearly: {
        priceId: 'price_yearly_premium', // Replace with actual Stripe price ID
        amount: 7999, // $79.99 in cents
        name: 'Yearly Premium'
      }
    }

    const selectedPlan = plans[planId as keyof typeof plans]
    if (!selectedPlan) {
      throw new Error('Invalid plan selected')
    }

    // Check if customer exists
    const customers = await stripe.customers.list({ 
      email: email,
      limit: 1 
    })

    let customerId
    if (customers.data.length > 0) {
      customerId = customers.data[0].id
    } else {
      // Create new customer
      const customer = await stripe.customers.create({
        email: email,
        metadata: {
          source: 'time2read_app'
        }
      })
      customerId = customer.id
    }

    // Create subscription checkout session
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: `Time2Read ${selectedPlan.name}`,
              description: planId === 'yearly' 
                ? 'Unlimited reading with advanced features - Save 33%!'
                : 'Unlimited reading with advanced features',
              images: ['https://your-domain.com/logo.png'], // Replace with your logo
            },
            unit_amount: selectedPlan.amount,
            recurring: {
              interval: planId === 'yearly' ? 'year' : 'month',
            },
          },
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${req.headers.get('origin')}/premium-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${req.headers.get('origin')}/premium-upgrade`,
      billing_address_collection: 'required',
      allow_promotion_codes: true,
      subscription_data: {
        metadata: {
          plan: planId,
          source: 'time2read_app'
        }
      }
    })

    return security.createSecureResponse({ 
      url: session.url,
      sessionId: session.id 
    });

  } catch (error) {
    console.error('Stripe payment error:', error)
    const errorMessage = error instanceof Error ? error.message : String(error);
    
    // Check for import failure and return 503 with structured response
    if (errorMessage.includes('Import') || errorMessage.includes('CDN') || errorMessage.includes('load')) {
      return createImportFailureResponse(error, 'create-premium-subscription');
    }
    
    return security.createErrorResponse(errorMessage, 500);
  }
}

// Apply security middleware with authentication required
serve(await withSecurity(handler, {
  requireAuth: true,
  rateLimit: {
    requests: 5, // Max 5 subscription attempts per hour
    windowMs: 60 * 60 * 1000 // 1 hour
  },
  auditLog: true
}));