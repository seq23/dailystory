-- Create character consistency cache table to replace memory-based cache
CREATE TABLE public.character_consistency_cache (
  session_id TEXT NOT NULL,
  character_key TEXT NOT NULL,
  character_data JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  PRIMARY KEY (session_id, character_key)
);

-- Add index for performance
CREATE INDEX idx_character_cache_session ON public.character_consistency_cache(session_id);

-- Enable Row Level Security
ALTER TABLE public.character_consistency_cache ENABLE ROW LEVEL SECURITY;

-- Create policies for character consistency cache
CREATE POLICY "Service role can manage character cache" 
ON public.character_consistency_cache 
FOR ALL 
USING (auth.role() = 'service_role'::text);