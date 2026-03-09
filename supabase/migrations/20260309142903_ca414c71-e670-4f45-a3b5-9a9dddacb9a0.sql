-- Recreate subscription_status_view with security_invoker = on
-- so it inherits RLS from the underlying subscribers table
DROP VIEW IF EXISTS public.subscription_status_view;

CREATE VIEW public.subscription_status_view
WITH (security_invoker = on)
AS
SELECT 
  user_id,
  subscribed,
  subscription_end,
  override_premium,
  override_end,
  subscription_tier,
  created_at,
  updated_at
FROM public.subscribers;