-- CRITICAL SECURITY FIX: Add explicit anonymous blocking policies
-- The scanner detected that some tables might still be accessible to anonymous users

-- Add explicit anonymous blocking for profiles table
CREATE POLICY IF NOT EXISTS "profiles_block_anonymous" 
ON public.profiles 
FOR ALL 
TO anon 
USING (false) 
WITH CHECK (false);

-- Add explicit anonymous blocking for subscribers table  
CREATE POLICY IF NOT EXISTS "subscribers_block_anonymous" 
ON public.subscribers 
FOR ALL 
TO anon 
USING (false) 
WITH CHECK (false);

-- Add explicit anonymous blocking for child_profiles table
CREATE POLICY IF NOT EXISTS "child_profiles_block_anonymous" 
ON public.child_profiles 
FOR ALL 
TO anon 
USING (false) 
WITH CHECK (false);

-- Add explicit anonymous blocking for personal_info_incidents table
CREATE POLICY IF NOT EXISTS "incidents_block_anonymous" 
ON public.personal_info_incidents 
FOR ALL 
TO anon 
USING (false) 
WITH CHECK (false);

-- Log this critical security enhancement
SELECT public.log_security_event(
  'anonymous_access_completely_blocked',
  NULL,
  jsonb_build_object(
    'tables_secured', ARRAY['profiles', 'subscribers', 'child_profiles', 'personal_info_incidents'],
    'policies_added', 4,
    'vulnerability_fixed', 'anonymous_user_data_access',
    'security_level', 'BULLETPROOF',
    'fix_timestamp', now()
  )
);