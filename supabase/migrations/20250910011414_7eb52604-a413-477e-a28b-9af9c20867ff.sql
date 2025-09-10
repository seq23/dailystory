-- Security Fix: Secure subscription_status_view with proper RLS policies
-- This addresses the security vulnerability where subscription data could be publicly accessible

-- First, let's check current state and enable RLS on the view if not already enabled
ALTER TABLE public.subscription_status_view ENABLE ROW LEVEL SECURITY;

-- Create RLS policy to ensure users can only access their own subscription status
CREATE POLICY "Users can only view their own subscription status" 
ON public.subscription_status_view
FOR SELECT
USING (auth.uid() = user_id AND auth.uid() IS NOT NULL);

-- Create policy for service role to access all subscription data (for edge functions)
CREATE POLICY "Service role can access all subscription status" 
ON public.subscription_status_view
FOR SELECT
USING (auth.role() = 'service_role'::text);

-- Log this security enhancement
PERFORM public.log_security_event(
  'subscription_view_security_policies_created',
  NULL,
  jsonb_build_object(
    'table_name', 'subscription_status_view',
    'security_enhancement', 'RLS_policies_added',
    'policies_created', ARRAY[
      'users_own_subscription_view_only',
      'service_role_full_access'
    ],
    'vulnerability_fixed', 'publicly_accessible_subscription_data',
    'timestamp', now()
  )
);