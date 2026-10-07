ALTER TABLE public.waitlist
  ADD COLUMN IF NOT EXISTS email_normalized text,
  ADD COLUMN IF NOT EXISTS confirmed_at timestamptz,
  ADD COLUMN IF NOT EXISTS confirm_token text,
  ADD COLUMN IF NOT EXISTS confirm_sent_at timestamptz;
CREATE INDEX IF NOT EXISTS waitlist_email_normalized_idx ON public.waitlist (email_normalized);
CREATE INDEX IF NOT EXISTS waitlist_confirm_token_idx ON public.waitlist (confirm_token);

CREATE TABLE public.waitlist_attempts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ip_hash text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT ALL ON public.waitlist_attempts TO service_role;
ALTER TABLE public.waitlist_attempts ENABLE ROW LEVEL SECURITY;
CREATE INDEX waitlist_attempts_ip_created_idx ON public.waitlist_attempts (ip_hash, created_at);

CREATE OR REPLACE FUNCTION public.notify_waitlist_welcome()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public', 'net'
AS $function$
DECLARE
  v_secret text;
BEGIN
  -- Nouveau parcours en deux temps : l'email de bienvenue part après confirmation.
  IF NEW.confirm_token IS NOT NULL THEN
    RETURN NEW;
  END IF;
  SELECT secret INTO v_secret FROM public.webhook_secrets WHERE name = 'waitlist_welcome';
  IF v_secret IS NULL THEN
    RETURN NEW;
  END IF;
  PERFORM net.http_post(
    url := 'https://kfnggqhawjvzgajakbgd.supabase.co/functions/v1/send-waitlist-welcome-email',
    headers := jsonb_build_object('Content-Type', 'application/json', 'x-webhook-secret', v_secret),
    body := jsonb_build_object('type', 'INSERT', 'record', jsonb_build_object('id', NEW.id, 'email', NEW.email, 'first_name', NEW.first_name))
  );
  RETURN NEW;
END;
$function$;