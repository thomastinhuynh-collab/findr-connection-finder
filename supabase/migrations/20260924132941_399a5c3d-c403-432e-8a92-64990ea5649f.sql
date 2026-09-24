-- Public profile columns must be readable by visitors (anon) too,
-- same public column set already granted to authenticated.
GRANT SELECT (id, user_id, full_name, avatar_url, bio, is_findr, xp_points, level, created_at, updated_at, is_premium, city, banner_url) ON public.profiles TO anon;