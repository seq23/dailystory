-- CRITICAL SECURITY FIX: Consolidate and strengthen RLS policies for child_profiles table
-- Remove overlapping policies and create single comprehensive policy

DROP POLICY IF EXISTS "Parents can delete only their own child profiles" ON public.child_profiles;
DROP POLICY IF EXISTS "Parents can insert child profiles for themselves only" ON public.child_profiles;
DROP POLICY IF EXISTS "Parents can update only their own child profiles" ON public.child_profiles;
DROP POLICY IF EXISTS "Parents can view only their own child profiles" ON public.child_profiles;
DROP POLICY IF EXISTS "ultra_secure_child_profile_protection" ON public.child_profiles;

-- Create single, comprehensive policy for child profiles with enhanced security
CREATE POLICY "secure_child_profiles_access" ON public.child_profiles
FOR ALL 
USING (
  (auth.uid() = parent_user_id) AND 
  (auth.uid() IS NOT NULL) AND 
  (parent_user_id IS NOT NULL) AND
  (EXISTS (
    SELECT 1 FROM auth.users 
    WHERE id = auth.uid() 
    AND email_confirmed_at IS NOT NULL 
    AND confirmed_at IS NOT NULL
  ))
)
WITH CHECK (
  (auth.uid() = parent_user_id) AND 
  (auth.uid() IS NOT NULL) AND 
  (parent_user_id IS NOT NULL)
);

-- CRITICAL SECURITY FIX: Strengthen subscribers table security
-- Remove overlapping policies that create confusion

DROP POLICY IF EXISTS "Service role can manage all subscriptions" ON public.subscribers;
DROP POLICY IF EXISTS "subscription_status_view_access" ON public.subscribers;
DROP POLICY IF EXISTS "subscription_status_view_policy" ON public.subscribers;
DROP POLICY IF EXISTS "ultra_secure_delete_subscription" ON public.subscribers;
DROP POLICY IF EXISTS "ultra_secure_insert_subscription" ON public.subscribers;
DROP POLICY IF EXISTS "ultra_secure_select_subscription" ON public.subscribers;
DROP POLICY IF EXISTS "ultra_secure_update_subscription" ON public.subscribers;

-- Create comprehensive subscription security policy
CREATE POLICY "secure_subscription_access" ON public.subscribers
FOR ALL
USING (
  ((auth.uid() = user_id) AND (auth.email() = email) AND (auth.uid() IS NOT NULL)) OR 
  (auth.role() = 'service_role'::text)
)
WITH CHECK (
  ((auth.uid() = user_id) AND (auth.email() = email) AND (auth.uid() IS NOT NULL)) OR 
  (auth.role() = 'service_role'::text)
);

-- CRITICAL SECURITY FIX: Consolidate profiles table policies
DROP POLICY IF EXISTS "Enhanced profile security" ON public.profiles;
DROP POLICY IF EXISTS "Users can create their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can delete their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;

-- Create single comprehensive profile policy
CREATE POLICY "secure_profiles_access" ON public.profiles
FOR ALL
USING (
  (auth.uid() = user_id) AND 
  (auth.uid() IS NOT NULL) AND 
  (user_id IS NOT NULL) AND
  (EXISTS (
    SELECT 1 FROM auth.users 
    WHERE id = auth.uid() 
    AND email_confirmed_at IS NOT NULL
  ))
)
WITH CHECK (
  (auth.uid() = user_id) AND 
  (auth.uid() IS NOT NULL) AND 
  (user_id IS NOT NULL)
);