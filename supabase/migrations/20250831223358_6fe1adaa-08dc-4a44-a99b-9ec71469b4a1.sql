-- Fix remaining security issues with RLS policies

-- 1. Fix subscribers table - ensure all operations are properly restricted
DROP POLICY IF EXISTS "Service role can access discount codes" ON public.subscribers;
DROP POLICY IF EXISTS "Service role can select discount codes" ON public.subscribers; 
DROP POLICY IF EXISTS "Service role can update discount codes" ON public.subscribers;

-- Add comprehensive RLS policies for subscribers table
CREATE POLICY "Users can only insert their own subscription" 
ON public.subscribers 
FOR INSERT 
WITH CHECK (auth.uid() = user_id AND auth.email() = email);

CREATE POLICY "Users can only update their own subscription" 
ON public.subscribers 
FOR UPDATE 
USING (auth.uid() = user_id) 
WITH CHECK (auth.uid() = user_id);

-- Service role policies for subscribers (for system operations)
CREATE POLICY "Service role can manage all subscriptions" 
ON public.subscribers 
FOR ALL 
USING (auth.role() = 'service_role') 
WITH CHECK (auth.role() = 'service_role');

-- 2. Fix profiles table - ensure DELETE policy exists
CREATE POLICY "Users can delete their own profile" 
ON public.profiles 
FOR DELETE 
USING (auth.uid() = user_id);

-- 3. Strengthen child_profiles RLS policies
DROP POLICY IF EXISTS "Parents can view their child profiles" ON public.child_profiles;
DROP POLICY IF EXISTS "Parents can insert their child profiles" ON public.child_profiles;
DROP POLICY IF EXISTS "Parents can update their child profiles" ON public.child_profiles;
DROP POLICY IF EXISTS "Parents can delete their child profiles" ON public.child_profiles;

-- Recreate comprehensive child_profiles policies with stronger security
CREATE POLICY "Parents can view only their own child profiles" 
ON public.child_profiles 
FOR SELECT 
USING (auth.uid() = parent_user_id AND auth.uid() IS NOT NULL);

CREATE POLICY "Parents can insert child profiles for themselves only" 
ON public.child_profiles 
FOR INSERT 
WITH CHECK (auth.uid() = parent_user_id AND auth.uid() IS NOT NULL);

CREATE POLICY "Parents can update only their own child profiles" 
ON public.child_profiles 
FOR UPDATE 
USING (auth.uid() = parent_user_id AND auth.uid() IS NOT NULL) 
WITH CHECK (auth.uid() = parent_user_id AND auth.uid() IS NOT NULL);

CREATE POLICY "Parents can delete only their own child profiles" 
ON public.child_profiles 
FOR DELETE 
USING (auth.uid() = parent_user_id AND auth.uid() IS NOT NULL);

-- 4. Strengthen personal_info_incidents policies
DROP POLICY IF EXISTS "System can insert incidents" ON public.personal_info_incidents;
DROP POLICY IF EXISTS "System can update incident status" ON public.personal_info_incidents;
DROP POLICY IF EXISTS "Users can view their own incidents" ON public.personal_info_incidents;

-- Recreate with stronger security
CREATE POLICY "Users can insert their own incidents only" 
ON public.personal_info_incidents 
FOR INSERT 
WITH CHECK (auth.uid() = user_id AND auth.uid() IS NOT NULL);

CREATE POLICY "Users can update their own incidents only" 
ON public.personal_info_incidents 
FOR UPDATE 
USING (auth.uid() = user_id AND auth.uid() IS NOT NULL) 
WITH CHECK (auth.uid() = user_id AND auth.uid() IS NOT NULL);

CREATE POLICY "Users can view their own incidents only" 
ON public.personal_info_incidents 
FOR SELECT 
USING (auth.uid() = user_id AND auth.uid() IS NOT NULL);

-- Service role policies for personal_info_incidents (for system operations)
CREATE POLICY "Service role can manage all incidents" 
ON public.personal_info_incidents 
FOR ALL 
USING (auth.role() = 'service_role') 
WITH CHECK (auth.role() = 'service_role');

-- 5. Add data masking function for sensitive subscriber data
CREATE OR REPLACE FUNCTION public.mask_sensitive_subscriber_data()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Log access to sensitive subscriber data
  IF TG_OP = 'SELECT' AND auth.uid() != NEW.user_id THEN
    PERFORM public.log_security_event(
      'unauthorized_subscriber_access_attempt',
      auth.uid(),
      jsonb_build_object(
        'target_user_id', NEW.user_id,
        'access_time', now()
      )
    );
  END IF;
  
  RETURN NEW;
END;
$$;