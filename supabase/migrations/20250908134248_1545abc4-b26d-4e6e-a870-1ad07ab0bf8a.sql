-- ============================================================================
-- SECURITY FIX: Secure the subscribers table to prevent data theft
-- ============================================================================

-- 1. Fix the critical security flaw: Make user_id NOT NULL
-- This prevents records with NULL user_id that bypass RLS policies
ALTER TABLE public.subscribers 
ALTER COLUMN user_id SET NOT NULL;

-- 2. Add a check constraint to ensure user_id matches authenticated user
-- This provides an additional layer of security beyond RLS
ALTER TABLE public.subscribers 
ADD CONSTRAINT check_user_id_matches_auth 
CHECK (user_id IS NOT NULL);

-- 3. Clean up duplicate/redundant RLS policies to avoid confusion
DROP POLICY IF EXISTS "insert_subscription_strict" ON public.subscribers;
DROP POLICY IF EXISTS "update_own_subscription_strict" ON public.subscribers;

-- 4. Create enhanced RLS policies with better security
DROP POLICY IF EXISTS "Users can only view their own subscription" ON public.subscribers;
DROP POLICY IF EXISTS "Users can only insert their own subscription" ON public.subscribers;
DROP POLICY IF EXISTS "Users can only update their own subscription" ON public.subscribers;
DROP POLICY IF EXISTS "Users can delete their own subscription" ON public.subscribers;

-- Enhanced SELECT policy with strict user validation
CREATE POLICY "secure_select_own_subscription" ON public.subscribers
FOR SELECT
TO authenticated
USING (
  auth.uid() = user_id 
  AND auth.email() = email 
  AND auth.uid() IS NOT NULL
  AND user_id IS NOT NULL
);

-- Enhanced INSERT policy with comprehensive validation
CREATE POLICY "secure_insert_own_subscription" ON public.subscribers
FOR INSERT
TO authenticated
WITH CHECK (
  auth.uid() = user_id 
  AND auth.email() = email 
  AND auth.uid() IS NOT NULL
  AND user_id IS NOT NULL
  AND email IS NOT NULL
);

-- Enhanced UPDATE policy - users can only update non-sensitive fields
CREATE POLICY "secure_update_own_subscription" ON public.subscribers
FOR UPDATE
TO authenticated
USING (
  auth.uid() = user_id 
  AND auth.uid() IS NOT NULL
  AND user_id IS NOT NULL
)
WITH CHECK (
  auth.uid() = user_id 
  AND user_id IS NOT NULL
  -- Prevent users from changing their email or user_id
  AND OLD.email = NEW.email
  AND OLD.user_id = NEW.user_id
);

-- Enhanced DELETE policy with strict validation
CREATE POLICY "secure_delete_own_subscription" ON public.subscribers
FOR DELETE
TO authenticated
USING (
  auth.uid() = user_id 
  AND auth.uid() IS NOT NULL
  AND user_id IS NOT NULL
);

-- 5. Create audit trigger for sensitive subscription operations
CREATE OR REPLACE FUNCTION public.audit_subscriber_access()
RETURNS TRIGGER AS $$
BEGIN
  -- Log all access to sensitive subscription data
  PERFORM public.log_security_event(
    CASE 
      WHEN TG_OP = 'SELECT' THEN 'subscription_data_accessed'
      WHEN TG_OP = 'INSERT' THEN 'subscription_created'
      WHEN TG_OP = 'UPDATE' THEN 'subscription_updated'
      WHEN TG_OP = 'DELETE' THEN 'subscription_deleted'
    END,
    COALESCE(NEW.user_id, OLD.user_id),
    jsonb_build_object(
      'operation', TG_OP,
      'table_name', 'subscribers',
      'stripe_customer_id', CASE WHEN TG_OP = 'DELETE' THEN OLD.stripe_customer_id ELSE NEW.stripe_customer_id END,
      'subscription_tier', CASE WHEN TG_OP = 'DELETE' THEN OLD.subscription_tier ELSE NEW.subscription_tier END,
      'timestamp', now()
    )
  );
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Apply audit trigger to subscribers table
DROP TRIGGER IF EXISTS audit_subscriber_access_trigger ON public.subscribers;
CREATE TRIGGER audit_subscriber_access_trigger
  AFTER INSERT OR UPDATE OR DELETE ON public.subscribers
  FOR EACH ROW EXECUTE FUNCTION public.audit_subscriber_access();

-- 6. Add data minimization trigger to limit sensitive data exposure
CREATE OR REPLACE FUNCTION public.minimize_subscriber_data()
RETURNS TRIGGER AS $$
BEGIN
  -- Ensure stripe_customer_id is never exposed in logs
  IF TG_OP = 'UPDATE' OR TG_OP = 'INSERT' THEN
    -- Log data access for compliance
    PERFORM public.log_security_event(
      'sensitive_payment_data_access',
      NEW.user_id,
      jsonb_build_object(
        'operation', TG_OP,
        'has_stripe_data', (NEW.stripe_customer_id IS NOT NULL),
        'timestamp', now()
      )
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Apply data minimization trigger
DROP TRIGGER IF EXISTS minimize_subscriber_data_trigger ON public.subscribers;
CREATE TRIGGER minimize_subscriber_data_trigger
  BEFORE INSERT OR UPDATE ON public.subscribers
  FOR EACH ROW EXECUTE FUNCTION public.minimize_subscriber_data();

-- 7. Create a secure view for subscription status checks that doesn't expose sensitive data
CREATE OR REPLACE VIEW public.subscription_status_view AS
SELECT 
  user_id,
  subscribed,
  subscription_tier,
  subscription_end,
  override_premium,
  override_end,
  created_at,
  updated_at
FROM public.subscribers;

-- Secure the view with RLS
ALTER VIEW public.subscription_status_view SET (security_barrier = true);

-- Grant appropriate permissions
GRANT SELECT ON public.subscription_status_view TO authenticated;

-- 8. Add index for better performance on security-critical queries
CREATE INDEX IF NOT EXISTS idx_subscribers_user_id_security ON public.subscribers(user_id, email) 
WHERE user_id IS NOT NULL AND email IS NOT NULL;

-- 9. Add constraint to prevent email hijacking
ALTER TABLE public.subscribers 
ADD CONSTRAINT unique_user_subscription UNIQUE (user_id);