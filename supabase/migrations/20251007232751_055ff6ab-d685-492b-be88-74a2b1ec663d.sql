-- Fix profiles foreign key to allow cascade deletion and delete test accounts
-- This resolves "violates foreign key constraint" errors when deleting users

-- Step 1: Drop the old constraint (without CASCADE)
ALTER TABLE public.profiles 
DROP CONSTRAINT IF EXISTS profiles_user_id_fkey;

-- Step 2: Add new constraint WITH cascade deletion
ALTER TABLE public.profiles 
ADD CONSTRAINT profiles_user_id_fkey 
FOREIGN KEY (user_id) 
REFERENCES auth.users(id) 
ON DELETE CASCADE;

-- Step 3: Verify the constraint was created correctly
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 
    FROM pg_constraint 
    WHERE conname = 'profiles_user_id_fkey' 
    AND confdeltype = 'c'  -- 'c' means CASCADE
  ) THEN
    RAISE EXCEPTION 'Foreign key constraint was not created with CASCADE';
  END IF;
END $$;

-- Step 4: Now that CASCADE is enabled, delete the 3 test accounts
-- This will automatically cascade delete their profiles and related records
DELETE FROM auth.users 
WHERE id IN (
  '746865db-c5da-44c7-b35d-484fcd9a305e',  -- sequoialtaylor@gmail.com
  '8b5951d9-4bd8-4bc5-b45c-157e5810286e',  -- bettersequoia@gmail.com
  '0c2fd2cd-afca-4118-a98c-911999005b3d'   -- staylor@spry.vc
);