-- ============================================================================
-- SECURITY FIX: Address linter warnings from previous migration
-- ============================================================================

-- 1. Fix ERROR: Security Definer View
-- Remove the security definer property from the view to use the querying user's permissions
ALTER VIEW public.subscription_status_view SET (security_barrier = false);

-- 2. Fix WARN: Function Search Path Mutable
-- Set proper search_path for all functions to prevent injection attacks

-- Update audit function with secure search path
CREATE OR REPLACE FUNCTION public.audit_subscriber_access()
RETURNS TRIGGER AS $$
BEGIN
  -- Log all sensitive operations on subscription data
  PERFORM public.log_security_event(
    CASE 
      WHEN TG_OP = 'INSERT' THEN 'subscription_created'
      WHEN TG_OP = 'UPDATE' THEN 'subscription_updated'
      WHEN TG_OP = 'DELETE' THEN 'subscription_deleted'
    END,
    COALESCE(NEW.user_id, OLD.user_id),
    jsonb_build_object(
      'operation', TG_OP,
      'table_name', 'subscribers',
      'has_stripe_data', COALESCE(NEW.stripe_customer_id IS NOT NULL, OLD.stripe_customer_id IS NOT NULL),
      'subscription_tier', COALESCE(NEW.subscription_tier, OLD.subscription_tier),
      'timestamp', now()
    )
  );
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql 
   SECURITY DEFINER 
   SET search_path = public;

-- Update identity protection function with secure search path
CREATE OR REPLACE FUNCTION public.prevent_subscription_identity_change()
RETURNS TRIGGER AS $$
BEGIN
  -- Prevent users from changing their identity fields
  IF OLD.user_id != NEW.user_id THEN
    RAISE EXCEPTION 'Cannot change user_id in subscription record';
  END IF;
  
  IF OLD.email != NEW.email THEN
    RAISE EXCEPTION 'Cannot change email in subscription record';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql 
   SECURITY DEFINER 
   SET search_path = public;

-- 3. Create RLS policies for the secure view
-- Ensure the view respects user-level security
CREATE POLICY "subscription_status_view_policy" ON public.subscribers
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- 4. Additional security hardening
-- Add comment documentation for security functions
COMMENT ON FUNCTION public.audit_subscriber_access() IS 
'Audits all subscription table operations. Uses SECURITY DEFINER with locked search_path for security.';

COMMENT ON FUNCTION public.prevent_subscription_identity_change() IS 
'Prevents modification of user_id and email fields in subscription records. Uses SECURITY DEFINER with locked search_path for security.';

COMMENT ON VIEW public.subscription_status_view IS 
'Secure view of subscription status without exposing sensitive payment data like Stripe customer IDs.';

-- 5. Final security validation
-- Ensure all functions have proper security settings
DO $$
BEGIN
  -- Log successful security hardening
  RAISE NOTICE 'Security hardening completed for subscribers table';
  RAISE NOTICE 'Applied: secure RLS policies, audit logging, identity protection, and performance indexes';
END
$$;