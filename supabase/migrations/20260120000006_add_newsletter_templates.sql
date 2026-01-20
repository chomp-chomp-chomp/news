-- =====================================================
-- NEWSLETTER TEMPLATES TABLE
-- Store reusable templates for newsletters
-- =====================================================
CREATE TABLE newsletter_templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  publication_id UUID REFERENCES publications(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  template_data JSONB NOT NULL DEFAULT '{}'::jsonb,
  -- template_data structure: { blocks: [...], preheader: "", subject_template: "" }
  is_global BOOLEAN DEFAULT false,
  -- Global templates available to all publications, publication-specific otherwise
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id),
  CONSTRAINT publication_or_global CHECK (
    (publication_id IS NOT NULL AND is_global = false) OR
    (publication_id IS NULL AND is_global = true)
  )
);

CREATE INDEX idx_newsletter_templates_publication ON newsletter_templates(publication_id);
CREATE INDEX idx_newsletter_templates_global ON newsletter_templates(is_global) WHERE is_global = true;

-- =====================================================
-- ROW LEVEL SECURITY for newsletter_templates
-- =====================================================
ALTER TABLE newsletter_templates ENABLE ROW LEVEL SECURITY;

-- Allow public read of global templates
CREATE POLICY select_global_templates ON newsletter_templates
  FOR SELECT
  USING (is_global = true);

-- Allow admins to read their publication templates
CREATE POLICY select_publication_templates ON newsletter_templates
  FOR SELECT
  USING (
    is_global = false AND EXISTS (
      SELECT 1 FROM publication_admins
      WHERE publication_admins.publication_id = newsletter_templates.publication_id
        AND publication_admins.user_id = auth.uid()
    )
  );

-- Allow admins to manage their publication templates
CREATE POLICY manage_publication_templates ON newsletter_templates
  FOR ALL
  USING (
    is_global = false AND EXISTS (
      SELECT 1 FROM publication_admins
      WHERE publication_admins.publication_id = newsletter_templates.publication_id
        AND publication_admins.user_id = auth.uid()
    )
  );

-- =====================================================
-- UPDATE TRIGGER for newsletter_templates
-- =====================================================
CREATE TRIGGER update_newsletter_templates_updated_at
  BEFORE UPDATE ON newsletter_templates
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- INSERT DEFAULT TEMPLATES
-- =====================================================
INSERT INTO newsletter_templates (name, description, is_global, template_data) VALUES
(
  'Basic Newsletter',
  'Simple text and story blocks template',
  true,
  '{
    "blocks": [
      {
        "type": "text",
        "data": {
          "content": "Welcome to our newsletter! Here are this week''s highlights.",
          "alignment": "left"
        }
      },
      {
        "type": "divider"
      },
      {
        "type": "story",
        "data": {
          "title": "Story Title",
          "blurb": "Brief description of the story goes here.",
          "link": "https://example.com",
          "image_url": ""
        }
      }
    ],
    "subject_template": "Newsletter - [Date]",
    "preheader": "Your weekly update"
  }'::jsonb
),
(
  'Promo Newsletter',
  'Template with promotional content',
  true,
  '{
    "blocks": [
      {
        "type": "promo",
        "data": {
          "title": "Special Announcement",
          "content": "Check out our latest offering!",
          "link": "https://example.com",
          "link_text": "Learn More",
          "background_color": "#fff8f0"
        }
      },
      {
        "type": "divider"
      },
      {
        "type": "text",
        "data": {
          "content": "Additional content goes here.",
          "alignment": "left"
        }
      }
    ],
    "subject_template": "Special Offer - [Date]",
    "preheader": "Don''t miss this!"
  }'::jsonb
),
(
  'Multi-Story Newsletter',
  'Template with multiple story blocks',
  true,
  '{
    "blocks": [
      {
        "type": "text",
        "data": {
          "content": "This week''s top stories:",
          "alignment": "left"
        }
      },
      {
        "type": "divider"
      },
      {
        "type": "story",
        "data": {
          "title": "Story 1 Title",
          "blurb": "First story description.",
          "link": "https://example.com/story1"
        }
      },
      {
        "type": "story",
        "data": {
          "title": "Story 2 Title",
          "blurb": "Second story description.",
          "link": "https://example.com/story2"
        }
      },
      {
        "type": "story",
        "data": {
          "title": "Story 3 Title",
          "blurb": "Third story description.",
          "link": "https://example.com/story3"
        }
      }
    ],
    "subject_template": "This Week''s Top Stories",
    "preheader": "Your weekly roundup"
  }'::jsonb
);
