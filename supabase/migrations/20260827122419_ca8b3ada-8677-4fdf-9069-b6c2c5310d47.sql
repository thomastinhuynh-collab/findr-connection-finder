ALTER TABLE public.reservations
  ADD COLUMN IF NOT EXISTS tracking_number text,
  ADD COLUMN IF NOT EXISTS carrier text,
  ADD COLUMN IF NOT EXISTS shipped_at timestamptz,
  ADD COLUMN IF NOT EXISTS delivered_at timestamptz,
  ADD COLUMN IF NOT EXISTS dispute_open boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS renewal_count integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS renewal_requested boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS accepted_at timestamptz,
  ADD COLUMN IF NOT EXISTS tracking_status text,
  ADD COLUMN IF NOT EXISTS lost_notified_at timestamptz,
  ADD COLUMN IF NOT EXISTS expired_without_proposal boolean NOT NULL DEFAULT false;

CREATE INDEX IF NOT EXISTS idx_reservations_tracking_number ON public.reservations (tracking_number);
CREATE INDEX IF NOT EXISTS idx_reservations_status ON public.reservations (status);