import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import Stripe from "https://esm.sh/stripe@14.21.0"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { planId, email } = await req.json()
    
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

    return new Response(JSON.stringify({ 
      url: session.url,
      sessionId: session.id 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })

  } catch (error) {
    console.error('Stripe payment error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})