-- Add email template field to publications table
ALTER TABLE publications ADD COLUMN IF NOT EXISTS email_template TEXT DEFAULT 'classic';

-- Add comment
COMMENT ON COLUMN publications.email_template IS 'Email layout template: classic, digest, feature, minimal, newsletter';

-- Update existing publications to use classic template
UPDATE publications SET email_template = 'classic' WHERE email_template IS NULL;
