-- Fix subscription_status_view security vulnerability
-- Ensure the view uses security_invoker so it inherits user permissions from underlying table

-- First, let's see the current view definition
SELECT definition FROM pg_views WHERE viewname = 'subscription_status_view' AND schemaname = 'public';

-- Drop and recreate the view with proper security settings
DROP VIEW IF EXISTS public.subscription_status_view;

-- Recreate the view with security_invoker=on to inherit RLS from subscribers table
CREATE VIEW public.subscription_status_view 
WITH (security_invoker=on) 
AS
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

-- Enable RLS on the view (even though it inherits from subscribers table)
ALTER VIEW public.subscription_status_view SET (security_invoker = on);

-- Verify the security settings are applied
SELECT 
  schemaname,
  viewname,
  viewowner,
  CASE 
    WHEN reloptions IS NOT NULL AND 'security_invoker=on' = ANY(reloptions) THEN 'security_invoker=on'
    ELSE 'security_definer (default)'
  END as security_setting
FROM pg_views v
LEFT JOIN pg_class c ON c.relname = v.viewname 
WHERE viewname = 'subscription_status_view' AND schemaname = 'public';