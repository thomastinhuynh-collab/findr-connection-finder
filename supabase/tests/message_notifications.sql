-- Synthetic rows only. The inner block is ALWAYS rolled back, including on success.
DO $$
DECLARE
  b uuid := gen_random_uuid(); f uuid := gen_random_uuid(); other_user uuid := gen_random_uuid();
  s uuid; m uuid; old_m uuid; recent_m uuid; notified_m uuid;
  cutoff timestamptz := public.message_email_rollout_at();
  test_at timestamptz := cutoff + interval '30 minutes';
  n integer; snapshot jsonb; failed boolean;
BEGIN
  BEGIN
    INSERT INTO public.profiles(user_id, full_name) VALUES (b, 'Digest Test Buyr'), (f, 'Digest Test Findr'), (other_user, 'Digest Test Other');
    IF NOT (SELECT notify_message_emails FROM public.profiles WHERE user_id=b) THEN
      RAISE EXCEPTION 'preference must default to true';
    END IF;
    INSERT INTO public.searches(user_id,title,category,budget_min,budget_max,status)
      VALUES (b,'zz digest test','autre',0,100,'closed') RETURNING id INTO s;
    INSERT INTO public.messages(search_id,sender_id,receiver_id,content,is_read,created_at)
      VALUES (s,f,b,repeat('z',150),false,cutoff + interval '1 minute') RETURNING id INTO m;
    SELECT count(*) INTO n FROM public.notifications WHERE user_id=b AND type='new_message'
      AND title='Nouveau message' AND message=repeat('z',120)
      AND link='/messagerie/' || s::text || '?with=' || f::text;
    IF n <> 1 THEN RAISE EXCEPTION 'expected exactly one notification, got %', n; END IF;
    SELECT count(*) INTO n FROM pg_trigger WHERE tgrelid='public.messages'::regclass AND tgname='notify_message_insert';
    IF n <> 1 THEN RAISE EXCEPTION 'exactly one notification trigger required'; END IF;

    -- Historical messages, recent messages and previously notified messages are excluded.
    INSERT INTO public.messages(search_id,sender_id,receiver_id,content,is_read,created_at)
      VALUES (s,f,b,'historical',false,cutoff - interval '1 day') RETURNING id INTO old_m;
    INSERT INTO public.messages(search_id,sender_id,receiver_id,content,is_read,created_at)
      VALUES (s,f,b,'too recent',false,test_at - interval '9 minutes') RETURNING id INTO recent_m;
    INSERT INTO public.messages(search_id,sender_id,receiver_id,content,is_read,created_at,email_notified_at)
      VALUES (s,f,b,'already notified',false,cutoff + interval '1 minute',test_at) RETURNING id INTO notified_m;
    snapshot := public.message_digest_snapshot(b,test_at);
    IF jsonb_array_length(snapshot) <> 1 OR snapshot->0->>'id' <> m::text THEN
      RAISE EXCEPTION 'history/age/marker exclusions failed';
    END IF;
    IF length(snapshot->0->>'content') <> 80 OR snapshot->0->>'partner_role' <> 'findr' OR snapshot->0 ? 'images' THEN
      RAISE EXCEPTION 'preview privacy or role failed';
    END IF;

    -- Receiver may mark read, but cannot write the email marker or change the content.
    PERFORM set_config('request.jwt.claims',json_build_object('sub',b,'role','authenticated')::text,true);
    PERFORM set_config('role','authenticated',true);
    failed := false;
    BEGIN UPDATE public.messages SET email_notified_at=test_at WHERE id=m;
    EXCEPTION WHEN raise_exception THEN failed := SQLERRM='message_email_marker_server_only'; END;
    IF NOT failed THEN RAISE EXCEPTION 'client email marker update allowed'; END IF;
    failed := false;
    BEGIN UPDATE public.messages SET content='tampered' WHERE id=m;
    EXCEPTION WHEN raise_exception THEN failed := SQLERRM='message_immutable'; END;
    IF NOT failed THEN RAISE EXCEPTION 'message content update allowed'; END IF;
    failed := false;
    BEGIN PERFORM public.message_digest_snapshot(b,test_at);
    EXCEPTION WHEN insufficient_privilege THEN failed := true; END;
    IF NOT failed THEN RAISE EXCEPTION 'client could execute private digest snapshot'; END IF;
    UPDATE public.messages SET is_read=true WHERE id=m;
    failed := false;
    BEGIN UPDATE public.messages SET is_read=false WHERE id=m;
    EXCEPTION WHEN raise_exception THEN failed := SQLERRM='message_read_irreversible'; END;
    IF NOT failed THEN RAISE EXCEPTION 'read reversal allowed'; END IF;
    PERFORM public.update_message_email_preference(false);
    PERFORM set_config('role','postgres',true);
    PERFORM set_config('request.jwt.claims','{}',true);
    IF (SELECT notify_message_emails FROM public.profiles WHERE user_id=b)
      OR NOT (SELECT notify_message_emails FROM public.profiles WHERE user_id=other_user) THEN
      RAISE EXCEPTION 'preference must only update self';
    END IF;
    IF jsonb_array_length(public.message_digest_snapshot(b,test_at)) <> 0 THEN
      RAISE EXCEPTION 'read/disabled recipient must not receive an email';
    END IF;

    -- Service marker-only writes succeed without weakening immutable content checks.
    PERFORM set_config('role','service_role',true);
    UPDATE public.messages SET email_notified_at=test_at WHERE id=m;
    failed := false;
    BEGIN UPDATE public.messages SET content='service tamper' WHERE id=m;
    EXCEPTION WHEN raise_exception THEN failed := SQLERRM='message_immutable'; END;
    IF NOT failed THEN RAISE EXCEPTION 'service could change content'; END IF;
    PERFORM set_config('role','postgres',true);

    -- Cleanup is scoped to fictional recipients in the test, never run globally on production.
    PERFORM public.cleanup_message_email_markers(test_at,b);
    IF (SELECT email_notified_at FROM public.messages WHERE id=old_m) IS NULL
      OR (SELECT email_notified_at FROM public.messages WHERE id=recent_m) IS NULL THEN
      RAISE EXCEPTION 'historical/disabled marker failed';
    END IF;
    -- Once re-enabled, already skipped messages stay skipped; only new messages qualify.
    UPDATE public.profiles SET notify_message_emails=true WHERE user_id=b;
    IF jsonb_array_length(public.message_digest_snapshot(b,test_at)) <> 0 THEN
      RAISE EXCEPTION 're-enabling must not send historical or skipped messages';
    END IF;
    RAISE EXCEPTION 'DIGEST_TESTS_OK';
  EXCEPTION WHEN raise_exception THEN
    IF SQLERRM <> 'DIGEST_TESTS_OK' THEN RAISE; END IF;
    RAISE NOTICE 'DIGEST_TESTS_OK — every fictional row rolled back; no emails sent';
  END;
END $$;