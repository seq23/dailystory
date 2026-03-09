-- Fix: Prevent users from self-granting premium via INSERT
-- Users can only insert with subscribed=false and override_premium=false
DROP POLICY IF EXISTS "subscribers_insert_own" ON public.subscribers;

CREATE POLICY "subscribers_insert_own" ON public.subscribers
FOR INSERT TO public
WITH CHECK (
  auth.uid() = user_id 
  AND auth.uid() IS NOT NULL 
  AND user_id IS NOT NULL
  AND subscribed = false
  AND override_premium = false
  AND subscription_tier IS NULL
);

-- Extra safety: Add WHERE clause to subscription_status_view
-- Even though security_invoker=on inherits RLS, this adds defense-in-depth
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
FROM public.subscribers
WHERE user_id = auth.uid();