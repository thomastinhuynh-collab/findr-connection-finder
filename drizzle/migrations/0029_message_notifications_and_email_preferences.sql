ALTER TABLE public.messages ADD COLUMN email_notified_at timestamptz;
ALTER TABLE public.profiles ADD COLUMN notify_message_emails boolean NOT NULL DEFAULT true;
CREATE INDEX messages_email_pending_idx ON public.messages(receiver_id, created_at) WHERE email_notified_at IS NULL AND is_read IS NOT TRUE;

CREATE OR REPLACE FUNCTION public.guard_message_update()
RETURNS trigger LANGUAGE plpgsql SET search_path TO 'public' AS $$
BEGIN
  IF NEW.id IS DISTINCT FROM OLD.id OR NEW.search_id IS DISTINCT FROM OLD.search_id
    OR NEW.sender_id IS DISTINCT FROM OLD.sender_id OR NEW.receiver_id IS DISTINCT FROM OLD.receiver_id
    OR NEW.content IS DISTINCT FROM OLD.content OR NEW.images IS DISTINCT FROM OLD.images
    OR NEW.created_at IS DISTINCT FROM OLD.created_at THEN
    RAISE EXCEPTION 'message_immutable';
  END IF;
  IF NEW.is_read IS DISTINCT FROM OLD.is_read AND NOT (COALESCE(OLD.is_read, false) = false AND NEW.is_read = true) THEN
    RAISE EXCEPTION 'message_read_irreversible';
  END IF;
  IF NEW.email_notified_at IS DISTINCT FROM OLD.email_notified_at
    AND NOT (auth.uid() IS NULL AND current_user IN ('postgres', 'service_role')) THEN
    RAISE EXCEPTION 'message_email_marker_server_only';
  END IF;
  RETURN NEW;
END $$;

CREATE FUNCTION public.notify_message_insert() RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public' AS $$
BEGIN
  INSERT INTO public.notifications(user_id, type, title, message, link)
  VALUES (NEW.receiver_id, 'new_message', 'Nouveau message', left(NEW.content, 120),
    '/messagerie/' || NEW.search_id::text || '?with=' || NEW.sender_id::text);
  RETURN NEW;
END $$;
REVOKE ALL ON FUNCTION public.notify_message_insert() FROM PUBLIC, anon, authenticated;
CREATE TRIGGER notify_message_insert AFTER INSERT ON public.messages FOR EACH ROW EXECUTE FUNCTION public.notify_message_insert();

CREATE FUNCTION public.update_message_email_preference(_enabled boolean) RETURNS boolean
LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public' AS $$
BEGIN
  IF auth.uid() IS NULL OR _enabled IS NULL THEN RAISE EXCEPTION 'unauthorized'; END IF;
  UPDATE public.profiles SET notify_message_emails = _enabled WHERE user_id = auth.uid();
  IF NOT FOUND THEN RAISE EXCEPTION 'profile_not_found'; END IF;
  RETURN _enabled;
END $$;
REVOKE ALL ON FUNCTION public.update_message_email_preference(boolean) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.update_message_email_preference(boolean) TO authenticated;

DO $$ BEGIN
  EXECUTE format('CREATE FUNCTION public.message_email_rollout_at() RETURNS timestamptz LANGUAGE sql IMMUTABLE SET search_path TO public AS %L',
    format('SELECT %L::timestamptz', clock_timestamp()));
END $$;
REVOKE ALL ON FUNCTION public.message_email_rollout_at() FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.message_email_rollout_at() TO service_role;

CREATE FUNCTION public.cleanup_message_email_markers(_at timestamptz DEFAULT now()) RETURNS integer
LANGUAGE plpgsql SET search_path TO 'public' AS $$
DECLARE n integer;
BEGIN
  IF auth.uid() IS NOT NULL OR current_user NOT IN ('postgres', 'service_role') THEN RAISE EXCEPTION 'unauthorized'; END IF;
  UPDATE public.messages m SET email_notified_at = _at WHERE m.email_notified_at IS NULL AND
    (m.created_at < public.message_email_rollout_at() OR m.is_read IS TRUE OR EXISTS
      (SELECT 1 FROM public.profiles p WHERE p.user_id=m.receiver_id AND NOT p.notify_message_emails));
  GET DIAGNOSTICS n = ROW_COUNT;
  RETURN n;
END $$;
REVOKE ALL ON FUNCTION public.cleanup_message_email_markers(timestamptz) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.cleanup_message_email_markers(timestamptz) TO service_role;

CREATE FUNCTION public.message_digest_recipients(_after uuid DEFAULT NULL, _at timestamptz DEFAULT now()) RETURNS SETOF uuid
LANGUAGE sql STABLE SET search_path TO 'public' AS $$
 SELECT DISTINCT m.receiver_id FROM public.messages m JOIN public.profiles p ON p.user_id=m.receiver_id
 WHERE m.email_notified_at IS NULL AND m.is_read IS NOT TRUE AND p.notify_message_emails
 AND m.created_at >= public.message_email_rollout_at() AND m.created_at < _at - interval '10 minutes'
 AND (_after IS NULL OR m.receiver_id > _after) ORDER BY m.receiver_id LIMIT 100
$$;
REVOKE ALL ON FUNCTION public.message_digest_recipients(uuid, timestamptz) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.message_digest_recipients(uuid, timestamptz) TO service_role;

CREATE FUNCTION public.message_digest_snapshot(_recipient uuid, _at timestamptz DEFAULT now()) RETURNS jsonb
LANGUAGE sql STABLE SET search_path TO 'public' AS $$
 SELECT COALESCE(jsonb_agg(row_to_json(rows) ORDER BY rows.created_at, rows.id), '[]'::jsonb) FROM
 (SELECT m.id, m.receiver_id, m.sender_id, m.search_id, m.created_at, left(m.content,80) AS content,
   COALESCE(pf.full_name,'') AS partner_name, s.title AS search_title,
   CASE WHEN s.user_id=m.sender_id THEN 'buyr' ELSE 'findr' END AS partner_role
  FROM public.messages m JOIN public.profiles p ON p.user_id=m.receiver_id
  JOIN public.searches s ON s.id=m.search_id LEFT JOIN public.profiles pf ON pf.user_id=m.sender_id
  WHERE m.receiver_id=_recipient AND p.notify_message_emails AND m.is_read IS NOT TRUE
    AND m.email_notified_at IS NULL AND m.created_at >= public.message_email_rollout_at()
    AND m.created_at < _at - interval '10 minutes') rows
$$;
REVOKE ALL ON FUNCTION public.message_digest_snapshot(uuid,timestamptz) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.message_digest_snapshot(uuid,timestamptz) TO service_role;