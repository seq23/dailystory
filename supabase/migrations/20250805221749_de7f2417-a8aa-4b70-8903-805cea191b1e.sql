-- Fix auth security settings for production readiness

-- Set OTP expiry to recommended 10 minutes (600 seconds)
UPDATE auth.config 
SET 
  -- Reduce OTP expiry from default to secure 10 minutes
  otp_exp = 600,
  -- Enable leaked password protection 
  enable_password_breach_protection = true
WHERE 
  -- Only update if current settings are insecure
  otp_exp > 600 OR enable_password_breach_protection = false;