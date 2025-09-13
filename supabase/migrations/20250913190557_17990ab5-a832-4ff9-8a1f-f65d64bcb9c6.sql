-- Add restrictive policy to personal_info_incidents table to prevent unauthorized access
-- This ensures that only authenticated users can access their own incident records

-- Add a restrictive policy that denies access to unauthenticated users
CREATE POLICY "Deny access to unauthenticated users" 
ON public.personal_info_incidents 
AS RESTRICTIVE 
FOR ALL 
TO public 
USING (auth.uid() IS NOT NULL);

-- Add additional restrictive policy to ensure users can only access their own data
CREATE POLICY "Restrict access to own incidents only" 
ON public.personal_info_incidents 
AS RESTRICTIVE 
FOR ALL 
TO public 
USING (auth.uid() = user_id OR auth.role() = 'service_role');

-- Log the security enhancement
SELECT public.log_security_event(
  'personal_info_incidents_security_enhanced',
  NULL,
  jsonb_build_object(
    'action', 'added_restrictive_policies',
    'table', 'personal_info_incidents',
    'timestamp', now(),
    'policies_added', ARRAY['deny_unauthenticated', 'restrict_to_own_data']
  )
);