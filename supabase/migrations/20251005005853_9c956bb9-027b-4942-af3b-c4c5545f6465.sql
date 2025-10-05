-- ============================================================================
-- CRITICAL SECURITY FIX: Protect Children's Personal Information
-- ============================================================================
-- 
-- Issue: The 'profiles' table contains sensitive child data (names, DOB, 
-- interests, hobbies, etc.) and needs explicit protection against unauthorized access.
--
-- Fix: Replace the generic "ALL" policy with explicit, separate policies for
-- each operation type (SELECT, INSERT, UPDATE, DELETE) to ensure maximum
-- security clarity and defense-in-depth protection.
--
-- ============================================================================

-- Step 1: Drop the existing generic ALL policy
DROP POLICY IF EXISTS "profiles_lean_access" ON public.profiles;

-- Step 2: Create explicit SELECT policy - users can only read their own profile
CREATE POLICY "profiles_select_own" 
ON public.profiles 
FOR SELECT 
USING (
  auth.uid() = user_id 
  AND auth.uid() IS NOT NULL 
  AND user_id IS NOT NULL
);

-- Step 3: Create explicit INSERT policy - users can only create their own profile
CREATE POLICY "profiles_insert_own" 
ON public.profiles 
FOR INSERT 
WITH CHECK (
  auth.uid() = user_id 
  AND auth.uid() IS NOT NULL 
  AND user_id IS NOT NULL
);

-- Step 4: Create explicit UPDATE policy - users can only update their own profile
CREATE POLICY "profiles_update_own" 
ON public.profiles 
FOR UPDATE 
USING (
  auth.uid() = user_id 
  AND auth.uid() IS NOT NULL 
  AND user_id IS NOT NULL
)
WITH CHECK (
  auth.uid() = user_id 
  AND auth.uid() IS NOT NULL 
  AND user_id IS NOT NULL
);

-- Step 5: Create explicit DELETE policy - users can only delete their own profile
CREATE POLICY "profiles_delete_own" 
ON public.profiles 
FOR DELETE 
USING (
  auth.uid() = user_id 
  AND auth.uid() IS NOT NULL 
  AND user_id IS NOT NULL
);

-- Step 6: Log the security enhancement
SELECT public.log_security_event(
  'profiles_table_security_hardened',
  NULL,
  jsonb_build_object(
    'action', 'replaced_generic_all_policy_with_explicit_policies',
    'policies_created', ARRAY[
      'profiles_select_own',
      'profiles_insert_own', 
      'profiles_update_own',
      'profiles_delete_own'
    ],
    'protection_level', 'MAXIMUM',
    'child_data_protected', true,
    'anonymous_access_blocked', true,
    'timestamp', now()
  )
);

-- ============================================================================
-- VERIFICATION NOTES:
-- - Anonymous users: CANNOT read any profile data (SELECT blocked)
-- - Authenticated users: Can ONLY access their own profile data
-- - Cross-user access: COMPLETELY blocked
-- - Child safety: MAXIMUM protection against data harvesting
-- ============================================================================