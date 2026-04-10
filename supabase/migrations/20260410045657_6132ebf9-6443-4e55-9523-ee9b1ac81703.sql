
-- Enable pg_net if not already enabled
CREATE EXTENSION IF NOT EXISTS pg_net WITH SCHEMA extensions;

-- Schedule quarterly cost report on 1st of Jan, Apr, Jul, Oct at 9:00 AM UTC
SELECT cron.schedule(
  'quarterly-cost-report',
  '0 9 1 1,4,7,10 *',
  $$
  SELECT
    net.http_post(
      url := 'https://cpzeuogomaixamrtnnmj.supabase.co/functions/v1/cost-report',
      headers := '{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNwemV1b2dvbWFpeGFtcnRubm1qIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM5ODQ2NTEsImV4cCI6MjA2OTU2MDY1MX0.3ziDSHAS6XNd73eF5GVEOHW8GpnP03h3NJKqElMyino"}'::jsonb,
      body := '{"scheduled": true}'::jsonb
    ) AS request_id;
  $$
);
