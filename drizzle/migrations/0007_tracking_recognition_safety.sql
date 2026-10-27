ALTER TABLE public.reservations
  ADD COLUMN IF NOT EXISTS tracking_recognized boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS tracking_first_event_at timestamptz,
  ADD COLUMN IF NOT EXISTS tracking_checked_at timestamptz,
  ADD COLUMN IF NOT EXISTS tracking_review_notified_at timestamptz;

CREATE OR REPLACE FUNCTION public.tracking_carrier_key(value text)
RETURNS text LANGUAGE sql IMMUTABLE SET search_path = public AS $$
 SELECT CASE
 WHEN lower(btrim(value)) = 'ups' THEN 'ups'
 WHEN lower(value) LIKE '%mondial%' THEN 'mondial relay'
 WHEN lower(value) LIKE '%colissimo%' OR lower(btrim(value)) = 'la poste' THEN 'colissimo'
 WHEN lower(value) LIKE '%chronopost%' THEN 'chronopost'
 ELSE regexp_replace(lower(btrim(value)), '[[:space:]_-]+', ' ', 'g') END
$$;
ALTER TABLE public.reservations
  ADD COLUMN IF NOT EXISTS tracking_carrier_key text GENERATED ALWAYS AS (public.tracking_carrier_key(carrier)) STORED,
  ADD COLUMN IF NOT EXISTS tracking_number_key text GENERATED ALWAYS AS (upper(regexp_replace(tracking_number, '[[:space:]-]', '', 'g'))) STORED;
CREATE UNIQUE INDEX IF NOT EXISTS reservations_unique_carrier_tracking
 ON public.reservations (tracking_carrier_key, tracking_number_key)
 WHERE tracking_number_key IS NOT NULL;

CREATE OR REPLACE FUNCTION public.guard_tracking_evidence()
RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN
 IF current_user IN ('anon', 'authenticated') THEN
   IF TG_OP = 'INSERT' THEN
     IF NEW.tracking_recognized OR NEW.tracking_first_event_at IS NOT NULL OR NEW.tracking_checked_at IS NOT NULL OR NEW.tracking_review_notified_at IS NOT NULL OR NEW.tracking_number IS NOT NULL OR NEW.shipped_at IS NOT NULL OR NEW.delivered_at IS NOT NULL OR NEW.payment_status NOT IN ('pending') THEN
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
     OR NEW.payment_status IS DISTINCT FROM OLD.payment_status THEN
       RAISE EXCEPTION 'tracking_evidence_server_only';
   END IF;
 END IF;
 RETURN NEW;
END;
$$;
CREATE TRIGGER guard_reservation_tracking_evidence
 BEFORE INSERT OR UPDATE ON public.reservations
 FOR EACH ROW EXECUTE FUNCTION public.guard_tracking_evidence();
COMMENT ON COLUMN public.reservations.tracking_review_notified_at IS 'Persistent tracking review marker; automatic payout retries must not bypass this review.';