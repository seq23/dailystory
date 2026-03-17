INSERT INTO public.discount_codes (code, description, duration_days, active, max_uses, created_by)
VALUES ('BEACON90', 'Partner review - 90 days free Premium access', 90, true, NULL, 'admin')
ON CONFLICT (code) DO NOTHING;