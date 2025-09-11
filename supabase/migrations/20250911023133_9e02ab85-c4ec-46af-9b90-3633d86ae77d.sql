-- CRITICAL SECURITY FIXES: Database Hardening and Enhanced Protection

-- 1. Enhanced RLS Policy for Subscribers Table (Critical Fix)
DROP POLICY IF EXISTS "enhanced_secure_select_subscription" ON public.subscribers;
DROP POLICY IF EXISTS "enhanced_secure_insert_subscription" ON public.subscribers;
DROP POLICY IF EXISTS "enhanced_secure_update_subscription" ON public.subscribers;
DROP POLICY IF EXISTS "enhanced_secure_delete_subscription" ON public.subscribers;

-- Create ultra-secure subscriber policies with email verification
CREATE POLICY "ultra_secure_select_subscription" ON public.subscribers
FOR SELECT USING (
  (auth.uid() = user_id AND auth.email() = email AND auth.uid() IS NOT NULL) 
  OR (auth.role() = 'service_role'::text)
);

CREATE POLICY "ultra_secure_insert_subscription" ON public.subscribers
FOR INSERT WITH CHECK (
  (auth.uid() = user_id AND auth.email() = email AND auth.uid() IS NOT NULL) 
  OR (auth.role() = 'service_role'::text)
);

CREATE POLICY "ultra_secure_update_subscription" ON public.subscribers
FOR UPDATE USING (
  (auth.uid() = user_id AND auth.uid() IS NOT NULL) 
  OR (auth.role() = 'service_role'::text)
) WITH CHECK (
  (auth.uid() = user_id AND auth.uid() IS NOT NULL) 
  OR (auth.role() = 'service_role'::text)
);

CREATE POLICY "ultra_secure_delete_subscription" ON public.subscribers
FOR DELETE USING (
  (auth.uid() = user_id AND auth.uid() IS NOT NULL) 
  OR (auth.role() = 'service_role'::text)
);

-- 2. Enhanced Child Profile Protection (COPPA Compliance)
DROP POLICY IF EXISTS "Enhanced child profile protection" ON public.child_profiles;

CREATE POLICY "ultra_secure_child_profile_protection" ON public.child_profiles
FOR ALL USING (
  auth.uid() = parent_user_id 
  AND auth.uid() IS NOT NULL 
  AND parent_user_id IS NOT NULL
  AND EXISTS (
    SELECT 1 FROM auth.users 
    WHERE users.id = auth.uid() 
    AND users.email_confirmed_at IS NOT NULL
    AND users.confirmed_at IS NOT NULL
  )
) WITH CHECK (
  auth.uid() = parent_user_id 
  AND auth.uid() IS NOT NULL 
  AND parent_user_id IS NOT NULL
);

-- 3. Create Security Monitoring Table
CREATE TABLE IF NOT EXISTS public.security_monitoring (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  event_type text NOT NULL,
  user_id uuid,
  table_name text,
  operation text,
  sensitive_data_accessed boolean DEFAULT false,
  ip_address inet,
  user_agent text,
  risk_level text CHECK (risk_level IN ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL')) DEFAULT 'LOW',
  details jsonb DEFAULT '{}',
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS on security monitoring
ALTER TABLE public.security_monitoring ENABLE ROW LEVEL SECURITY;

-- Only service role and authenticated admins can access security monitoring
CREATE POLICY "service_role_security_monitoring" ON public.security_monitoring
FOR ALL USING (auth.role() = 'service_role'::text);

-- 4. Enhanced Personal Info Incidents Protection
DROP POLICY IF EXISTS "Enhanced users can view their own incidents only" ON public.personal_info_incidents;

CREATE POLICY "ultra_secure_incidents_access" ON public.personal_info_incidents
FOR SELECT USING (
  auth.uid() = user_id 
  AND auth.uid() IS NOT NULL 
  AND created_at > (now() - '2 years'::interval)
  AND EXISTS (
    SELECT 1 FROM auth.users 
    WHERE users.id = auth.uid() 
    AND users.email_confirmed_at IS NOT NULL
  )
);

-- 5. Create Enhanced Security Event Logging Function
CREATE OR REPLACE FUNCTION public.log_enhanced_security_event(
  event_type_param text,
  user_id_param uuid DEFAULT auth.uid(),
  table_name_param text DEFAULT NULL,
  operation_param text DEFAULT NULL,
  sensitive_data_param boolean DEFAULT false,
  risk_level_param text DEFAULT 'LOW',
  details_param jsonb DEFAULT '{}'
) RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  -- Log to both security_audit_log and new security_monitoring
  PERFORM public.log_security_event(event_type_param, user_id_param, details_param);
  
  INSERT INTO public.security_monitoring (
    event_type,
    user_id,
    table_name,
    operation,
    sensitive_data_accessed,
    ip_address,
    user_agent,
    risk_level,
    details
  ) VALUES (
    event_type_param,
    user_id_param,
    table_name_param,
    operation_param,
    sensitive_data_param,
    inet_client_addr(),
    current_setting('request.headers', true)::jsonb->>'user-agent',
    risk_level_param,
    details_param
  );
END;
$$;

-- 6. Enhanced Audit Triggers for Sensitive Tables
CREATE OR REPLACE FUNCTION public.enhanced_security_audit()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  -- Enhanced logging for sensitive table access
  PERFORM public.log_enhanced_security_event(
    CASE 
      WHEN TG_OP = 'INSERT' THEN 'sensitive_data_created'
      WHEN TG_OP = 'UPDATE' THEN 'sensitive_data_modified'
      WHEN TG_OP = 'DELETE' THEN 'sensitive_data_deleted'
      ELSE 'sensitive_data_accessed'
    END,
    COALESCE(NEW.user_id, OLD.user_id, auth.uid()),
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
      'record_id', COALESCE(NEW.id, OLD.id)
    )
  );
  
  -- Additional security checks for critical operations
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
  END IF;
  
  RETURN COALESCE(NEW, OLD);
END;
$$;

-- Apply enhanced audit triggers to sensitive tables
DROP TRIGGER IF EXISTS enhanced_subscribers_audit ON public.subscribers;
CREATE TRIGGER enhanced_subscribers_audit
  AFTER INSERT OR UPDATE OR DELETE ON public.subscribers
  FOR EACH ROW EXECUTE FUNCTION public.enhanced_security_audit();

DROP TRIGGER IF EXISTS enhanced_child_profiles_audit ON public.child_profiles;
CREATE TRIGGER enhanced_child_profiles_audit
  AFTER INSERT OR UPDATE OR DELETE ON public.child_profiles
  FOR EACH ROW EXECUTE FUNCTION public.enhanced_security_audit();

DROP TRIGGER IF EXISTS enhanced_personal_info_incidents_audit ON public.personal_info_incidents;
CREATE TRIGGER enhanced_personal_info_incidents_audit
  AFTER INSERT OR UPDATE OR DELETE ON public.personal_info_incidents
  FOR EACH ROW EXECUTE FUNCTION public.enhanced_security_audit();

-- 7. Session Security Enhancement
DROP TRIGGER IF EXISTS enhanced_session_security ON public.user_sessions;
CREATE TRIGGER enhanced_session_security
  AFTER INSERT OR UPDATE OR DELETE ON public.user_sessions
  FOR EACH ROW EXECUTE FUNCTION public.enhanced_security_audit();

-- 8. Create Security Dashboard Function
CREATE OR REPLACE FUNCTION public.get_security_dashboard()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  dashboard_data jsonb;
  critical_events_count integer;
  high_risk_events_count integer;
  recent_incidents_count integer;
BEGIN
  -- Only allow service role to access dashboard
  IF auth.role() != 'service_role' THEN
    RAISE EXCEPTION 'Unauthorized access to security dashboard';
  END IF;
  
  -- Count critical events in last 24 hours
  SELECT count(*) INTO critical_events_count
  FROM public.security_monitoring
  WHERE risk_level = 'CRITICAL' AND created_at > (now() - '24 hours'::interval);
  
  -- Count high risk events in last 24 hours
  SELECT count(*) INTO high_risk_events_count
  FROM public.security_monitoring
  WHERE risk_level = 'HIGH' AND created_at > (now() - '24 hours'::interval);
  
  -- Count recent personal info incidents
  SELECT count(*) INTO recent_incidents_count
  FROM public.personal_info_incidents
  WHERE created_at > (now() - '24 hours'::interval);
  
  dashboard_data := jsonb_build_object(
    'critical_events_24h', critical_events_count,
    'high_risk_events_24h', high_risk_events_count,
    'personal_info_incidents_24h', recent_incidents_count,
    'security_status', CASE 
      WHEN critical_events_count > 0 THEN 'CRITICAL'
      WHEN high_risk_events_count > 5 THEN 'HIGH'
      WHEN recent_incidents_count > 10 THEN 'MEDIUM'
      ELSE 'NORMAL'
    END,
    'last_updated', now()
  );
  
  -- Log dashboard access
  PERFORM public.log_enhanced_security_event(
    'security_dashboard_accessed',
    NULL,
    'security_monitoring',
    'DASHBOARD_VIEW',
    false,
    'LOW',
    dashboard_data
  );
  
  RETURN dashboard_data;
END;
$$;