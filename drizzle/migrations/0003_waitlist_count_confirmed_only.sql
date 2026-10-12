CREATE OR REPLACE FUNCTION public.get_waitlist_count()
 RETURNS integer
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  SELECT COUNT(*)::int FROM public.waitlist WHERE confirmed_at IS NOT NULL;
$function$;

COMMENT ON FUNCTION public.get_waitlist_count() IS 'Nombre d''inscrits à la liste d''attente ayant confirmé leur adresse email (confirmed_at non nul).';