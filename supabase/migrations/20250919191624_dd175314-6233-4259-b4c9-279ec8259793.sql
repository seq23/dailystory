-- Create dedicated image generation debug table
CREATE TABLE public.image_generation_debug (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id TEXT NOT NULL,
  user_id UUID,
  page_number INTEGER DEFAULT 1,
  tier TEXT NOT NULL,
  status TEXT NOT NULL, -- 'attempting', 'success', 'failure'
  edge_function TEXT NOT NULL, -- 'runware-generate-image', 'runware-template-ab', etc.
  positive_prompt TEXT,
  negative_prompt TEXT,
  api_response JSONB DEFAULT '{}'::jsonb,
  image_url TEXT,
  success BOOLEAN DEFAULT false,
  failure_reason TEXT,
  processing_time_ms INTEGER,
  template_complexity TEXT,
  context JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.image_generation_debug ENABLE ROW LEVEL SECURITY;

-- Users can only see their own image generation logs
CREATE POLICY "Users can view their own image generation logs"
ON public.image_generation_debug
FOR SELECT
USING (
  (auth.uid() = user_id) OR 
  (auth.role() = 'service_role'::text)
);

-- Service role can insert logs (edge functions)
CREATE POLICY "Service role can insert image generation logs"
ON public.image_generation_debug
FOR INSERT
WITH CHECK (auth.role() = 'service_role'::text);

-- Service role can update logs
CREATE POLICY "Service role can update image generation logs"
ON public.image_generation_debug
FOR UPDATE
USING (auth.role() = 'service_role'::text);

-- Create indexes for performance
CREATE INDEX idx_image_generation_debug_session_id ON public.image_generation_debug(session_id);
CREATE INDEX idx_image_generation_debug_user_id ON public.image_generation_debug(user_id);
CREATE INDEX idx_image_generation_debug_created_at ON public.image_generation_debug(created_at);

-- Function to cleanup old image generation debug logs (keep last 6 per session, delete older than 7 days)
CREATE OR REPLACE FUNCTION public.cleanup_image_generation_debug_logs()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  -- Delete records older than 7 days
  DELETE FROM public.image_generation_debug 
  WHERE created_at < (now() - interval '7 days');
  
  -- Keep only last 6 records per session (delete older ones)
  DELETE FROM public.image_generation_debug
  WHERE id IN (
    SELECT id
    FROM (
      SELECT id,
             ROW_NUMBER() OVER (PARTITION BY session_id ORDER BY created_at DESC) as rn
      FROM public.image_generation_debug
    ) ranked
    WHERE rn > 6
  );
  
  -- Log the cleanup operation
  PERFORM public.log_security_event(
    'image_generation_debug_cleanup',
    NULL,
    jsonb_build_object(
      'cleaned_at', now(),
      'retention_policy', 'last_6_per_session_and_7_days'
    )
  );
END;
$function$;