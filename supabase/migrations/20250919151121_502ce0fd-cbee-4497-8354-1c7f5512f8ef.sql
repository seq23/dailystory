-- Fix the enhanced_security_audit trigger to handle child_profiles table correctly
CREATE OR REPLACE FUNCTION public.enhanced_security_audit()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  user_ref_id uuid;
BEGIN
  -- Schema-aware user ID extraction based on table structure
  user_ref_id := CASE TG_TABLE_NAME
    WHEN 'child_profiles' THEN COALESCE(NEW.parent_user_id, OLD.parent_user_id, auth.uid())
    ELSE COALESCE(NEW.user_id, OLD.user_id, auth.uid())
  END;

  -- Enhanced logging for sensitive table access
  PERFORM public.log_enhanced_security_event(
    CASE 
      WHEN TG_OP = 'INSERT' THEN 'sensitive_data_created'
      WHEN TG_OP = 'UPDATE' THEN 'sensitive_data_modified'
      WHEN TG_OP = 'DELETE' THEN 'sensitive_data_deleted'
      ELSE 'sensitive_data_accessed'
    END,
    user_ref_id,
    TG_TABLE_NAME,
    TG_OP,
    true, -- sensitive_data = true
    CASE 
      WHEN TG_TABLE_NAME IN ('subscribers', 'child_profiles') THEN 'CRITICAL'
      WHEN TG_TABLE_NAME = 'personal_info_incidents' THEN 'HIGH'
      ELSE 'MEDIUM'
    END,
    jsonb_build_object(
      'table', TG_TABLE_NAME,
      'operation', TG_OP,
      'timestamp', now(),
      'auth_role', auth.role(),
      'record_id', COALESCE(NEW.id, OLD.id),
      'user_field_used', CASE TG_TABLE_NAME WHEN 'child_profiles' THEN 'parent_user_id' ELSE 'user_id' END
    )
  );
  
  -- Table-specific security checks
  IF TG_TABLE_NAME = 'subscribers' AND TG_OP = 'UPDATE' THEN
    -- Prevent unauthorized subscription modifications
    IF COALESCE(OLD.user_id, '') != COALESCE(NEW.user_id, '') THEN
      PERFORM public.log_enhanced_security_event(
        'critical_subscription_tampering_blocked',
        OLD.user_id,
        'subscribers',
        'UNAUTHORIZED_MODIFICATION',
        true,
        'CRITICAL',
        jsonb_build_object(
          'old_user_id', OLD.user_id,
          'attempted_new_user_id', NEW.user_id,
          'blocked_by_system', true
        )
      );
      RAISE EXCEPTION 'Unauthorized subscription modification blocked - security violation';
    END IF;
  ELSIF TG_TABLE_NAME = 'child_profiles' AND TG_OP = 'UPDATE' THEN
    -- Prevent unauthorized child profile owner changes
    IF COALESCE(OLD.parent_user_id::text, '') != COALESCE(NEW.parent_user_id::text, '') THEN
      PERFORM public.log_enhanced_security_event(
        'critical_child_profile_tampering_blocked',
        OLD.parent_user_id,
        'child_profiles',
        'UNAUTHORIZED_MODIFICATION',
        true,
        'CRITICAL',
        jsonb_build_object(
          'old_parent_user_id', OLD.parent_user_id,
          'attempted_new_parent_user_id', NEW.parent_user_id,
          'blocked_by_system', true
        )
      );
      RAISE EXCEPTION 'Unauthorized child profile modification blocked - security violation';
    END IF;
  END IF;
  
  RETURN COALESCE(NEW, OLD);
END;
$function$;