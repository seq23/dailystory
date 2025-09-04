-- Create ai_prompt_debug_log table for persistent AI debugging data
CREATE TABLE public.ai_prompt_debug_log (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id TEXT NOT NULL,
  user_id UUID NULL,
  system_prompt TEXT NOT NULL,
  user_prompt TEXT NOT NULL,
  bundle_data JSONB NOT NULL DEFAULT '{}'::jsonb,
  api_response JSONB NOT NULL DEFAULT '{}'::jsonb,
  model TEXT NOT NULL DEFAULT 'gpt-4o-mini',
  token_limit INTEGER NOT NULL DEFAULT 4000,
  page_number INTEGER NOT NULL DEFAULT 1,
  attempt INTEGER NOT NULL DEFAULT 1,
  success BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.ai_prompt_debug_log ENABLE ROW LEVEL SECURITY;

-- Create policies for debug log access
CREATE POLICY "Service role can manage debug logs" 
ON public.ai_prompt_debug_log 
FOR ALL 
USING (auth.role() = 'service_role');

CREATE POLICY "Users can view debug logs for their sessions" 
ON public.ai_prompt_debug_log 
FOR SELECT 
USING (
  auth.uid() IS NOT NULL AND (
    user_id = auth.uid() OR 
    user_id IS NULL
  )
);

-- Create index for efficient session-based queries
CREATE INDEX idx_ai_prompt_debug_log_session_id ON public.ai_prompt_debug_log(session_id);
CREATE INDEX idx_ai_prompt_debug_log_created_at ON public.ai_prompt_debug_log(created_at DESC);