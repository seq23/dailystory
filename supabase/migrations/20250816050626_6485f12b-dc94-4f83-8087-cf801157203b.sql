-- Create discount_codes table
CREATE TABLE public.discount_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT UNIQUE NOT NULL,
  description TEXT NOT NULL,
  duration_days INTEGER NOT NULL DEFAULT 90,
  max_uses INTEGER DEFAULT NULL, -- NULL means unlimited
  current_uses INTEGER NOT NULL DEFAULT 0,
  active BOOLEAN NOT NULL DEFAULT true,
  created_by TEXT DEFAULT 'system',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.discount_codes ENABLE ROW LEVEL SECURITY;

-- Policy to allow reading active codes (for validation)
CREATE POLICY "Anyone can view active discount codes" 
ON public.discount_codes 
FOR SELECT 
USING (active = true);

-- Policy to allow system updates (for usage tracking)
CREATE POLICY "System can update discount codes" 
ON public.discount_codes 
FOR UPDATE 
USING (true);

-- Add discount tracking fields to subscribers table
ALTER TABLE public.subscribers 
ADD COLUMN discount_code_pending TEXT,
ADD COLUMN discount_activated_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN discount_activated BOOLEAN DEFAULT false;

-- Insert the SEQUOIA90 code
INSERT INTO public.discount_codes (code, description, duration_days, max_uses, active, created_by)
VALUES ('SEQUOIA90', '90 days free premium access', 90, NULL, true, 'admin');

-- Create trigger for updated_at
CREATE TRIGGER update_discount_codes_updated_at
BEFORE UPDATE ON public.discount_codes
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();