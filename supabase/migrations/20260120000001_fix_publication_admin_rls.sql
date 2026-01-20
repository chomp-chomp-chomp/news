-- Fix RLS policy for publication_admins to allow initial admin creation
-- Drop the problematic policy
DROP POLICY IF EXISTS "Admins can manage publication admins" ON publication_admins;

-- Allow users to insert themselves as admins when creating a new publication
CREATE POLICY "Users can add themselves as publication admins"
  ON publication_admins FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Allow existing admins to manage other admins
CREATE POLICY "Admins can manage publication admins"
  ON publication_admins FOR UPDATE
  USING (
    auth.uid() IN (
      SELECT user_id FROM publication_admins pa
      WHERE pa.publication_id = publication_admins.publication_id
    )
  );

CREATE POLICY "Admins can delete publication admins"
  ON publication_admins FOR DELETE
  USING (
    auth.uid() IN (
      SELECT user_id FROM publication_admins pa
      WHERE pa.publication_id = publication_admins.publication_id
    )
  );
