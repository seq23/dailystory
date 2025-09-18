-- Emergency lean fix for user_preferences RLS policy
-- Drop the over-engineered policy with problematic auth.users subquery
DROP POLICY IF EXISTS "user_preferences_secure_access" ON public.user_preferences;

-- Create lean, reliable policy with simple user isolation
CREATE POLICY "user_preferences_lean_access" ON public.user_preferences
FOR ALL USING (
  (auth.uid() = user_id) AND 
  (auth.uid() IS NOT NULL) AND 
  (user_id IS NOT NULL)
);

-- Log the fix for audit trail
SELECT public.log_security_event(
  'emergency_rls_policy_simplified',
  NULL,
  jsonb_build_object(
    'table_name', 'user_preferences',
    'old_policy', 'user_preferences_secure_access',
    'new_policy', 'user_preferences_lean_access',
    'reason', 'eliminate_403_error_spam_from_auth_users_subquery',
    'affected_errors', '3000+',
    'fix_timestamp', now()
  )
);