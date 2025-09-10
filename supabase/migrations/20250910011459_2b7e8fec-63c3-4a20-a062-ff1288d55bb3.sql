-- Security Fix: Ensure subscription_status_view inherits proper security from underlying table
-- Views can't have RLS policies directly, but they inherit security from underlying tables

-- First, let's check the view definition and recreate it with security_invoker=on if needed
DROP VIEW IF EXISTS public.subscription_status_view;

-- Recreate the view with security_invoker=on to ensure it respects RLS from underlying tables
CREATE OR REPLACE VIEW public.subscription_status_view 
WITH (security_invoker=on) AS
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

-- Ensure the underlying subscribers table has proper RLS policies (should already exist)
-- Add a specific policy for the view access if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'subscribers' 
    AND policyname = 'subscription_status_view_access'
  ) THEN
    CREATE POLICY "subscription_status_view_access" 
    ON public.subscribers
    FOR SELECT
    USING (
      (auth.uid() = user_id AND auth.uid() IS NOT NULL) 
      OR 
      (auth.role() = 'service_role'::text)
    );
  END IF;
END $$;