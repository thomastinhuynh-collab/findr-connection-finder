ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS preferred_relay_point jsonb;
ALTER TABLE public.proposals ADD COLUMN IF NOT EXISTS object_size text;
ALTER TABLE public.proposals ADD CONSTRAINT proposals_object_size_check CHECK (object_size IS NULL OR object_size IN ('S','M','L','XL'));