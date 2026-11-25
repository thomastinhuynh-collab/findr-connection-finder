-- Vérifie list_my_exchanges / unread_exchanges_count sur des données fictives.
-- Tout se passe dans un bloc qui lève une exception finale : rien n'est conservé.
DO $$
DECLARE
  b uuid := gen_random_uuid(); f1 uuid := gen_random_uuid(); f2 uuid := gen_random_uuid();
  f3 uuid := gen_random_uuid(); f4 uuid := gen_random_uuid();
  s uuid; p uuid; n int; r record;
BEGIN
  INSERT INTO public.searches (user_id, title, category, budget_min, budget_max, status)
    VALUES (b, 'zz test échanges', 'autre', 0, 100, 'closed') RETURNING id INTO s;
  -- 1. deux findrs écrivent sur la même recherche (f1 : 130 messages)
  INSERT INTO public.messages (search_id, sender_id, receiver_id, content, is_read, created_at)
    SELECT s, f1, b, 'msg ' || g, false, now() - interval '1 hour' + g * interval '1 second' FROM generate_series(1,130) g;
  INSERT INTO public.messages (search_id, sender_id, receiver_id, content, is_read) VALUES (s, f2, b, 'bonjour', true);
  -- 2. proposition seule
  INSERT INTO public.proposals (search_id, findr_id, title, proposed_price, status) VALUES (s, f3, 'objet', 42, 'pending');
  -- 3. réservation seule
  INSERT INTO public.reservations (search_id, findr_id, buyr_id, justification, requested_duration_days, status, expires_at)
    VALUES (s, f4, b, 'test', 3, 'approved', now() + interval '2 days');
  -- 4. vente payée (f2)
  INSERT INTO public.proposals (search_id, findr_id, title, proposed_price, status) VALUES (s, f2, 'objet', 50, 'accepted_pending') RETURNING id INTO p;
  INSERT INTO public.reservations (search_id, findr_id, buyr_id, justification, requested_duration_days, status, proposal_id, object_price, payment_status)
    VALUES (s, f2, b, 'achat', 1, 'approved', p, 50, 'paye_en_attente_reception');

  PERFORM set_config('request.jwt.claims', json_build_object('sub', b, 'role', 'authenticated')::text, true);
  PERFORM set_config('role', 'authenticated', true);

  SELECT count(*) INTO n FROM public.list_my_exchanges('toutes', 100) e WHERE e.search_id = s;
  IF n <> 4 THEN RAISE EXCEPTION 'ÉCHEC : 4 échanges attendus, % obtenus', n; END IF;

  SELECT * INTO r FROM public.list_my_exchanges('toutes', 100) e WHERE e.search_id = s AND e.partner_id = f1;
  IF r.unread_count <> 130 OR r.kind <> 'message' OR r.last_message_preview <> 'msg 130' OR r.partner_role <> 'findr' THEN
    RAISE EXCEPTION 'ÉCHEC : échange de 130 messages incorrect (%)', row_to_json(r); END IF;
  SELECT * INTO r FROM public.list_my_exchanges('toutes', 100) e WHERE e.search_id = s AND e.partner_id = f3;
  IF r.kind <> 'proposition' OR r.amount <> 42 OR r.last_message_at IS NOT NULL OR NOT r.needs_action THEN
    RAISE EXCEPTION 'ÉCHEC : proposition seule incorrecte (%)', row_to_json(r); END IF;
  SELECT * INTO r FROM public.list_my_exchanges('toutes', 100) e WHERE e.search_id = s AND e.partner_id = f4;
  IF r.kind <> 'reservation' OR r.expires_at IS NULL THEN RAISE EXCEPTION 'ÉCHEC : réservation incorrecte (%)', row_to_json(r); END IF;
  SELECT * INTO r FROM public.list_my_exchanges('toutes', 100) e WHERE e.search_id = s AND e.partner_id = f2;
  IF r.kind <> 'vente' OR r.state <> 'paye_en_attente_reception' OR r.amount <> 50 OR r.needs_action THEN
    RAISE EXCEPTION 'ÉCHEC : vente payée incorrecte (%)', row_to_json(r); END IF;

  SELECT count(*) INTO n FROM public.list_my_exchanges('ventes_en_cours', 100) e WHERE e.search_id = s;
  IF n <> 1 THEN RAISE EXCEPTION 'ÉCHEC : filtre ventes_en_cours = %', n; END IF;
  SELECT count(*) INTO n FROM public.list_my_exchanges('en_attente', 100) e WHERE e.search_id = s;
  IF n <> 2 THEN RAISE EXCEPTION 'ÉCHEC : filtre en_attente = %', n; END IF;
  SELECT count(*) INTO n FROM public.list_my_exchanges('non_lus', 100) e WHERE e.search_id = s;
  IF n <> 1 THEN RAISE EXCEPTION 'ÉCHEC : filtre non_lus = %', n; END IF;
  IF public.unread_exchanges_count() <> 1 THEN RAISE EXCEPTION 'ÉCHEC : compteur non lus'; END IF;
  -- le non-lu passe en premier
  SELECT partner_id INTO r FROM public.list_my_exchanges('toutes', 1) e;
  IF r.partner_id <> f1 THEN RAISE EXCEPTION 'ÉCHEC : non lu pas en tête'; END IF;

  -- côté findr f1 : il ne voit que son échange
  PERFORM set_config('request.jwt.claims', json_build_object('sub', f1, 'role', 'authenticated')::text, true);
  SELECT count(*) INTO n FROM public.list_my_exchanges('toutes', 100);
  IF n <> 1 THEN RAISE EXCEPTION 'ÉCHEC : f1 voit % échanges', n; END IF;
  SELECT * INTO r FROM public.list_my_exchanges('toutes', 100);
  IF r.partner_role <> 'buyr' OR r.unread_count <> 0 THEN RAISE EXCEPTION 'ÉCHEC : vue findr'; END IF;

  RAISE EXCEPTION 'TESTS_OK';
END $$;
