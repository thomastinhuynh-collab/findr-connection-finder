ALTER TABLE public.reservations
  ADD COLUMN IF NOT EXISTS delivery_type text,
  ADD COLUMN IF NOT EXISTS delivery_address jsonb,
  ADD COLUMN IF NOT EXISTS delivery_relay_point jsonb;

ALTER TABLE public.reservations
  DROP CONSTRAINT IF EXISTS reservations_delivery_type_check;

ALTER TABLE public.reservations
  ADD CONSTRAINT reservations_delivery_type_check
  CHECK (delivery_type IS NULL OR delivery_type IN ('domicile', 'point_relais'));