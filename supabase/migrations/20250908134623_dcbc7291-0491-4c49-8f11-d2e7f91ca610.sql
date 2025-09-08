-- ============================================================================
-- SECURITY FIX: Fix Security Definer View by setting security_invoker=on
-- ============================================================================

-- Fix the Security Definer View issue by enabling security_invoker
-- This makes the view use the privileges of the calling user, not the creator
ALTER VIEW public.subscription_status_view SET (security_invoker = on);

-- Update documentation for the now secure view
COMMENT ON VIEW public.subscription_status_view IS 
'Secure view of subscription status without exposing sensitive payment data like Stripe customer IDs. Uses security_invoker=on to respect calling user permissions and RLS policies.';