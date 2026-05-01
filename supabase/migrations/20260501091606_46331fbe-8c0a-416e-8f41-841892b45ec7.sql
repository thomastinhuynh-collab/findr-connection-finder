CREATE TABLE public.ab_events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  experiment TEXT NOT NULL,
  variant TEXT NOT NULL CHECK (variant IN ('A','B')),
  event_type TEXT NOT NULL CHECK (event_type IN ('view','click')),
  cta TEXT,
  session_id TEXT NOT NULL,
  user_id UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE INDEX idx_ab_events_exp_variant ON public.ab_events(experiment, variant);
CREATE INDEX idx_ab_events_created_at ON public.ab_events(created_at DESC);

ALTER TABLE public.ab_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can insert ab events"
ON public.ab_events
FOR INSERT
WITH CHECK (true);

CREATE POLICY "Authenticated users can read ab events"
ON public.ab_events
FOR SELECT
USING (auth.uid() IS NOT NULL);