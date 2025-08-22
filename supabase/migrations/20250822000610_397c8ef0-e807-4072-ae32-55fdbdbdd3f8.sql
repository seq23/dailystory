-- Create personal_info_incidents table for COPPA compliance audit trail
CREATE TABLE public.personal_info_incidents (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  child_profile_id UUID NULL,
  violation_type TEXT NOT NULL,
  detected_content TEXT NOT NULL,
  context_field TEXT NOT NULL,
  ip_address INET NULL,
  user_agent TEXT NULL,
  email_notification_sent BOOLEAN NOT NULL DEFAULT false,
  email_notification_status TEXT NULL,
  parent_notified_at TIMESTAMP WITH TIME ZONE NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.personal_info_incidents ENABLE ROW LEVEL SECURITY;

-- Create policies for COPPA incidents
CREATE POLICY "Users can view their own incidents" 
ON public.personal_info_incidents 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "System can insert incidents" 
ON public.personal_info_incidents 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "System can update incident status" 
ON public.personal_info_incidents 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_personal_info_incidents_updated_at
BEFORE UPDATE ON public.personal_info_incidents
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Add index for performance
CREATE INDEX idx_personal_info_incidents_user_id ON public.personal_info_incidents(user_id);
CREATE INDEX idx_personal_info_incidents_created_at ON public.personal_info_incidents(created_at);

-- Add parent_email column to child_profiles if not exists
ALTER TABLE public.child_profiles 
ADD COLUMN IF NOT EXISTS parent_email TEXT;