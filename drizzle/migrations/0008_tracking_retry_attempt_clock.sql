ALTER TABLE public.reservations ADD COLUMN IF NOT EXISTS tracking_last_attempt_at timestamptz;
COMMENT ON COLUMN public.reservations.tracking_last_attempt_at IS 'Attempt clock for daily retries when provider is unavailable; tracking_checked_at remains null until a successful check.';
CREATE OR REPLACE FUNCTION public.guard_tracking_attempt_clock()
RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN
 IF current_user IN ('anon', 'authenticated') AND ((TG_OP = 'INSERT' AND NEW.tracking_last_attempt_at IS NOT NULL) OR (TG_OP = 'UPDATE' AND NEW.tracking_last_attempt_at IS DISTINCT FROM OLD.tracking_last_attempt_at)) THEN
   RAISE EXCEPTION 'tracking_evidence_server_only';
 END IF;
 RETURN NEW;
END;
$$;
CREATE TRIGGER guard_reservation_tracking_attempt_clock BEFORE INSERT OR UPDATE ON public.reservations FOR EACH ROW EXECUTE FUNCTION public.guard_tracking_attempt_clock();