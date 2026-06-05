DO $$
DECLARE
  t text;
  auth_keep text[] := ARRAY[
    'consent_records','profiles','subscribers','user_preferences',
    'image_generation_debug','feedback','game_sessions','quiz_attempts',
    'child_profiles','reading_sessions','saved_stories','vocabulary_progress',
    'analytics_sessions'
  ];
  anon_keep text[] := ARRAY['analytics_sessions'];
BEGIN
  FOR t IN
    SELECT c.relname
    FROM pg_class c
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE n.nspname = 'public' AND c.relkind IN ('r','v','m','f')
  LOOP
    EXECUTE format('REVOKE SELECT ON public.%I FROM PUBLIC, anon, authenticated;', t);
    EXECUTE format('GRANT SELECT ON public.%I TO service_role;', t);
    IF t = ANY(auth_keep) THEN
      EXECUTE format('GRANT SELECT ON public.%I TO authenticated;', t);
    END IF;
    IF t = ANY(anon_keep) THEN
      EXECUTE format('GRANT SELECT ON public.%I TO anon;', t);
    END IF;
  END LOOP;
END $$;