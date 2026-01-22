-- Create parental_consents table for COPPA verifiable consent
CREATE TABLE public.parental_consents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  child_profile_id UUID REFERENCES child_profiles(id) ON DELETE CASCADE,
  parent_email TEXT NOT NULL,
  consent_token UUID DEFAULT gen_random_uuid(),
  consent_status TEXT NOT NULL DEFAULT 'pending',
  token_expires_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '48 hours'),
  verified_at TIMESTAMPTZ,
  revoked_at TIMESTAMPTZ,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.parental_consents ENABLE ROW LEVEL SECURITY;

-- Parents can view consent records for their children
CREATE POLICY "parental_consents_select_own" ON public.parental_consents
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM child_profiles cp 
      WHERE cp.id = parental_consents.child_profile_id 
      AND cp.parent_user_id = auth.uid()
    )
  );

-- Service role can manage all consent records
CREATE POLICY "parental_consents_service_role" ON public.parental_consents
  FOR ALL USING (auth.role() = 'service_role');

-- Add index for token lookups
CREATE INDEX idx_parental_consents_token ON public.parental_consents(consent_token);
CREATE INDEX idx_parental_consents_child ON public.parental_consents(child_profile_id);