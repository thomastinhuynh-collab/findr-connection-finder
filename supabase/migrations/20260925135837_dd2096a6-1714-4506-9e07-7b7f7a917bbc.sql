CREATE TABLE public.welcome_emails_sent (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  sent_at timestamptz NOT NULL DEFAULT now()
);
GRANT ALL ON public.welcome_emails_sent TO service_role;
ALTER TABLE public.welcome_emails_sent ENABLE ROW LEVEL SECURITY;
-- Comptes existants : considérés comme déjà accueillis.
INSERT INTO public.welcome_emails_sent (user_id) SELECT id FROM auth.users ON CONFLICT DO NOTHING;