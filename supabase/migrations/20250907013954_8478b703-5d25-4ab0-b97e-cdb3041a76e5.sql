-- Enhanced RLS Policies for Critical Security Tables

-- Add encryption trigger for sensitive subscriber data
CREATE OR REPLACE FUNCTION encrypt_sensitive_subscriber_data()
RETURNS TRIGGER AS $$
BEGIN
  -- Log access to sensitive subscriber data for audit
  PERFORM public.log_security_event(
    'subscriber_data_access',
    NEW.user_id,
    jsonb_build_object(
      'stripe_customer_id', CASE WHEN NEW.stripe_customer_id IS NOT NULL THEN '[ENCRYPTED]' ELSE NULL END,
      'access_time', now(),
      'operation', TG_OP
    )
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public';

-- Add trigger for subscriber data access logging
DROP TRIGGER IF EXISTS log_subscriber_access ON public.subscribers;
CREATE TRIGGER log_subscriber_access
  BEFORE INSERT OR UPDATE ON public.subscribers
  FOR EACH ROW
  EXECUTE FUNCTION encrypt_sensitive_subscriber_data();

-- Enhanced child profile security
CREATE OR REPLACE FUNCTION validate_child_profile_security()
RETURNS TRIGGER AS $$
BEGIN
  -- Additional validation for child profiles
  IF NEW.birth_year IS NOT NULL AND NEW.birth_year > EXTRACT(YEAR FROM NOW()) THEN
    RAISE EXCEPTION 'Invalid birth year for child profile';
  END IF;
  
  -- Log child profile access
  PERFORM public.log_security_event(
    'child_profile_access',
    NEW.parent_user_id,
    jsonb_build_object(
      'child_profile_id', NEW.id,
      'operation', TG_OP,
      'access_time', now()
    )
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public';

-- Add trigger for child profile security
DROP TRIGGER IF EXISTS validate_child_security ON public.child_profiles;
CREATE TRIGGER validate_child_security
  BEFORE INSERT OR UPDATE ON public.child_profiles
  FOR EACH ROW
  EXECUTE FUNCTION validate_child_profile_security();

-- Enhanced security audit log with automatic cleanup
CREATE OR REPLACE FUNCTION cleanup_security_audit_log()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Delete audit logs older than 90 days to prevent unbounded growth
  DELETE FROM public.security_audit_log 
  WHERE created_at < (now() - interval '90 days');
  
  -- Log the cleanup operation
  PERFORM public.log_security_event(
    'audit_log_cleanup',
    NULL,
    jsonb_build_object(
      'cleaned_at', now(),
      'retention_period', '90 days'
    )
  );
END;
$$;

-- Enhanced RLS policy for personal info incidents - more restrictive
DROP POLICY IF EXISTS "Enhanced users can view their own incidents only" ON public.personal_info_incidents;
CREATE POLICY "Enhanced users can view their own incidents only" 
ON public.personal_info_incidents 
FOR SELECT 
USING (
  auth.uid() = user_id AND 
  auth.uid() IS NOT NULL AND
  -- Additional security: only show incidents from last 2 years
  created_at > (now() - interval '2 years')
);

-- Add rate limiting table for server-side enforcement
CREATE TABLE IF NOT EXISTS public.api_rate_limits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  identifier TEXT NOT NULL,
  endpoint TEXT NOT NULL,
  request_count INTEGER NOT NULL DEFAULT 1,
  window_start TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(identifier, endpoint, window_start)
);

-- Enable RLS on rate limits table
ALTER TABLE public.api_rate_limits ENABLE ROW LEVEL SECURITY;

-- Service role can manage rate limits
CREATE POLICY "Service role can manage rate limits" 
ON public.api_rate_limits 
FOR ALL 
USING (auth.role() = 'service_role');

-- Add session security table for tracking active sessions
CREATE TABLE IF NOT EXISTS public.user_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  session_token_hash TEXT NOT NULL,
  ip_address INET,
  user_agent TEXT,
  last_activity TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT (now() + interval '24 hours'),
  is_active BOOLEAN NOT NULL DEFAULT true
);

-- Enable RLS on sessions table
ALTER TABLE public.user_sessions ENABLE ROW LEVEL SECURITY;

-- Users can only see their own sessions
CREATE POLICY "Users can view their own sessions" 
ON public.user_sessions 
FOR SELECT 
USING (auth.uid() = user_id);

-- Service role can manage all sessions
CREATE POLICY "Service role can manage sessions" 
ON public.user_sessions 
FOR ALL 
USING (auth.role() = 'service_role');

-- Function to cleanup expired sessions
CREATE OR REPLACE FUNCTION cleanup_expired_sessions()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Mark expired sessions as inactive
  UPDATE public.user_sessions 
  SET is_active = false 
  WHERE expires_at < now() AND is_active = true;
  
  -- Delete sessions older than 30 days
  DELETE FROM public.user_sessions 
  WHERE created_at < (now() - interval '30 days');
  
  -- Log cleanup
  PERFORM public.log_security_event(
    'session_cleanup',
    NULL,
    jsonb_build_object(
      'cleaned_at', now(),
      'retention_period', '30 days'
    )
  );
END;
$$;