-- Drop existing policy
DROP POLICY IF EXISTS "subscribers_lean_access" ON public.subscribers;

-- Create a security definer function for validating subscriber access
-- This adds an additional layer of validation beyond just user_id matching
CREATE OR REPLACE FUNCTION public.validate_subscriber_access(target_user_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  requesting_user_id uuid;
  subscriber_email text;
  auth_email text;
BEGIN
  requesting_user_id := auth.uid();
  
  -- Must be authenticated
  IF requesting_user_id IS NULL THEN
    RETURN false;
  END IF;
  
  -- Service role has full access (for edge functions)
  IF auth.role() = 'service_role' THEN
    RETURN true;
  END IF;
  
  -- User must be accessing their own record
  IF requesting_user_id != target_user_id THEN
    -- Log unauthorized access attempt
    INSERT INTO public.security_audit_log (event_type, user_id, details)
    VALUES (
      'unauthorized_subscriber_access_attempt',
      requesting_user_id,
      jsonb_build_object(
        'target_user_id', target_user_id,
        'timestamp', now(),
        'blocked', true
      )
    );
    RETURN false;
  END IF;
  
  -- Additional validation: verify email matches auth.users email
  SELECT email INTO auth_email FROM auth.users WHERE id = requesting_user_id;
  SELECT email INTO subscriber_email FROM public.subscribers WHERE user_id = target_user_id;
  
  -- If subscriber exists, email should match auth email
  IF subscriber_email IS NOT NULL AND auth_email IS NOT NULL THEN
    IF subscriber_email != auth_email THEN
      -- Log email mismatch (potential security issue)
      INSERT INTO public.security_audit_log (event_type, user_id, details)
      VALUES (
        'subscriber_email_mismatch_detected',
        requesting_user_id,
        jsonb_build_object(
          'timestamp', now(),
          'alert_level', 'HIGH'
        )
      );
      RETURN false;
    END IF;
  END IF;
  
  RETURN true;
END;
$$;

-- Create separate, more secure policies for each operation type

-- SELECT: Users can only view their own subscription with validation
CREATE POLICY "subscribers_select_validated"
ON public.subscribers
FOR SELECT
USING (
  public.validate_subscriber_access(user_id)
);

-- INSERT: Users can only create their own subscription record
CREATE POLICY "subscribers_insert_own"
ON public.subscribers
FOR INSERT
WITH CHECK (
  (auth.uid() = user_id) 
  AND (auth.uid() IS NOT NULL)
  AND (user_id IS NOT NULL)
);

-- UPDATE: Users can only update their own subscription (but not user_id or email)
CREATE POLICY "subscribers_update_own"
ON public.subscribers
FOR UPDATE
USING (
  public.validate_subscriber_access(user_id)
)
WITH CHECK (
  (auth.uid() = user_id) 
  AND (auth.uid() IS NOT NULL)
  AND (user_id IS NOT NULL)
);

-- DELETE: Only service role can delete (users cannot delete subscription records)
CREATE POLICY "subscribers_delete_service_only"
ON public.subscribers
FOR DELETE
USING (
  auth.role() = 'service_role'
);

-- Add trigger to prevent identity field changes
DROP TRIGGER IF EXISTS prevent_subscriber_identity_change ON public.subscribers;

CREATE OR REPLACE FUNCTION public.prevent_subscriber_identity_change_trigger()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  -- Prevent user_id changes (except by service role)
  IF OLD.user_id != NEW.user_id AND auth.role() != 'service_role' THEN
    PERFORM public.log_enhanced_security_event(
      'critical_subscriber_user_id_change_blocked',
      OLD.user_id,
      'subscribers',
      'BLOCKED_UPDATE',
      true,
      'CRITICAL',
      jsonb_build_object(
        'old_user_id', OLD.user_id,
        'attempted_new_user_id', NEW.user_id,
        'blocked_at', now()
      )
    );
    RAISE EXCEPTION 'Cannot change user_id in subscription record - security violation';
  END IF;
  
  -- Prevent email changes (except by service role)
  IF OLD.email != NEW.email AND auth.role() != 'service_role' THEN
    PERFORM public.log_enhanced_security_event(
      'subscriber_email_change_blocked',
      OLD.user_id,
      'subscribers',
      'BLOCKED_UPDATE',
      true,
      'HIGH',
      jsonb_build_object(
        'old_email', OLD.email,
        'attempted_new_email', NEW.email,
        'blocked_at', now()
      )
    );
    RAISE EXCEPTION 'Cannot change email in subscription record - contact support';
  END IF;
  
  RETURN NEW;
END;
$$;

CREATE TRIGGER prevent_subscriber_identity_change
BEFORE UPDATE ON public.subscribers
FOR EACH ROW
EXECUTE FUNCTION public.prevent_subscriber_identity_change_trigger();