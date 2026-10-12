DROP TRIGGER IF EXISTS trg_waitlist_welcome_email ON public.waitlist;
DROP FUNCTION IF EXISTS public.notify_waitlist_welcome();
REVOKE ALL ON public.waitlist FROM anon, authenticated;
GRANT ALL ON public.waitlist TO service_role;