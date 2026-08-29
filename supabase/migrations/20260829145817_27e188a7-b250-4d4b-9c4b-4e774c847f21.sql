CREATE OR REPLACE FUNCTION public.notify_waitlist_welcome()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, net
AS $$
DECLARE
  v_secret text;
BEGIN
  SELECT secret INTO v_secret FROM public.webhook_secrets WHERE name = 'waitlist_welcome';
  IF v_secret IS NULL THEN
    RETURN NEW;
  END IF;

  PERFORM net.http_post(
    url := 'https://kfnggqhawjvzgajakbgd.supabase.co/functions/v1/send-waitlist-welcome-email',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'x-webhook-secret', v_secret
    ),
    body := jsonb_build_object(
      'type', 'INSERT',
      'record', jsonb_build_object(
        'id', NEW.id,
        'email', NEW.email,
        'first_name', NEW.first_name
      )
    )
  );
  RETURN NEW;
END;
$$;

REVOKE ALL ON FUNCTION public.notify_waitlist_welcome() FROM PUBLIC, anon, authenticated;