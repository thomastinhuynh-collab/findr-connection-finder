DROP FUNCTION IF EXISTS public.list_my_exchanges(text, integer, timestamptz);

CREATE FUNCTION public.list_my_exchanges(_filter text DEFAULT 'toutes', _limit integer DEFAULT 30, _before timestamptz DEFAULT NULL, _before_unread boolean DEFAULT NULL)
RETURNS TABLE(
  search_id uuid, search_title text, partner_id uuid, partner_name text, partner_avatar_url text,
  partner_role text, last_message_preview text, last_message_at timestamptz, unread_count integer,
  kind text, state text, amount numeric, expires_at timestamptz, last_activity_at timestamptz, needs_action boolean)
LANGUAGE sql STABLE SECURITY INVOKER SET search_path TO 'public'
AS $$
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
      SELECT m.content, m.created_at FROM public.messages m
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
      WHEN 'vente' THEN c.s_status
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
        OR (f.k = 'proposition' AND f.p_status IN ('rejected','cancelled','expired','completed'))
        OR (f.k = 'reservation' AND f.resa_expired)
     ELSE false END
 ORDER BY (f.unread > 0) DESC, f.activity DESC NULLS LAST
 LIMIT LEAST(GREATEST(COALESCE(_limit, 30), 1), 100);
$$;

REVOKE ALL ON FUNCTION public.list_my_exchanges(text, integer, timestamptz, boolean) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.list_my_exchanges(text, integer, timestamptz, boolean) TO authenticated;