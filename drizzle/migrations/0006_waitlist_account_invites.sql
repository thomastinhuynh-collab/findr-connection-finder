ALTER TABLE public.app_settings ADD COLUMN IF NOT EXISTS beta_open boolean NOT NULL DEFAULT false;
ALTER TABLE public.app_settings ADD COLUMN IF NOT EXISTS waitlist_invite_enabled boolean NOT NULL DEFAULT true;
ALTER TABLE public.waitlist ADD COLUMN IF NOT EXISTS source text NOT NULL DEFAULT 'site';
CREATE TABLE public.waitlist_invites (
  user_id uuid PRIMARY KEY,
  invited_at timestamptz NOT NULL DEFAULT now()
);
GRANT ALL ON public.waitlist_invites TO service_role;
ALTER TABLE public.waitlist_invites ENABLE ROW LEVEL SECURITY;