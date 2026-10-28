CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA extensions;
INSERT INTO public.webhook_secrets (name, secret)
VALUES ('cron_secret', encode(extensions.gen_random_bytes(32), 'hex'))
ON CONFLICT (name) DO NOTHING;

SELECT cron.alter_job(
  (SELECT jobid FROM cron.job WHERE jobname = 'auto-release-funds-hourly'),
  schedule := '17 * * * *',
  command := $cmd$
  SELECT net.http_post(
    url := 'https://kfnggqhawjvzgajakbgd.supabase.co/functions/v1/auto-release-funds',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtmbmdncWhhd2p2emdhamFrYmdkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjgzOTYwODksImV4cCI6MjA4Mzk3MjA4OX0.zOo2Hee8uV4FobAsUzGc2ODkGuNdbHAJ6pGAWXtc8Go',
      'x-cron-secret', (SELECT secret FROM public.webhook_secrets WHERE name = 'cron_secret')
    ),
    body := '{}'::jsonb
  );
  $cmd$
);

SELECT cron.alter_job(
  (SELECT jobid FROM cron.job WHERE jobname = 'reservation-reminders-daily'),
  schedule := '30 8 * * *',
  command := $cmd$
  SELECT net.http_post(
    url := 'https://kfnggqhawjvzgajakbgd.supabase.co/functions/v1/reservation-reminders',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtmbmdncWhhd2p2emdhamFrYmdkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjgzOTYwODksImV4cCI6MjA4Mzk3MjA4OX0.zOo2Hee8uV4FobAsUzGc2ODkGuNdbHAJ6pGAWXtc8Go',
      'x-cron-secret', (SELECT secret FROM public.webhook_secrets WHERE name = 'cron_secret')
    ),
    body := '{}'::jsonb
  ) AS request_id;
  $cmd$
);