-- Phase 3: Security Hardening - Fixed Consolidated RLS Policy Updates
-- Fix security findings by hardening underlying tables

-- 1. CRITICAL: Fix subscription_status_view by securing underlying subscribers table
-- The view inherits security from the subscribers table via security_invoker=on
-- Ensure subscribers table has proper RLS (already exists but enhance it)

-- 2. CRITICAL: Strengthen child_profiles RLS for COPPA compliance  
-- Replace existing policy with enhanced protection
DROP POLICY IF EXISTS "secure_child_profiles_access" ON public.child_profiles;

CREATE POLICY "secure_child_profiles_coppa_compliant"
ON public.child_profiles
FOR ALL
USING (
  -- Only authenticated and verified parents can access
  (auth.uid() = parent_user_id) AND 
  (auth.uid() IS NOT NULL) AND 
  (parent_user_id IS NOT NULL) AND
  -- Additional verification: user must be confirmed
  (EXISTS (
    SELECT 1 FROM auth.users 
    WHERE users.id = auth.uid() 
    AND users.email_confirmed_at IS NOT NULL 
    AND users.confirmed_at IS NOT NULL
    AND users.email IS NOT NULL
  ))
)
WITH CHECK (
  -- Same restrictions for inserts/updates  
  (auth.uid() = parent_user_id) AND 
  (auth.uid() IS NOT NULL) AND 
  (parent_user_id IS NOT NULL)
);

-- 3. MODERATE: Strengthen profiles table RLS for child data protection
-- Replace existing policy with enhanced protection
DROP POLICY IF EXISTS "secure_profiles_access" ON public.profiles;

CREATE POLICY "secure_profiles_enhanced_protection" 
ON public.profiles
FOR ALL
USING (
  -- Enhanced authentication requirements
  (auth.uid() = user_id) AND 
  (auth.uid() IS NOT NULL) AND 
  (user_id IS NOT NULL) AND
  -- Must be confirmed and verified user
  (EXISTS (
    SELECT 1 FROM auth.users 
    WHERE users.id = auth.uid() 
    AND users.email_confirmed_at IS NOT NULL
    AND users.confirmed_at IS NOT NULL
    AND users.email IS NOT NULL
  ))
)
WITH CHECK (
  (auth.uid() = user_id) AND 
  (auth.uid() IS NOT NULL) AND 
  (user_id IS NOT NULL)
);

-- 4. MODERATE: Enhance subscribers table security (this secures subscription_status_view)
-- Replace existing policy with enhanced verification 
DROP POLICY IF EXISTS "secure_subscription_access" ON public.subscribers;

CREATE POLICY "subscribers_enhanced_security_audit"
ON public.subscribers  
FOR ALL
USING (
  -- Enhanced security with additional email verification
  (((auth.uid() = user_id) AND (auth.email() = email) AND (auth.uid() IS NOT NULL)) OR 
   (auth.role() = 'service_role'::text)) AND
  -- Additional verification for critical subscription data
  (EXISTS (
    SELECT 1 FROM auth.users 
    WHERE users.id = auth.uid() 
    AND users.email_confirmed_at IS NOT NULL
  ) OR auth.role() = 'service_role'::text)
)
WITH CHECK (
  (((auth.uid() = user_id) AND (auth.email() = email) AND (auth.uid() IS NOT NULL)) OR 
   (auth.role() = 'service_role'::text))
);

-- 5. MODERATE: Strengthen user_preferences security
-- Replace all existing policies with consolidated secure access
DROP POLICY IF EXISTS "Users can view their own preferences" ON public.user_preferences;
DROP POLICY IF EXISTS "Users can create their own preferences" ON public.user_preferences;
DROP POLICY IF EXISTS "Users can update their own preferences" ON public.user_preferences;
DROP POLICY IF EXISTS "Users can delete their own preferences" ON public.user_preferences;

CREATE POLICY "user_preferences_secure_access"
ON public.user_preferences
FOR ALL
USING (
  (auth.uid() = user_id) AND 
  (auth.uid() IS NOT NULL) AND 
  (user_id IS NOT NULL) AND
  -- Enhanced verification for preferences containing child data
  (EXISTS (
    SELECT 1 FROM auth.users 
    WHERE users.id = auth.uid() 
    AND users.email_confirmed_at IS NOT NULL
    AND users.confirmed_at IS NOT NULL
  ))
)
WITH CHECK (
  (auth.uid() = user_id) AND 
  (auth.uid() IS NOT NULL) AND 
  (user_id IS NOT NULL)
);

-- 6. MODERATE: Enhance personal_info_incidents security
-- Ensure incidents table has proper protection
DROP POLICY IF EXISTS "secure_incidents_access" ON public.personal_info_incidents;

CREATE POLICY "secure_incidents_enhanced_access"
ON public.personal_info_incidents
FOR ALL
USING (
  -- Only incident owner or service role can access
  (((auth.uid() = user_id) AND (auth.uid() IS NOT NULL)) OR 
   (auth.role() = 'service_role'::text)) AND
  -- Additional verification for incident data
  (EXISTS (
    SELECT 1 FROM auth.users 
    WHERE users.id = auth.uid() 
    AND users.email_confirmed_at IS NOT NULL
  ) OR auth.role() = 'service_role'::text)
)
WITH CHECK (
  (((auth.uid() = user_id) AND (auth.uid() IS NOT NULL)) OR 
   (auth.role() = 'service_role'::text))
);