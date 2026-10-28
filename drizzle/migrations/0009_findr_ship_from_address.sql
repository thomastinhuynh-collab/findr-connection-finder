ALTER TABLE public.profiles
  ADD COLUMN ship_from_first_name text,
  ADD COLUMN ship_from_last_name text,
  ADD COLUMN ship_from_street text,
  ADD COLUMN ship_from_postal_code text,
  ADD COLUMN ship_from_city text,
  ADD COLUMN ship_from_country text NOT NULL DEFAULT 'FR',
  ADD COLUMN ship_from_updated_at timestamptz;

ALTER TABLE public.reservations
  ADD COLUMN ship_from jsonb,
  ADD COLUMN label_provided_at timestamptz;

CREATE OR REPLACE FUNCTION public.get_my_profile()
 RETURNS profiles LANGUAGE sql STABLE SECURITY DEFINER SET search_path TO 'public'
AS $$ SELECT p.* FROM public.profiles p WHERE p.user_id = auth.uid() $$;
REVOKE EXECUTE ON FUNCTION public.get_my_profile() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.get_my_profile() TO authenticated;

CREATE OR REPLACE FUNCTION public.update_ship_from(_first_name text, _last_name text, _street text, _postal_code text, _city text, _country text DEFAULT 'FR')
 RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public'
AS $$
DECLARE
  v_uid uuid := auth.uid();
  v_name_re text := '^[[:alpha:]][[:alpha:][:space:]''’-]{1,59}$';
BEGIN
  IF v_uid IS NULL THEN RAISE EXCEPTION 'not_authenticated'; END IF;
  _first_name := btrim(coalesce(_first_name, ''));
  _last_name := btrim(coalesce(_last_name, ''));
  _street := btrim(coalesce(_street, ''));
  _postal_code := btrim(coalesce(_postal_code, ''));
  _city := btrim(coalesce(_city, ''));
  _country := upper(btrim(coalesce(_country, 'FR')));
  IF _first_name !~ v_name_re THEN RAISE EXCEPTION 'invalid_first_name'; END IF;
  IF _last_name !~ v_name_re THEN RAISE EXCEPTION 'invalid_last_name'; END IF;
  IF char_length(_street) < 3 OR char_length(_street) > 120 THEN RAISE EXCEPTION 'invalid_street'; END IF;
  IF _postal_code !~ '^[0-9]{5}$' THEN RAISE EXCEPTION 'invalid_postal_code'; END IF;
  IF char_length(_city) < 2 OR char_length(_city) > 80 THEN RAISE EXCEPTION 'invalid_city'; END IF;
  IF _country <> 'FR' THEN RAISE EXCEPTION 'invalid_country'; END IF;
  UPDATE public.profiles SET
    ship_from_first_name = _first_name, ship_from_last_name = _last_name,
    ship_from_street = _street, ship_from_postal_code = _postal_code,
    ship_from_city = _city, ship_from_country = _country, ship_from_updated_at = now()
  WHERE user_id = v_uid;
  IF NOT FOUND THEN RAISE EXCEPTION 'profile_not_found'; END IF;
END;
$$;
REVOKE EXECUTE ON FUNCTION public.update_ship_from(text, text, text, text, text, text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.update_ship_from(text, text, text, text, text, text) TO authenticated;

CREATE OR REPLACE FUNCTION public.guard_tracking_evidence()
 RETURNS trigger LANGUAGE plpgsql SET search_path TO 'public'
AS $function$
BEGIN
 IF current_user IN ('anon', 'authenticated') THEN
   IF TG_OP = 'INSERT' THEN
     IF NEW.tracking_recognized OR NEW.tracking_first_event_at IS NOT NULL OR NEW.tracking_checked_at IS NOT NULL OR NEW.tracking_review_notified_at IS NOT NULL OR NEW.tracking_number IS NOT NULL OR NEW.shipped_at IS NOT NULL OR NEW.delivered_at IS NOT NULL OR NEW.payment_status NOT IN ('pending') OR NEW.ship_from IS NOT NULL OR NEW.label_provided_at IS NOT NULL THEN
       RAISE EXCEPTION 'tracking_evidence_server_only';
     END IF;
   ELSIF NEW.tracking_recognized IS DISTINCT FROM OLD.tracking_recognized
     OR NEW.tracking_first_event_at IS DISTINCT FROM OLD.tracking_first_event_at
     OR NEW.tracking_checked_at IS DISTINCT FROM OLD.tracking_checked_at
     OR NEW.tracking_review_notified_at IS DISTINCT FROM OLD.tracking_review_notified_at
     OR NEW.tracking_number IS DISTINCT FROM OLD.tracking_number
     OR NEW.carrier IS DISTINCT FROM OLD.carrier
     OR NEW.shipped_at IS DISTINCT FROM OLD.shipped_at
     OR NEW.delivered_at IS DISTINCT FROM OLD.delivered_at
     OR NEW.payment_status IS DISTINCT FROM OLD.payment_status
     OR NEW.ship_from IS DISTINCT FROM OLD.ship_from
     OR NEW.label_provided_at IS DISTINCT FROM OLD.label_provided_at THEN
       RAISE EXCEPTION 'tracking_evidence_server_only';
   END IF;
 END IF;
 RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.purge_reservation_ship_from()
 RETURNS integer LANGUAGE sql SECURITY DEFINER SET search_path TO 'public'
AS $$
  WITH done AS (
    UPDATE public.reservations SET ship_from = NULL
    WHERE ship_from IS NOT NULL AND (
      (label_provided_at IS NOT NULL AND label_provided_at < now() - interval '7 days')
      OR (label_provided_at IS NULL AND payment_status IN ('termine', 'annule', 'rembourse')
          AND coalesce(dispute_resolved_at, updated_at) < now() - interval '30 days')
    ) RETURNING 1)
  SELECT count(*)::int FROM done;
$$;
REVOKE EXECUTE ON FUNCTION public.purge_reservation_ship_from() FROM PUBLIC, anon, authenticated;