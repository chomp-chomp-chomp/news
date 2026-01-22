-- =====================================================
-- ADD THEME-SPECIFIC LOGO SUPPORT
-- =====================================================
-- Add light and dark mode logo fields to site_settings

-- Add new settings for theme-specific logos
INSERT INTO site_settings (key, value) VALUES
  ('site_logo_url_light', ''),
  ('site_logo_url_dark', '')
ON CONFLICT (key) DO NOTHING;

-- Add comment explaining the logo precedence
COMMENT ON TABLE site_settings IS
  'Site-wide settings. Logo precedence: 1) theme-specific (site_logo_url_light/dark), 2) fallback (site_logo_url)';
