-- =====================================================
-- HELPER MIGRATION: Add Current User as Admin to Seed Publication
-- =====================================================
-- This migration helps users access the seed publication "Chomp Weekly"
-- by creating a function that adds the current authenticated user as an admin.

-- Create a helper function to add current user as admin to seed publication
CREATE OR REPLACE FUNCTION add_current_user_to_seed_publication()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  -- Hardcoded seed publication ID from seed.sql
  -- This matches the ID in supabase/seed/seed.sql for "Chomp Weekly"
  seed_pub_id UUID := '00000000-0000-0000-0000-000000000001';
  current_user_id UUID;
BEGIN
  -- Get current user ID
  current_user_id := auth.uid();
  
  -- Check if user is authenticated
  IF current_user_id IS NULL THEN
    RAISE EXCEPTION 'Must be authenticated to run this function';
  END IF;
  
  -- Check if publication exists
  IF NOT EXISTS (SELECT 1 FROM publications WHERE id = seed_pub_id) THEN
    RAISE EXCEPTION 'Seed publication does not exist';
  END IF;
  
  -- Add user as admin to seed publication (ignore if already exists)
  INSERT INTO publication_admins (publication_id, user_id, role)
  VALUES (seed_pub_id, current_user_id, 'admin')
  ON CONFLICT (publication_id, user_id) DO NOTHING;
  
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION add_current_user_to_seed_publication() TO authenticated;

-- Add comment
COMMENT ON FUNCTION add_current_user_to_seed_publication() IS 
  'Adds the currently authenticated user as an admin to the seed publication (Chomp Weekly). ' ||
  'Run this by calling: SELECT add_current_user_to_seed_publication();';
