-- Fix RLS policy for default_footers to allow public access
-- This allows viewing footers for public publications on the public page

-- Add policy to allow public viewing of footers for public publications
CREATE POLICY "Public can view footers for public publications"
  ON default_footers FOR SELECT
  USING (
    publication_id IN (
      SELECT id FROM publications
      WHERE is_public = true AND deleted_at IS NULL
    )
  );
