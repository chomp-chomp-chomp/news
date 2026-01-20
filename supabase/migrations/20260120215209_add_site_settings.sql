-- =====================================================
-- SITE SETTINGS TABLE
-- =====================================================
-- Table to store global site configuration settings
CREATE TABLE site_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  key TEXT NOT NULL UNIQUE,
  value TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for faster lookups
CREATE INDEX idx_site_settings_key ON site_settings(key);

-- Insert default site settings
INSERT INTO site_settings (key, value) VALUES
  ('site_name', 'Newsletter Platform'),
  ('site_description', 'A platform for creating and sending newsletters'),
  ('favicon_url', ''),
  ('site_logo_url', ''),
  ('og_image_url', ''),
  ('twitter_image_url', '');

-- Enable RLS
ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;

-- Policy: Allow public read access to site settings
CREATE POLICY "Allow public read access to site settings"
  ON site_settings
  FOR SELECT
  USING (true);

-- Policy: Only authenticated users can update site settings
CREATE POLICY "Allow authenticated users to update site settings"
  ON site_settings
  FOR UPDATE
  USING (auth.role() = 'authenticated');

-- Policy: Only authenticated users can insert site settings
CREATE POLICY "Allow authenticated users to insert site settings"
  ON site_settings
  FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');
