-- Create tts-cache storage bucket for persistent audio caching
INSERT INTO storage.buckets (id, name, public)
VALUES ('tts-cache', 'tts-cache', false)
ON CONFLICT (id) DO NOTHING;

-- Allow service_role full access (edge functions use service role)
CREATE POLICY "Service role full access to tts-cache"
ON storage.objects
FOR ALL
TO service_role
USING (bucket_id = 'tts-cache')
WITH CHECK (bucket_id = 'tts-cache');

-- Allow authenticated users to read cached audio
CREATE POLICY "Authenticated users can read tts-cache"
ON storage.objects
FOR SELECT
TO authenticated
USING (bucket_id = 'tts-cache');

-- Allow anon users to read cached audio (guests need TTS too)
CREATE POLICY "Anon users can read tts-cache"
ON storage.objects
FOR SELECT
TO anon
USING (bucket_id = 'tts-cache');