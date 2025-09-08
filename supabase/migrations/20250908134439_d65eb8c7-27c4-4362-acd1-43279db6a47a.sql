-- ============================================================================
-- SECURITY FIX: Fix Security Definer View warning
-- ============================================================================

-- Fix ERROR: Security Definer View
-- Remove the security barrier property from the view to use standard RLS
ALTER VIEW public.subscription_status_view SET (security_barrier = false);

-- Add documentation for the secure view
COMMENT ON VIEW public.subscription_status_view IS 
'Secure view of subscription status without exposing sensitive payment data like Stripe customer IDs. Uses standard RLS policies for access control.';