CREATE OR REPLACE FUNCTION public.guard_proposal_update()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public' AS $$
DECLARE
  v_uid uuid := auth.uid();
  v_owner uuid;
BEGIN
  IF v_uid IS NULL THEN RETURN NEW; END IF;
  IF NEW.id IS DISTINCT FROM OLD.id OR NEW.search_id IS DISTINCT FROM OLD.search_id
     OR NEW.findr_id IS DISTINCT FROM OLD.findr_id OR NEW.created_at IS DISTINCT FROM OLD.created_at THEN
    RAISE EXCEPTION 'proposal_immutable';
  END IF;
  -- Colonnes hors formulaire de modification : jamais modifiables par un utilisateur
  IF NEW.product_link IS DISTINCT FROM OLD.product_link OR NEW.object_size IS DISTINCT FROM OLD.object_size
     OR NEW.source_lang IS DISTINCT FROM OLD.source_lang THEN
    RAISE EXCEPTION 'proposal_immutable';
  END IF;

  IF v_uid = OLD.findr_id THEN
    IF OLD.status IS DISTINCT FROM 'pending' THEN RAISE EXCEPTION 'proposal_immutable'; END IF;
    IF NEW.status IS DISTINCT FROM OLD.status AND NEW.status IS DISTINCT FROM 'withdrawn' THEN
      RAISE EXCEPTION 'proposal_immutable';
    END IF;
    RETURN NEW;
  END IF;

  SELECT user_id INTO v_owner FROM public.searches WHERE id = OLD.search_id;
  IF v_uid = v_owner THEN
    IF NEW.title IS DISTINCT FROM OLD.title OR NEW.description IS DISTINCT FROM OLD.description
       OR NEW.proposed_price IS DISTINCT FROM OLD.proposed_price OR NEW.image_urls IS DISTINCT FROM OLD.image_urls
       OR NEW.parcel_weight_kg IS DISTINCT FROM OLD.parcel_weight_kg
       OR NOT (OLD.status = 'pending' AND NEW.status = 'rejected') THEN
      RAISE EXCEPTION 'proposal_immutable';
    END IF;
    RETURN NEW;
  END IF;

  RAISE EXCEPTION 'proposal_immutable';
END;
$$;

DROP TRIGGER IF EXISTS guard_proposal_update ON public.proposals;
CREATE TRIGGER guard_proposal_update BEFORE UPDATE ON public.proposals
FOR EACH ROW EXECUTE FUNCTION public.guard_proposal_update();

CREATE OR REPLACE FUNCTION public.withdraw_proposal(_proposal_id uuid)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public' AS $$
DECLARE
  v_uid uuid := auth.uid();
  v_p public.proposals%ROWTYPE;
  v_search record;
  v_name text;
BEGIN
  IF v_uid IS NULL THEN RAISE EXCEPTION 'not_authenticated'; END IF;
  SELECT * INTO v_p FROM public.proposals WHERE id = _proposal_id FOR UPDATE;
  IF NOT FOUND OR v_p.findr_id <> v_uid THEN RAISE EXCEPTION 'not_owner'; END IF;
  IF v_p.status IS DISTINCT FROM 'pending' THEN RAISE EXCEPTION 'not_pending'; END IF;
  IF EXISTS (
    SELECT 1 FROM public.reservations r WHERE r.proposal_id = _proposal_id
      AND r.payment_status IN ('en_attente_paiement','paye_attente_etiquette','etiquette_refusee',
        'paye_en_attente_reception','expedie','livre','versement_en_revue','termine')
  ) THEN RAISE EXCEPTION 'checkout_in_progress'; END IF;

  UPDATE public.proposals SET status = 'withdrawn' WHERE id = _proposal_id;

  SELECT id, user_id, title INTO v_search FROM public.searches WHERE id = v_p.search_id;
  SELECT NULLIF(split_part(btrim(coalesce(full_name, '')), ' ', 1), '') INTO v_name
    FROM public.profiles WHERE user_id = v_uid;

  INSERT INTO public.notifications (user_id, type, title, message, link)
  VALUES (v_search.user_id, 'proposal_withdrawn', 'Proposition annulée',
    left(coalesce(v_name, 'Le findr') || ' a annulé sa proposition pour « ' || v_search.title || ' ».', 500),
    '/messagerie/' || v_search.id || '?with=' || v_uid);
END;
$$;

REVOKE ALL ON FUNCTION public.withdraw_proposal(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.withdraw_proposal(uuid) TO authenticated;