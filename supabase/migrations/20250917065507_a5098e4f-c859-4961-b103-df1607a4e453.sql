-- MODERATE SECURITY FIX: Consolidate remaining security monitoring policies
-- Address moderate security findings from scan

-- Fix debug log exposure issues
DROP POLICY IF EXISTS "Block access to system debug logs" ON public.ai_prompt_debug_log;
DROP POLICY IF EXISTS "Service role can manage debug logs" ON public.ai_prompt_debug_log;
DROP POLICY IF EXISTS "Users can only view their own debug logs" ON public.ai_prompt_debug_log;

-- Create single comprehensive debug log policy
CREATE POLICY "secure_debug_log_access" ON public.ai_prompt_debug_log
FOR ALL
USING (
  -- Only service role for system operations, users for their own logs
  (auth.role() = 'service_role'::text) OR 
  ((auth.uid() = user_id) AND (auth.uid() IS NOT NULL) AND (user_id IS NOT NULL))
)
WITH CHECK (
  (auth.role() = 'service_role'::text) OR 
  ((auth.uid() = user_id) AND (auth.uid() IS NOT NULL) AND (user_id IS NOT NULL))
);

-- Fix personal info incidents exposure
DROP POLICY IF EXISTS "Deny access to unauthenticated users" ON public.personal_info_incidents;
DROP POLICY IF EXISTS "Restrict access to own incidents only" ON public.personal_info_incidents;
DROP POLICY IF EXISTS "Service role can manage all incidents" ON public.personal_info_incidents;
DROP POLICY IF EXISTS "Users can delete their own incidents" ON public.personal_info_incidents;
DROP POLICY IF EXISTS "Users can insert their own incidents only" ON public.personal_info_incidents;
DROP POLICY IF EXISTS "Users can update their own incidents only" ON public.personal_info_incidents;
DROP POLICY IF EXISTS "Users can view their own incidents only" ON public.personal_info_incidents;
DROP POLICY IF EXISTS "ultra_secure_incidents_access" ON public.personal_info_incidents;

-- Create single comprehensive personal info incidents policy
CREATE POLICY "secure_incidents_access" ON public.personal_info_incidents
FOR ALL
USING (
  -- Only affected user or service role can access
  ((auth.uid() = user_id) AND (auth.uid() IS NOT NULL)) OR 
  (auth.role() = 'service_role'::text)
)
WITH CHECK (
  ((auth.uid() = user_id) AND (auth.uid() IS NOT NULL)) OR 
  (auth.role() = 'service_role'::text)
);

-- Ensure security monitoring is service role only
-- (This table already has correct single policy, just verify)
-- CREATE POLICY "service_role_security_monitoring" ON public.security_monitoring already exists