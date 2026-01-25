-- Add web_template column to publications table
ALTER TABLE publications ADD COLUMN IF NOT EXISTS web_template TEXT DEFAULT 'classic';

-- Add comment explaining the field
COMMENT ON COLUMN publications.web_template IS 'Web layout template: classic, magazine, minimal, blog, newspaper';

-- Update existing publications to use classic template
UPDATE publications SET web_template = 'classic' WHERE web_template IS NULL;
