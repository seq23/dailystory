-- Make subscription_status_view use SECURITY INVOKER so RLS on subscribers table applies
DROP VIEW IF EXISTS public.subscription_status_view;
CREATE VIEW public.subscription_status_view
WITH (security_invoker = on)
AS
SELECT 
  s.user_id,
  s.subscribed,
  s.subscription_end,
  s.override_premium,
  s.override_end,
  s.created_at,
  s.updated_at,
  s.subscription_tier
FROM public.subscribers s;