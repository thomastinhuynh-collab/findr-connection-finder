CREATE OR REPLACE FUNCTION public.exchange_filter_counts()
RETURNS TABLE(filter text, total integer)
LANGUAGE plpgsql STABLE SECURITY INVOKER SET search_path TO 'public'
AS $$
DECLARE
  f text; n int; got int; cur_at timestamptz; cur_unread boolean; r record;
BEGIN
  FOREACH f IN ARRAY ARRAY['toutes','non_lus','en_attente','ventes_en_cours','finalisees'] LOOP
    n := 0; cur_at := NULL; cur_unread := NULL;
    LOOP
      got := 0;
      FOR r IN SELECT e.unread_count, e.last_activity_at FROM public.list_my_exchanges(f, 100, cur_at, cur_unread) e LOOP
        got := got + 1; cur_at := r.last_activity_at; cur_unread := r.unread_count > 0;
      END LOOP;
      n := n + got;
      EXIT WHEN got < 100 OR cur_at IS NULL;
    END LOOP;
    filter := f; total := n; RETURN NEXT;
  END LOOP;
END;
$$;
REVOKE ALL ON FUNCTION public.exchange_filter_counts() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.exchange_filter_counts() TO authenticated;