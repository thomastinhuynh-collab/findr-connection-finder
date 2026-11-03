CREATE TABLE public.tracking_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  reservation_id uuid NOT NULL REFERENCES public.reservations(id) ON DELETE CASCADE,
  occurred_at timestamptz NOT NULL,
  status text NOT NULL DEFAULT '',
  description text NOT NULL DEFAULT '',
  location text,
  is_test boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX tracking_events_unique_event
  ON public.tracking_events (reservation_id, occurred_at, status, description);

GRANT SELECT ON public.tracking_events TO authenticated;
GRANT ALL ON public.tracking_events TO service_role;

ALTER TABLE public.tracking_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Participants can read tracking events"
  ON public.tracking_events FOR SELECT TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.reservations r
    WHERE r.id = tracking_events.reservation_id
      AND (r.buyr_id = auth.uid() OR r.findr_id = auth.uid())
  ));