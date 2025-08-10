-- 1) Ensure unique email for upserts used by edge functions
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'subscribers_email_unique'
  ) THEN
    ALTER TABLE public.subscribers
    ADD CONSTRAINT subscribers_email_unique UNIQUE (email);
  END IF;
END $$;

-- 2) Add manual override columns
ALTER TABLE public.subscribers
  ADD COLUMN IF NOT EXISTS override_premium boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS override_tier text,
  ADD COLUMN IF NOT EXISTS override_end timestamptz,
  ADD COLUMN IF NOT EXISTS override_reason text,
  ADD COLUMN IF NOT EXISTS override_set_by text;

-- 3) Seed manual override for the requested account
INSERT INTO public.subscribers (
  email,
  subscribed,
  subscription_tier,
  subscription_end,
  override_premium,
  override_tier,
  override_end,
  override_reason,
  override_set_by,
  updated_at
) VALUES (
  'seq.taylor@gmail.com',
  true,
  'Premium',
  NULL,
  true,
  'Premium',
  NULL,
  'Manual dev override',
  'Lovable system',
  now()
)
ON CONFLICT (email) DO UPDATE SET
  subscribed = EXCLUDED.subscribed,
  subscription_tier = EXCLUDED.subscription_tier,
  subscription_end = EXCLUDED.subscription_end,
  override_premium = EXCLUDED.override_premium,
  override_tier = EXCLUDED.override_tier,
  override_end = EXCLUDED.override_end,
  override_reason = EXCLUDED.override_reason,
  override_set_by = EXCLUDED.override_set_by,
  updated_at = now();