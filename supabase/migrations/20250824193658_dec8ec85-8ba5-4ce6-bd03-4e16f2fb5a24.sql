-- Fix Stories table RLS policy - require authentication for story access
DROP POLICY IF EXISTS "Authenticated users can view stories" ON public.stories;
DROP POLICY IF EXISTS "Stories are viewable by everyone" ON public.stories;

CREATE POLICY "Authenticated users can view stories" 
ON public.stories 
FOR SELECT 
USING (auth.uid() IS NOT NULL);

-- Fix Feedback table RLS policy - require authentication for submissions  
DROP POLICY IF EXISTS "Authenticated users can submit feedback" ON public.feedback;
DROP POLICY IF EXISTS "Anyone can submit feedback" ON public.feedback;

CREATE POLICY "Authenticated users can submit feedback" 
ON public.feedback 
FOR INSERT 
WITH CHECK (auth.uid() IS NOT NULL AND auth.uid() = user_id);

-- Fix Security Audit Log RLS policies - allow service role access
DROP POLICY IF EXISTS "Service role can manage audit logs" ON public.security_audit_log;

CREATE POLICY "Service role can manage audit logs" 
ON public.security_audit_log 
FOR ALL 
USING (auth.role() = 'service_role'::text)
WITH CHECK (auth.role() = 'service_role'::text);

-- Fix Rate Limits RLS policies - allow service role access
DROP POLICY IF EXISTS "Service role can manage rate limits" ON public.rate_limits;

CREATE POLICY "Service role can manage rate limits" 
ON public.rate_limits 
FOR ALL 
USING (auth.role() = 'service_role'::text)
WITH CHECK (auth.role() = 'service_role'::text);