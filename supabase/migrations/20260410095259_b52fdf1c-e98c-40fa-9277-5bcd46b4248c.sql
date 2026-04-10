
ALTER TABLE public.waitlist ADD COLUMN role text NOT NULL DEFAULT 'unknown';

-- Allow public to count waitlist entries
DROP POLICY IF EXISTS "No public read access" ON public.waitlist;
CREATE POLICY "Anyone can read waitlist count"
ON public.waitlist
FOR SELECT
USING (true);
