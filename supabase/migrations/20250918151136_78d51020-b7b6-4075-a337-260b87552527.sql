-- CRITICAL SECURITY FIX: Enable proper security on subscription_status_view
-- This view was exposing all subscription data publicly

-- First, enable security_invoker on the view to inherit RLS from underlying table
ALTER VIEW public.subscription_status_view SET (security_invoker = on);

-- Enable RLS on the view itself
ALTER VIEW public.subscription_status_view ENABLE ROW LEVEL SECURITY;

-- Create policy to match the underlying subscribers table policy
CREATE POLICY "subscription_status_view_secure_access" 
ON public.subscription_status_view 
FOR ALL 
USING (
  (((auth.uid() = user_id) AND (auth.email() = (SELECT email FROM subscribers WHERE user_id = subscription_status_view.user_id)) AND (auth.uid() IS NOT NULL)) OR (auth.role() = 'service_role'::text)) AND 
  ((EXISTS (SELECT 1 FROM auth.users WHERE ((users.id = auth.uid()) AND (users.email_confirmed_at IS NOT NULL)))) OR (auth.role() = 'service_role'::text))
);

-- Log this critical security fix
SELECT public.log_security_event(
  'critical_subscription_view_security_fixed',
  NULL,
  jsonb_build_object(
    'view_name', 'subscription_status_view',
    'security_invoker_enabled', true,
    'rls_enabled', true,
    'policy_created', 'subscription_status_view_secure_access',
    'vulnerability_type', 'publicly_accessible_subscription_data',
    'fix_timestamp', now(),
    'severity', 'CRITICAL'
  )
);