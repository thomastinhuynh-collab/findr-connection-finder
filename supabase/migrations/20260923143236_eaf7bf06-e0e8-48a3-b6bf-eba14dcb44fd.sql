-- 1. PROFILS : privilèges au niveau colonne
REVOKE SELECT, UPDATE, INSERT ON public.profiles FROM authenticated;
REVOKE SELECT, UPDATE, INSERT ON public.profiles FROM anon;

GRANT SELECT (id, user_id, full_name, avatar_url, bio, is_findr, xp_points, level, created_at, updated_at, is_premium, city, banner_url) ON public.profiles TO authenticated;
GRANT UPDATE (full_name, avatar_url, bio, is_findr, city, banner_url, updated_at) ON public.profiles TO authenticated;
GRANT INSERT (user_id, full_name, avatar_url, bio, is_findr, city, banner_url) ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;

-- Sa propre fiche, complète
CREATE OR REPLACE FUNCTION public.get_my_profile()
RETURNS public.profiles
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT p.* FROM public.profiles p WHERE p.user_id = auth.uid()
$$;

GRANT EXECUTE ON FUNCTION public.get_my_profile() TO authenticated;

-- Liste admin des soldes à recouvrer
CREATE OR REPLACE FUNCTION public.admin_negative_balance_profiles(_limit integer DEFAULT 25, _offset integer DEFAULT 0)
RETURNS TABLE (user_id uuid, full_name text, negative_balance numeric, payout_hold boolean)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'not_authorized';
  END IF;
  RETURN QUERY
    SELECT p.user_id, p.full_name, p.negative_balance, p.payout_hold
    FROM public.profiles p
    WHERE p.negative_balance > 0 OR p.payout_hold = true
    ORDER BY p.negative_balance DESC
    LIMIT GREATEST(_limit, 0) OFFSET GREATEST(_offset, 0);
END;
$$;

GRANT EXECUTE ON FUNCTION public.admin_negative_balance_profiles(integer, integer) TO authenticated;

-- 2. NOTIFICATIONS : insertion client limitée à soi-même
DROP POLICY IF EXISTS "Authenticated users can insert notifications" ON public.notifications;
CREATE POLICY "Users can insert their own notifications"
  ON public.notifications FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION public.create_notification(
  _user_id uuid,
  _type text,
  _title text,
  _message text DEFAULT NULL,
  _link text DEFAULT NULL
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_caller uuid := auth.uid();
  v_id uuid;
  v_related boolean;
BEGIN
  IF v_caller IS NULL THEN
    RAISE EXCEPTION 'not_authenticated';
  END IF;
  IF _user_id IS NULL OR _type IS NULL OR _title IS NULL THEN
    RAISE EXCEPTION 'invalid_arguments';
  END IF;

  IF _user_id = v_caller THEN
    v_related := true;
  ELSE
    SELECT
      EXISTS (
        SELECT 1 FROM public.proposals p
        JOIN public.searches s ON s.id = p.search_id
        WHERE (s.user_id = v_caller AND p.findr_id = _user_id)
           OR (s.user_id = _user_id AND p.findr_id = v_caller)
      )
      OR EXISTS (
        SELECT 1 FROM public.reservations r
        WHERE (r.buyr_id = v_caller AND r.findr_id = _user_id)
           OR (r.buyr_id = _user_id AND r.findr_id = v_caller)
      )
      OR EXISTS (
        SELECT 1 FROM public.messages m
        WHERE (m.sender_id = v_caller AND m.receiver_id = _user_id)
           OR (m.sender_id = _user_id AND m.receiver_id = v_caller)
      )
    INTO v_related;
  END IF;

  IF NOT v_related THEN
    RAISE EXCEPTION 'not_related';
  END IF;

  INSERT INTO public.notifications (user_id, type, title, message, link)
  VALUES (_user_id, left(_type, 60), left(_title, 200), left(_message, 500), left(_link, 300))
  RETURNING id INTO v_id;

  RETURN v_id;
END;
$$;

GRANT EXECUTE ON FUNCTION public.create_notification(uuid, text, text, text, text) TO authenticated;

-- 3. STOCKAGE : dépôt uniquement dans son propre dossier
DROP POLICY IF EXISTS "Authenticated users can upload search images" ON storage.objects;
CREATE POLICY "Users can upload search images in their own folder"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'search-images'
    AND (auth.uid())::text = (storage.foldername(name))[1]
  );