-- Create reservations table
CREATE TABLE public.reservations (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    search_id UUID NOT NULL REFERENCES public.searches(id) ON DELETE CASCADE,
    findr_id UUID NOT NULL,
    buyr_id UUID NOT NULL,
    justification TEXT NOT NULL,
    requested_duration_days INTEGER NOT NULL DEFAULT 7,
    approved_duration_days INTEGER,
    status TEXT NOT NULL DEFAULT 'pending',
    expires_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    CONSTRAINT valid_status CHECK (status IN ('pending', 'approved', 'rejected', 'expired', 'cancelled'))
);

-- Enable RLS
ALTER TABLE public.reservations ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Findrs can create reservations"
ON public.reservations FOR INSERT
WITH CHECK (auth.uid() = findr_id);

CREATE POLICY "Users can view reservations they're involved in"
ON public.reservations FOR SELECT
USING (auth.uid() = findr_id OR auth.uid() = buyr_id);

CREATE POLICY "Findrs can update their pending reservations"
ON public.reservations FOR UPDATE
USING (auth.uid() = findr_id AND status = 'pending');

CREATE POLICY "Buyrs can update reservation status"
ON public.reservations FOR UPDATE
USING (auth.uid() = buyr_id);

CREATE POLICY "Findrs can cancel their reservations"
ON public.reservations FOR DELETE
USING (auth.uid() = findr_id AND status = 'pending');

-- Trigger for updated_at
CREATE TRIGGER update_reservations_updated_at
BEFORE UPDATE ON public.reservations
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Enable realtime for reservations
ALTER PUBLICATION supabase_realtime ADD TABLE public.reservations;