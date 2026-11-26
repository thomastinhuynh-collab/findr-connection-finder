CREATE TABLE public.exchange_hidden (
  user_id uuid NOT NULL,
  search_id uuid NOT NULL,
  partner_id uuid NOT NULL,
  hidden_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, search_id, partner_id)
);
REVOKE ALL ON public.exchange_hidden FROM PUBLIC, anon;
GRANT SELECT ON public.exchange_hidden TO authenticated;
GRANT ALL ON public.exchange_hidden TO service_role;
ALTER TABLE public.exchange_hidden ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users read only their own hidden exchanges"
ON public.exchange_hidden FOR SELECT TO authenticated
USING (user_id = auth.uid());

CREATE OR REPLACE FUNCTION public.hide_exchange(_search_id uuid, _partner_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  v_uid uuid := auth.uid();
BEGIN
  IF v_uid IS NULL THEN RAISE EXCEPTION 'not_authenticated'; END IF;
  IF _search_id IS NULL OR _partner_id IS NULL OR _partner_id = v_uid THEN RAISE EXCEPTION 'not_participant'; END IF;

  IF NOT (
    EXISTS (
      SELECT 1 FROM public.messages m
      WHERE m.search_id = _search_id
        AND ((m.sender_id = v_uid AND m.receiver_id = _partner_id)
          OR (m.sender_id = _partner_id AND m.receiver_id = v_uid))
    ) OR EXISTS (
      SELECT 1 FROM public.proposals p JOIN public.searches s ON s.id = p.search_id
      WHERE p.search_id = _search_id
        AND ((p.findr_id = v_uid AND s.user_id = _partner_id)
          OR (p.findr_id = _partner_id AND s.user_id = v_uid))
    ) OR EXISTS (
      SELECT 1 FROM public.reservations r
      WHERE r.search_id = _search_id
        AND ((r.findr_id = v_uid AND r.buyr_id = _partner_id)
          OR (r.findr_id = _partner_id AND r.buyr_id = v_uid))
    )
  ) THEN RAISE EXCEPTION 'not_participant'; END IF;

  IF EXISTS (
    SELECT 1 FROM public.reservations r
    WHERE r.search_id = _search_id
      AND ((r.findr_id = v_uid AND r.buyr_id = _partner_id)
        OR (r.findr_id = _partner_id AND r.buyr_id = v_uid))
      AND r.payment_status IN ('paye_attente_etiquette','etiquette_refusee','paye_en_attente_reception','expedie','livre','versement_en_revue')
  ) THEN RAISE EXCEPTION 'sale_in_progress'; END IF;

  INSERT INTO public.exchange_hidden (user_id, search_id, partner_id, hidden_at)
  VALUES (v_uid, _search_id, _partner_id, now())
  ON CONFLICT (user_id, search_id, partner_id)
  DO UPDATE SET hidden_at = EXCLUDED.hidden_at;

  UPDATE public.messages
  SET is_read = true
  WHERE search_id = _search_id AND receiver_id = v_uid AND sender_id = _partner_id
    AND COALESCE(is_read, false) = false;
END;
$function$;
REVOKE ALL ON FUNCTION public.hide_exchange(uuid, uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.hide_exchange(uuid, uuid) TO authenticated;

DROP FUNCTION public.list_my_exchanges(text, integer, timestamptz, boolean);
CREATE FUNCTION public.list_my_exchanges(_filter text DEFAULT 'toutes'::text, _limit integer DEFAULT 30, _before timestamp with time zone DEFAULT NULL::timestamp with time zone, _before_unread boolean DEFAULT NULL::boolean)
 RETURNS TABLE(search_id uuid, search_title text, partner_id uuid, partner_name text, partner_avatar_url text, partner_role text, last_message_preview text, last_message_at timestamp with time zone, unread_count integer, kind text, state text, amount numeric, expires_at timestamp with time zone, last_activity_at timestamp with time zone, needs_action boolean, can_delete boolean)
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
    FROM pairs pr JOIN public.searches s ON s.id = pr.search_id
    CROSS JOIN me
    LEFT JOIN public.exchange_hidden h
      ON h.user_id = me.uid AND h.search_id = pr.search_id AND h.partner_id = pr.partner_id
   WHERE pr.partner_id IS NOT NULL AND pr.partner_id <> me.uid
     AND (
       h.hidden_at IS NULL
       OR EXISTS (
         SELECT 1 FROM public.reservations r
         WHERE r.search_id = pr.search_id
           AND ((r.findr_id = me.uid AND r.buyr_id = pr.partner_id)
             OR (r.findr_id = pr.partner_id AND r.buyr_id = me.uid))
           AND r.payment_status IN ('paye_attente_etiquette','etiquette_refusee','paye_en_attente_reception','expedie','livre','versement_en_revue')
       ) OR EXISTS (
         SELECT 1 FROM public.messages m
         WHERE m.search_id = pr.search_id AND m.sender_id = pr.partner_id AND m.receiver_id = me.uid
           AND m.created_at > h.hidden_at
       ) OR EXISTS (
         SELECT 1 FROM public.proposals p JOIN public.searches s2 ON s2.id = p.search_id
         WHERE p.search_id = pr.search_id AND p.findr_id = pr.partner_id AND s2.user_id = me.uid
           AND p.created_at > h.hidden_at
       ) OR EXISTS (
         SELECT 1 FROM public.reservations r
         WHERE r.search_id = pr.search_id
           AND ((r.findr_id = me.uid AND r.buyr_id = pr.partner_id)
             OR (r.findr_id = pr.partner_id AND r.buyr_id = me.uid))
           AND r.created_at > h.hidden_at
       )
     )
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
       f.activity, f.act,
       NOT EXISTS (
         SELECT 1 FROM public.reservations r
         WHERE r.search_id = f.search_id
           AND ((r.findr_id = me.uid AND r.buyr_id = f.partner_id)
             OR (r.findr_id = f.partner_id AND r.buyr_id = me.uid))
           AND r.payment_status IN ('paye_attente_etiquette','etiquette_refusee','paye_en_attente_reception','expedie','livre','versement_en_revue')
       ) AS can_delete
  FROM final f
  CROSS JOIN me
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
REVOKE ALL ON FUNCTION public.list_my_exchanges(text, integer, timestamptz, boolean) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.list_my_exchanges(text, integer, timestamptz, boolean) TO authenticated;

CREATE OR REPLACE FUNCTION public.unread_exchanges_count()
 RETURNS integer
 LANGUAGE sql
 STABLE
 SET search_path TO 'public'
AS $function$
  SELECT count(*)::int FROM (
    SELECT DISTINCT m.search_id, m.sender_id FROM public.messages m
     WHERE m.receiver_id = auth.uid() AND COALESCE(m.is_read, false) = false AND m.sender_id <> auth.uid()
       AND NOT EXISTS (
         SELECT 1 FROM public.exchange_hidden h
         WHERE h.user_id = auth.uid() AND h.search_id = m.search_id AND h.partner_id = m.sender_id
           AND NOT EXISTS (
             SELECT 1 FROM public.reservations r
             WHERE r.search_id = m.search_id
               AND ((r.findr_id = auth.uid() AND r.buyr_id = m.sender_id)
                 OR (r.findr_id = m.sender_id AND r.buyr_id = auth.uid()))
               AND r.payment_status IN ('paye_attente_etiquette','etiquette_refusee','paye_en_attente_reception','expedie','livre','versement_en_revue')
           ) AND NOT EXISTS (
             SELECT 1 FROM public.messages newer
             WHERE newer.search_id = m.search_id AND newer.sender_id = m.sender_id AND newer.receiver_id = auth.uid()
               AND newer.created_at > h.hidden_at
           ) AND NOT EXISTS (
             SELECT 1 FROM public.proposals p JOIN public.searches s ON s.id = p.search_id
             WHERE p.search_id = m.search_id AND p.findr_id = m.sender_id AND s.user_id = auth.uid()
               AND p.created_at > h.hidden_at
           ) AND NOT EXISTS (
             SELECT 1 FROM public.reservations r
             WHERE r.search_id = m.search_id
               AND ((r.findr_id = auth.uid() AND r.buyr_id = m.sender_id)
                 OR (r.findr_id = m.sender_id AND r.buyr_id = auth.uid()))
               AND r.created_at > h.hidden_at
           )
       )
  ) x;
$function$;
REVOKE ALL ON FUNCTION public.unread_exchanges_count() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.unread_exchanges_count() TO authenticated;
