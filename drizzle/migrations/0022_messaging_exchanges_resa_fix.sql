DO $$
DECLARE v_def text;
BEGIN
  SELECT pg_get_functiondef('public.list_my_exchanges(text,integer,timestamptz)'::regprocedure) INTO v_def;
  v_def := replace(v_def, 'AND r.payment_status IS NULL OR false',
    'AND COALESCE(r.payment_status, '''') NOT IN (''paye_attente_etiquette'',''etiquette_refusee'',''paye_en_attente_reception'',''expedie'',''livre'',''versement_en_revue'',''termine'',''annule'',''rembourse'')');
  EXECUTE v_def;
END $$;