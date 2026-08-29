CREATE POLICY "Findrs can renew their approved reservations"
ON public.reservations
FOR UPDATE
TO authenticated
USING (auth.uid() = findr_id AND status = 'approved')
WITH CHECK (auth.uid() = findr_id AND status = 'approved' AND renewal_count <= 1);