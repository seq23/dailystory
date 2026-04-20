
-- 1. Remove anonymous read access to tts-cache bucket
DROP POLICY IF EXISTS "Anon users can read tts-cache" ON storage.objects;

-- 2. Tighten subscribers INSERT policy: ensure email matches authenticated user's email
DROP POLICY IF EXISTS "subscribers_insert_own" ON public.subscribers;

CREATE POLICY "subscribers_insert_own"
ON public.subscribers
FOR INSERT
TO public
WITH CHECK (
  auth.uid() = user_id
  AND auth.uid() IS NOT NULL
  AND user_id IS NOT NULL
  AND subscribed = false
  AND override_premium = false
  AND subscription_tier IS NULL
  AND stripe_customer_id IS NULL
  AND discount_activated = false
  AND discount_code_pending IS NULL
  AND email = (SELECT u.email FROM auth.users u WHERE u.id = auth.uid())
);
