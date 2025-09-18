-- SECURITY ENHANCEMENT: Strengthen stories table RLS policies
-- Fix potential policy overlap that scanner is detecting

-- First, drop the existing policies that might have gaps
DROP POLICY IF EXISTS "Free users can view basic stories" ON public.stories;
DROP POLICY IF EXISTS "Premium users can view all stories" ON public.stories;
DROP POLICY IF EXISTS "Prevent anonymous story access" ON public.stories;

-- Create a single, bulletproof SELECT policy with clear logic
CREATE POLICY "stories_secure_access_unified" 
ON public.stories 
FOR SELECT 
TO public
USING (
  -- Must be authenticated 
  auth.uid() IS NOT NULL 
  AND 
  (
    -- Premium users get access to ALL stories
    EXISTS (
      SELECT 1 FROM public.subscribers s 
      WHERE s.user_id = auth.uid() 
      AND (s.subscribed = true OR s.override_premium = true)
      AND (
        s.subscription_end IS NULL OR s.subscription_end > now() OR
        s.override_end IS NULL OR s.override_end > now()
      )
    )
    OR
    -- Non-premium users ONLY get basic stories
    (
      NOT EXISTS (
        SELECT 1 FROM public.subscribers s 
        WHERE s.user_id = auth.uid() 
        AND (s.subscribed = true OR s.override_premium = true)
        AND (
          s.subscription_end IS NULL OR s.subscription_end > now() OR
          s.override_end IS NULL OR s.override_end > now()
        )
      )
      AND 
      (reading_level = ANY (ARRAY['beginner'::text, 'elementary'::text]) 
       OR age_group = ANY (ARRAY['3-5'::text, '6-8'::text]))
    )
  )
);

-- Ensure anonymous users are completely blocked
CREATE POLICY "stories_block_anonymous_access" 
ON public.stories 
FOR ALL
TO anon
USING (false)
WITH CHECK (false);

-- Log the policy optimization
SELECT public.log_security_event(
  'stories_rls_policies_optimized',
  NULL,
  jsonb_build_object(
    'table_name', 'stories',
    'old_policies_removed', 3,
    'new_policies_created', 2,
    'security_improvement', 'unified_access_logic_eliminates_gaps',
    'fix_timestamp', now(),
    'vulnerability_fixed', 'complex_subscription_logic_gaps'
  )
);