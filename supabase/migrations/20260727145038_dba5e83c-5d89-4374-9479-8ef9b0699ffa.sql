DROP POLICY IF EXISTS "voice_overrides_read_auth" ON public.voice_overrides;
REVOKE SELECT ON public.voice_overrides FROM authenticated;

CREATE POLICY "voice_overrides_service_role_all"
  ON public.voice_overrides
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);