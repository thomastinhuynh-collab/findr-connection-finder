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
  IF NEW.product_link IS DISTINCT FROM OLD.product_link OR NEW.object_size IS DISTINCT FROM OLD.object_size
     OR NEW.source_lang IS DISTINCT FROM OLD.source_lang THEN
    RAISE EXCEPTION 'proposal_immutable';
  END IF;

  IF v_uid = OLD.findr_id THEN
    IF OLD.status IS DISTINCT FROM 'pending' THEN RAISE EXCEPTION 'proposal_immutable'; END IF;
    IF NEW.status IS DISTINCT FROM OLD.status AND NEW.status IS DISTINCT FROM 'withdrawn' THEN
      RAISE EXCEPTION 'proposal_immutable';
    END IF;
    -- Contenu figé dès qu'un paiement a commencé (réservation liée avec payment_status renseigné)
    IF (NEW.title IS DISTINCT FROM OLD.title OR NEW.description IS DISTINCT FROM OLD.description
        OR NEW.proposed_price IS DISTINCT FROM OLD.proposed_price OR NEW.image_urls IS DISTINCT FROM OLD.image_urls
        OR NEW.parcel_weight_kg IS DISTINCT FROM OLD.parcel_weight_kg)
       AND EXISTS (SELECT 1 FROM public.reservations r WHERE r.proposal_id = OLD.id AND r.payment_status IS NOT NULL) THEN
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