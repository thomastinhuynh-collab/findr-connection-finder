ALTER TABLE public.reservations
  ADD COLUMN IF NOT EXISTS scan_reminder_2d_at timestamptz,
  ADD COLUMN IF NOT EXISTS scan_reminder_5d_at timestamptz;