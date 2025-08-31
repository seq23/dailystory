-- Security Enhancement: Add Missing DELETE Policies and Data Protection

-- 1. Add DELETE policy for subscribers table
CREATE POLICY "Users can delete their own subscription"
ON public.subscribers
FOR DELETE
USING (auth.uid() = user_id);

-- 2. Add DELETE policy for personal_info_incidents table
CREATE POLICY "Users can delete their own incidents"
ON public.personal_info_incidents
FOR DELETE  
USING (auth.uid() = user_id);

-- 3. Add DELETE policy for user_preferences table
CREATE POLICY "Users can delete their own preferences"
ON public.user_preferences
FOR DELETE
USING (auth.uid() = user_id);

-- 4. Create audit logging function for sensitive deletions
CREATE OR REPLACE FUNCTION public.log_sensitive_deletion()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Log deletion of sensitive data
  PERFORM public.log_security_event(
    'sensitive_data_deleted',
    COALESCE(OLD.user_id, auth.uid()),
    jsonb_build_object(
      'table_name', TG_TABLE_NAME,
      'deleted_at', now(),
      'record_id', COALESCE(OLD.id, OLD.user_id)
    )
  );
  
  RETURN OLD;
END;
$$;

-- 5. Add deletion audit triggers for sensitive tables
CREATE TRIGGER audit_subscribers_deletion
  BEFORE DELETE ON public.subscribers
  FOR EACH ROW
  EXECUTE FUNCTION public.log_sensitive_deletion();

CREATE TRIGGER audit_incidents_deletion
  BEFORE DELETE ON public.personal_info_incidents
  FOR EACH ROW
  EXECUTE FUNCTION public.log_sensitive_deletion();

CREATE TRIGGER audit_preferences_deletion
  BEFORE DELETE ON public.user_preferences
  FOR EACH ROW
  EXECUTE FUNCTION public.log_sensitive_deletion();

-- 6. Create function to automatically purge old incident records (COPPA compliance)
CREATE OR REPLACE FUNCTION public.purge_old_incidents()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Delete incident records older than 2 years (COPPA retention guideline)
  DELETE FROM public.personal_info_incidents
  WHERE created_at < (now() - interval '2 years');
  
  -- Log the purge operation
  PERFORM public.log_security_event(
    'automated_data_purge',
    NULL,
    jsonb_build_object(
      'table_name', 'personal_info_incidents',
      'purge_date', now(),
      'retention_period', '2 years'
    )
  );
END;
$$;

-- 7. Enhanced RLS policy for child_profiles to ensure stricter access
DROP POLICY IF EXISTS "Parents can view their child profiles" ON public.child_profiles;
CREATE POLICY "Parents can view their child profiles"
ON public.child_profiles
FOR SELECT
USING (
  auth.uid() = parent_user_id AND
  auth.uid() IS NOT NULL
);

-- 8. Add data minimization trigger for personal_info_incidents
CREATE OR REPLACE FUNCTION public.minimize_incident_data()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Limit detected_content field to prevent excessive data collection
  IF LENGTH(NEW.detected_content) > 500 THEN
    NEW.detected_content = LEFT(NEW.detected_content, 500) || '... [truncated for privacy]';
  END IF;
  
  RETURN NEW;
END;
$$;

CREATE TRIGGER minimize_incident_data_trigger
  BEFORE INSERT OR UPDATE ON public.personal_info_incidents
  FOR EACH ROW
  EXECUTE FUNCTION public.minimize_incident_data();