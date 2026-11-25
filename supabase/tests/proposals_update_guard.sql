-- Vérifie guard_proposal_update et withdraw_proposal avec des données fictives,
-- toutes annulées par le ROLLBACK final : aucune donnée existante n'est modifiée.
BEGIN;
DO $$
DECLARE
  b uuid := gen_random_uuid(); f uuid := gen_random_uuid(); x uuid := gen_random_uuid();
  s uuid; p uuid; ok boolean;
BEGIN
  INSERT INTO public.searches (user_id, title, category, budget_min, budget_max) VALUES (b, 'Test garde', 'mode', 0, 100) RETURNING id INTO s;
  INSERT INTO public.proposals (search_id, findr_id, title, proposed_price, status, parcel_weight_kg) VALUES (s, f, 'P', 10, 'pending', 1) RETURNING id INTO p;

  -- findr : contenu modifiable si pending
  PERFORM set_config('request.jwt.claims', json_build_object('sub', f)::text, true);
  UPDATE public.proposals SET title = 'P2', proposed_price = 12, parcel_weight_kg = 2 WHERE id = p;
  -- findr : interdits
  ok := false; BEGIN UPDATE public.proposals SET status = 'accepted_pending' WHERE id = p; EXCEPTION WHEN raise_exception THEN ok := SQLERRM = 'proposal_immutable'; END;
  IF NOT ok THEN RAISE EXCEPTION 'ÉCHEC findr pending→accepted_pending'; END IF;
  ok := false; BEGIN UPDATE public.proposals SET findr_id = x WHERE id = p; EXCEPTION WHEN raise_exception THEN ok := true; END;
  IF NOT ok THEN RAISE EXCEPTION 'ÉCHEC findr change findr_id'; END IF;
  ok := false; BEGIN UPDATE public.proposals SET search_id = gen_random_uuid() WHERE id = p; EXCEPTION WHEN raise_exception THEN ok := true; END;
  IF NOT ok THEN RAISE EXCEPTION 'ÉCHEC findr change search_id'; END IF;

  -- propriétaire : seulement pending→rejected
  PERFORM set_config('request.jwt.claims', json_build_object('sub', b)::text, true);
  ok := false; BEGIN UPDATE public.proposals SET proposed_price = 1 WHERE id = p; EXCEPTION WHEN raise_exception THEN ok := true; END;
  IF NOT ok THEN RAISE EXCEPTION 'ÉCHEC buyr change prix'; END IF;
  ok := false; BEGIN UPDATE public.proposals SET status = 'accepted_pending' WHERE id = p; EXCEPTION WHEN raise_exception THEN ok := true; END;
  IF NOT ok THEN RAISE EXCEPTION 'ÉCHEC buyr pending→accepted_pending'; END IF;
  -- tiers
  PERFORM set_config('request.jwt.claims', json_build_object('sub', x)::text, true);
  ok := false; BEGIN UPDATE public.proposals SET status = 'rejected' WHERE id = p; EXCEPTION WHEN raise_exception THEN ok := true; END;
  IF NOT ok THEN RAISE EXCEPTION 'ÉCHEC tiers modifie'; END IF;
  ok := false; BEGIN PERFORM public.withdraw_proposal(p); EXCEPTION WHEN raise_exception THEN ok := SQLERRM = 'not_owner'; END;
  IF NOT ok THEN RAISE EXCEPTION 'ÉCHEC tiers annule'; END IF;

  -- checkout en cours bloque l'annulation
  PERFORM set_config('request.jwt.claims', '', true);
  INSERT INTO public.reservations (search_id, findr_id, buyr_id, justification, requested_duration_days, status, proposal_id, payment_status)
    VALUES (s, f, b, 't', 1, 'approved', p, 'en_attente_paiement');
  PERFORM set_config('request.jwt.claims', json_build_object('sub', f)::text, true);
  ok := false; BEGIN PERFORM public.withdraw_proposal(p); EXCEPTION WHEN raise_exception THEN ok := SQLERRM = 'checkout_in_progress'; END;
  IF NOT ok THEN RAISE EXCEPTION 'ÉCHEC annulation pendant paiement'; END IF;
  -- paiement commencé : contenu figé même si la proposition est encore pending
  ok := false; BEGIN UPDATE public.proposals SET title = 'Modifié' WHERE id = p; EXCEPTION WHEN raise_exception THEN ok := SQLERRM = 'proposal_immutable'; END;
  IF NOT ok THEN RAISE EXCEPTION 'ÉCHEC titre modifié pendant paiement'; END IF;
  ok := false; BEGIN UPDATE public.proposals SET description = 'x' WHERE id = p; EXCEPTION WHEN raise_exception THEN ok := SQLERRM = 'proposal_immutable'; END;
  IF NOT ok THEN RAISE EXCEPTION 'ÉCHEC description modifiée pendant paiement'; END IF;
  ok := false; BEGIN UPDATE public.proposals SET proposed_price = 99 WHERE id = p; EXCEPTION WHEN raise_exception THEN ok := SQLERRM = 'proposal_immutable'; END;
  IF NOT ok THEN RAISE EXCEPTION 'ÉCHEC prix modifié pendant paiement'; END IF;
  ok := false; BEGIN UPDATE public.proposals SET image_urls = ARRAY['x'] WHERE id = p; EXCEPTION WHEN raise_exception THEN ok := SQLERRM = 'proposal_immutable'; END;
  IF NOT ok THEN RAISE EXCEPTION 'ÉCHEC photos modifiées pendant paiement'; END IF;
  ok := false; BEGIN UPDATE public.proposals SET parcel_weight_kg = 5 WHERE id = p; EXCEPTION WHEN raise_exception THEN ok := SQLERRM = 'proposal_immutable'; END;
  IF NOT ok THEN RAISE EXCEPTION 'ÉCHEC poids modifié pendant paiement'; END IF;
  PERFORM set_config('request.jwt.claims', '', true);
  DELETE FROM public.reservations WHERE proposal_id = p;
  -- réservation sans payment_status : modification de nouveau permise
  INSERT INTO public.reservations (search_id, findr_id, buyr_id, justification, requested_duration_days, status, proposal_id, payment_status)
    VALUES (s, f, b, 't', 1, 'approved', p, NULL);
  PERFORM set_config('request.jwt.claims', json_build_object('sub', f)::text, true);
  UPDATE public.proposals SET title = 'Sans paiement' WHERE id = p;
  PERFORM set_config('request.jwt.claims', '', true);
  DELETE FROM public.reservations WHERE proposal_id = p;

  -- annulation permise + notification
  PERFORM set_config('request.jwt.claims', json_build_object('sub', f)::text, true);
  PERFORM public.withdraw_proposal(p);
  IF (SELECT status FROM public.proposals WHERE id = p) <> 'withdrawn' THEN RAISE EXCEPTION 'ÉCHEC statut withdrawn'; END IF;
  IF NOT EXISTS (SELECT 1 FROM public.notifications WHERE user_id = b AND type = 'proposal_withdrawn'
     AND link = '/messagerie/' || s || '?with=' || f) THEN RAISE EXCEPTION 'ÉCHEC notification'; END IF;
  ok := false; BEGIN PERFORM public.withdraw_proposal(p); EXCEPTION WHEN raise_exception THEN ok := SQLERRM = 'not_pending'; END;
  IF NOT ok THEN RAISE EXCEPTION 'ÉCHEC double annulation'; END IF;
  ok := false; BEGIN UPDATE public.proposals SET title = 'Z' WHERE id = p; EXCEPTION WHEN raise_exception THEN ok := true; END;
  IF NOT ok THEN RAISE EXCEPTION 'ÉCHEC findr modifie après annulation'; END IF;

  -- propriétaire refuse une proposition pending (ProposalList)
  PERFORM set_config('request.jwt.claims', '', true);
  INSERT INTO public.proposals (search_id, findr_id, title, proposed_price, status, parcel_weight_kg) VALUES (s, f, 'Q', 10, 'pending', 1) RETURNING id INTO p;
  PERFORM set_config('request.jwt.claims', json_build_object('sub', b)::text, true);
  UPDATE public.proposals SET status = 'rejected' WHERE id = p;
  ok := false; BEGIN UPDATE public.proposals SET status = 'pending' WHERE id = p; EXCEPTION WHEN raise_exception THEN ok := true; END;
  IF NOT ok THEN RAISE EXCEPTION 'ÉCHEC buyr rejected→pending'; END IF;

  -- serveur (sans utilisateur) : libre (webhook, versement, remboursement, litige)
  PERFORM set_config('request.jwt.claims', '', true);
  UPDATE public.proposals SET status = 'accepted_pending' WHERE id = p;
  UPDATE public.proposals SET status = 'completed' WHERE id = p;
  UPDATE public.proposals SET status = 'cancelled' WHERE id = p;
  RAISE NOTICE 'proposals_update_guard : tous les tests passent';
END $$;
ROLLBACK;
