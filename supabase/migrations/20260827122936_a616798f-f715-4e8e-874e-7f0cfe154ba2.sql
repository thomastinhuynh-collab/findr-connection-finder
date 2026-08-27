CREATE EXTENSION IF NOT EXISTS pg_cron WITH SCHEMA extensions;
CREATE EXTENSION IF NOT EXISTS pg_net WITH SCHEMA extensions;

SELECT cron.unschedule('auto-release-funds-hourly')
WHERE EXISTS (SELECT 1 FROM cron.job WHERE jobname = 'auto-release-funds-hourly');

SELECT cron.schedule(
  'auto-release-funds-hourly',
  '17 * * * *',
  $$
  SELECT net.http_post(
    url := 'https://kfnggqhawjvzgajakbgd.supabase.co/functions/v1/auto-release-funds',
    headers := '{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtmbmdncWhhd2p2emdhamFrYmdkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjgzOTYwODksImV4cCI6MjA4Mzk3MjA4OX0.zOo2Hee8uV4FobAsUzGc2ODkGuNdbHAJ6pGAWXtc8Go"}'::jsonb,
    body := '{}'::jsonb
  );
  $$
);