CREATE OR REPLACE FUNCTION public.handle_message_report(_report_id uuid, _action text)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public' AS $$
DECLARE v_r public.message_reports%ROWTYPE; v_sender uuid;
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN RAISE EXCEPTION 'not_authorized'; END IF;
  IF _action IS NULL OR _action NOT IN ('classe', 'averti') THEN RAISE EXCEPTION 'invalid_action'; END IF;
  SELECT * INTO v_r FROM public.message_reports WHERE id = _report_id FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'not_found'; END IF;
  IF v_r.status <> 'ouvert' THEN RAISE EXCEPTION 'already_handled'; END IF;
  UPDATE public.message_reports SET status = _action, handled_by = auth.uid(), handled_at = now() WHERE id = _report_id;
  IF _action = 'averti' THEN
    SELECT sender_id INTO v_sender FROM public.messages WHERE id = v_r.message_id;
    INSERT INTO public.notifications (user_id, type, title, message, link)
    VALUES (v_sender, 'moderation_warning', 'Avertissement de l''équipe findr',
      'Un de tes messages a été signalé et ne respecte pas les règles de findr. Reste courtois et ne propose jamais de payer en dehors de findr.',
      '/messagerie');
  END IF;
END $$;
REVOKE ALL ON FUNCTION public.handle_message_report(uuid, text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.handle_message_report(uuid, text) TO authenticated;