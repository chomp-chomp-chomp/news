-- Allow users to view their own admin records
-- This fixes the 404 error when viewing publications after creation

DROP POLICY IF EXISTS "Admins can view publication admins" ON publication_admins;

-- Users can see admin records where they are listed
CREATE POLICY "Users can view their own admin records"
  ON publication_admins FOR SELECT
  USING (auth.uid() = user_id);
