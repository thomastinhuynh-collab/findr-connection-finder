-- Vérifie le masquage personnel des échanges sur des données fictives.
-- Chaque bloc se termine par une exception : aucune donnée de test n'est conservée.

-- Une vente payée non finalisée, litige ouvert compris, ne peut pas être masquée.
DO $$
DECLARE
  b uuid := gen_random_uuid(); f uuid := gen_random_uuid(); s uuid; p uuid; m uuid;
  failed boolean := false; err text; r record; n int;
BEGIN
  INSERT INTO public.searches (user_id, title, category, budget_min, budget_max, status)
    VALUES (b, 'zz test masquage vente en cours', 'autre', 0, 100, 'closed') RETURNING id INTO s;
  INSERT INTO public.proposals (search_id, findr_id, title, proposed_price, status)
    VALUES (s, f, 'objet', 60, 'accepted_pending') RETURNING id INTO p;
  INSERT INTO public.reservations (search_id, findr_id, buyr_id, justification, requested_duration_days, status, proposal_id, object_price, payment_status, dispute_open)
    VALUES (s, f, b, 'achat', 1, 'approved', p, 60, 'livre', true);
  INSERT INTO public.messages (search_id, sender_id, receiver_id, content, is_read)
    VALUES (s, f, b, 'message inchangé', false) RETURNING id INTO m;

  PERFORM set_config('request.jwt.claims', json_build_object('sub', b, 'role', 'authenticated')::text, true);
  PERFORM set_config('role', 'authenticated', true);
  BEGIN PERFORM public.hide_exchange(s, f); EXCEPTION WHEN OTHERS THEN err := SQLERRM; failed := SQLERRM = 'sale_in_progress'; END;
  IF NOT failed THEN RAISE EXCEPTION 'ÉCHEC : vente en cours masquée ou autre erreur (%)', coalesce(err, 'aucune'); END IF;
  SELECT count(*) INTO n FROM public.exchange_hidden WHERE user_id = b;
  IF n <> 0 THEN RAISE EXCEPTION 'ÉCHEC : ligne de masquage créée pendant une vente'; END IF;
  SELECT * INTO r FROM public.list_my_exchanges('ventes_en_cours', 100) e WHERE e.search_id = s;
  IF r.can_delete IS DISTINCT FROM false OR r.state <> 'litige' THEN RAISE EXCEPTION 'ÉCHEC : can_delete pendant une vente (%)', row_to_json(r); END IF;
  SELECT is_read INTO failed FROM public.messages WHERE id = m;
  IF failed THEN RAISE EXCEPTION 'ÉCHEC : message lu malgré le refus'; END IF;
  RAISE EXCEPTION 'TESTS_OK';
END $$;

-- Proposition en attente : masquage buyr, messages reçus marqués lus, contenu intact,
-- compteur à zéro et échange toujours visible par le findr.
DO $$
DECLARE
  b uuid := gen_random_uuid(); f uuid := gen_random_uuid(); s uuid; m uuid;
  before_row public.messages%ROWTYPE; after_row public.messages%ROWTYPE; n int; write_refused boolean := false;
BEGIN
  INSERT INTO public.searches (user_id, title, category, budget_min, budget_max, status)
    VALUES (b, 'zz test masquage proposition', 'autre', 0, 100, 'active') RETURNING id INTO s;
  INSERT INTO public.proposals (search_id, findr_id, title, proposed_price, status)
    VALUES (s, f, 'objet', 42, 'pending');
  INSERT INTO public.messages (search_id, sender_id, receiver_id, content, is_read)
    VALUES (s, f, b, 'contenu à conserver', false) RETURNING id INTO m;
  SELECT * INTO before_row FROM public.messages WHERE id = m;

  PERFORM set_config('request.jwt.claims', json_build_object('sub', b, 'role', 'authenticated')::text, true);
  PERFORM set_config('role', 'authenticated', true);
  BEGIN
    INSERT INTO public.exchange_hidden (user_id, search_id, partner_id) VALUES (b, s, f);
  EXCEPTION WHEN insufficient_privilege THEN write_refused := true;
  END;
  IF NOT write_refused THEN RAISE EXCEPTION 'ÉCHEC : écriture directe acceptée dans exchange_hidden'; END IF;
  PERFORM public.hide_exchange(s, f);
  SELECT * INTO after_row FROM public.messages WHERE id = m;
  IF after_row.is_read IS NOT TRUE OR to_jsonb(after_row) - 'is_read' IS DISTINCT FROM to_jsonb(before_row) - 'is_read' THEN
    RAISE EXCEPTION 'ÉCHEC : un message a été modifié au-delà de is_read';
  END IF;
  SELECT count(*) INTO n FROM public.list_my_exchanges('toutes', 100) e WHERE e.search_id = s;
  IF n <> 0 OR public.unread_exchanges_count() <> 0 THEN RAISE EXCEPTION 'ÉCHEC : échange ou non lu encore visible'; END IF;

  PERFORM set_config('request.jwt.claims', json_build_object('sub', f, 'role', 'authenticated')::text, true);
  PERFORM set_config('role', 'authenticated', true);
  SELECT count(*) INTO n FROM public.exchange_hidden;
  IF n <> 0 THEN RAISE EXCEPTION 'ÉCHEC : masquage buyr visible par le findr'; END IF;
  SELECT count(*) INTO n FROM public.list_my_exchanges('en_attente', 100) e WHERE e.search_id = s AND e.partner_id = b;
  IF n <> 1 THEN RAISE EXCEPTION 'ÉCHEC : échange disparu pour l’autre personne'; END IF;
  RAISE EXCEPTION 'TESTS_OK';
END $$;

-- Proposition annulée côté buyr et refusée côté findr : les deux peuvent masquer.
DO $$
DECLARE
  b uuid := gen_random_uuid(); f1 uuid := gen_random_uuid(); f2 uuid := gen_random_uuid(); s uuid; n int;
BEGIN
  INSERT INTO public.searches (user_id, title, category, budget_min, budget_max, status)
    VALUES (b, 'zz test propositions terminées', 'autre', 0, 100, 'active') RETURNING id INTO s;
  INSERT INTO public.proposals (search_id, findr_id, title, proposed_price, status)
    VALUES (s, f1, 'annulée', 40, 'withdrawn'), (s, f2, 'refusée', 45, 'rejected');
  PERFORM set_config('request.jwt.claims', json_build_object('sub', b, 'role', 'authenticated')::text, true);
  PERFORM set_config('role', 'authenticated', true);
  PERFORM public.hide_exchange(s, f1);
  PERFORM set_config('request.jwt.claims', json_build_object('sub', f2, 'role', 'authenticated')::text, true);
  PERFORM set_config('role', 'authenticated', true);
  PERFORM public.hide_exchange(s, b);
  SELECT count(*) INTO n FROM public.list_my_exchanges('toutes', 100) e WHERE e.search_id = s;
  IF n <> 0 THEN RAISE EXCEPTION 'ÉCHEC : proposition refusée visible chez le findr'; END IF;
  PERFORM set_config('request.jwt.claims', json_build_object('sub', b, 'role', 'authenticated')::text, true);
  PERFORM set_config('role', 'authenticated', true);
  SELECT count(*) INTO n FROM public.list_my_exchanges('toutes', 100) e WHERE e.search_id = s;
  IF n <> 1 THEN RAISE EXCEPTION 'ÉCHEC : l’autre échange finalisé devrait rester visible (%), un seul attendu', n; END IF;
  RAISE EXCEPTION 'TESTS_OK';
END $$;

-- Une vente finalisée peut être masquée et ne réapparaît pas sans nouvelle activité.
DO $$
DECLARE
  b uuid := gen_random_uuid(); f uuid := gen_random_uuid(); s uuid; p uuid; rid uuid; n int; can boolean;
BEGIN
  INSERT INTO public.searches (user_id, title, category, budget_min, budget_max, status)
    VALUES (b, 'zz test vente finalisée', 'autre', 0, 100, 'closed') RETURNING id INTO s;
  INSERT INTO public.proposals (search_id, findr_id, title, proposed_price, status)
    VALUES (s, f, 'objet', 50, 'completed') RETURNING id INTO p;
  INSERT INTO public.reservations (search_id, findr_id, buyr_id, justification, requested_duration_days, status, proposal_id, object_price, payment_status)
    VALUES (s, f, b, 'achat', 1, 'approved', p, 50, 'termine') RETURNING id INTO rid;
  PERFORM set_config('request.jwt.claims', json_build_object('sub', b, 'role', 'authenticated')::text, true);
  PERFORM set_config('role', 'authenticated', true);
  SELECT e.can_delete INTO can FROM public.list_my_exchanges('finalisees', 100) e WHERE e.search_id = s;
  IF can IS NOT TRUE THEN RAISE EXCEPTION 'ÉCHEC : vente finalisée non supprimable'; END IF;
  PERFORM public.hide_exchange(s, f);
  PERFORM set_config('role', 'postgres', true);
  UPDATE public.reservations SET updated_at = now() + interval '1 day' WHERE id = rid;
  PERFORM set_config('role', 'authenticated', true);
  SELECT count(*) INTO n FROM public.list_my_exchanges('toutes', 100) e WHERE e.search_id = s;
  IF n <> 0 THEN RAISE EXCEPTION 'ÉCHEC : vente finalisée masquée réapparue sans activité'; END IF;
  RAISE EXCEPTION 'TESTS_OK';
END $$;

-- Un nouveau message de l'autre personne fait réapparaître l'échange et son non lu.
DO $$
DECLARE
  b uuid := gen_random_uuid(); f uuid := gen_random_uuid(); s uuid; r record;
BEGIN
  INSERT INTO public.searches (user_id, title, category, budget_min, budget_max, status)
    VALUES (b, 'zz test retour message', 'autre', 0, 100, 'active') RETURNING id INTO s;
  INSERT INTO public.messages (search_id, sender_id, receiver_id, content, is_read)
    VALUES (s, f, b, 'ancien', false);
  PERFORM set_config('request.jwt.claims', json_build_object('sub', b, 'role', 'authenticated')::text, true);
  PERFORM set_config('role', 'authenticated', true);
  PERFORM public.hide_exchange(s, f);
  PERFORM set_config('role', 'postgres', true);
  INSERT INTO public.messages (search_id, sender_id, receiver_id, content, is_read, created_at)
    VALUES (s, f, b, 'nouveau', false, now() + interval '1 second');
  PERFORM set_config('role', 'authenticated', true);
  SELECT * INTO r FROM public.list_my_exchanges('non_lus', 100) e WHERE e.search_id = s;
  IF r.partner_id IS DISTINCT FROM f OR r.unread_count <> 1 OR r.last_message_preview <> 'nouveau' OR NOT r.can_delete THEN
    RAISE EXCEPTION 'ÉCHEC : réapparition par message (%)', row_to_json(r); END IF;
  IF public.unread_exchanges_count() <> 1 THEN RAISE EXCEPTION 'ÉCHEC : compteur après réapparition'; END IF;
  RAISE EXCEPTION 'TESTS_OK';
END $$;

-- Une nouvelle proposition du partenaire fait réapparaître l'échange dans En attente.
DO $$
DECLARE
  b uuid := gen_random_uuid(); f uuid := gen_random_uuid(); s uuid; r record;
BEGIN
  INSERT INTO public.searches (user_id, title, category, budget_min, budget_max, status)
    VALUES (b, 'zz test retour proposition', 'autre', 0, 100, 'active') RETURNING id INTO s;
  INSERT INTO public.proposals (search_id, findr_id, title, proposed_price, status, created_at)
    VALUES (s, f, 'ancienne', 40, 'rejected', now() - interval '1 hour');
  PERFORM set_config('request.jwt.claims', json_build_object('sub', b, 'role', 'authenticated')::text, true);
  PERFORM set_config('role', 'authenticated', true);
  PERFORM public.hide_exchange(s, f);
  PERFORM set_config('role', 'postgres', true);
  INSERT INTO public.proposals (search_id, findr_id, title, proposed_price, status, created_at)
    VALUES (s, f, 'nouvelle', 45, 'pending', now() + interval '1 second');
  PERFORM set_config('role', 'authenticated', true);
  SELECT * INTO r FROM public.list_my_exchanges('en_attente', 100) e WHERE e.search_id = s;
  IF r.kind IS DISTINCT FROM 'proposition' OR r.state <> 'proposition_pending' OR r.amount <> 45 OR NOT r.can_delete THEN
    RAISE EXCEPTION 'ÉCHEC : réapparition par nouvelle proposition (%)', row_to_json(r); END IF;
  RAISE EXCEPTION 'TESTS_OK';
END $$;

-- Une nouvelle réservation du partenaire fait également réapparaître l'échange.
DO $$
DECLARE
  b uuid := gen_random_uuid(); f uuid := gen_random_uuid(); s uuid; r record;
BEGIN
  INSERT INTO public.searches (user_id, title, category, budget_min, budget_max, status)
    VALUES (b, 'zz test retour réservation', 'autre', 0, 100, 'active') RETURNING id INTO s;
  INSERT INTO public.messages (search_id, sender_id, receiver_id, content, is_read)
    VALUES (s, f, b, 'bonjour', true);
  PERFORM set_config('request.jwt.claims', json_build_object('sub', b, 'role', 'authenticated')::text, true);
  PERFORM set_config('role', 'authenticated', true);
  PERFORM public.hide_exchange(s, f);
  PERFORM set_config('role', 'postgres', true);
  INSERT INTO public.reservations (search_id, findr_id, buyr_id, justification, requested_duration_days, status, created_at)
    VALUES (s, f, b, 'nouvelle exclusivité', 3, 'pending', now() + interval '1 second');
  PERFORM set_config('role', 'authenticated', true);
  SELECT * INTO r FROM public.list_my_exchanges('en_attente', 100) e WHERE e.search_id = s;
  IF r.kind IS DISTINCT FROM 'reservation' OR r.state <> 'exclusivite_pending' OR NOT r.can_delete THEN
    RAISE EXCEPTION 'ÉCHEC : réapparition par nouvelle réservation (%)', row_to_json(r); END IF;
  RAISE EXCEPTION 'TESTS_OK';
END $$;

-- Une proposition masquée puis acceptée et payée réapparaît et redevient non supprimable.
DO $$
DECLARE
  b uuid := gen_random_uuid(); f uuid := gen_random_uuid(); s uuid; p uuid; r record;
BEGIN
  INSERT INTO public.searches (user_id, title, category, budget_min, budget_max, status)
    VALUES (b, 'zz test retour paiement', 'autre', 0, 100, 'active') RETURNING id INTO s;
  INSERT INTO public.proposals (search_id, findr_id, title, proposed_price, status, created_at)
    VALUES (s, f, 'objet', 55, 'pending', now() - interval '1 hour') RETURNING id INTO p;
  PERFORM set_config('request.jwt.claims', json_build_object('sub', b, 'role', 'authenticated')::text, true);
  PERFORM set_config('role', 'authenticated', true);
  PERFORM public.hide_exchange(s, f);
  PERFORM set_config('request.jwt.claims', '{}', true);
  PERFORM set_config('role', 'postgres', true);
  UPDATE public.proposals SET status = 'accepted_pending' WHERE id = p;
  INSERT INTO public.reservations (search_id, findr_id, buyr_id, justification, requested_duration_days, status, proposal_id, object_price, payment_status, created_at)
    VALUES (s, f, b, 'achat', 1, 'approved', p, 55, 'paye_en_attente_reception', now() - interval '30 minutes');
  PERFORM set_config('request.jwt.claims', json_build_object('sub', b, 'role', 'authenticated')::text, true);
  PERFORM set_config('role', 'authenticated', true);
  SELECT * INTO r FROM public.list_my_exchanges('ventes_en_cours', 100) e WHERE e.search_id = s;
  IF r.kind IS DISTINCT FROM 'vente' OR r.state <> 'paye_en_attente_reception' OR r.can_delete IS DISTINCT FROM false THEN
    RAISE EXCEPTION 'ÉCHEC : réapparition après paiement (%)', row_to_json(r); END IF;
  RAISE EXCEPTION 'TESTS_OK';
END $$;
