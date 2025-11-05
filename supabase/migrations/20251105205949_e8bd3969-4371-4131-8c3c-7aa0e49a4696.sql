-- Add SELECT policy for personal_info_incidents table
-- Defense-in-depth: Allows service_role full access and users to see only their own incidents
-- COPPA Compliance: Parents can view violation incidents for their account

CREATE POLICY "personal_info_incidents_user_select" 
ON public.personal_info_incidents
FOR SELECT 
USING (
  -- Service role can see everything (for edge functions and admin monitoring)
  (auth.role() = 'service_role'::text) 
  OR 
  -- Authenticated users can only see their own incidents
  ((auth.uid() = user_id) AND (auth.uid() IS NOT NULL))
);

-- Add helpful comment for database documentation
COMMENT ON POLICY "personal_info_incidents_user_select" ON public.personal_info_incidents 
IS 'Allows parents to view COPPA violation incidents for their own account. Service role has full access for edge functions. Added for defense-in-depth security.';