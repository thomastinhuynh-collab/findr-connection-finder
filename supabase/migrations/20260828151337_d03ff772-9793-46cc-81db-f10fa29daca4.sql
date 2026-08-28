select cron.schedule(
  'reservation-reminders-daily',
  '30 8 * * *',
  $$
  SELECT net.http_post(
    url := 'https://kfnggqhawjvzgajakbgd.supabase.co/functions/v1/reservation-reminders',
    headers := '{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtmbmdncWhhd2p2emdhamFrYmdkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjgzOTYwODksImV4cCI6MjA4Mzk3MjA4OX0.zOo2Hee8uV4FobAsUzGc2ODkGuNdbHAJ6pGAWXtc8Go"}'::jsonb,
    body := '{}'::jsonb
  ) as request_id;
  $$
);