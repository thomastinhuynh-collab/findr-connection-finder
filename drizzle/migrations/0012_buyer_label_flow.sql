ALTER TABLE public.reservations
  ADD COLUMN IF NOT EXISTS label_path text,
  ADD COLUMN IF NOT EXISTS label_carrier text,
  ADD COLUMN IF NOT EXISTS label_tracking_number text,
  ADD COLUMN IF NOT EXISTS label_deadline_at timestamptz,
  ADD COLUMN IF NOT EXISTS label_rejected_at timestamptz,
  ADD COLUMN IF NOT EXISTS label_rejection_count integer NOT NULL DEFAULT 0;

CREATE OR REPLACE FUNCTION public.guard_tracking_evidence()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path TO 'public'
AS $function$
BEGIN
 IF current_user IN ('anon', 'authenticated') THEN
   IF TG_OP = 'INSERT' THEN
     IF NEW.tracking_recognized OR NEW.tracking_first_event_at IS NOT NULL OR NEW.tracking_checked_at IS NOT NULL OR NEW.tracking_review_notified_at IS NOT NULL OR NEW.tracking_number IS NOT NULL OR NEW.shipped_at IS NOT NULL OR NEW.delivered_at IS NOT NULL OR NEW.payment_status NOT IN ('pending') OR NEW.ship_from IS NOT NULL OR NEW.label_provided_at IS NOT NULL
       OR NEW.label_path IS NOT NULL OR NEW.label_carrier IS NOT NULL OR NEW.label_tracking_number IS NOT NULL OR NEW.label_deadline_at IS NOT NULL OR NEW.label_rejected_at IS NOT NULL OR NEW.label_rejection_count <> 0 THEN
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
     OR NEW.label_provided_at IS DISTINCT FROM OLD.label_provided_at
     OR NEW.label_path IS DISTINCT FROM OLD.label_path
     OR NEW.label_carrier IS DISTINCT FROM OLD.label_carrier
     OR NEW.label_tracking_number IS DISTINCT FROM OLD.label_tracking_number
     OR NEW.label_deadline_at IS DISTINCT FROM OLD.label_deadline_at
     OR NEW.label_rejected_at IS DISTINCT FROM OLD.label_rejected_at
     OR NEW.label_rejection_count IS DISTINCT FROM OLD.label_rejection_count THEN
       RAISE EXCEPTION 'tracking_evidence_server_only';
   END IF;
 END IF;
 RETURN NEW;
END;
$function$;

CREATE POLICY "Participants read reservation labels"
ON storage.objects FOR SELECT TO authenticated
USING (
  bucket_id = 'labels'
  AND EXISTS (
    SELECT 1 FROM public.reservations r
    WHERE r.id::text = (storage.foldername(objects.name))[1]
      AND (r.buyr_id = auth.uid() OR r.findr_id = auth.uid())
  )
);