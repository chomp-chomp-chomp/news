-- Fix view permissions for publication_subscriber_stats
-- The view was failing because it inherits the RLS policies of the subscribers table

-- Drop and recreate the view with SECURITY DEFINER to bypass RLS
DROP VIEW IF EXISTS publication_subscriber_stats;

CREATE OR REPLACE VIEW publication_subscriber_stats
WITH (security_invoker = false) AS
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

-- Grant SELECT on the view to authenticated users
GRANT SELECT ON publication_subscriber_stats TO authenticated;

-- Same fix for issue_stats view
DROP VIEW IF EXISTS issue_stats;

CREATE OR REPLACE VIEW issue_stats
WITH (security_invoker = false) AS
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

-- Grant SELECT on the view to authenticated users
GRANT SELECT ON issue_stats TO authenticated;
