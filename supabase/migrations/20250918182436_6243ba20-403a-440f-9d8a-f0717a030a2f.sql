-- Hotfix: Remove auth.users references from RLS policies to resolve permission errors
-- and ensure row ownership with developer exception; keep service_role access where needed.

-- PROFILES
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS profiles_block_anonymous ON public.profiles;
DROP POLICY IF EXISTS secure_profiles_enhanced_protection ON public.profiles;
CREATE POLICY profiles_owner_access
ON public.profiles
FOR ALL
USING (
  auth.uid() = user_id OR auth.email() = 'seq.taylor@gmail.com'
)
WITH CHECK (
  auth.uid() = user_id OR auth.email() = 'seq.taylor@gmail.com'
);

-- SUBSCRIBERS
ALTER TABLE public.subscribers ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS subscribers_block_anonymous ON public.subscribers;
DROP POLICY IF EXISTS subscribers_enhanced_security_audit ON public.subscribers;
CREATE POLICY subscribers_owner_access
ON public.subscribers
FOR ALL
USING (
  auth.role() = 'service_role' OR auth.email() = 'seq.taylor@gmail.com' OR auth.uid() = user_id
)
WITH CHECK (
  auth.role() = 'service_role' OR auth.email() = 'seq.taylor@gmail.com' OR auth.uid() = user_id
);

-- CHILD PROFILES
ALTER TABLE public.child_profiles ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS child_profiles_block_anonymous ON public.child_profiles;
DROP POLICY IF EXISTS secure_child_profiles_coppa_compliant ON public.child_profiles;
CREATE POLICY child_profiles_owner_access
ON public.child_profiles
FOR ALL
USING (
  auth.uid() = parent_user_id OR auth.email() = 'seq.taylor@gmail.com'
)
WITH CHECK (
  auth.uid() = parent_user_id OR auth.email() = 'seq.taylor@gmail.com'
);

-- PERSONAL INFO INCIDENTS
ALTER TABLE public.personal_info_incidents ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS incidents_block_anonymous ON public.personal_info_incidents;
DROP POLICY IF EXISTS secure_incidents_enhanced_access ON public.personal_info_incidents;
CREATE POLICY personal_info_incidents_owner_access
ON public.personal_info_incidents
FOR ALL
USING (
  auth.role() = 'service_role' OR auth.uid() = user_id OR auth.email() = 'seq.taylor@gmail.com'
)
WITH CHECK (
  auth.role() = 'service_role' OR auth.uid() = user_id OR auth.email() = 'seq.taylor@gmail.com'
);

-- Note: Other tables (saved_stories, user_preferences, etc.) already enforce row ownership and do not reference auth.users.
-- This migration focuses on removing auth.users references that caused permission errors.
