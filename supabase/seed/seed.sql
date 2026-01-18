-- =====================================================
-- SEED DATA for Newsletter Platform
-- =====================================================
-- This file creates sample data for development and testing
-- Run this after the initial migration

-- IMPORTANT: Replace 'YOUR_USER_ID_HERE' with your actual Supabase Auth user ID
-- You can find this by:
-- 1. Sign up in your app
-- 2. Run: SELECT id, email FROM auth.users;
-- 3. Copy your user ID and replace below

-- =====================================================
-- 1. Create sample publication
-- =====================================================
INSERT INTO publications (id, slug, name, description, from_name, from_email, reply_to_email, is_public, brand)
VALUES (
  '00000000-0000-0000-0000-000000000001',
  'chomp-weekly',
  'Chomp Weekly',
  'A weekly digest of food stories, recipes, and culinary adventures from around the world.',
  'Chomp Team',
  'hello@chompchomp.cc',
  'hello@chompchomp.cc',
  true,
  '{
    "logo_url": "https://chompchomp.cc/logo.png",
    "accent_color": "#e73b42",
    "header_image_url": ""
  }'::jsonb
) ON CONFLICT (id) DO NOTHING;

-- =====================================================
-- 2. Create default footer for publication
-- =====================================================
INSERT INTO default_footers (id, publication_id, name, content, is_default)
VALUES (
  '00000000-0000-0000-0000-000000000002',
  '00000000-0000-0000-0000-000000000001',
  'Default Footer',
  '{
    "text": "You are receiving this email because you subscribed to Chomp Weekly. We share the best food stories and recipes every week.",
    "social_links": [
      {
        "platform": "website",
        "url": "https://chompchomp.cc",
        "label": "Visit our website"
      },
      {
        "platform": "instagram",
        "url": "https://instagram.com/chompchomp",
        "label": "Follow on Instagram"
      }
    ],
    "address": "Chomp Chomp, Inc. · San Francisco, CA"
  }'::jsonb,
  true
) ON CONFLICT (id) DO NOTHING;

-- Link footer to publication
UPDATE publications
SET default_footer_id = '00000000-0000-0000-0000-000000000002'
WHERE id = '00000000-0000-0000-0000-000000000001';

-- =====================================================
-- 3. Assign admin user (REPLACE YOUR_USER_ID_HERE)
-- =====================================================
-- After you create your first user account, run this:
-- INSERT INTO publication_admins (publication_id, user_id, role)
-- VALUES (
--   '00000000-0000-0000-0000-000000000001',
--   'YOUR_USER_ID_HERE',
--   'admin'
-- );

-- Alternatively, use this helper function in your SQL editor:
-- SELECT id, email FROM auth.users; -- Find your user ID first
-- Then run:
-- INSERT INTO publication_admins (publication_id, user_id, role)
-- SELECT '00000000-0000-0000-0000-000000000001', id, 'admin'
-- FROM auth.users WHERE email = 'your-email@example.com';

-- =====================================================
-- 4. Create sample issue
-- =====================================================
INSERT INTO issues (id, publication_id, slug, subject, preheader, status, published_at)
VALUES (
  '00000000-0000-0000-0000-000000000003',
  '00000000-0000-0000-0000-000000000001',
  'welcome-to-chomp-weekly',
  '🍽️ Welcome to Chomp Weekly!',
  'Your weekly dose of delicious stories and recipes',
  'published',
  NOW() - INTERVAL '7 days'
) ON CONFLICT (publication_id, slug) DO NOTHING;

-- =====================================================
-- 5. Create sample story blocks
-- =====================================================
INSERT INTO blocks (issue_id, type, sort_order, data)
VALUES
  -- Story 1
  (
    '00000000-0000-0000-0000-000000000003',
    'story',
    1,
    '{
      "title": "The Secret to Perfect Sourdough",
      "image_url": "https://images.unsplash.com/photo-1549931319-a545dcf3bc73?w=800",
      "image_alt": "Freshly baked sourdough bread",
      "link": "https://example.com/sourdough-guide",
      "blurb": "After years of trial and error, we''ve cracked the code to bakery-quality sourdough at home. The secret? It''s all about timing and temperature control."
    }'::jsonb
  ),
  -- Story 2
  (
    '00000000-0000-0000-0000-000000000003',
    'story',
    2,
    '{
      "title": "Street Food Spotlight: Bangkok''s Night Markets",
      "image_url": "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=800",
      "image_alt": "Bangkok street food market at night",
      "link": "https://example.com/bangkok-street-food",
      "blurb": "From pad thai to mango sticky rice, we explore the vibrant flavors of Bangkok''s legendary night markets and the vendors who make them special."
    }'::jsonb
  ),
  -- Story 3
  (
    '00000000-0000-0000-0000-000000000003',
    'story',
    3,
    '{
      "title": "Fermentation 101: Start Your Own Kimchi",
      "image_url": "https://images.unsplash.com/photo-1606850780554-b55b39fe1e63?w=800",
      "image_alt": "Homemade kimchi in glass jars",
      "link": "https://example.com/kimchi-recipe",
      "blurb": "Dive into the ancient art of fermentation with this beginner-friendly kimchi recipe. Your gut (and taste buds) will thank you."
    }'::jsonb
  ),
  -- Divider
  (
    '00000000-0000-0000-0000-000000000003',
    'divider',
    4,
    '{
      "style": "simple"
    }'::jsonb
  ),
  -- Promo block
  (
    '00000000-0000-0000-0000-000000000003',
    'promo',
    5,
    '{
      "title": "🎉 New Recipe Collection",
      "content": "Get our complete guide to 30-minute weeknight dinners. Real recipes, tested in real kitchens, designed for real life.",
      "link": "https://example.com/recipe-collection",
      "link_text": "Get the Collection",
      "background_color": "#fff8f0"
    }'::jsonb
  ),
  -- Footer
  (
    '00000000-0000-0000-0000-000000000003',
    'footer',
    6,
    '{
      "content": "You are receiving this email because you subscribed to Chomp Weekly. We share the best food stories and recipes every week."
    }'::jsonb
  )
ON CONFLICT DO NOTHING;

-- =====================================================
-- 6. Create sample subscribers (for testing)
-- =====================================================
INSERT INTO subscribers (publication_id, email, status, confirmed_at)
VALUES
  (
    '00000000-0000-0000-0000-000000000001',
    'subscriber1@example.com',
    'active',
    NOW() - INTERVAL '30 days'
  ),
  (
    '00000000-0000-0000-0000-000000000001',
    'subscriber2@example.com',
    'active',
    NOW() - INTERVAL '25 days'
  ),
  (
    '00000000-0000-0000-0000-000000000001',
    'subscriber3@example.com',
    'pending',
    NULL
  )
ON CONFLICT (publication_id, email) DO NOTHING;

-- =====================================================
-- 7. Helpful queries for setup
-- =====================================================

-- View all publications
-- SELECT * FROM publications;

-- View all issues for a publication
-- SELECT * FROM issues WHERE publication_id = '00000000-0000-0000-0000-000000000001';

-- View blocks for an issue
-- SELECT * FROM blocks WHERE issue_id = '00000000-0000-0000-0000-000000000003' ORDER BY sort_order;

-- View subscribers
-- SELECT * FROM subscribers WHERE publication_id = '00000000-0000-0000-0000-000000000001';

-- Make yourself an admin (run after creating account)
-- INSERT INTO publication_admins (publication_id, user_id, role)
-- SELECT '00000000-0000-0000-0000-000000000001', id, 'admin'
-- FROM auth.users WHERE email = 'YOUR_EMAIL@example.com';
