-- Create character_traits table for Phase 1 character consistency
CREATE TABLE public.character_traits (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  character_name TEXT NOT NULL,
  visual_traits JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, character_name)
);

-- Create visual_details table for Phase 2 visual detail tracker  
CREATE TABLE public.visual_details (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  session_id TEXT NOT NULL,
  character_name TEXT NOT NULL,
  image_url TEXT NOT NULL,
  visual_elements JSONB NOT NULL DEFAULT '{}',
  generated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  page_number INTEGER NOT NULL DEFAULT 1
);

-- Enable RLS on both tables
ALTER TABLE public.character_traits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.visual_details ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for character_traits
CREATE POLICY "Users can manage their own character traits"
ON public.character_traits
FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Create RLS policies for visual_details  
CREATE POLICY "Users can manage their own visual details"
ON public.visual_details
FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Create indexes for performance
CREATE INDEX idx_character_traits_user_character ON public.character_traits(user_id, character_name);
CREATE INDEX idx_visual_details_user_character ON public.visual_details(user_id, character_name);
CREATE INDEX idx_visual_details_session ON public.visual_details(session_id);

-- Create update trigger for character_traits
CREATE TRIGGER update_character_traits_updated_at
BEFORE UPDATE ON public.character_traits
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();