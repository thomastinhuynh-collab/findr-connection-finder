ALTER TABLE public.proposals ADD COLUMN IF NOT EXISTS parcel_weight_kg numeric;
ALTER TABLE public.proposals ADD CONSTRAINT proposals_parcel_weight_kg_check CHECK (parcel_weight_kg IN (0.5, 1, 2, 5, 10)) NOT VALID;

CREATE TABLE public.shipping_rates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  carrier text NOT NULL,
  mode text NOT NULL CHECK (mode IN ('relais', 'domicile')),
  max_weight_kg numeric NOT NULL CHECK (max_weight_kg > 0),
  price_eur numeric NOT NULL CHECK (price_eur >= 0),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (carrier, mode, max_weight_kg)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.shipping_rates TO authenticated;
GRANT ALL ON public.shipping_rates TO service_role;
ALTER TABLE public.shipping_rates ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated can read shipping rates" ON public.shipping_rates FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins insert shipping rates" ON public.shipping_rates FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins update shipping rates" ON public.shipping_rates FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins delete shipping rates" ON public.shipping_rates FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE TRIGGER update_shipping_rates_updated_at BEFORE UPDATE ON public.shipping_rates FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();