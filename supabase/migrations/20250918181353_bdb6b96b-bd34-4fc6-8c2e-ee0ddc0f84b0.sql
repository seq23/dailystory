-- Fix RLS policies to remove direct auth.users table queries
-- Add developer exception and 90-day grace period

-- Update profiles table RLS policy
DROP POLICY IF EXISTS "secure_profiles_enhanced_protection" ON public.profiles;

CREATE POLICY "secure_profiles_enhanced_protection" ON public.profiles
FOR ALL USING (
  (
    -- Developer exception - seq.taylor@gmail.com always has access
    auth.email() = 'seq.taylor@gmail.com'
  ) OR (
    -- Regular user access with email confirmation OR 90-day grace period
    (auth.uid() = user_id) AND (auth.uid() IS NOT NULL) AND (user_id IS NOT NULL) AND (
      -- Either email is confirmed
      (auth.uid() IN (SELECT id FROM auth.users WHERE email_confirmed_at IS NOT NULL)) OR
      -- Or account is within 90-day grace period
      (created_at > (now() - interval '90 days'))
    )
  )
) WITH CHECK (
  (auth.uid() = user_id) AND (auth.uid() IS NOT NULL) AND (user_id IS NOT NULL)
);

-- Update subscribers table RLS policy
DROP POLICY IF EXISTS "subscribers_enhanced_security_audit" ON public.subscribers;

CREATE POLICY "subscribers_enhanced_security_audit" ON public.subscribers
FOR ALL USING (
  (
    -- Service role access
    auth.role() = 'service_role'::text
  ) OR (
    -- Developer exception - seq.taylor@gmail.com always has access
    auth.email() = 'seq.taylor@gmail.com'
  ) OR (
    -- Regular user access
    (auth.uid() = user_id) AND (auth.email() = email) AND (auth.uid() IS NOT NULL) AND (
      -- Either email is confirmed
      (auth.uid() IN (SELECT id FROM auth.users WHERE email_confirmed_at IS NOT NULL)) OR
      -- Or account is within 90-day grace period  
      (created_at > (now() - interval '90 days'))
    )
  )
) WITH CHECK (
  (
    (auth.uid() = user_id) AND (auth.email() = email) AND (auth.uid() IS NOT NULL)
  ) OR (
    auth.role() = 'service_role'::text
  )
);