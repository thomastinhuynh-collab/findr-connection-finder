ALTER TABLE public.reservations
  ADD COLUMN IF NOT EXISTS proposal_id uuid REFERENCES public.proposals(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS object_price numeric,
  ADD COLUMN IF NOT EXISTS buyr_fee numeric,
  ADD COLUMN IF NOT EXISTS findr_fee numeric,
  ADD COLUMN IF NOT EXISTS total_buyr_amount numeric,
  ADD COLUMN IF NOT EXISTS findr_payout_amount numeric,
  ADD COLUMN IF NOT EXISTS payment_status text,
  ADD COLUMN IF NOT EXISTS stripe_payment_intent_id text,
  ADD COLUMN IF NOT EXISTS stripe_transfer_id text;

CREATE TABLE IF NOT EXISTS public.transactions (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  findr_id uuid NOT NULL,
  reservation_id uuid REFERENCES public.reservations(id) ON DELETE SET NULL,
  amount numeric NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

GRANT SELECT ON public.transactions TO authenticated;
GRANT ALL ON public.transactions TO service_role;

ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Findrs can view their own transactions" ON public.transactions;
CREATE POLICY "Findrs can view their own transactions"
ON public.transactions FOR SELECT TO authenticated
USING (auth.uid() = findr_id);

CREATE INDEX IF NOT EXISTS transactions_findr_id_idx ON public.transactions (findr_id);