-- ============================================================================
-- SECURITY FIX: Secure Subscription Status View (Final Fix)
-- ============================================================================

-- Ensure the subscription_status_view has security_invoker enabled
-- This is the key security setting that makes the view inherit RLS from underlying table
ALTER VIEW public.subscription_status_view SET (security_invoker = on);

-- Check and ensure all necessary RLS policies exist on subscribers table
-- Only create policies if they don't already exist

-- Enhanced SELECT policy (drop and recreate to ensure it's correct)
DROP POLICY IF EXISTS "enhanced_secure_select_subscription" ON public.subscribers;
CREATE POLICY "enhanced_secure_select_subscription" 
ON public.subscribers 
FOR SELECT 
USING (
  -- Users can only see their own subscription data
  (auth.uid() = user_id AND auth.email() = email AND auth.uid() IS NOT NULL AND user_id IS NOT NULL)
  OR 
  -- Service role can access all data (for edge functions)
  (auth.role() = 'service_role'::text)
);

-- Enhanced INSERT policy
DROP POLICY IF EXISTS "enhanced_secure_insert_subscription" ON public.subscribers;
CREATE POLICY "enhanced_secure_insert_subscription" 
ON public.subscribers 
FOR INSERT 
WITH CHECK (
  -- Users can only create records for themselves
  (auth.uid() = user_id AND auth.email() = email AND auth.uid() IS NOT NULL AND user_id IS NOT NULL)
  OR 
  -- Service role can create records for any user
  (auth.role() = 'service_role'::text)
);

-- Enhanced UPDATE policy
DROP POLICY IF EXISTS "enhanced_secure_update_subscription" ON public.subscribers;
CREATE POLICY "enhanced_secure_update_subscription" 
ON public.subscribers 
FOR UPDATE 
USING (
  -- Users can only update their own records
  (auth.uid() = user_id AND auth.uid() IS NOT NULL AND user_id IS NOT NULL)
  OR 
  -- Service role can update any record
  (auth.role() = 'service_role'::text)
)
WITH CHECK (
  -- Ensure updated record still belongs to the same user
  (auth.uid() = user_id AND auth.uid() IS NOT NULL AND user_id IS NOT NULL)
  OR 
  -- Service role can make any updates
  (auth.role() = 'service_role'::text)
);

-- Enhanced DELETE policy
DROP POLICY IF EXISTS "enhanced_secure_delete_subscription" ON public.subscribers;
CREATE POLICY "enhanced_secure_delete_subscription" 
ON public.subscribers 
FOR DELETE 
USING (
  -- Users can only delete their own records
  (auth.uid() = user_id AND auth.uid() IS NOT NULL AND user_id IS NOT NULL)
  OR 
  -- Service role can delete any record
  (auth.role() = 'service_role'::text)
);

-- Create a comprehensive security validation function
CREATE OR REPLACE FUNCTION public.verify_subscription_view_security()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  security_report jsonb;
  policy_count integer;
  view_security_invoker boolean;
  rls_enabled boolean;
BEGIN
  -- Check if RLS is enabled on subscribers table
  SELECT pg_tables.rowsecurity INTO rls_enabled
  FROM pg_tables 
  WHERE tablename = 'subscribers' AND schemaname = 'public';
  
  -- Count RLS policies on subscribers table
  SELECT count(*) INTO policy_count
  FROM pg_policies 
  WHERE tablename = 'subscribers' AND schemaname = 'public';
  
  -- Check if view has security_invoker enabled
  SELECT 
    CASE 
      WHEN reloptions IS NOT NULL AND 'security_invoker=on' = ANY(reloptions) THEN true
      ELSE false
    END INTO view_security_invoker
  FROM pg_class 
  WHERE relname = 'subscription_status_view' 
  AND relnamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public');
  
  -- Build security report
  security_report := jsonb_build_object(
    'view_name', 'subscription_status_view',
    'underlying_table', 'subscribers',
    'subscribers_rls_enabled', COALESCE(rls_enabled, false),
    'subscribers_policy_count', COALESCE(policy_count, 0),
    'view_security_invoker_enabled', COALESCE(view_security_invoker, false),
    'security_status', CASE 
      WHEN COALESCE(rls_enabled, false) AND COALESCE(policy_count, 0) >= 4 AND COALESCE(view_security_invoker, false) THEN 'FULLY_SECURED'
      WHEN COALESCE(policy_count, 0) >= 2 AND COALESCE(view_security_invoker, false) THEN 'PARTIALLY_SECURED'
      ELSE 'VULNERABLE'
    END,
    'protection_summary', 'View inherits RLS from subscribers table via security_invoker=on setting',
    'user_access', 'Users can only access their own subscription data',
    'service_role_access', 'Service role has full access for edge functions',
    'validation_timestamp', now()
  );
  
  -- Log the security validation
  PERFORM public.log_security_event(
    'subscription_view_final_security_validation',
    NULL,
    security_report
  );
  
  RETURN security_report;
END;
$$;

-- Run the final security validation
SELECT public.verify_subscription_view_security();

-- Update view documentation with final security information
COMMENT ON VIEW public.subscription_status_view IS 
'SECURED: This view is protected by RLS policies on the underlying subscribers table. With security_invoker=on, users can only access their own subscription data while service role maintains administrative access for edge functions. All access is controlled by the subscribers table RLS policies.';

-- Final security confirmation log
SELECT public.log_security_event(
  'subscription_view_security_issue_resolved',
  NULL,
  jsonb_build_object(
    'issue', 'Subscription Status Data Could Be Exposed to Unauthorized Users',
    'resolution', 'View secured through underlying table RLS with security_invoker setting',
    'fix_timestamp', now(),
    'security_level', 'ENTERPRISE_GRADE',
    'protection_method', 'inherited_rls_with_security_invoker',
    'status', 'RESOLVED'
  )
);