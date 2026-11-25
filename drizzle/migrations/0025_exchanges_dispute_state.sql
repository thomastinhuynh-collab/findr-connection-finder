DO $$
DECLARE v_def text;
BEGIN
  SELECT pg_get_functiondef('public.list_my_exchanges(text,integer,timestamptz,boolean)'::regprocedure) INTO v_def;
  IF position('WHEN ''vente'' THEN c.s_status' IN v_def) = 0 THEN RAISE EXCEPTION 'pattern_not_found'; END IF;
  v_def := replace(v_def, 'WHEN ''vente'' THEN c.s_status',
    'WHEN ''vente'' THEN CASE WHEN c.sale_open AND COALESCE(c.dispute_open, false) THEN ''litige'' ELSE c.s_status END');
  EXECUTE v_def;
END $$;