-- Remove old newsletter_templates table from abandoned JSONB-based template approach
-- This table was from migration 20260120000006 but is no longer used
-- We now use email_template and web_template columns with code-based templates

DROP TABLE IF EXISTS newsletter_templates CASCADE;

-- Remove the old migration file reference to prevent confusion
-- Note: The actual migration file should be deleted from the migrations folder
