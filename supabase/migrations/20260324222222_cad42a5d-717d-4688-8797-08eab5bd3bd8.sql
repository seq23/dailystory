DROP VIEW IF EXISTS public.subscription_status_view;
CREATE VIEW public.subscription_status_view WITH (security_barrier, security_invoker = on) AS
  SELECT user_id, subscribed, subscription_tier, subscription_end,
         override_premium, override_end, created_at, updated_at
  FROM public.subscribers
  WHERE user_id = auth.uid();