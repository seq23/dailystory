-- Safely refactor enhanced_security_audit to avoid direct NEW/OLD column references
CREATE OR REPLACE FUNCTION public.enhanced_security_audit()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  new_data jsonb := to_jsonb(NEW);
  old_data jsonb := to_jsonb(OLD);
  user_ref_id uuid;
  used_field text;
  rec_id uuid;
  risk_level text;
BEGIN
  -- Derive a user reference ID without touching non-existent columns
  user_ref_id := COALESCE(
    NULLIF(new_data->>'parent_user_id', '')::uuid,
    NULLIF(old_data->>'parent_user_id', '')::uuid,
    NULLIF(new_data->>'user_id', '')::uuid,
    NULLIF(old_data->>'user_id', '')::uuid,
    auth.uid()
  );

  used_field := CASE 
    WHEN (new_data ? 'parent_user_id') OR (old_data ? 'parent_user_id') THEN 'parent_user_id'
    WHEN (new_data ? 'user_id') OR (old_data ? 'user_id') THEN 'user_id'
    ELSE 'unknown'
  END;

  rec_id := COALESCE(
    NULLIF(new_data->>'id', '')::uuid,
    NULLIF(old_data->>'id', '')::uuid
  );

  risk_level := CASE 
    WHEN TG_TABLE_NAME IN ('subscribers', 'child_profiles') THEN 'CRITICAL'
    WHEN TG_TABLE_NAME = 'personal_info_incidents' THEN 'HIGH'
    ELSE 'MEDIUM'
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
    risk_level,
    jsonb_build_object(
      'table', TG_TABLE_NAME,
      'operation', TG_OP,
      'timestamp', now(),
      'auth_role', auth.role(),
      'record_id', rec_id,
      'user_field_used', used_field
    )
  );
  
  -- Table-specific security checks using JSON-safe access
  IF TG_TABLE_NAME = 'subscribers' AND TG_OP = 'UPDATE' THEN
    -- Prevent unauthorized subscription modifications
    IF COALESCE(old_data->>'user_id','') <> COALESCE(new_data->>'user_id','') THEN
      PERFORM public.log_enhanced_security_event(
        'critical_subscription_tampering_blocked',
        NULLIF(old_data->>'user_id','')::uuid,
        'subscribers',
        'UNAUTHORIZED_MODIFICATION',
        true,
        'CRITICAL',
        jsonb_build_object(
          'old_user_id', old_data->>'user_id',
          'attempted_new_user_id', new_data->>'user_id',
          'blocked_by_system', true
        )
      );
      RAISE EXCEPTION 'Unauthorized subscription modification blocked - security violation';
    END IF;
  ELSIF TG_TABLE_NAME = 'child_profiles' AND TG_OP = 'UPDATE' THEN
    -- Prevent unauthorized child profile owner changes
    IF COALESCE(old_data->>'parent_user_id','') <> COALESCE(new_data->>'parent_user_id','') THEN
      PERFORM public.log_enhanced_security_event(
        'critical_child_profile_tampering_blocked',
        NULLIF(old_data->>'parent_user_id','')::uuid,
        'child_profiles',
        'UNAUTHORIZED_MODIFICATION',
        true,
        'CRITICAL',
        jsonb_build_object(
          'old_parent_user_id', old_data->>'parent_user_id',
          'attempted_new_parent_user_id', new_data->>'parent_user_id',
          'blocked_by_system', true
        )
      );
      RAISE EXCEPTION 'Unauthorized child profile modification blocked - security violation';
    END IF;
  END IF;
  
  RETURN COALESCE(NEW, OLD);
END;
$function$;