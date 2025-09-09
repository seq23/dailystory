-- Create visual_details_cache table for persistent clothing and visual details
CREATE TABLE public.visual_details_cache (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id TEXT NOT NULL,
  character_name TEXT NOT NULL,
  detail_type TEXT NOT NULL, -- 'clothing', 'size', 'color', etc.
  detail_key TEXT NOT NULL, -- 'shirt', 'pants', 'hat', etc.
  detail_value TEXT NOT NULL, -- 'red', 'blue dress', 'small', etc.
  page_first_seen INTEGER NOT NULL,
  page_last_seen INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.visual_details_cache ENABLE ROW LEVEL SECURITY;

-- Create policies for service role access (edge functions need this)
CREATE POLICY "Service role can manage visual details cache" 
ON public.visual_details_cache 
FOR ALL 
USING (auth.role() = 'service_role');

-- Create index for efficient lookups
CREATE INDEX idx_visual_details_session_character 
ON public.visual_details_cache (session_id, character_name, detail_type);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_visual_details_cache_updated_at
BEFORE UPDATE ON public.visual_details_cache
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();