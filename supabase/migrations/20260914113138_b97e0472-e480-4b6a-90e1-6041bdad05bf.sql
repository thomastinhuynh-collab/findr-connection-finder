REVOKE ALL ON FUNCTION public.invalidate_content_translations() FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.invalidate_content_translations() TO service_role;