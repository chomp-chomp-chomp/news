-- =====================================================
-- PUBLICATION LISTS TABLE
-- Allows grouping subscribers into lists
-- =====================================================
CREATE TABLE publication_lists (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  publication_id UUID NOT NULL REFERENCES publications(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(publication_id, name)
);

CREATE INDEX idx_publication_lists_publication ON publication_lists(publication_id);

-- =====================================================
-- SUBSCRIBER LISTS TABLE (many-to-many junction)
-- Links subscribers to publication lists
-- =====================================================
CREATE TABLE subscriber_lists (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  subscriber_id UUID NOT NULL REFERENCES subscribers(id) ON DELETE CASCADE,
  list_id UUID NOT NULL REFERENCES publication_lists(id) ON DELETE CASCADE,
  added_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(subscriber_id, list_id)
);

CREATE INDEX idx_subscriber_lists_subscriber ON subscriber_lists(subscriber_id);
CREATE INDEX idx_subscriber_lists_list ON subscriber_lists(list_id);

-- =====================================================
-- ROW LEVEL SECURITY for publication_lists
-- =====================================================
ALTER TABLE publication_lists ENABLE ROW LEVEL SECURITY;

-- Allow public read of lists (for filtering purposes)
CREATE POLICY select_publication_lists ON publication_lists
  FOR SELECT
  USING (true);

-- Allow admins to manage lists
CREATE POLICY manage_publication_lists ON publication_lists
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM publication_admins
      WHERE publication_admins.publication_id = publication_lists.publication_id
        AND publication_admins.user_id = auth.uid()
    )
  );

-- =====================================================
-- ROW LEVEL SECURITY for subscriber_lists
-- =====================================================
ALTER TABLE subscriber_lists ENABLE ROW LEVEL SECURITY;

-- Allow public read of subscriber-list associations
CREATE POLICY select_subscriber_lists ON subscriber_lists
  FOR SELECT
  USING (true);

-- Allow admins to manage subscriber-list associations
CREATE POLICY manage_subscriber_lists ON subscriber_lists
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM subscribers
      JOIN publication_admins ON publication_admins.publication_id = subscribers.publication_id
      WHERE subscribers.id = subscriber_lists.subscriber_id
        AND publication_admins.user_id = auth.uid()
    )
  );

-- =====================================================
-- UPDATE TRIGGER for publication_lists
-- =====================================================
CREATE TRIGGER update_publication_lists_updated_at
  BEFORE UPDATE ON publication_lists
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
