-- Add parent_email column to child_profiles for COPPA compliance
ALTER TABLE child_profiles 
ADD COLUMN IF NOT EXISTS parent_email TEXT;

-- Add comment for documentation
COMMENT ON COLUMN child_profiles.parent_email IS 'Parent/guardian email for COPPA parental consent notifications';