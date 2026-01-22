-- Create table for caching shortened URLs
CREATE TABLE IF NOT EXISTS url_shortener_cache (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  original_url TEXT NOT NULL,
  short_url TEXT NOT NULL,
  short_code TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Create unique index on original_url for fast lookups and prevent duplicates
CREATE UNIQUE INDEX idx_url_shortener_cache_original_url ON url_shortener_cache(original_url);

-- Create index on short_code for potential reverse lookups
CREATE INDEX idx_url_shortener_cache_short_code ON url_shortener_cache(short_code);

-- Add comment
COMMENT ON TABLE url_shortener_cache IS 'Caches shortened URLs to avoid redundant API calls to the URL shortener service';
