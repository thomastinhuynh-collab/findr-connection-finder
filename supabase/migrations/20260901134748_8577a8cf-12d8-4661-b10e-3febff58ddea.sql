ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS negative_balance numeric NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS payout_hold boolean NOT NULL DEFAULT false;

CREATE TABLE public.findr_debits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  findr_id uuid NOT NULL,
  reservation_id uuid REFERENCES public.reservations(id) ON DELETE SET NULL,
  amount numeric NOT NULL DEFAULT 0,
  reason text NOT NULL DEFAULT 'ajustement_admin',
  status text NOT NULL DEFAULT 'en_attente',
  stripe_dispute_id text,
  admin_notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  resolved_at timestamptz
);

CREATE INDEX idx_findr_debits_findr ON public.findr_debits(findr_id);
CREATE INDEX idx_findr_debits_status ON public.findr_debits(status);
CREATE UNIQUE INDEX idx_findr_debits_dispute ON public.findr_debits(stripe_dispute_id) WHERE stripe_dispute_id IS NOT NULL;

GRANT SELECT ON public.findr_debits TO authenticated;
GRANT ALL ON public.findr_debits TO service_role;

ALTER TABLE public.findr_debits ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Findrs can view their own debits"
  ON public.findr_debits FOR SELECT TO authenticated
  USING (auth.uid() = findr_id);

CREATE POLICY "Admins can view all debits"
  ON public.findr_debits FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update debits"
  ON public.findr_debits FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));
