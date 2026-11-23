-- Parent incident notices (Privacy.tsx: "Personal information incidents are logged and
-- parents are notified"). Additive only. Written by notify-data-breach (service role).

-- One incident record per incident key, so a re-run never logs it twice.
ALTER TABLE public.data_breach_log ADD COLUMN IF NOT EXISTS incident_key text;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'data_breach_log_incident_key_key') THEN
    ALTER TABLE public.data_breach_log ADD CONSTRAINT data_breach_log_incident_key_key UNIQUE (incident_key);
  END IF;
END $$;

-- One row per incident and parent: the send log, and the lock that stops a second send.
CREATE TABLE IF NOT EXISTS public.incident_notices (
  incident_id text NOT NULL,
  parent_user_id uuid NOT NULL,
  status text NOT NULL CHECK (status IN ('sending', 'sent', 'failed')),
  attempts integer NOT NULL DEFAULT 1,
  provider_id text,
  last_error text,
  sent_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (incident_id, parent_user_id)
);
ALTER TABLE public.incident_notices ENABLE ROW LEVEL SECURITY;
-- No policies: only the service role (which bypasses RLS) reads or writes it.
REVOKE ALL ON public.incident_notices FROM anon, authenticated;

-- Takes the right to send one parent's notice: 'claimed' when never sent, when the last try
-- failed, or when a run died mid-send 10 minutes to 23 hours ago (the mailer's idempotency key
-- lasts 24 hours, so a send that did go out is not repeated); otherwise the current status
-- ('sent', or 'sending' while a run is mid-send).
CREATE OR REPLACE FUNCTION public.incident_notice_claim(p_incident text, p_parent uuid)
RETURNS text LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE s text;
BEGIN
  INSERT INTO public.incident_notices (incident_id, parent_user_id, status)
  VALUES (p_incident, p_parent, 'sending')
  ON CONFLICT (incident_id, parent_user_id) DO NOTHING;
  IF FOUND THEN RETURN 'claimed'; END IF;
  UPDATE public.incident_notices
     SET status = 'sending', attempts = attempts + 1, last_error = NULL, updated_at = now()
   WHERE incident_id = p_incident AND parent_user_id = p_parent
     AND (status = 'failed'
          OR (status = 'sending' AND updated_at < now() - interval '10 minutes'
                                 AND updated_at > now() - interval '23 hours'));
  IF FOUND THEN RETURN 'claimed'; END IF;
  SELECT status INTO s FROM public.incident_notices WHERE incident_id = p_incident AND parent_user_id = p_parent;
  RETURN s;
END $$;
REVOKE ALL ON FUNCTION public.incident_notice_claim(text, uuid) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.incident_notice_claim(text, uuid) TO service_role;
