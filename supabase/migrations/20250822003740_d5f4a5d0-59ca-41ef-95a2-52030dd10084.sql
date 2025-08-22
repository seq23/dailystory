-- Fix critical security issues identified in security scan

-- 1. CRITICAL: Fix discount codes policy - restrict to service role only
DROP POLICY IF EXISTS "System can update discount codes" ON public.discount_codes;

-- Create secure policy for discount codes - only service role can update
CREATE POLICY "Service role can update discount codes" 
ON public.discount_codes 
FOR UPDATE 
USING (auth.role() = 'service_role'::text);

-- Add policy for service role to select discount codes (needed for validation)
CREATE POLICY "Service role can select discount codes" 
ON public.discount_codes 
FOR SELECT 
USING (auth.role() = 'service_role'::text);

-- 2. Enhance subscribers table security - ensure only users can access their own data
-- The existing policies look correct but let's add explicit SELECT restriction
DROP POLICY IF EXISTS "select_own_subscription_strict" ON public.subscribers;
CREATE POLICY "Users can only view their own subscription" 
ON public.subscribers 
FOR SELECT 
USING (auth.uid() = user_id);

-- 3. Add audit logging function for security events
CREATE OR REPLACE FUNCTION public.log_security_event(
  event_type text,
  user_id_param uuid DEFAULT auth.uid(),
  details jsonb DEFAULT '{}'::jsonb
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO public.security_audit_log (
    event_type,
    user_id,
    details,
    ip_address,
    user_agent
  ) VALUES (
    event_type,
    user_id_param,
    details,
    inet_client_addr(),
    current_setting('request.headers', true)::jsonb->>'user-agent'
  );
END;
$$;

-- 4. Add rate limiting table for enhanced security
CREATE TABLE IF NOT EXISTS public.rate_limits (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  identifier text NOT NULL,
  action text NOT NULL,
  count integer NOT NULL DEFAULT 1,
  window_start timestamp with time zone NOT NULL DEFAULT now(),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(identifier, action, window_start)
);

-- Enable RLS on rate limits table
ALTER TABLE public.rate_limits ENABLE ROW LEVEL SECURITY;

-- Rate limits are system-managed only
CREATE POLICY "System manages rate limits" 
ON public.rate_limits 
FOR ALL 
USING (false);

-- 5. Remove parent_email from child_profiles to enhance privacy
-- This is sensitive data that shouldn't be stored in this table
ALTER TABLE public.child_profiles DROP COLUMN IF EXISTS parent_email;