-- Parent incident notices, follow-up to 20261123180000 (review notes N1-N4, 23 Nov 2026).
-- Additive: no row is deleted or rewritten. Written by notify-data-breach (service role).
--
-- 1. Versions. An owner who edits a notice under the same incident id makes a new version
--    (keyed by a hash of its text). Each version is stored with what it said, and the send log
--    is kept per version, so an edit never loses the record of who got the earlier one.
-- 2. Retries past the mailer's memory. The mailer's idempotency key lasts 24 hours from its
--    first use. A send whose outcome is unknown (timeout, 5xx, a run that died mid-send) is
--    retried with the same key only inside 23 hours of that first use; after that it is held
--    as 'unsure' for the owner and never sent again by itself. A send the mailer refused
--    ('failed': nothing went out) is retried under a fresh key.

-- Rows written before versions existed cannot be matched to a version: stop the deploy
-- rather than risk sending those parents the same notice again.
ALTER TABLE public.incident_notices ADD COLUMN IF NOT EXISTS notice_version text;
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM public.incident_notices WHERE notice_version IS NULL) THEN
    RAISE EXCEPTION 'NAMED STOP INCIDENT_ROWS_WITHOUT_VERSION: incident_notices has rows sent before notice versions; set their notice_version by hand (the noticeVersion hash of the text they got) and deploy again';
  END IF;
END $$;
ALTER TABLE public.incident_notices ALTER COLUMN notice_version SET NOT NULL;

-- Which mailer key the row is on, and when that key was first used.
ALTER TABLE public.incident_notices ADD COLUMN IF NOT EXISTS send_key integer NOT NULL DEFAULT 1;
ALTER TABLE public.incident_notices ADD COLUMN IF NOT EXISTS send_key_at timestamptz NOT NULL DEFAULT now();

-- 'unsure': the mailer never confirmed and its key has expired; held for the owner.
ALTER TABLE public.incident_notices DROP CONSTRAINT IF EXISTS incident_notices_status_check;
ALTER TABLE public.incident_notices ADD CONSTRAINT incident_notices_status_check
  CHECK (status IN ('sending', 'sent', 'failed', 'unsure'));

-- One row per incident, version and parent.
DO $$ BEGIN
  IF (SELECT array_length(conkey, 1) FROM pg_constraint
       WHERE conrelid = 'public.incident_notices'::regclass AND contype = 'p') <> 3 THEN
    ALTER TABLE public.incident_notices DROP CONSTRAINT incident_notices_pkey;
    ALTER TABLE public.incident_notices ADD CONSTRAINT incident_notices_pkey
      PRIMARY KEY (incident_id, notice_version, parent_user_id);
  END IF;
END $$;

-- What each version said, numbered in the order the owner sent them.
CREATE TABLE IF NOT EXISTS public.incident_notice_versions (
  incident_id text NOT NULL,
  notice_version text NOT NULL,
  version_no integer NOT NULL,
  content jsonb NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (incident_id, notice_version),
  UNIQUE (incident_id, version_no)
);
ALTER TABLE public.incident_notice_versions ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.incident_notice_versions FROM anon, authenticated;

-- Records a version once and returns its number (1, 2, ...). Serialised per incident.
CREATE OR REPLACE FUNCTION public.incident_notice_version(p_incident text, p_version text, p_content jsonb)
RETURNS integer LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE n integer;
BEGIN
  PERFORM pg_advisory_xact_lock(hashtext('incident_notice_version:' || p_incident));
  SELECT version_no INTO n FROM public.incident_notice_versions WHERE incident_id = p_incident AND notice_version = p_version;
  IF n IS NOT NULL THEN RETURN n; END IF;
  SELECT coalesce(max(version_no), 0) + 1 INTO n FROM public.incident_notice_versions WHERE incident_id = p_incident;
  INSERT INTO public.incident_notice_versions (incident_id, notice_version, version_no, content)
  VALUES (p_incident, p_version, n, p_content);
  RETURN n;
END $$;
REVOKE ALL ON FUNCTION public.incident_notice_version(text, text, jsonb) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.incident_notice_version(text, text, jsonb) TO service_role;

-- The claim, now per version. Replaces the two-argument claim (one way to claim, not two).
DROP FUNCTION IF EXISTS public.incident_notice_claim(text, uuid);

-- Takes the right to send one parent one version. Returns {"status", "key"}:
--   claimed  send now under mailer key `key` (a new row; a refused send, under a fresh key; an
--            unconfirmed one inside 23 hours of its key's first use, under the same key, so the
--            mailer drops a copy that did go out; or, only with p_resend_unsure, an 'unsure'
--            one past that, under a fresh key: the owner has checked the mailer's log)
--   sent     already sent
--   sending  another run is mid-send (less than 10 minutes ago)
--   unsure   never confirmed and past the key's 23 hours: held, never sent again by itself
CREATE OR REPLACE FUNCTION public.incident_notice_claim(p_incident text, p_version text, p_parent uuid, p_resend_unsure boolean DEFAULT false)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE r public.incident_notices%ROWTYPE;
BEGIN
  INSERT INTO public.incident_notices (incident_id, notice_version, parent_user_id, status)
  VALUES (p_incident, p_version, p_parent, 'sending')
  ON CONFLICT (incident_id, notice_version, parent_user_id) DO NOTHING;
  IF FOUND THEN RETURN jsonb_build_object('status', 'claimed', 'key', 1); END IF;

  SELECT * INTO r FROM public.incident_notices
   WHERE incident_id = p_incident AND notice_version = p_version AND parent_user_id = p_parent
   FOR UPDATE;

  IF r.status = 'failed' THEN
    UPDATE public.incident_notices
       SET status = 'sending', attempts = attempts + 1, send_key = send_key + 1, send_key_at = now(),
           last_error = NULL, updated_at = now()
     WHERE incident_id = p_incident AND notice_version = p_version AND parent_user_id = p_parent
     RETURNING * INTO r;
    RETURN jsonb_build_object('status', 'claimed', 'key', r.send_key);
  END IF;

  IF r.status = 'unsure' OR (r.status = 'sending' AND r.updated_at < now() - interval '10 minutes') THEN
    IF r.send_key_at > now() - interval '23 hours' THEN
      UPDATE public.incident_notices
         SET status = 'sending', attempts = attempts + 1, updated_at = now()
       WHERE incident_id = p_incident AND notice_version = p_version AND parent_user_id = p_parent;
      RETURN jsonb_build_object('status', 'claimed', 'key', r.send_key);
    ELSIF p_resend_unsure THEN
      UPDATE public.incident_notices
         SET status = 'sending', attempts = attempts + 1, send_key = send_key + 1, send_key_at = now(),
             updated_at = now()
       WHERE incident_id = p_incident AND notice_version = p_version AND parent_user_id = p_parent
       RETURNING * INTO r;
      RETURN jsonb_build_object('status', 'claimed', 'key', r.send_key);
    END IF;
    IF r.status <> 'unsure' THEN
      UPDATE public.incident_notices SET status = 'unsure', updated_at = now()
       WHERE incident_id = p_incident AND notice_version = p_version AND parent_user_id = p_parent;
    END IF;
    RETURN jsonb_build_object('status', 'unsure', 'key', r.send_key);
  END IF;

  RETURN jsonb_build_object('status', r.status, 'key', r.send_key);
END $$;
REVOKE ALL ON FUNCTION public.incident_notice_claim(text, text, uuid, boolean) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.incident_notice_claim(text, text, uuid, boolean) TO service_role;
