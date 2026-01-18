-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =====================================================
-- PUBLICATIONS TABLE
-- =====================================================
CREATE TABLE publications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  description TEXT,
  from_name TEXT NOT NULL,
  from_email TEXT NOT NULL,
  reply_to_email TEXT,
  brand JSONB DEFAULT '{}'::jsonb,
  -- brand structure: { logo_url, accent_color, header_image_url }
  default_footer_id UUID,
  is_public BOOLEAN DEFAULT true,
  is_archived BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

CREATE INDEX idx_publications_slug ON publications(slug) WHERE deleted_at IS NULL;
CREATE INDEX idx_publications_is_public ON publications(is_public) WHERE deleted_at IS NULL;

-- =====================================================
-- PUBLICATION ADMINS TABLE
-- =====================================================
CREATE TABLE publication_admins (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  publication_id UUID NOT NULL REFERENCES publications(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT DEFAULT 'admin' CHECK (role IN ('admin', 'editor')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(publication_id, user_id)
);

CREATE INDEX idx_publication_admins_user ON publication_admins(user_id);
CREATE INDEX idx_publication_admins_publication ON publication_admins(publication_id);

-- =====================================================
-- ISSUES TABLE
-- =====================================================
CREATE TABLE issues (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  publication_id UUID NOT NULL REFERENCES publications(id) ON DELETE CASCADE,
  slug TEXT NOT NULL,
  subject TEXT NOT NULL,
  preheader TEXT,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'sent', 'scheduled')),
  footer_override_id UUID,
  published_at TIMESTAMPTZ,
  sent_at TIMESTAMPTZ,
  scheduled_for TIMESTAMPTZ,
  send_count INTEGER DEFAULT 0,
  open_count INTEGER DEFAULT 0,
  click_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ,
  UNIQUE(publication_id, slug)
);

CREATE INDEX idx_issues_publication ON issues(publication_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_issues_slug ON issues(publication_id, slug) WHERE deleted_at IS NULL;
CREATE INDEX idx_issues_status ON issues(status) WHERE deleted_at IS NULL;
CREATE INDEX idx_issues_published_at ON issues(published_at DESC) WHERE deleted_at IS NULL;

-- =====================================================
-- BLOCKS TABLE (Content blocks for issues)
-- =====================================================
CREATE TABLE blocks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  issue_id UUID NOT NULL REFERENCES issues(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('story', 'promo', 'text', 'divider', 'image', 'footer')),
  sort_order INTEGER NOT NULL,
  data JSONB NOT NULL DEFAULT '{}'::jsonb,
  -- data structure varies by type:
  -- story: { title, image_url, image_alt, link, blurb }
  -- promo: { title, content, link, link_text, background_color }
  -- text: { content, alignment }
  -- divider: { style }
  -- image: { url, alt, caption, link }
  -- footer: { content }
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_blocks_issue ON blocks(issue_id, sort_order);

-- =====================================================
-- SUBSCRIBERS TABLE
-- =====================================================
CREATE TABLE subscribers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  publication_id UUID NOT NULL REFERENCES publications(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'unsubscribed', 'bounced', 'complained')),
  confirmation_token UUID DEFAULT uuid_generate_v4(),
  unsubscribe_token UUID DEFAULT uuid_generate_v4(),
  confirmed_at TIMESTAMPTZ,
  unsubscribed_at TIMESTAMPTZ,
  bounced_at TIMESTAMPTZ,
  complained_at TIMESTAMPTZ,
  metadata JSONB DEFAULT '{}'::jsonb,
  -- metadata can store: source, tags, custom fields, etc.
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(publication_id, email)
);

CREATE INDEX idx_subscribers_publication ON subscribers(publication_id);
CREATE INDEX idx_subscribers_email ON subscribers(email);
CREATE INDEX idx_subscribers_status ON subscribers(status);
CREATE INDEX idx_subscribers_confirmation_token ON subscribers(confirmation_token);
CREATE INDEX idx_subscribers_unsubscribe_token ON subscribers(unsubscribe_token);

-- =====================================================
-- SEND JOBS TABLE (Campaign tracking)
-- =====================================================
CREATE TABLE send_jobs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  publication_id UUID NOT NULL REFERENCES publications(id) ON DELETE CASCADE,
  issue_id UUID NOT NULL REFERENCES issues(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed', 'cancelled')),
  total_recipients INTEGER DEFAULT 0,
  sent_count INTEGER DEFAULT 0,
  failed_count INTEGER DEFAULT 0,
  error_message TEXT,
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_send_jobs_status ON send_jobs(status);
CREATE INDEX idx_send_jobs_issue ON send_jobs(issue_id);
CREATE INDEX idx_send_jobs_created_at ON send_jobs(created_at DESC);

-- =====================================================
-- SEND MESSAGES TABLE (Individual email tracking)
-- =====================================================
CREATE TABLE send_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  send_job_id UUID NOT NULL REFERENCES send_jobs(id) ON DELETE CASCADE,
  subscriber_id UUID NOT NULL REFERENCES subscribers(id) ON DELETE CASCADE,
  issue_id UUID NOT NULL REFERENCES issues(id) ON DELETE CASCADE,
  resend_message_id TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'delivered', 'failed', 'bounced', 'complained')),
  error_message TEXT,
  sent_at TIMESTAMPTZ,
  delivered_at TIMESTAMPTZ,
  opened_at TIMESTAMPTZ,
  clicked_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_send_messages_job ON send_messages(send_job_id);
CREATE INDEX idx_send_messages_subscriber ON send_messages(subscriber_id);
CREATE INDEX idx_send_messages_resend_id ON send_messages(resend_message_id);
CREATE INDEX idx_send_messages_status ON send_messages(status);

-- =====================================================
-- SEND EVENTS TABLE (Webhook events from Resend)
-- =====================================================
CREATE TABLE send_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  subscriber_id UUID REFERENCES subscribers(id) ON DELETE SET NULL,
  issue_id UUID REFERENCES issues(id) ON DELETE SET NULL,
  send_message_id UUID REFERENCES send_messages(id) ON DELETE SET NULL,
  type TEXT NOT NULL,
  -- Types: email.sent, email.delivered, email.opened, email.clicked, email.bounced, email.complained, email.delivery_delayed
  payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  resend_event_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_send_events_type ON send_events(type);
CREATE INDEX idx_send_events_subscriber ON send_events(subscriber_id);
CREATE INDEX idx_send_events_issue ON send_events(issue_id);
CREATE INDEX idx_send_events_resend_id ON send_events(resend_event_id);
CREATE INDEX idx_send_events_created_at ON send_events(created_at DESC);

-- =====================================================
-- RATE LIMITS TABLE (API rate limiting)
-- =====================================================
CREATE TABLE rate_limits (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  identifier TEXT NOT NULL,
  -- Can be IP address, email, API key, etc.
  endpoint TEXT NOT NULL,
  count INTEGER DEFAULT 1,
  window_start TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(identifier, endpoint, window_start)
);

CREATE INDEX idx_rate_limits_identifier ON rate_limits(identifier, endpoint, window_start);

-- =====================================================
-- AUDIT LOGS TABLE (Track admin actions)
-- =====================================================
CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  publication_id UUID REFERENCES publications(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  entity_type TEXT,
  entity_id UUID,
  changes JSONB,
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_audit_logs_user ON audit_logs(user_id, created_at DESC);
CREATE INDEX idx_audit_logs_publication ON audit_logs(publication_id, created_at DESC);
CREATE INDEX idx_audit_logs_entity ON audit_logs(entity_type, entity_id);

-- =====================================================
-- DEFAULT FOOTERS TABLE
-- =====================================================
CREATE TABLE default_footers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  publication_id UUID NOT NULL REFERENCES publications(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  content JSONB NOT NULL DEFAULT '{}'::jsonb,
  -- content structure: { text, social_links: [{platform, url}], address }
  is_default BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_default_footers_publication ON default_footers(publication_id);

-- Add foreign key for publications.default_footer_id
ALTER TABLE publications
  ADD CONSTRAINT fk_publications_default_footer
  FOREIGN KEY (default_footer_id)
  REFERENCES default_footers(id)
  ON DELETE SET NULL;

ALTER TABLE issues
  ADD CONSTRAINT fk_issues_footer_override
  FOREIGN KEY (footer_override_id)
  REFERENCES default_footers(id)
  ON DELETE SET NULL;

-- =====================================================
-- FUNCTIONS
-- =====================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at triggers
CREATE TRIGGER update_publications_updated_at BEFORE UPDATE ON publications
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_issues_updated_at BEFORE UPDATE ON issues
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_blocks_updated_at BEFORE UPDATE ON blocks
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_subscribers_updated_at BEFORE UPDATE ON subscribers
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_send_jobs_updated_at BEFORE UPDATE ON send_jobs
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_send_messages_updated_at BEFORE UPDATE ON send_messages
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_default_footers_updated_at BEFORE UPDATE ON default_footers
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to check if user is admin of publication
CREATE OR REPLACE FUNCTION is_publication_admin(pub_id UUID, usr_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM publication_admins
    WHERE publication_id = pub_id AND user_id = usr_id
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to increment block sort orders when inserting
CREATE OR REPLACE FUNCTION increment_block_sort_order()
RETURNS TRIGGER AS $$
BEGIN
  -- If sort_order is not provided, set it to max + 1
  IF NEW.sort_order IS NULL THEN
    SELECT COALESCE(MAX(sort_order), 0) + 1
    INTO NEW.sort_order
    FROM blocks
    WHERE issue_id = NEW.issue_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_block_sort_order BEFORE INSERT ON blocks
  FOR EACH ROW EXECUTE FUNCTION increment_block_sort_order();

-- Function to clean up old rate limit records
CREATE OR REPLACE FUNCTION cleanup_old_rate_limits()
RETURNS void AS $$
BEGIN
  DELETE FROM rate_limits
  WHERE window_start < NOW() - INTERVAL '1 hour';
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE publications ENABLE ROW LEVEL SECURITY;
ALTER TABLE publication_admins ENABLE ROW LEVEL SECURITY;
ALTER TABLE issues ENABLE ROW LEVEL SECURITY;
ALTER TABLE blocks ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscribers ENABLE ROW LEVEL SECURITY;
ALTER TABLE send_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE send_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE send_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE default_footers ENABLE ROW LEVEL SECURITY;

-- Publications: Public read for published, admin write
CREATE POLICY "Public can view public publications"
  ON publications FOR SELECT
  USING (is_public = true AND deleted_at IS NULL);

CREATE POLICY "Admins can view their publications"
  ON publications FOR SELECT
  USING (
    auth.uid() IN (
      SELECT user_id FROM publication_admins WHERE publication_id = id
    )
  );

CREATE POLICY "Admins can update their publications"
  ON publications FOR UPDATE
  USING (
    auth.uid() IN (
      SELECT user_id FROM publication_admins WHERE publication_id = id
    )
  );

CREATE POLICY "Admins can insert publications"
  ON publications FOR INSERT
  WITH CHECK (true);

-- Publication Admins: Only admins can manage
CREATE POLICY "Admins can view publication admins"
  ON publication_admins FOR SELECT
  USING (
    auth.uid() IN (
      SELECT user_id FROM publication_admins WHERE publication_id = publication_admins.publication_id
    )
  );

CREATE POLICY "Admins can manage publication admins"
  ON publication_admins FOR ALL
  USING (
    auth.uid() IN (
      SELECT user_id FROM publication_admins pa WHERE pa.publication_id = publication_admins.publication_id
    )
  );

-- Issues: Public read for published, admin write
CREATE POLICY "Public can view published issues"
  ON issues FOR SELECT
  USING (
    status IN ('published', 'sent')
    AND deleted_at IS NULL
    AND publication_id IN (SELECT id FROM publications WHERE is_public = true)
  );

CREATE POLICY "Admins can view all issues"
  ON issues FOR SELECT
  USING (
    auth.uid() IN (
      SELECT user_id FROM publication_admins WHERE publication_id = issues.publication_id
    )
  );

CREATE POLICY "Admins can manage issues"
  ON issues FOR ALL
  USING (
    auth.uid() IN (
      SELECT user_id FROM publication_admins WHERE publication_id = issues.publication_id
    )
  );

-- Blocks: Follow issue permissions
CREATE POLICY "Public can view blocks of published issues"
  ON blocks FOR SELECT
  USING (
    issue_id IN (
      SELECT id FROM issues
      WHERE status IN ('published', 'sent') AND deleted_at IS NULL
    )
  );

CREATE POLICY "Admins can view all blocks"
  ON blocks FOR SELECT
  USING (
    issue_id IN (
      SELECT id FROM issues WHERE publication_id IN (
        SELECT publication_id FROM publication_admins WHERE user_id = auth.uid()
      )
    )
  );

CREATE POLICY "Admins can manage blocks"
  ON blocks FOR ALL
  USING (
    issue_id IN (
      SELECT id FROM issues WHERE publication_id IN (
        SELECT publication_id FROM publication_admins WHERE user_id = auth.uid()
      )
    )
  );

-- Subscribers: Admins only
CREATE POLICY "Admins can view subscribers"
  ON subscribers FOR SELECT
  USING (
    auth.uid() IN (
      SELECT user_id FROM publication_admins WHERE publication_id = subscribers.publication_id
    )
  );

CREATE POLICY "Admins can manage subscribers"
  ON subscribers FOR ALL
  USING (
    auth.uid() IN (
      SELECT user_id FROM publication_admins WHERE publication_id = subscribers.publication_id
    )
  );

-- Send Jobs: Admins only
CREATE POLICY "Admins can view send jobs"
  ON send_jobs FOR SELECT
  USING (
    auth.uid() IN (
      SELECT user_id FROM publication_admins WHERE publication_id = send_jobs.publication_id
    )
  );

CREATE POLICY "Admins can manage send jobs"
  ON send_jobs FOR ALL
  USING (
    auth.uid() IN (
      SELECT user_id FROM publication_admins WHERE publication_id = send_jobs.publication_id
    )
  );

-- Send Messages: Admins only
CREATE POLICY "Admins can view send messages"
  ON send_messages FOR SELECT
  USING (
    send_job_id IN (
      SELECT id FROM send_jobs WHERE publication_id IN (
        SELECT publication_id FROM publication_admins WHERE user_id = auth.uid()
      )
    )
  );

-- Send Events: Admins only
CREATE POLICY "Admins can view send events"
  ON send_events FOR SELECT
  USING (
    issue_id IN (
      SELECT id FROM issues WHERE publication_id IN (
        SELECT publication_id FROM publication_admins WHERE user_id = auth.uid()
      )
    )
  );

-- Audit Logs: Admins can view their publication's logs
CREATE POLICY "Admins can view audit logs"
  ON audit_logs FOR SELECT
  USING (
    publication_id IN (
      SELECT publication_id FROM publication_admins WHERE user_id = auth.uid()
    )
  );

-- Default Footers: Follow publication permissions
CREATE POLICY "Admins can view footers"
  ON default_footers FOR SELECT
  USING (
    publication_id IN (
      SELECT publication_id FROM publication_admins WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Admins can manage footers"
  ON default_footers FOR ALL
  USING (
    publication_id IN (
      SELECT publication_id FROM publication_admins WHERE user_id = auth.uid()
    )
  );

-- =====================================================
-- VIEWS
-- =====================================================

-- View for subscriber counts by publication
CREATE OR REPLACE VIEW publication_subscriber_stats AS
SELECT
  publication_id,
  COUNT(*) FILTER (WHERE status = 'active') as active_count,
  COUNT(*) FILTER (WHERE status = 'pending') as pending_count,
  COUNT(*) FILTER (WHERE status = 'unsubscribed') as unsubscribed_count,
  COUNT(*) FILTER (WHERE status = 'bounced') as bounced_count,
  COUNT(*) FILTER (WHERE status = 'complained') as complained_count,
  COUNT(*) as total_count
FROM subscribers
GROUP BY publication_id;

-- View for issue statistics
CREATE OR REPLACE VIEW issue_stats AS
SELECT
  i.id as issue_id,
  i.publication_id,
  i.subject,
  i.sent_at,
  sj.total_recipients,
  sj.sent_count,
  sj.failed_count,
  COUNT(DISTINCT se.id) FILTER (WHERE se.type = 'email.opened') as unique_opens,
  COUNT(DISTINCT se.id) FILTER (WHERE se.type = 'email.clicked') as unique_clicks,
  CASE
    WHEN sj.sent_count > 0
    THEN (COUNT(DISTINCT se.id) FILTER (WHERE se.type = 'email.opened')::FLOAT / sj.sent_count * 100)
    ELSE 0
  END as open_rate,
  CASE
    WHEN sj.sent_count > 0
    THEN (COUNT(DISTINCT se.id) FILTER (WHERE se.type = 'email.clicked')::FLOAT / sj.sent_count * 100)
    ELSE 0
  END as click_rate
FROM issues i
LEFT JOIN send_jobs sj ON i.id = sj.issue_id AND sj.status = 'completed'
LEFT JOIN send_events se ON i.id = se.issue_id
GROUP BY i.id, sj.id;

-- =====================================================
-- GRANTS (for service role and authenticated users)
-- =====================================================

-- Grant usage on schema
GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;

-- Grant access to tables
GRANT ALL ON ALL TABLES IN SCHEMA public TO service_role;
GRANT SELECT ON publications, issues, blocks TO anon;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;

-- Grant access to sequences
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO authenticated, service_role;
