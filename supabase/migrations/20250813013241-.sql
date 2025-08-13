-- Tighten RLS policies on public.subscribers to prevent email-based harvesting and over-permissive updates
-- 1) Drop existing permissive policies
DROP POLICY IF EXISTS "select_own_subscription" ON public.subscribers;
DROP POLICY IF EXISTS "update_own_subscription" ON public.subscribers;
DROP POLICY IF EXISTS "insert_subscription" ON public.subscribers;

-- 2) Strict, user-id based access only
CREATE POLICY "select_own_subscription_strict" ON public.subscribers
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "update_own_subscription_strict" ON public.subscribers
FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Allow users to create their own row only, matching both user_id and email
CREATE POLICY "insert_subscription_strict" ON public.subscribers
FOR INSERT
WITH CHECK (auth.uid() = user_id AND auth.email() = email);
