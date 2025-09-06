-- Fix Critical Security Issues: Story Access & Debug Log Exposure

-- 1. Update stories table RLS to check subscription status
DROP POLICY IF EXISTS "Authenticated users can view stories" ON public.stories;

-- Create subscription-aware story access policy
CREATE POLICY "Premium users can view all stories" 
ON public.stories 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.subscribers s 
    WHERE s.user_id = auth.uid() 
    AND (s.subscribed = true OR s.override_premium = true)
    AND (s.subscription_end IS NULL OR s.subscription_end > now() OR s.override_end IS NULL OR s.override_end > now())
  )
);

-- Create free tier story access policy (limited content)
CREATE POLICY "Free users can view basic stories" 
ON public.stories 
FOR SELECT 
USING (
  auth.uid() IS NOT NULL 
  AND (reading_level IN ('beginner', 'elementary') OR age_group IN ('3-5', '6-8'))
  AND NOT EXISTS (
    SELECT 1 FROM public.subscribers s 
    WHERE s.user_id = auth.uid() 
    AND (s.subscribed = true OR s.override_premium = true)
    AND (s.subscription_end IS NULL OR s.subscription_end > now() OR s.override_end IS NULL OR s.override_end > now())
  )
);

-- 2. Secure ai_prompt_debug_log table - prevent viewing logs without user_id
DROP POLICY IF EXISTS "Users can view debug logs for their sessions" ON public.ai_prompt_debug_log;

-- Create strict user-only debug log access
CREATE POLICY "Users can only view their own debug logs" 
ON public.ai_prompt_debug_log 
FOR SELECT 
USING (
  auth.uid() IS NOT NULL 
  AND user_id = auth.uid()
);

-- Prevent access to system debug logs (user_id IS NULL)
CREATE POLICY "Block access to system debug logs" 
ON public.ai_prompt_debug_log 
FOR SELECT 
USING (user_id IS NOT NULL);

-- 3. Add data retention for debug logs (function to clean old logs)
CREATE OR REPLACE FUNCTION public.cleanup_old_debug_logs()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Delete debug logs older than 30 days
  DELETE FROM public.ai_prompt_debug_log 
  WHERE created_at < (now() - interval '30 days');
  
  -- Log the cleanup operation
  PERFORM public.log_security_event(
    'debug_log_cleanup',
    NULL,
    jsonb_build_object(
      'cleaned_at', now(),
      'retention_period', '30 days'
    )
  );
END;
$$;

-- 4. Add security audit function for story access
CREATE OR REPLACE FUNCTION public.log_story_access()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Log story access attempts
  PERFORM public.log_security_event(
    'story_access',
    auth.uid(),
    jsonb_build_object(
      'story_id', NEW.id,
      'story_title', NEW.title,
      'reading_level', NEW.reading_level,
      'access_time', now()
    )
  );
  
  RETURN NEW;
END;
$$;