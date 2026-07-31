DROP POLICY IF EXISTS "Evaluations are viewable by everyone" ON public.evaluations;

CREATE POLICY "Authenticated users can view evaluations"
ON public.evaluations
FOR SELECT
TO authenticated
USING (true);

REVOKE SELECT ON public.evaluations FROM anon;
GRANT SELECT, INSERT ON public.evaluations TO authenticated;
GRANT ALL ON public.evaluations TO service_role;