ALTER TABLE public.messages ADD COLUMN hidden_at timestamptz;
ALTER TABLE public.messages ADD COLUMN hidden_reason text;

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
  -- Only hide_message (admin, SECURITY DEFINER) sets the moderation fields.
  IF (NEW.hidden_at IS DISTINCT FROM OLD.hidden_at OR NEW.hidden_reason IS DISTINCT FROM OLD.hidden_reason)
    AND COALESCE(current_setting('findr.hide_message', true), '') <> 'on' THEN
    RAISE EXCEPTION 'message_moderation_admin_only';
  END IF;
  RETURN NEW;
END $$;

CREATE TABLE public.message_reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  message_id uuid NOT NULL REFERENCES public.messages(id),
  reporter_id uuid NOT NULL,
  reason text NOT NULL CHECK (reason IN ('insultes_harcelement','arnaque_lien_suspect','paiement_hors_findr','contenu_interdit','autre')),
  comment text CHECK (comment IS NULL OR char_length(comment) <= 240),
  context_snapshot jsonb NOT NULL DEFAULT '{}'::jsonb,
  status text NOT NULL DEFAULT 'ouvert' CHECK (status IN ('ouvert','classe','averti','suspendu')),
  created_at timestamptz NOT NULL DEFAULT now(),
  handled_by uuid,
  handled_at timestamptz
);
CREATE INDEX message_reports_reporter_idx ON public.message_reports(reporter_id, created_at DESC);
CREATE INDEX message_reports_open_idx ON public.message_reports(created_at DESC) WHERE status = 'ouvert';
GRANT SELECT, UPDATE ON public.message_reports TO authenticated;
GRANT ALL ON public.message_reports TO service_role;
ALTER TABLE public.message_reports ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Reporters read own reports" ON public.message_reports FOR SELECT TO authenticated
  USING (reporter_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins update reports" ON public.message_reports FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE FUNCTION public.report_message(_message_id uuid, _reason text, _comment text DEFAULT NULL)
RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public' AS $$
DECLARE
  v_uid uuid := auth.uid();
  v_msg public.messages%ROWTYPE;
  v_id uuid;
  v_ctx jsonb;
BEGIN
  IF v_uid IS NULL THEN RAISE EXCEPTION 'not_authenticated'; END IF;
  IF _reason IS NULL OR _reason NOT IN ('insultes_harcelement','arnaque_lien_suspect','paiement_hors_findr','contenu_interdit','autre') THEN
    RAISE EXCEPTION 'invalid_reason';
  END IF;
  _comment := NULLIF(btrim(coalesce(_comment, '')), '');
  IF _comment IS NOT NULL AND char_length(_comment) > 240 THEN RAISE EXCEPTION 'comment_too_long'; END IF;
  SELECT * INTO v_msg FROM public.messages WHERE id = _message_id;
  IF NOT FOUND OR v_msg.receiver_id <> v_uid THEN RAISE EXCEPTION 'not_receiver'; END IF;
  PERFORM pg_advisory_xact_lock(hashtext('message_report:' || v_uid::text));
  IF (SELECT count(*) FROM public.message_reports WHERE reporter_id = v_uid AND created_at > now() - interval '1 hour') >= 10 THEN
    RAISE EXCEPTION 'report_rate_limited';
  END IF;
  SELECT COALESCE(jsonb_agg(to_jsonb(c) ORDER BY c.created_at), '[]'::jsonb) INTO v_ctx FROM (
    SELECT m.id, m.sender_id, m.receiver_id, m.content, m.images, m.created_at, m.hidden_at
    FROM public.messages m
    WHERE m.search_id = v_msg.search_id
      AND ((m.sender_id = v_msg.sender_id AND m.receiver_id = v_msg.receiver_id)
        OR (m.sender_id = v_msg.receiver_id AND m.receiver_id = v_msg.sender_id))
    ORDER BY m.created_at DESC LIMIT 20) c;
  INSERT INTO public.message_reports (message_id, reporter_id, reason, comment, context_snapshot)
  VALUES (_message_id, v_uid, _reason, _comment, jsonb_build_object(
    'message', jsonb_build_object('id', v_msg.id, 'sender_id', v_msg.sender_id, 'receiver_id', v_msg.receiver_id,
      'content', v_msg.content, 'images', v_msg.images, 'created_at', v_msg.created_at, 'search_id', v_msg.search_id),
    'messages', v_ctx))
  RETURNING id INTO v_id;
  RETURN v_id;
END $$;
REVOKE ALL ON FUNCTION public.report_message(uuid, text, text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.report_message(uuid, text, text) TO authenticated;

CREATE FUNCTION public.hide_message(_message_id uuid, _reason text)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public' AS $$
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN RAISE EXCEPTION 'not_authorized'; END IF;
  _reason := NULLIF(btrim(coalesce(_reason, '')), '');
  IF _reason IS NULL OR char_length(_reason) > 240 THEN RAISE EXCEPTION 'invalid_reason'; END IF;
  PERFORM set_config('findr.hide_message', 'on', true);
  UPDATE public.messages SET hidden_at = now(), hidden_reason = _reason WHERE id = _message_id AND hidden_at IS NULL;
  PERFORM set_config('findr.hide_message', 'off', true);
END $$;
REVOKE ALL ON FUNCTION public.hide_message(uuid, text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.hide_message(uuid, text) TO authenticated;

CREATE FUNCTION public.handle_message_report(_report_id uuid, _action text)
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
      'Un de tes messages a été signalé et ne respecte pas les règles de findr. Reste courtois et ne propose jamais de payer en dehors de findr. En cas de récidive, ton compte pourra être suspendu.',
      '/messagerie');
  END IF;
END $$;
REVOKE ALL ON FUNCTION public.handle_message_report(uuid, text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.handle_message_report(uuid, text) TO authenticated;

CREATE OR REPLACE FUNCTION public.message_digest_snapshot(_recipient uuid, _at timestamptz DEFAULT now()) RETURNS jsonb
LANGUAGE sql STABLE SET search_path TO 'public' AS $$
 SELECT COALESCE(jsonb_agg(row_to_json(rows) ORDER BY rows.created_at, rows.id), '[]'::jsonb) FROM
 (SELECT m.id, m.receiver_id, m.sender_id, m.search_id, m.created_at,
   CASE WHEN m.hidden_at IS NOT NULL THEN '' ELSE left(m.content,80) END AS content,
   COALESCE(pf.full_name,'') AS partner_name, s.title AS search_title,
   CASE WHEN s.user_id=m.sender_id THEN 'buyr' ELSE 'findr' END AS partner_role
  FROM public.messages m JOIN public.profiles p ON p.user_id=m.receiver_id
  JOIN public.searches s ON s.id=m.search_id LEFT JOIN public.profiles pf ON pf.user_id=m.sender_id
  WHERE m.receiver_id=_recipient AND p.notify_message_emails AND m.is_read IS NOT TRUE
    AND m.email_notified_at IS NULL AND m.created_at >= public.message_email_rollout_at()
    AND m.created_at < _at - interval '10 minutes') rows
$$;

CREATE OR REPLACE FUNCTION public.list_my_exchanges(_filter text DEFAULT 'toutes'::text, _limit integer DEFAULT 30, _before timestamp with time zone DEFAULT NULL::timestamp with time zone, _before_unread boolean DEFAULT NULL::boolean)
 RETURNS TABLE(search_id uuid, search_title text, partner_id uuid, partner_name text, partner_avatar_url text, partner_role text, last_message_preview text, last_message_at timestamp with time zone, unread_count integer, kind text, state text, amount numeric, expires_at timestamp with time zone, last_activity_at timestamp with time zone, needs_action boolean)
 LANGUAGE sql
 STABLE
 SET search_path TO 'public'
AS $function$
WITH me AS (SELECT auth.uid() AS uid),
pairs AS (
  SELECT m.search_id, CASE WHEN m.sender_id = me.uid THEN m.receiver_id ELSE m.sender_id END AS partner_id
    FROM public.messages m, me WHERE me.uid IN (m.sender_id, m.receiver_id)
  UNION
  SELECT p.search_id, CASE WHEN p.findr_id = me.uid THEN s.user_id ELSE p.findr_id END
    FROM public.proposals p JOIN public.searches s ON s.id = p.search_id, me
   WHERE me.uid IN (p.findr_id, s.user_id)
  UNION
  SELECT r.search_id, CASE WHEN r.findr_id = me.uid THEN r.buyr_id ELSE r.findr_id END
    FROM public.reservations r, me WHERE me.uid IN (r.findr_id, r.buyr_id)
),
ex AS (
  SELECT DISTINCT pr.search_id, pr.partner_id, s.title AS search_title, s.user_id AS owner_id,
         (s.user_id = me.uid) AS i_am_buyr
    FROM pairs pr JOIN public.searches s ON s.id = pr.search_id, me
   WHERE pr.partner_id IS NOT NULL AND pr.partner_id <> me.uid
),
rows AS (
  SELECT ex.*, lm.content, lm.created_at AS msg_at,
         COALESCE(uc.n, 0)::int AS unread,
         lp.status AS p_status, lp.proposed_price, lp.updated_at AS p_at, lp.created_at AS p_created,
         lr.status AS r_status, lr.expires_at AS r_expires, lr.updated_at AS r_at,
         ls.payment_status AS s_status, ls.object_price, ls.dispute_open, ls.updated_at AS s_at, ls.created_at AS s_created
    FROM ex
    CROSS JOIN me
    LEFT JOIN LATERAL (
      SELECT CASE WHEN m.hidden_at IS NOT NULL THEN '__hidden__' ELSE m.content END AS content, m.created_at FROM public.messages m
       WHERE m.search_id = ex.search_id
         AND ((m.sender_id = me.uid AND m.receiver_id = ex.partner_id) OR (m.sender_id = ex.partner_id AND m.receiver_id = me.uid))
       ORDER BY m.created_at DESC LIMIT 1) lm ON true
    LEFT JOIN LATERAL (
      SELECT count(*) AS n FROM public.messages m
       WHERE m.search_id = ex.search_id AND m.receiver_id = me.uid AND m.sender_id = ex.partner_id
         AND COALESCE(m.is_read, false) = false) uc ON true
    LEFT JOIN LATERAL (
      SELECT p.status, p.proposed_price, p.updated_at, p.created_at FROM public.proposals p
       WHERE p.search_id = ex.search_id
         AND p.findr_id = CASE WHEN ex.i_am_buyr THEN ex.partner_id ELSE me.uid END
       ORDER BY p.created_at DESC LIMIT 1) lp ON true
    LEFT JOIN LATERAL (
      SELECT r.status, r.expires_at, r.updated_at FROM public.reservations r
       WHERE r.search_id = ex.search_id
         AND r.findr_id = CASE WHEN ex.i_am_buyr THEN ex.partner_id ELSE me.uid END
         AND r.buyr_id = ex.owner_id
         AND COALESCE(r.payment_status, '') NOT IN ('paye_attente_etiquette','etiquette_refusee','paye_en_attente_reception','expedie','livre','versement_en_revue','termine','annule','rembourse')
       ORDER BY r.created_at DESC LIMIT 1) lr ON true
    LEFT JOIN LATERAL (
      SELECT r.payment_status, r.object_price, r.dispute_open, r.updated_at, r.created_at FROM public.reservations r
       WHERE r.search_id = ex.search_id
         AND r.findr_id = CASE WHEN ex.i_am_buyr THEN ex.partner_id ELSE me.uid END
         AND r.buyr_id = ex.owner_id
         AND r.payment_status IN ('paye_attente_etiquette','etiquette_refusee','paye_en_attente_reception','expedie','livre','versement_en_revue','termine','annule','rembourse')
       ORDER BY r.updated_at DESC LIMIT 1) ls ON true
),
classified AS (
  SELECT r.*,
    CASE WHEN r.s_status IS NOT NULL
              AND NOT (r.s_status IN ('termine','annule','rembourse')
                       AND r.p_status IN ('pending','accepted_pending')
                       AND r.p_created > r.s_created) THEN 'vente'
         WHEN r.p_status IS NOT NULL THEN 'proposition'
         WHEN r.r_status IS NOT NULL THEN 'reservation'
         ELSE 'message' END AS k,
    (r.s_status IN ('paye_attente_etiquette','etiquette_refusee','paye_en_attente_reception','expedie','livre','versement_en_revue')) AS sale_open,
    (r.r_status IN ('pending','approved') AND (r.r_expires IS NULL OR r.r_expires > now())) AS resa_open,
    (r.r_status = 'expired' OR (r.r_status = 'approved' AND r.r_expires IS NOT NULL AND r.r_expires <= now())) AS resa_expired
  FROM rows r
),
final AS (
  SELECT c.*,
    CASE c.k
      WHEN 'vente' THEN CASE WHEN c.sale_open AND COALESCE(c.dispute_open, false) THEN 'litige' ELSE c.s_status END
      WHEN 'proposition' THEN 'proposition_' || COALESCE(c.p_status, 'pending')
      WHEN 'reservation' THEN CASE WHEN c.resa_expired THEN 'exclusivite_expiree' ELSE 'exclusivite_' || c.r_status END
      ELSE 'message' END AS st,
    GREATEST(c.msg_at, c.p_at, c.r_at, c.s_at) AS activity,
    (c.unread > 0
      OR (c.i_am_buyr AND c.k = 'vente' AND (c.s_status IN ('paye_attente_etiquette','etiquette_refusee')
            OR (c.s_status IN ('expedie','livre') AND NOT COALESCE(c.dispute_open, false))))
      OR (NOT c.i_am_buyr AND c.k = 'vente' AND c.s_status = 'paye_en_attente_reception')
      OR (c.i_am_buyr AND c.k = 'proposition' AND c.p_status IN ('pending','accepted_pending'))) AS act
  FROM classified c
)
SELECT f.search_id, f.search_title, f.partner_id, pf.full_name, pf.avatar_url,
       CASE WHEN f.partner_id = f.owner_id THEN 'buyr' ELSE 'findr' END,
       left(f.content, 80), f.msg_at, f.unread, f.k, f.st,
       CASE WHEN f.k = 'vente' THEN COALESCE(f.object_price, f.proposed_price) ELSE f.proposed_price END,
       CASE WHEN f.k = 'reservation' THEN f.r_expires END,
       f.activity, f.act
  FROM final f
  LEFT JOIN public.profiles pf ON pf.user_id = f.partner_id
 WHERE (_before IS NULL
        OR ((f.unread > 0) < COALESCE(_before_unread, false))
        OR ((f.unread > 0) = COALESCE(_before_unread, false) AND f.activity < _before))
   AND CASE COALESCE(_filter, 'toutes')
     WHEN 'toutes' THEN true
     WHEN 'non_lus' THEN f.unread > 0
     WHEN 'en_attente' THEN (f.k = 'proposition' AND f.p_status IN ('pending','accepted_pending')) OR (f.k = 'reservation' AND f.resa_open)
     WHEN 'ventes_en_cours' THEN f.k = 'vente' AND f.sale_open
     WHEN 'finalisees' THEN (f.k = 'vente' AND NOT f.sale_open)
        OR (f.k = 'proposition' AND f.p_status IN ('rejected','cancelled','expired','completed','withdrawn'))
        OR (f.k = 'reservation' AND f.resa_expired)
     ELSE false END
 ORDER BY (f.unread > 0) DESC, f.activity DESC NULLS LAST
 LIMIT LEAST(GREATEST(COALESCE(_limit, 30), 1), 100);
$function$;