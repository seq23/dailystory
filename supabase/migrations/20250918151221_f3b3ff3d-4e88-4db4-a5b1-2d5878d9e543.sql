-- CRITICAL SECURITY FIX: Secure subscription_status_view 
-- Views cannot have RLS directly, but can inherit it via security_invoker

-- Enable security_invoker on the view to inherit RLS from underlying subscribers table
ALTER VIEW public.subscription_status_view SET (security_invoker = on);

-- Verify the fix worked
SELECT 
  'subscription_status_view' as view_name,
  CASE WHEN array_length(c.reloptions, 1) IS NOT NULL 
       AND 'security_invoker=on' = ANY(c.reloptions) 
       THEN 'SECURED: Inherits RLS from subscribers table' 
       ELSE 'VULNERABLE: No security inheritance' 
  END as security_status
FROM pg_class c 
WHERE c.relname = 'subscription_status_view' 
AND c.relnamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public');

-- Log the critical security fix
SELECT public.log_security_event(
  'critical_subscription_view_security_fixed',
  NULL,
  jsonb_build_object(
    'view_name', 'subscription_status_view',
    'security_method', 'security_invoker_enabled',
    'inherits_rls_from', 'subscribers_table',
    'vulnerability_fixed', 'publicly_accessible_subscription_data',
    'fix_timestamp', now(),
    'severity', 'CRITICAL_RESOLVED'
  )
);