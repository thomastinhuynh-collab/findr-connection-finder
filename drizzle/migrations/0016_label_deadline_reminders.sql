ALTER TABLE public.reservations
  ADD COLUMN IF NOT EXISTS label_reminder_24h_at timestamptz,
  ADD COLUMN IF NOT EXISTS label_reminder_48h_at timestamptz;