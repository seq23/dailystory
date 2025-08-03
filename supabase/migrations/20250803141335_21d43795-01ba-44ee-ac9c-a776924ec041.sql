-- Create table for persistent anti-repetition content tracking
CREATE TABLE public.user_content_signatures (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_identifier TEXT NOT NULL, -- device fingerprint for guests, user_id for registered
  content_signature TEXT NOT NULL, -- hash of the content
  story_session_number INTEGER NOT NULL DEFAULT 1,
  content_type TEXT NOT NULL DEFAULT 'story', -- 'story', 'page', 'segment'
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.user_content_signatures ENABLE ROW LEVEL SECURITY;

-- Create policies for user access
CREATE POLICY "Users can view their own content signatures" 
ON public.user_content_signatures 
FOR SELECT 
USING (
  (auth.uid()::text = user_identifier) OR 
  (auth.uid() IS NULL AND user_identifier LIKE 'guest_%')
);

CREATE POLICY "Users can create their own content signatures" 
ON public.user_content_signatures 
FOR INSERT 
WITH CHECK (
  (auth.uid()::text = user_identifier) OR 
  (auth.uid() IS NULL AND user_identifier LIKE 'guest_%')
);

CREATE POLICY "Users can update their own content signatures" 
ON public.user_content_signatures 
FOR UPDATE 
USING (
  (auth.uid()::text = user_identifier) OR 
  (auth.uid() IS NULL AND user_identifier LIKE 'guest_%')
);

CREATE POLICY "Users can delete their own content signatures" 
ON public.user_content_signatures 
FOR DELETE 
USING (
  (auth.uid()::text = user_identifier) OR 
  (auth.uid() IS NULL AND user_identifier LIKE 'guest_%')
);

-- Create indexes for performance
CREATE INDEX idx_user_content_signatures_user_identifier ON public.user_content_signatures(user_identifier);
CREATE INDEX idx_user_content_signatures_content_signature ON public.user_content_signatures(content_signature);
CREATE INDEX idx_user_content_signatures_session_number ON public.user_content_signatures(story_session_number);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_user_content_signatures_updated_at
BEFORE UPDATE ON public.user_content_signatures
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();