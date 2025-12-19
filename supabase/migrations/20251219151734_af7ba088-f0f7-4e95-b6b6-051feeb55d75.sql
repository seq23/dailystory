-- Drop the existing restrictive policy
DROP POLICY IF EXISTS "Authenticated users can submit feedback" ON feedback;

-- Create a new policy that allows both authenticated and anonymous feedback
CREATE POLICY "Anyone can submit feedback" ON feedback
FOR INSERT
WITH CHECK (
  -- Either authenticated user submitting their own feedback
  (auth.uid() IS NOT NULL AND user_id = auth.uid())
  -- OR anonymous user submitting with null user_id
  OR (auth.uid() IS NULL AND user_id IS NULL)
);