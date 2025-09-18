-- EMERGENCY LEAN SECURITY OVERHAUL - PHASE 1
-- Fix 4 critical data exposures with lean RLS policies

-- 1. Fix subscribers table (CRITICAL: Exposes customer emails + payment data)
DROP POLICY IF EXISTS "subscribers_owner_access" ON public.subscribers;
CREATE POLICY "subscribers_lean_access" ON public.subscribers
FOR ALL USING (
  (auth.uid() = user_id) AND (auth.uid() IS NOT NULL)
);

-- 2. Fix child_profiles table (CRITICAL: Exposes children's data)  
DROP POLICY IF EXISTS "child_profiles_owner_access" ON public.child_profiles;
CREATE POLICY "child_profiles_lean_access" ON public.child_profiles
FOR ALL USING (
  (auth.uid() = parent_user_id) AND (auth.uid() IS NOT NULL)
);

-- 3. Fix profiles table (CRITICAL: Exposes user personal data)
DROP POLICY IF EXISTS "profiles_owner_access" ON public.profiles; 
CREATE POLICY "profiles_lean_access" ON public.profiles
FOR ALL USING (
  (auth.uid() = user_id) AND (auth.uid() IS NOT NULL)
);

-- 4. Fix personal_info_incidents table (CRITICAL: Exposes security details)
DROP POLICY IF EXISTS "personal_info_incidents_owner_access" ON public.personal_info_incidents;
CREATE POLICY "personal_info_incidents_lean_access" ON public.personal_info_incidents
FOR SELECT USING (
  (auth.role() = 'service_role'::text) OR (auth.uid() = user_id)
);
CREATE POLICY "personal_info_incidents_service_write" ON public.personal_info_incidents  
FOR INSERT WITH CHECK (auth.role() = 'service_role'::text);

-- 5. Add lean input sanitization trigger to prevent UUID errors
CREATE OR REPLACE FUNCTION public.sanitize_uuid_inputs()
RETURNS trigger AS $$
BEGIN
  -- Clean user_id if it's not a valid UUID
  IF NEW.user_id IS NOT NULL AND NOT (NEW.user_id::text ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$') THEN
    NEW.user_id = NULL;
  END IF;
  
  -- Clean parent_user_id if exists and invalid
  IF TG_TABLE_NAME = 'child_profiles' AND NEW.parent_user_id IS NOT NULL 
     AND NOT (NEW.parent_user_id::text ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$') THEN
    NEW.parent_user_id = NULL;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Apply sanitization to critical tables
DROP TRIGGER IF EXISTS sanitize_uuids_trigger ON public.subscribers;
CREATE TRIGGER sanitize_uuids_trigger 
  BEFORE INSERT OR UPDATE ON public.subscribers
  FOR EACH ROW EXECUTE FUNCTION public.sanitize_uuid_inputs();

DROP TRIGGER IF EXISTS sanitize_uuids_trigger ON public.child_profiles;  
CREATE TRIGGER sanitize_uuids_trigger
  BEFORE INSERT OR UPDATE ON public.child_profiles
  FOR EACH ROW EXECUTE FUNCTION public.sanitize_uuid_inputs();

DROP TRIGGER IF EXISTS sanitize_uuids_trigger ON public.profiles;
CREATE TRIGGER sanitize_uuids_trigger
  BEFORE INSERT OR UPDATE ON public.profiles 
  FOR EACH ROW EXECUTE FUNCTION public.sanitize_uuid_inputs();

-- Log the emergency fix
SELECT public.log_security_event(
  'emergency_lean_security_overhaul_phase1_completed',
  NULL,
  jsonb_build_object(
    'fixed_vulnerabilities', 4,
    'tables_secured', ARRAY['subscribers', 'child_profiles', 'profiles', 'personal_info_incidents'],
    'uuid_sanitization_added', true,
    'old_complex_policies_removed', true,
    'new_lean_policies_applied', true,
    'fix_timestamp', now()
  )
);