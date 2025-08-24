-- Fix RLS policies for security vulnerabilities

-- Fix stories table - should not be fully public
DROP POLICY IF EXISTS "Stories are viewable by everyone" ON public.stories;

-- Create proper RLS policies for stories
CREATE POLICY "Authenticated users can view stories"
ON public.stories
FOR SELECT
TO authenticated
USING (true);

-- Fix feedback table - require authentication for submissions
DROP POLICY IF EXISTS "Anyone can submit feedback" ON public.feedback;

CREATE POLICY "Authenticated users can submit feedback"
ON public.feedback
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Fix security_audit_log policies - they were broken
DROP POLICY IF EXISTS "System can insert audit logs" ON public.security_audit_log;
DROP POLICY IF EXISTS "System can view audit logs" ON public.security_audit_log;

CREATE POLICY "Service role can manage audit logs"
ON public.security_audit_log
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- Fix rate_limits policies
DROP POLICY IF EXISTS "System manages rate limits" ON public.rate_limits;

CREATE POLICY "Service role can manage rate limits"
ON public.rate_limits
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- Add indexes for performance optimization
CREATE INDEX IF NOT EXISTS idx_character_cache_session_id 
ON public.character_consistency_cache(session_id);

CREATE INDEX IF NOT EXISTS idx_character_cache_character_key 
ON public.character_consistency_cache(character_key);

CREATE INDEX IF NOT EXISTS idx_quiz_attempts_user_id 
ON public.quiz_attempts(user_id);

CREATE INDEX IF NOT EXISTS idx_feedback_user_id 
ON public.feedback(user_id);

CREATE INDEX IF NOT EXISTS idx_reading_sessions_user_id 
ON public.reading_sessions(user_id);