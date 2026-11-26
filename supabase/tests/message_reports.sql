-- Synthetic rows only. The inner block is ALWAYS rolled back, including on success.
DO $$
DECLARE
  b uuid := gen_random_uuid(); f uuid := gen_random_uuid();
  s uuid; m uuid; mine uuid; rid uuid; n integer; failed boolean; snap jsonb;
BEGIN
  BEGIN
    INSERT INTO public.profiles(user_id, full_name) VALUES (b, 'Report Test Buyr'), (f, 'Report Test Findr');
    INSERT INTO public.searches(user_id,title,category,budget_min,budget_max,status)
      VALUES (b,'zz report test','autre',0,100,'closed') RETURNING id INTO s;
    INSERT INTO public.messages(search_id,sender_id,receiver_id,content) VALUES (s,f,b,'appelle-moi 0612345678') RETURNING id INTO m;
    INSERT INTO public.messages(search_id,sender_id,receiver_id,content) VALUES (s,b,f,'non merci') RETURNING id INTO mine;

    PERFORM set_config('request.jwt.claims', json_build_object('sub', b, 'role', 'authenticated')::text, true);
    SET LOCAL ROLE authenticated;

    -- Receiver can report a received message; the snapshot captures the exchange.
    rid := public.report_message(m, 'paiement_hors_findr', '  numéro donné  ');
    SELECT context_snapshot INTO snap FROM public.message_reports WHERE id = rid;
    IF snap->'message'->>'id' <> m::text OR jsonb_array_length(snap->'messages') <> 2 THEN RAISE EXCEPTION 'snapshot failed'; END IF;
    IF (SELECT status FROM public.message_reports WHERE id = rid) <> 'ouvert' THEN RAISE EXCEPTION 'default status failed'; END IF;

    -- Cannot report a message one sent.
    failed := false;
    BEGIN PERFORM public.report_message(mine, 'autre', NULL); EXCEPTION WHEN OTHERS THEN failed := SQLERRM = 'not_receiver'; END;
    IF NOT failed THEN RAISE EXCEPTION 'sender report must fail'; END IF;

    -- Invalid reason and too long comment.
    failed := false;
    BEGIN PERFORM public.report_message(m, 'spam', NULL); EXCEPTION WHEN OTHERS THEN failed := SQLERRM = 'invalid_reason'; END;
    IF NOT failed THEN RAISE EXCEPTION 'invalid reason must fail'; END IF;
    failed := false;
    BEGIN PERFORM public.report_message(m, 'autre', repeat('x', 241)); EXCEPTION WHEN OTHERS THEN failed := SQLERRM = 'comment_too_long'; END;
    IF NOT failed THEN RAISE EXCEPTION 'long comment must fail'; END IF;

    -- Rate limit: 10 per hour.
    FOR n IN 2..10 LOOP PERFORM public.report_message(m, 'autre', NULL); END LOOP;
    failed := false;
    BEGIN PERFORM public.report_message(m, 'autre', NULL); EXCEPTION WHEN OTHERS THEN failed := SQLERRM = 'report_rate_limited'; END;
    IF NOT failed THEN RAISE EXCEPTION '11th report must be rate limited'; END IF;

    -- No direct insert, receiver cannot hide or handle.
    failed := false;
    BEGIN INSERT INTO public.message_reports(message_id, reporter_id, reason) VALUES (m, b, 'autre'); EXCEPTION WHEN insufficient_privilege THEN failed := true; END;
    IF NOT failed THEN RAISE EXCEPTION 'direct insert must fail'; END IF;
    failed := false;
    BEGIN UPDATE public.messages SET hidden_at = now() WHERE id = m; EXCEPTION WHEN OTHERS THEN failed := SQLERRM = 'message_moderation_admin_only'; END;
    IF NOT failed THEN RAISE EXCEPTION 'receiver must not hide'; END IF;
    failed := false;
    BEGIN PERFORM public.hide_message(m, 'test'); EXCEPTION WHEN OTHERS THEN failed := SQLERRM = 'not_authorized'; END;
    IF NOT failed THEN RAISE EXCEPTION 'non-admin hide must fail'; END IF;
    failed := false;
    BEGIN PERFORM public.handle_message_report(rid, 'classe'); EXCEPTION WHEN OTHERS THEN failed := SQLERRM = 'not_authorized'; END;
    IF NOT failed THEN RAISE EXCEPTION 'non-admin handle must fail'; END IF;

    -- The sender cannot read the receiver's reports.
    PERFORM set_config('request.jwt.claims', json_build_object('sub', f, 'role', 'authenticated')::text, true);
    SELECT count(*) INTO n FROM public.message_reports WHERE message_id = m;
    IF n <> 0 THEN RAISE EXCEPTION 'reports must be private'; END IF;
    RESET ROLE;

    -- Moderation path (as hide_message does): content kept, previews masked, email marker still server-only.
    PERFORM set_config('findr.hide_message', 'on', true);
    UPDATE public.messages SET hidden_at = now(), hidden_reason = 'test' WHERE id = m;
    PERFORM set_config('findr.hide_message', 'off', true);
    IF (SELECT content FROM public.messages WHERE id = m) <> 'appelle-moi 0612345678' THEN RAISE EXCEPTION 'content must stay'; END IF;
    PERFORM set_config('request.jwt.claims', json_build_object('sub', b, 'role', 'authenticated')::text, true);
    SET LOCAL ROLE authenticated;
    failed := false;
    BEGIN UPDATE public.messages SET email_notified_at = now() WHERE id = m; EXCEPTION WHEN OTHERS THEN failed := SQLERRM = 'message_email_marker_server_only'; END;
    IF NOT failed THEN RAISE EXCEPTION 'email marker must stay server-only'; END IF;
    RESET ROLE;
    DELETE FROM public.messages WHERE id = mine;
    PERFORM set_config('request.jwt.claims', json_build_object('sub', b, 'role', 'authenticated')::text, true);
    SET LOCAL ROLE authenticated;
    SELECT count(*) INTO n FROM public.list_my_exchanges('toutes', 100) e WHERE e.search_id = s AND e.last_message_preview = '__hidden__';
    IF n <> 1 THEN RAISE EXCEPTION 'exchange preview must be masked'; END IF;
    RESET ROLE;
    IF (SELECT content FROM jsonb_to_recordset(public.message_digest_snapshot(b, now() + interval '1 hour')) AS x(id uuid, content text) WHERE x.id = m) IS DISTINCT FROM '' THEN
      RAISE EXCEPTION 'digest must not show hidden text';
    END IF;

    RAISE EXCEPTION 'rollback_ok';
  EXCEPTION WHEN OTHERS THEN
    IF SQLERRM <> 'rollback_ok' THEN RAISE; END IF;
  END;
  RAISE NOTICE 'message_reports tests passed (rolled back)';
END $$;
