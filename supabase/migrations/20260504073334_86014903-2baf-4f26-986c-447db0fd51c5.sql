-- 1. Restrict profiles SELECT to authenticated users
DROP POLICY IF EXISTS "Profiles are viewable by everyone" ON public.profiles;

CREATE POLICY "Authenticated users can view profiles"
ON public.profiles
FOR SELECT
TO authenticated
USING (true);

-- 2. Waitlist: remove public SELECT, expose only count via SECURITY DEFINER function
DROP POLICY IF EXISTS "Anyone can read waitlist count" ON public.waitlist;

CREATE OR REPLACE FUNCTION public.get_waitlist_count()
RETURNS integer
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COUNT(*)::int FROM public.waitlist;
$$;

GRANT EXECUTE ON FUNCTION public.get_waitlist_count() TO anon, authenticated;

-- 3. Add UPDATE policy on storage.objects for search-images bucket (owner only)
CREATE POLICY "Users can update their own search images"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'search-images'
  AND auth.uid()::text = (storage.foldername(name))[1]
)
WITH CHECK (
  bucket_id = 'search-images'
  AND auth.uid()::text = (storage.foldername(name))[1]
);