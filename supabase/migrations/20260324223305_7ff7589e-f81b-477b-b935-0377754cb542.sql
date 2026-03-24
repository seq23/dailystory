-- Add UNIQUE constraint on user_id to prevent spam inserts
ALTER TABLE public.subscribers ADD CONSTRAINT subscribers_user_id_unique UNIQUE (user_id);

-- Tighten INSERT policy: force sensitive fields to NULL/defaults on insert
DROP POLICY IF EXISTS "subscribers_insert_own" ON public.subscribers;
CREATE POLICY "subscribers_insert_own" ON public.subscribers
  FOR INSERT WITH CHECK (
    auth.uid() = user_id
    AND auth.uid() IS NOT NULL
    AND user_id IS NOT NULL
    AND subscribed = false
    AND override_premium = false
    AND subscription_tier IS NULL
    AND stripe_customer_id IS NULL
    AND discount_activated = false
    AND discount_code_pending IS NULL
  );