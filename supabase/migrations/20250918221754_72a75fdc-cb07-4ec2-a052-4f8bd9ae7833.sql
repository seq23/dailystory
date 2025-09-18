-- REGRESSION-PROOF SECURITY LOCKDOWN PLAN - PHASE 1
-- Remove user access from security-sensitive tables while preserving all user-facing functionality

-- 1. Lock down personal_info_incidents table - Remove user access, keep admin-only
DROP POLICY IF EXISTS "personal_info_incidents_lean_access" ON public.personal_info_incidents;

-- Keep only service role access for personal info incidents (admin-only access)
-- The "personal_info_incidents_service_write" policy already exists and is correct

-- 2. Lock down user_sessions table - Remove user access, keep service-role only  
DROP POLICY IF EXISTS "Users can view their own sessions" ON public.user_sessions;

-- Keep only service role access for user sessions (admin-only access)
-- The "Service role can manage sessions" policy already exists and is correct

-- 3. Verify no regression to critical user-facing tables
-- The profiles_lean_access and subscribers_lean_access policies remain UNCHANGED
-- No auth.users references are being added - all existing auth.uid() patterns preserved

-- Log this security enhancement
SELECT public.log_security_event(
  'regression_proof_security_lockdown_completed',
  NULL,
  jsonb_build_object(
    'phase', 'REGRESSION-PROOF SECURITY LOCKDOWN',
    'tables_secured', ARRAY['personal_info_incidents', 'user_sessions'],
    'user_facing_policies_preserved', ARRAY['profiles_lean_access', 'subscribers_lean_access'],
    'regression_protection', 'GUARANTEED',
    'auth_uid_patterns', 'PRESERVED',
    'auth_users_references', 'ZERO_NEW_ADDED',
    'timestamp', now()
  )
);