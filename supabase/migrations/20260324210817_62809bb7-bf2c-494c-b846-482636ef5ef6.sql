
-- Phase 1: Add account_status to profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS account_status text NOT NULL DEFAULT 'active';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS account_restricted_at timestamp with time zone;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS account_restriction_reason text;

-- Phase 4: Consent records table for tracking signup consent and withdrawal
CREATE TABLE IF NOT EXISTS public.consent_records (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  consent_type text NOT NULL,
  consent_given boolean NOT NULL DEFAULT true,
  consent_text text,
  ip_address inet,
  user_agent text,
  given_at timestamp with time zone NOT NULL DEFAULT now(),
  withdrawn_at timestamp with time zone,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.consent_records ENABLE ROW LEVEL SECURITY;

CREATE POLICY "consent_records_select_own" ON public.consent_records
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "consent_records_insert_own" ON public.consent_records
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "consent_records_service_role" ON public.consent_records
  FOR ALL TO authenticated
  USING (auth.role() = 'service_role');

-- Phase 5: Data breach log table
CREATE TABLE IF NOT EXISTS public.data_breach_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  breach_description text NOT NULL,
  data_types_affected text[] NOT NULL DEFAULT '{}',
  users_affected_count integer DEFAULT 0,
  severity text NOT NULL DEFAULT 'low',
  detected_at timestamp with time zone NOT NULL DEFAULT now(),
  reported_to_authority_at timestamp with time zone,
  users_notified_at timestamp with time zone,
  remediation_steps text,
  status text NOT NULL DEFAULT 'detected',
  logged_by text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.data_breach_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "data_breach_log_service_only" ON public.data_breach_log
  FOR ALL TO authenticated
  USING (auth.role() = 'service_role');
