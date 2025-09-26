-- Create cost tracking tables for real analytics
CREATE TABLE public.cost_tracking (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id TEXT NOT NULL,
  user_id UUID,
  timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  input_tokens INTEGER NOT NULL DEFAULT 0,
  output_tokens INTEGER NOT NULL DEFAULT 0,
  cost DECIMAL(10, 6) NOT NULL DEFAULT 0,
  model_used TEXT NOT NULL,
  operation_type TEXT NOT NULL DEFAULT 'story_generation', -- story_generation, image_generation, audio_generation
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create analytics sessions table for user activity tracking
CREATE TABLE public.analytics_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id TEXT NOT NULL UNIQUE,
  user_id UUID,
  is_premium BOOLEAN NOT NULL DEFAULT false,
  started_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  ended_at TIMESTAMP WITH TIME ZONE,
  total_cost DECIMAL(10, 6) NOT NULL DEFAULT 0,
  stories_generated INTEGER NOT NULL DEFAULT 0,
  images_generated INTEGER NOT NULL DEFAULT 0,
  pages_viewed INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on both tables
ALTER TABLE public.cost_tracking ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analytics_sessions ENABLE ROW LEVEL SECURITY;

-- Create policies for cost_tracking
CREATE POLICY "Users can view their own cost tracking" 
ON public.cost_tracking 
FOR SELECT 
USING (auth.uid() = user_id OR auth.role() = 'service_role');

CREATE POLICY "Service role can manage cost tracking" 
ON public.cost_tracking 
FOR ALL 
USING (auth.role() = 'service_role');

-- Create policies for analytics_sessions
CREATE POLICY "Users can view their own analytics sessions" 
ON public.analytics_sessions 
FOR SELECT 
USING (auth.uid() = user_id OR auth.role() = 'service_role');

CREATE POLICY "Service role can manage analytics sessions" 
ON public.analytics_sessions 
FOR ALL 
USING (auth.role() = 'service_role');

-- Create indexes for better performance
CREATE INDEX idx_cost_tracking_session_id ON public.cost_tracking(session_id);
CREATE INDEX idx_cost_tracking_timestamp ON public.cost_tracking(timestamp);
CREATE INDEX idx_cost_tracking_user_id ON public.cost_tracking(user_id);
CREATE INDEX idx_analytics_sessions_session_id ON public.analytics_sessions(session_id);
CREATE INDEX idx_analytics_sessions_user_id ON public.analytics_sessions(user_id);

-- Create trigger for updated_at timestamp
CREATE TRIGGER update_analytics_sessions_updated_at
BEFORE UPDATE ON public.analytics_sessions
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();