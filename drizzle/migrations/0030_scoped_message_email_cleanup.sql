CREATE FUNCTION public.cleanup_message_email_markers(_at timestamptz, _recipient uuid) RETURNS integer
LANGUAGE plpgsql SET search_path TO 'public' AS $$
DECLARE n integer;
BEGIN
  IF auth.uid() IS NOT NULL OR current_user NOT IN ('postgres', 'service_role') THEN RAISE EXCEPTION 'unauthorized'; END IF;
  UPDATE public.messages m SET email_notified_at = _at WHERE m.email_notified_at IS NULL
    AND (_recipient IS NULL OR m.receiver_id = _recipient) AND
    (m.created_at < public.message_email_rollout_at() OR m.is_read IS TRUE OR EXISTS
      (SELECT 1 FROM public.profiles p WHERE p.user_id=m.receiver_id AND NOT p.notify_message_emails));
  GET DIAGNOSTICS n = ROW_COUNT;
  RETURN n;
END $$;
REVOKE ALL ON FUNCTION public.cleanup_message_email_markers(timestamptz,uuid) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.cleanup_message_email_markers(timestamptz,uuid) TO service_role;
CREATE OR REPLACE FUNCTION public.cleanup_message_email_markers(_at timestamptz DEFAULT now()) RETURNS integer
LANGUAGE plpgsql SET search_path TO 'public' AS $$
BEGIN
  RETURN public.cleanup_message_email_markers(_at, NULL);
END $$;