-- Fix: stories_secure_access_unified has broken OR logic that lets expired subs keep access
-- The override_end IS NULL OR condition always passes for non-overridden users
DROP POLICY IF EXISTS "stories_secure_access_unified" ON public.stories;

CREATE POLICY "stories_secure_access_unified" ON public.stories
FOR SELECT TO public
USING (
  auth.uid() IS NOT NULL 
  AND (
    -- Premium access: active subscription OR active override
    EXISTS (
      SELECT 1 FROM subscribers s
      WHERE s.user_id = auth.uid()
      AND (
        -- Valid subscription (not expired)
        (s.subscribed = true AND (s.subscription_end IS NULL OR s.subscription_end > now()))
        OR
        -- Valid override (not expired)  
        (s.override_premium = true AND (s.override_end IS NULL OR s.override_end > now()))
      )
    )
    OR
    -- Free tier: limited content access
    (
      NOT EXISTS (
        SELECT 1 FROM subscribers s
        WHERE s.user_id = auth.uid()
        AND (
          (s.subscribed = true AND (s.subscription_end IS NULL OR s.subscription_end > now()))
          OR
          (s.override_premium = true AND (s.override_end IS NULL OR s.override_end > now()))
        )
      )
      AND (reading_level = ANY (ARRAY['beginner', 'elementary']))
      OR (age_group = ANY (ARRAY['3-5', '6-8']))
    )
  )
);