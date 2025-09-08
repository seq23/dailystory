-- ============================================================================
-- COMPREHENSIVE SECURITY ENHANCEMENT MIGRATION
-- Addresses remaining security vulnerabilities and warnings
-- ============================================================================

-- ============================================================================
-- 1. CHILDREN'S PERSONAL INFORMATION PROTECTION
-- ============================================================================

-- Enhanced child profiles security with stricter validation
CREATE OR REPLACE FUNCTION public.validate_child_data()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  -- Age validation: child must be between 3-17 years old
  IF NEW.birth_year IS NOT NULL THEN
    IF NEW.birth_year > EXTRACT(YEAR FROM NOW()) - 3 OR 
       NEW.birth_year < EXTRACT(YEAR FROM NOW()) - 17 THEN
      RAISE EXCEPTION 'Invalid birth year for child profile: must be between 3-17 years old';
    END IF;
  END IF;
  
  -- Data minimization: limit text field lengths
  IF LENGTH(COALESCE(NEW.hobbies, '')) > 200 THEN
    NEW.hobbies = LEFT(NEW.hobbies, 200);
  END IF;
  
  -- Log child profile access for COPPA compliance
  PERFORM public.log_security_event(
    'child_profile_modified',
    NEW.parent_user_id,
    jsonb_build_object(
      'child_profile_id', NEW.id,
      'operation', TG_OP,
      'birth_year_changed', OLD.birth_year IS DISTINCT FROM NEW.birth_year,
      'timestamp', now()
    )
  );
  
  RETURN NEW;
END;
$$;

-- Create trigger for child profile validation
DROP TRIGGER IF EXISTS validate_child_data_trigger ON public.child_profiles;
CREATE TRIGGER validate_child_data_trigger
  BEFORE INSERT OR UPDATE ON public.child_profiles
  FOR EACH ROW EXECUTE FUNCTION public.validate_child_data();

-- ============================================================================
-- 2. USER PROFILE DATA SECURITY ENHANCEMENT
-- ============================================================================

-- Enhanced profiles security with data anonymization support
CREATE OR REPLACE FUNCTION public.secure_profile_access()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  -- Log profile access for audit trail
  PERFORM public.log_security_event(
    'profile_accessed',
    COALESCE(NEW.user_id, OLD.user_id),
    jsonb_build_object(
      'operation', TG_OP,
      'has_dob', COALESCE(NEW.date_of_birth IS NOT NULL, OLD.date_of_birth IS NOT NULL),
      'has_interests', COALESCE(array_length(NEW.interests, 1) > 0, array_length(OLD.interests, 1) > 0),
      'timestamp', now()
    )
  );
  
  -- Data minimization for text fields
  IF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN
    IF LENGTH(COALESCE(NEW.special_request, '')) > 500 THEN
      NEW.special_request = LEFT(NEW.special_request, 500) || '... [truncated]';
    END IF;
    
    IF LENGTH(COALESCE(NEW.hobbies, '')) > 300 THEN
      NEW.hobbies = LEFT(NEW.hobbies, 300) || '... [truncated]';
    END IF;
  END IF;
  
  RETURN COALESCE(NEW, OLD);
END;
$$;

-- Create trigger for profile security
DROP TRIGGER IF EXISTS secure_profile_access_trigger ON public.profiles;
CREATE TRIGGER secure_profile_access_trigger
  BEFORE INSERT OR UPDATE OR DELETE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.secure_profile_access();

-- ============================================================================
-- 3. ENHANCED SESSION SECURITY
-- ============================================================================

-- Session security enhancement function
CREATE OR REPLACE FUNCTION public.secure_session_management()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  -- For new sessions, add security validations
  IF TG_OP = 'INSERT' THEN
    -- Ensure session token hash is present
    IF NEW.session_token_hash IS NULL OR LENGTH(NEW.session_token_hash) < 32 THEN
      RAISE EXCEPTION 'Invalid session token hash';
    END IF;
    
    -- Log session creation
    PERFORM public.log_security_event(
      'session_created',
      NEW.user_id,
      jsonb_build_object(
        'session_id', NEW.id,
        'ip_address', NEW.ip_address,
        'user_agent_hash', md5(COALESCE(NEW.user_agent, '')),
        'expires_at', NEW.expires_at,
        'timestamp', now()
      )
    );
  END IF;
  
  -- For session updates, log activity
  IF TG_OP = 'UPDATE' THEN
    -- Log suspicious activity if session details change unexpectedly
    IF OLD.user_id != NEW.user_id THEN
      PERFORM public.log_security_event(
        'suspicious_session_activity',
        OLD.user_id,
        jsonb_build_object(
          'session_id', OLD.id,
          'old_user_id', OLD.user_id,
          'new_user_id', NEW.user_id,
          'ip_address', NEW.ip_address,
          'timestamp', now()
        )
      );
      RAISE EXCEPTION 'Cannot change session user_id';
    END IF;
    
    -- Log session activity updates
    IF OLD.last_activity != NEW.last_activity THEN
      PERFORM public.log_security_event(
        'session_activity_updated',
        NEW.user_id,
        jsonb_build_object(
          'session_id', NEW.id,
          'ip_address', NEW.ip_address,
          'timestamp', now()
        )
      );
    END IF;
  END IF;
  
  RETURN COALESCE(NEW, OLD);
END;
$$;

-- Create trigger for session security
DROP TRIGGER IF EXISTS secure_session_management_trigger ON public.user_sessions;
CREATE TRIGGER secure_session_management_trigger
  BEFORE INSERT OR UPDATE ON public.user_sessions
  FOR EACH ROW EXECUTE FUNCTION public.secure_session_management();

-- ============================================================================
-- 4. DEBUG DATA SECURITY ENHANCEMENT
-- ============================================================================

-- Enhanced debug log security with data masking
CREATE OR REPLACE FUNCTION public.secure_debug_logging()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  -- Data masking for sensitive information in prompts
  IF TG_OP = 'INSERT' THEN
    -- Mask potential personal information in prompts
    NEW.user_prompt = regexp_replace(NEW.user_prompt, '\b\d{3}-\d{2}-\d{4}\b', '[SSN-MASKED]', 'g');
    NEW.user_prompt = regexp_replace(NEW.user_prompt, '\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b', '[EMAIL-MASKED]', 'g');
    NEW.user_prompt = regexp_replace(NEW.user_prompt, '\b\d{3}-\d{3}-\d{4}\b', '[PHONE-MASKED]', 'g');
    
    -- Limit prompt length to prevent excessive data collection
    IF LENGTH(NEW.user_prompt) > 2000 THEN
      NEW.user_prompt = LEFT(NEW.user_prompt, 2000) || '... [truncated for security]';
    END IF;
    
    IF LENGTH(NEW.system_prompt) > 5000 THEN
      NEW.system_prompt = LEFT(NEW.system_prompt, 5000) || '... [truncated for security]';
    END IF;
    
    -- Log debug data creation for audit
    PERFORM public.log_security_event(
      'debug_log_created',
      NEW.user_id,
      jsonb_build_object(
        'session_id', NEW.session_id,
        'model', NEW.model,
        'success', NEW.success,
        'page_number', NEW.page_number,
        'timestamp', now()
      )
    );
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger for debug log security
DROP TRIGGER IF EXISTS secure_debug_logging_trigger ON public.ai_prompt_debug_log;
CREATE TRIGGER secure_debug_logging_trigger
  BEFORE INSERT ON public.ai_prompt_debug_log
  FOR EACH ROW EXECUTE FUNCTION public.secure_debug_logging();

-- ============================================================================
-- 5. ENHANCED SECURITY INCIDENT PROTECTION
-- ============================================================================

-- Enhanced incident logging with additional protection
CREATE OR REPLACE FUNCTION public.secure_incident_logging()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    -- Enhanced data minimization for detected content
    IF LENGTH(NEW.detected_content) > 300 THEN
      NEW.detected_content = LEFT(NEW.detected_content, 300) || '... [truncated for privacy]';
    END IF;
    
    -- Add automatic categorization flags
    NEW.detected_content = CASE 
      WHEN NEW.detected_content ~* '\b(email|@)\b' THEN '[EMAIL-DETECTED] ' || NEW.detected_content
      WHEN NEW.detected_content ~* '\b(phone|call|number)\b' THEN '[PHONE-DETECTED] ' || NEW.detected_content
      WHEN NEW.detected_content ~* '\b(address|street|home)\b' THEN '[ADDRESS-DETECTED] ' || NEW.detected_content
      ELSE NEW.detected_content
    END;
    
    -- Log the incident creation for monitoring
    PERFORM public.log_security_event(
      'personal_info_incident_logged',
      NEW.user_id,
      jsonb_build_object(
        'incident_id', NEW.id,
        'violation_type', NEW.violation_type,
        'context_field', NEW.context_field,
        'child_profile_id', NEW.child_profile_id,
        'timestamp', now()
      )
    );
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger for incident security
DROP TRIGGER IF EXISTS secure_incident_logging_trigger ON public.personal_info_incidents;
CREATE TRIGGER secure_incident_logging_trigger
  BEFORE INSERT ON public.personal_info_incidents
  FOR EACH ROW EXECUTE FUNCTION public.secure_incident_logging();

-- ============================================================================
-- 6. AUTOMATED DATA RETENTION AND CLEANUP
-- ============================================================================

-- Enhanced cleanup function with comprehensive data retention
CREATE OR REPLACE FUNCTION public.comprehensive_security_cleanup()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  cleanup_summary jsonb;
BEGIN
  -- Initialize cleanup tracking
  cleanup_summary := jsonb_build_object();
  
  -- Clean up old debug logs (30 days retention)
  WITH deleted_debug AS (
    DELETE FROM public.ai_prompt_debug_log 
    WHERE created_at < (now() - interval '30 days')
    RETURNING id
  )
  SELECT jsonb_set(cleanup_summary, '{debug_logs_deleted}', to_jsonb(count(*)))
  INTO cleanup_summary
  FROM deleted_debug;
  
  -- Clean up old security audit logs (90 days retention)
  WITH deleted_audit AS (
    DELETE FROM public.security_audit_log 
    WHERE created_at < (now() - interval '90 days')
    RETURNING id
  )
  SELECT jsonb_set(cleanup_summary, '{audit_logs_deleted}', to_jsonb(count(*)))
  INTO cleanup_summary
  FROM deleted_audit;
  
  -- Clean up old personal info incidents (2 years retention for COPPA compliance)
  WITH deleted_incidents AS (
    DELETE FROM public.personal_info_incidents
    WHERE created_at < (now() - interval '2 years')
    RETURNING id
  )
  SELECT jsonb_set(cleanup_summary, '{incidents_deleted}', to_jsonb(count(*)))
  INTO cleanup_summary
  FROM deleted_incidents;
  
  -- Clean up expired sessions (30 days retention)
  WITH deleted_sessions AS (
    DELETE FROM public.user_sessions 
    WHERE created_at < (now() - interval '30 days')
    RETURNING id
  )
  SELECT jsonb_set(cleanup_summary, '{sessions_deleted}', to_jsonb(count(*)))
  INTO cleanup_summary
  FROM deleted_sessions;
  
  -- Mark expired sessions as inactive
  UPDATE public.user_sessions 
  SET is_active = false 
  WHERE expires_at < now() AND is_active = true;
  
  -- Clean up old rate limit records (7 days retention)
  DELETE FROM public.rate_limits 
  WHERE window_start < (now() - interval '7 days');
  
  DELETE FROM public.api_rate_limits 
  WHERE window_start < (now() - interval '7 days');
  
  -- Log comprehensive cleanup operation
  PERFORM public.log_security_event(
    'comprehensive_security_cleanup',
    NULL,
    jsonb_build_object(
      'cleanup_summary', cleanup_summary,
      'cleanup_timestamp', now(),
      'retention_policies', jsonb_build_object(
        'debug_logs', '30 days',
        'audit_logs', '90 days', 
        'incidents', '2 years',
        'sessions', '30 days',
        'rate_limits', '7 days'
      )
    )
  );
END;
$$;

-- ============================================================================
-- 7. ENHANCED RLS POLICIES FOR ADDITIONAL PROTECTION
-- ============================================================================

-- Enhanced RLS policy for child profiles with stricter access control
DROP POLICY IF EXISTS "Enhanced child profile protection" ON public.child_profiles;
CREATE POLICY "Enhanced child profile protection"
ON public.child_profiles 
FOR ALL
USING (
  auth.uid() = parent_user_id 
  AND auth.uid() IS NOT NULL 
  AND parent_user_id IS NOT NULL
  -- Additional check: ensure user is authenticated properly
  AND EXISTS (
    SELECT 1 FROM auth.users 
    WHERE id = auth.uid() 
    AND email_confirmed_at IS NOT NULL
  )
)
WITH CHECK (
  auth.uid() = parent_user_id 
  AND auth.uid() IS NOT NULL 
  AND parent_user_id IS NOT NULL
);

-- Enhanced RLS policy for profiles with additional security
DROP POLICY IF EXISTS "Enhanced profile security" ON public.profiles;
CREATE POLICY "Enhanced profile security"
ON public.profiles 
FOR ALL
USING (
  auth.uid() = user_id 
  AND auth.uid() IS NOT NULL 
  AND user_id IS NOT NULL
  -- Ensure user is properly authenticated
  AND EXISTS (
    SELECT 1 FROM auth.users 
    WHERE id = auth.uid() 
    AND email_confirmed_at IS NOT NULL
  )
)
WITH CHECK (
  auth.uid() = user_id 
  AND auth.uid() IS NOT NULL 
  AND user_id IS NOT NULL
);

-- ============================================================================
-- 8. SECURITY MONITORING FUNCTIONS
-- ============================================================================

-- Function to detect and log suspicious activity patterns
CREATE OR REPLACE FUNCTION public.detect_suspicious_patterns()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  suspicious_user record;
BEGIN
  -- Detect users with excessive incident reports
  FOR suspicious_user IN
    SELECT user_id, count(*) as incident_count
    FROM public.personal_info_incidents
    WHERE created_at > (now() - interval '24 hours')
    GROUP BY user_id
    HAVING count(*) > 10
  LOOP
    PERFORM public.log_security_event(
      'suspicious_high_incident_count',
      suspicious_user.user_id,
      jsonb_build_object(
        'incident_count_24h', suspicious_user.incident_count,
        'detection_timestamp', now(),
        'alert_level', 'HIGH'
      )
    );
  END LOOP;
  
  -- Detect rapid session creation patterns
  FOR suspicious_user IN
    SELECT user_id, count(*) as session_count
    FROM public.user_sessions
    WHERE created_at > (now() - interval '1 hour')
    GROUP BY user_id
    HAVING count(*) > 20
  LOOP
    PERFORM public.log_security_event(
      'suspicious_rapid_session_creation',
      suspicious_user.user_id,
      jsonb_build_object(
        'session_count_1h', suspicious_user.session_count,
        'detection_timestamp', now(),
        'alert_level', 'MEDIUM'
      )
    );
  END LOOP;
END;
$$;

-- ============================================================================
-- 9. DATA ANONYMIZATION UTILITIES
-- ============================================================================

-- Function to anonymize old user data while preserving analytics
CREATE OR REPLACE FUNCTION public.anonymize_old_user_data()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  -- Anonymize profiles older than 3 years for inactive users
  UPDATE public.profiles
  SET 
    display_name = 'Anonymized User',
    interests = ARRAY[]::text[],
    special_request = NULL,
    hobbies = NULL,
    favorite_color = NULL,
    favorite_animal = NULL,
    favorite_food = NULL
  WHERE 
    created_at < (now() - interval '3 years')
    AND user_id NOT IN (
      SELECT DISTINCT user_id 
      FROM public.user_sessions 
      WHERE last_activity > (now() - interval '1 year')
    );
  
  -- Log anonymization activity
  PERFORM public.log_security_event(
    'user_data_anonymization',
    NULL,
    jsonb_build_object(
      'anonymization_timestamp', now(),
      'retention_period', '3 years',
      'activity_threshold', '1 year'
    )
  );
END;
$$;

-- ============================================================================
-- 10. FINAL SECURITY DOCUMENTATION UPDATE
-- ============================================================================

-- Update table comments with security information
COMMENT ON TABLE public.child_profiles IS 
'Child profile data with enhanced COPPA compliance, data minimization, and comprehensive audit logging. Includes automatic age validation and content filtering.';

COMMENT ON TABLE public.profiles IS 
'User profile data with enhanced security controls, data anonymization support, and comprehensive access logging for privacy protection.';

COMMENT ON TABLE public.user_sessions IS 
'User session management with enhanced security controls, automatic cleanup, and suspicious activity detection for session hijacking prevention.';

COMMENT ON TABLE public.ai_prompt_debug_log IS 
'AI interaction debug logs with automatic PII masking, data minimization, and retention policies to protect business logic and user privacy.';

COMMENT ON TABLE public.personal_info_incidents IS 
'Personal information incident tracking with enhanced data protection, automatic categorization, and COPPA compliance features.';

COMMENT ON TABLE public.security_audit_log IS 
'Comprehensive security audit logging with automatic cleanup and retention policies for compliance and security monitoring.';

-- Log the completion of comprehensive security enhancement
PERFORM public.log_security_event(
  'comprehensive_security_enhancement_completed',
  NULL,
  jsonb_build_object(
    'migration_timestamp', now(),
    'features_added', ARRAY[
      'children_data_protection',
      'profile_security_enhancement', 
      'session_security_controls',
      'debug_data_masking',
      'incident_logging_protection',
      'automated_cleanup_policies',
      'suspicious_activity_detection',
      'data_anonymization_utilities'
    ],
    'compliance_frameworks', ARRAY['COPPA', 'GDPR', 'Privacy_by_Design'],
    'security_level', 'ENHANCED'
  )
);