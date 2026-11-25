-- Vérifie le déclencheur guard_message_update sans modifier aucune donnée :
-- chaque tentative s'exécute dans un sous-bloc annulé.
DO $$
DECLARE
  v_id uuid;
  v_ok boolean;
BEGIN
  SELECT id INTO v_id FROM public.messages LIMIT 1;
  IF v_id IS NULL THEN RAISE NOTICE 'aucun message, test ignoré'; RETURN; END IF;

  v_ok := false;
  BEGIN
    UPDATE public.messages SET content = content || ' falsifié' WHERE id = v_id;
  EXCEPTION WHEN raise_exception THEN v_ok := SQLERRM = 'message_immutable';
  END;
  IF NOT v_ok THEN RAISE EXCEPTION 'ÉCHEC : modification du contenu acceptée'; END IF;

  v_ok := false;
  BEGIN
    UPDATE public.messages SET sender_id = gen_random_uuid() WHERE id = v_id;
  EXCEPTION WHEN raise_exception THEN v_ok := true;
  END;
  IF NOT v_ok THEN RAISE EXCEPTION 'ÉCHEC : changement d''expéditeur accepté'; END IF;

  v_ok := false;
  BEGIN
    UPDATE public.messages SET is_read = true WHERE id = v_id;
    UPDATE public.messages SET is_read = false WHERE id = v_id;
  EXCEPTION WHEN raise_exception THEN v_ok := SQLERRM = 'message_read_irreversible';
  END;
  IF NOT v_ok THEN RAISE EXCEPTION 'ÉCHEC : retour à non lu accepté'; END IF;

  RAISE NOTICE 'OK : contenu et expéditeur verrouillés, lu irréversible';
END $$;
