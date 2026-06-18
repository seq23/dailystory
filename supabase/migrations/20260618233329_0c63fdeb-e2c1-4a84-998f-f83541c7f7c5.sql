DROP POLICY IF EXISTS stories_secure_access_unified ON public.stories;

CREATE POLICY stories_secure_access_unified ON public.stories
FOR SELECT
USING (
  (auth.uid() IS NOT NULL) AND (
    EXISTS (
      SELECT 1 FROM public.subscribers s
      WHERE s.user_id = auth.uid()
        AND (
          (s.subscribed = true AND (s.subscription_end IS NULL OR s.subscription_end > now()))
          OR (s.override_premium = true AND (s.override_end IS NULL OR s.override_end > now()))
        )
    )
    OR (
      NOT EXISTS (
        SELECT 1 FROM public.subscribers s
        WHERE s.user_id = auth.uid()
          AND (
            (s.subscribed = true AND (s.subscription_end IS NULL OR s.subscription_end > now()))
            OR (s.override_premium = true AND (s.override_end IS NULL OR s.override_end > now()))
          )
      )
      AND reading_level = ANY (ARRAY['beginner'::text, 'elementary'::text])
    )
  )
);