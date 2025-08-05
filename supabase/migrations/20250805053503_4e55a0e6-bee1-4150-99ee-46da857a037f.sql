-- Fix Supabase Security Settings for Production Launch

-- 1. Configure secure OTP expiry (reduce from default to recommended 5 minutes)
UPDATE auth.config 
SET value = '300' 
WHERE parameter = 'otp_expiry';

-- 2. Enable leaked password protection
UPDATE auth.config 
SET value = 'true' 
WHERE parameter = 'enable_leaked_password_protection';

-- 3. Set strong password requirements
UPDATE auth.config 
SET value = '8' 
WHERE parameter = 'password_min_length';

-- 4. Enable additional security measures
UPDATE auth.config 
SET value = 'true' 
WHERE parameter = 'enable_captcha';

-- 5. Set secure session timeout (24 hours)
UPDATE auth.config 
SET value = '86400' 
WHERE parameter = 'session_timeout';

-- 6. Create security monitoring table for template system
CREATE TABLE IF NOT EXISTS public.security_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  event_type TEXT NOT NULL,
  user_id UUID,
  ip_address INET,
  user_agent TEXT,
  metadata JSONB,
  severity TEXT CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on security logs
ALTER TABLE public.security_logs ENABLE ROW LEVEL SECURITY;

-- Only admins can view security logs
CREATE POLICY "Admin only access to security logs" 
ON public.security_logs 
FOR ALL 
USING (false); -- No access by default

-- Create performance metrics table
CREATE TABLE IF NOT EXISTS public.performance_metrics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  metric_name TEXT NOT NULL,
  metric_value NUMERIC NOT NULL,
  difficulty_level TEXT,
  user_id UUID,
  session_id TEXT,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on performance metrics
ALTER TABLE public.performance_metrics ENABLE ROW LEVEL SECURITY;

-- Users can only see their own metrics
CREATE POLICY "Users can view their own metrics" 
ON public.performance_metrics 
FOR SELECT 
USING (auth.uid() = user_id);

-- System can insert metrics
CREATE POLICY "System can insert metrics" 
ON public.performance_metrics 
FOR INSERT 
WITH CHECK (true);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_performance_metrics_user_id ON public.performance_metrics(user_id);
CREATE INDEX IF NOT EXISTS idx_performance_metrics_created_at ON public.performance_metrics(created_at);
CREATE INDEX IF NOT EXISTS idx_security_logs_created_at ON public.security_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_security_logs_severity ON public.security_logs(severity);

-- Create function to log security events
CREATE OR REPLACE FUNCTION public.log_security_event(
  p_event_type TEXT,
  p_user_id UUID DEFAULT NULL,
  p_ip_address INET DEFAULT NULL,
  p_user_agent TEXT DEFAULT NULL,
  p_metadata JSONB DEFAULT NULL,
  p_severity TEXT DEFAULT 'low'
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $$
DECLARE
  v_log_id UUID;
BEGIN
  INSERT INTO public.security_logs (
    event_type,
    user_id,
    ip_address,
    user_agent,
    metadata,
    severity
  ) VALUES (
    p_event_type,
    p_user_id,
    p_ip_address,
    p_user_agent,
    p_metadata,
    p_severity
  ) RETURNING id INTO v_log_id;
  
  RETURN v_log_id;
END;
$$;

-- Create function to record performance metrics
CREATE OR REPLACE FUNCTION public.record_performance_metric(
  p_metric_name TEXT,
  p_metric_value NUMERIC,
  p_difficulty_level TEXT DEFAULT NULL,
  p_user_id UUID DEFAULT NULL,
  p_session_id TEXT DEFAULT NULL,
  p_metadata JSONB DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $$
DECLARE
  v_metric_id UUID;
BEGIN
  INSERT INTO public.performance_metrics (
    metric_name,
    metric_value,
    difficulty_level,
    user_id,
    session_id,
    metadata
  ) VALUES (
    p_metric_name,
    p_metric_value,
    p_difficulty_level,
    p_user_id,
    p_session_id,
    p_metadata
  ) RETURNING id INTO v_metric_id;
  
  RETURN v_metric_id;
END;
$$;