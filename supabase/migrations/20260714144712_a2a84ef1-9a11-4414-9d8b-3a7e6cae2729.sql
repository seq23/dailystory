CREATE TABLE public.voice_overrides (
  language_code text PRIMARY KEY,
  voice_id      text NOT NULL,
  display_name  text NOT NULL,
  accent_note   text,
  model_id      text NOT NULL DEFAULT 'eleven_turbo_v2_5',
  updated_by    uuid,
  created_at    timestamptz NOT NULL DEFAULT now(),
  updated_at    timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.voice_overrides TO authenticated;
GRANT ALL    ON public.voice_overrides TO service_role;

ALTER TABLE public.voice_overrides ENABLE ROW LEVEL SECURITY;

CREATE POLICY "voice_overrides_read_auth"
  ON public.voice_overrides
  FOR SELECT
  TO authenticated
  USING (true);

CREATE TRIGGER update_voice_overrides_updated_at
  BEFORE UPDATE ON public.voice_overrides
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

INSERT INTO public.voice_overrides (language_code, voice_id, display_name, accent_note, model_id)
VALUES ('en', 'XB0fDUnXU5powFXDhCwa', 'Charlotte (English default)', 'Neutral English narrator', 'eleven_turbo_v2_5')
ON CONFLICT (language_code) DO NOTHING;