CREATE EXTENSION IF NOT EXISTS pg_net WITH SCHEMA extensions;

CREATE TABLE public.webhook_secrets (
  name text PRIMARY KEY,
  secret text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT ALL ON public.webhook_secrets TO service_role;
ALTER TABLE public.webhook_secrets ENABLE ROW LEVEL SECURITY;

INSERT INTO public.webhook_secrets (name, secret)
VALUES ('waitlist_welcome', encode(extensions.gen_random_bytes(32), 'hex'));

CREATE TABLE public.waitlist_welcome_emails (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL UNIQUE,
  waitlist_id uuid,
  sent_at timestamptz NOT NULL DEFAULT now()
);
GRANT ALL ON public.waitlist_welcome_emails TO service_role;
ALTER TABLE public.waitlist_welcome_emails ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.notify_waitlist_welcome()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_secret text;
BEGIN
  SELECT secret INTO v_secret FROM public.webhook_secrets WHERE name = 'waitlist_welcome';
  IF v_secret IS NULL THEN
    RETURN NEW;
  END IF;

  PERFORM extensions.net.http_post(
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

DROP TRIGGER IF EXISTS trg_waitlist_welcome_email ON public.waitlist;
CREATE TRIGGER trg_waitlist_welcome_email
AFTER INSERT ON public.waitlist
FOR EACH ROW EXECUTE FUNCTION public.notify_waitlist_welcome();