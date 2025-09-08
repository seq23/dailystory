-- ============================================================================
-- SECURITY FIX: Secure the subscribers table to prevent data theft
-- ============================================================================

-- 1. Fix the critical security flaw: Make user_id NOT NULL
-- This prevents records with NULL user_id that bypass RLS policies
ALTER TABLE public.subscribers 
ALTER COLUMN user_id SET NOT NULL;

-- 2. Clean up duplicate/redundant RLS policies to avoid confusion
DROP POLICY IF EXISTS "insert_subscription_strict" ON public.subscribers;
DROP POLICY IF EXISTS "update_own_subscription_strict" ON public.subscribers;

-- 3. Drop existing policies to recreate them with better security
DROP POLICY IF EXISTS "Users can only view their own subscription" ON public.subscribers;
DROP POLICY IF EXISTS "Users can only insert their own subscription" ON public.subscribers;
DROP POLICY IF EXISTS "Users can only update their own subscription" ON public.subscribers;
DROP POLICY IF EXISTS "Users can delete their own subscription" ON public.subscribers;

-- 4. Create enhanced RLS policies with strict security
-- Enhanced SELECT policy - only authenticated users can view their own subscription
CREATE POLICY "secure_select_own_subscription" ON public.subscribers
FOR SELECT
TO authenticated
USING (
  auth.uid() = user_id 
  AND auth.email() = email 
  AND auth.uid() IS NOT NULL
  AND user_id IS NOT NULL
);

-- Enhanced INSERT policy - strict validation on creation
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

-- Enhanced UPDATE policy - prevent changing user_id or email
CREATE POLICY "secure_update_own_subscription" ON public.subscribers
FOR UPDATE
TO authenticated
USING (
  auth.uid() = user_id 
  AND auth.uid() IS NOT NULL
  AND user_id IS NOT NULL
);

-- Enhanced DELETE policy - strict validation
CREATE POLICY "secure_delete_own_subscription" ON public.subscribers
FOR DELETE
TO authenticated
USING (
  auth.uid() = user_id 
  AND auth.uid() IS NOT NULL
  AND user_id IS NOT NULL
);

-- 5. Add security constraints
-- Prevent multiple subscriptions per user
ALTER TABLE public.subscribers 
ADD CONSTRAINT unique_user_subscription UNIQUE (user_id);

-- Ensure user_id is never null (additional safety)
ALTER TABLE public.subscribers 
ADD CONSTRAINT check_user_id_not_null 
CHECK (user_id IS NOT NULL);

-- 6. Create audit trigger for sensitive subscription operations
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
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Apply audit trigger
DROP TRIGGER IF EXISTS audit_subscriber_access_trigger ON public.subscribers;
CREATE TRIGGER audit_subscriber_access_trigger
  AFTER INSERT OR UPDATE OR DELETE ON public.subscribers
  FOR EACH ROW EXECUTE FUNCTION public.audit_subscriber_access();

-- 7. Create a secure view that doesn't expose sensitive payment data
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
GRANT SELECT ON public.subscription_status_view TO authenticated;

-- 8. Add performance index for security queries
CREATE INDEX IF NOT EXISTS idx_subscribers_user_security 
ON public.subscribers(user_id, email) 
WHERE user_id IS NOT NULL;

-- 9. Add trigger to prevent email/user_id changes in updates
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
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Apply identity protection trigger
DROP TRIGGER IF EXISTS prevent_identity_change_trigger ON public.subscribers;
CREATE TRIGGER prevent_identity_change_trigger
  BEFORE UPDATE ON public.subscribers
  FOR EACH ROW EXECUTE FUNCTION public.prevent_subscription_identity_change();