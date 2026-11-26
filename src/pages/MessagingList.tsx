import { useCallback, useEffect, useRef, useState } from "react";
import { Link, useNavigate, useParams, useSearchParams } from "react-router-dom";
import ConversationView from "@/components/ConversationView";
import MySpaceBottomBar from "@/components/MySpaceBottomBar";
import { useTodoItems, ACCOUNT_TODO_KINDS } from "@/components/TodoNowBlock";
import { useTranslation } from "react-i18next";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { formatPrice } from "@/lib/fees";
import { useToast } from "@/hooks/use-toast";
import DeleteExchangeMenu from "@/components/DeleteExchangeMenu";
import { nextAfterDelete } from "@/lib/deleteExchange";
import {
  EXCHANGE_PAGE_SIZE, type ExchangeRow,
  exchangeBadges, exchangeKey, firstUnreadExchange, exchangePreview, firstName, formatExchangeTime, mergePages, nextCursor,
} from "@/lib/exchangeRows";

const NAVY = "#070E42";
const GOLD = "#D9BB87";
const MUTED = "#5C5648";
const AMBER_BG = "#FDF1DC";
const AMBER_TEXT = "#7A4B00";
const ROW_MIN = 88;

/** La liste n'a plus de filtres : le paramètre ?filtre= des anciennes adresses est ignoré. */
const LIST_FILTER = "toutes";

const WIDE_QUERY = "(min-width: 901px)";
export function useWideMessaging() {
  const [wide, setWide] = useState(() => typeof window !== "undefined" && window.matchMedia(WIDE_QUERY).matches);
  useEffect(() => {
    const mq = window.matchMedia(WIDE_QUERY);
    const on = () => setWide(mq.matches);
    mq.addEventListener("change", on);
    return () => mq.removeEventListener("change", on);
  }, []);
  return wide;
}

/** /messagerie et /messagerie/:id : liste + volet (ordinateur) ou conversation plein écran (téléphone). */
const MessagingHub = () => {
  const { id } = useParams();
  const [params] = useSearchParams();
  const wide = useWideMessaging();
  const withUserId = params.get("with");
  if (id && !wide) return <ConversationView key={`${id}:${withUserId ?? ""}`} searchId={id} withUserId={withUserId} />;
  return <MessagingList wide={wide} selectedId={id ?? null} selectedWith={withUserId} />;
};

const MessagingList = ({ wide, selectedId, selectedWith }: { wide: boolean; selectedId: string | null; selectedWith: string | null }) => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const uid = user?.id;
  const { toast } = useToast();
  const [rows, setRows] = useState<ExchangeRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState(false);
  const [hasMore, setHasMore] = useState(false);

  const fetchPage = useCallback(async (cursor: ReturnType<typeof nextCursor>) => {
    const { data, error } = await supabase.rpc("list_my_exchanges", {
      _filter: LIST_FILTER, _limit: EXCHANGE_PAGE_SIZE,
      ...(cursor ? { _before: cursor._before ?? undefined, _before_unread: cursor._before_unread } : {}),
    });
    if (error) throw error;
    return (data ?? []) as ExchangeRow[];
  }, []);

  const loadFirst = useCallback(async () => {
    setLoading(true); setError(false);
    try {
      const page = await fetchPage(null);
      setRows(page); setHasMore(page.length === EXCHANGE_PAGE_SIZE);
    } catch { setError(true); }
    setLoading(false);
  }, [fetchPage]);

  useEffect(() => { if (uid) loadFirst(); }, [uid, loadFirst]);

  // Ordinateur : à l'arrivée sans sélection, ouvrir le premier échange non lu.
  const autoSelected = useRef(false);
  useEffect(() => {
    if (!wide || selectedId || loading || autoSelected.current) return;
    autoSelected.current = true;
    const first = firstUnreadExchange(rows);
    if (first) navigate(rowHref(first), { replace: true });
  }, [wide, selectedId, loading, rows]); // eslint-disable-line react-hooks/exhaustive-deps

  // Chiffres dorés de la barre du bas : mêmes règles que Mon espace.
  const [profile, setProfile] = useState<unknown>(null);
  useEffect(() => {
    if (!uid || wide) return;
    supabase.rpc("get_my_profile").then(({ data }) => setProfile(data ?? null));
  }, [uid, wide]);
  const todo = useTodoItems(!wide && profile ? uid : undefined, profile);
  const todoItems = todo.items ?? [];

  const loadMore = async () => {
    setLoadingMore(true);
    try {
      const page = await fetchPage(nextCursor(rows));
      setRows((prev) => mergePages(prev, page)); setHasMore(page.length === EXCHANGE_PAGE_SIZE);
    } catch { setError(true); }
    setLoadingMore(false);
  };

  // Temps réel : message reçu ou envoyé, proposition, réservation ou vente qui démarre
  // rafraîchissent la tête de liste ; un échange supprimé qui revient réapparaît à jour.
  useEffect(() => {
    if (!uid) return;
    let timer: ReturnType<typeof setTimeout> | undefined;
    const refresh = () => {
      clearTimeout(timer);
      timer = setTimeout(async () => {
        try {
          const top = await fetchPage(null);
          const keys = new Set(top.map(exchangeKey));
          setRows((prev) => [...top, ...prev.filter((r) => !keys.has(exchangeKey(r)))]);
        } catch { /* la liste actuelle reste affichée */ }
      }, 400);
    };
    const channel = supabase
      .channel(`messaging-list-${uid}-${Math.random().toString(36).slice(2)}`)
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "messages", filter: `receiver_id=eq.${uid}` }, refresh)
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "messages", filter: `sender_id=eq.${uid}` }, refresh)
      .on("postgres_changes", { event: "*", schema: "public", table: "reservations", filter: `buyr_id=eq.${uid}` }, refresh)
      .on("postgres_changes", { event: "*", schema: "public", table: "reservations", filter: `findr_id=eq.${uid}` }, refresh)
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "notifications", filter: `user_id=eq.${uid}` }, refresh)
      .subscribe();
    return () => { clearTimeout(timer); supabase.removeChannel(channel); };
  }, [uid, fetchPage]);

  /** Après hide_exchange : retirer la ligne, prévenir, puis sélectionner l'échange suivant (ordinateur) ou revenir à la liste. */
  const handleDeleted = useCallback((searchId: string, partnerId: string) => {
    const key = exchangeKey({ search_id: searchId, partner_id: partnerId });
    const wasSelected = searchId === selectedId && partnerId === selectedWith;
    const next = nextAfterDelete<ExchangeRow>(rows, key, (r) => exchangeKey(r));
    setRows((prev) => prev.filter((r) => exchangeKey(r) !== key));
    toast({ title: t("messagingList.deleteExchange.done") });
    if (wide && wasSelected) navigate(next ? rowHref(next) : "/messagerie", { replace: true });
    else if (!wide && selectedId) navigate("/messagerie", { replace: true });
  }, [rows, selectedId, selectedWith, wide, navigate, toast, t]); // eslint-disable-line react-hooks/exhaustive-deps

  const fmt = (n: number) => formatPrice(n, i18n.language);
  function rowHref(r: ExchangeRow) {
    const q = new URLSearchParams({ with: r.partner_id });
    return `/messagerie/${r.search_id}?${q.toString()}`;
  }

  return (
    <>
    <main className={wide ? "mx-auto grid min-h-0 min-w-0 w-full max-w-7xl gap-6 px-6 pb-4 pt-24" : "mx-auto w-full max-w-3xl px-4 pt-24 sm:px-6 pb-[calc(88px+env(safe-area-inset-bottom))] min-[641px]:pb-16"}
      style={wide ? { gridTemplateColumns: "minmax(280px,420px) minmax(0,1fr)", height: "100dvh" } : undefined}>
     <div className={wide ? "flex min-h-0 flex-col" : undefined}>
      <h1 className="text-3xl" style={{ fontFamily: "'Playfair Display', serif", color: NAVY }}>{t("messagingList.title")}</h1>
      <section className={wide ? "mt-6 min-h-0 flex-1 overflow-y-auto" : "mt-6"} aria-live="polite">
        {loading ? (
          <div role="status" aria-busy="true">
            <span className="sr-only">{t("common.loading")}</span>
            <ul aria-hidden="true" className="divide-y overflow-hidden rounded-xl bg-white" style={{ border: "1px solid #E5E1D8" }}>
              {Array.from({ length: 5 }).map((_, i) => (
                <li key={i} className="flex items-center gap-3 px-4" style={{ minHeight: ROW_MIN }}>
                  <span className="h-12 w-12 shrink-0 animate-pulse rounded-full bg-muted" />
                  <span className="flex-1 space-y-2">
                    <span className="block h-3 w-1/3 animate-pulse rounded bg-muted" />
                    <span className="block h-3 w-2/3 animate-pulse rounded bg-muted" />
                  </span>
                </li>
              ))}
            </ul>
          </div>
        ) : error && rows.length === 0 ? (
          <div role="alert" className="rounded-xl bg-white px-4 py-8 text-center" style={{ border: "1px solid #E5E1D8" }}>
            <p className="text-sm" style={{ color: NAVY }}>{t("messagingList.error")}</p>
            <button type="button" onClick={loadFirst}
              className="mt-4 inline-flex min-h-[44px] items-center rounded-full px-5 text-sm font-semibold focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
              style={{ backgroundColor: NAVY, color: "#F5F1E8", outlineColor: NAVY }}>{t("messagingList.retry")}</button>
          </div>
        ) : rows.length === 0 ? (
          <div className="rounded-xl px-4 py-10 text-center" style={{ border: "1px dashed #D4CCBC", backgroundColor: "#FAF7F2" }}>
            <p className="text-base" style={{ color: NAVY }}>{t("messagingList.empty")}</p>
            <div className="mt-5 flex flex-wrap justify-center gap-3">
              <Link to="/poster" className="inline-flex min-h-[44px] items-center rounded-full px-5 text-sm font-semibold focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
                style={{ backgroundColor: GOLD, color: NAVY, outlineColor: NAVY }}>{t("messagingList.emptyPost")}</Link>
              <Link to="/recherches" className="inline-flex min-h-[44px] items-center rounded-full px-5 text-sm font-semibold focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
                style={{ border: `1px solid ${NAVY}`, color: NAVY, outlineColor: NAVY }}>{t("messagingList.emptyBrowse")}</Link>
            </div>
          </div>
        ) : (
          <>
            <ul className="divide-y overflow-hidden rounded-xl bg-white" style={{ border: "1px solid #E5E1D8" }}>
              {rows.map((r) => {
                const unread = r.unread_count > 0;
                const selected = wide && r.search_id === selectedId && r.partner_id === selectedWith;
                const name = r.partner_name?.trim() || t("messagingList.someone");
                const preview = exchangePreview(r);
                const previewText = "text" in preview ? preview.text : t(`messagingList.${preview.key}`);
                const badges = exchangeBadges(r, fmt);
                const time = formatExchangeTime(r.last_message_at ?? r.last_activity_at, i18n.language, t("messagingList.yesterday"));
                const aria = [
                  t("messagingList.ariaRow", { name, role: r.partner_role, title: r.search_title ?? "" }),
                  unread ? t("messagingList.ariaUnread", { count: r.unread_count }) : null,
                ].filter(Boolean).join(", ");
                return (
                  <li key={exchangeKey(r)} className="flex items-start"
                    style={{ backgroundColor: selected ? "#F5F1E8" : unread ? "#FBF7EE" : undefined }}>
                    <Link to={rowHref(r)} aria-label={aria} aria-current={selected ? "true" : undefined}
                      className="flex min-w-0 flex-1 items-start gap-3 px-4 py-3 transition-colors hover:bg-[#FAF7F2] focus-visible:outline focus-visible:outline-2 focus-visible:-outline-offset-2"
                      style={{ minHeight: ROW_MIN, outlineColor: NAVY, backgroundColor: selected ? "#F5F1E8" : unread ? "#FBF7EE" : undefined, boxShadow: selected ? `inset 3px 0 0 ${GOLD}` : undefined }}>
                      <span aria-hidden="true" className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-full text-lg font-semibold"
                        style={{ backgroundColor: "#F5F1E8", color: NAVY }}>
                        {r.partner_avatar_url ? <img src={r.partner_avatar_url} alt="" className="h-full w-full object-cover" /> : (firstName(name).charAt(0).toUpperCase() || "?")}
                      </span>
                      <span className="min-w-0 flex-1" aria-hidden="true">
                        <span className="flex items-baseline gap-2">
                          <span className={`truncate text-sm ${unread ? "font-bold" : "font-medium"}`} style={{ color: NAVY }}>{name}</span>
                          <span className="shrink-0 text-xs" style={{ color: MUTED }}>{r.partner_role}</span>
                          <span className="ml-auto shrink-0 text-xs" style={{ color: MUTED }}>{time}</span>
                        </span>
                        <span className="mt-0.5 block truncate text-xs" style={{ color: MUTED }}>{r.search_title}</span>
                        <span className="mt-1.5 flex flex-wrap gap-1.5">
                          {badges.map((b) => (
                            <span key={b.key} className="rounded-full px-2 py-0.5 text-xs font-medium"
                              style={b.amber ? { backgroundColor: AMBER_BG, color: AMBER_TEXT } : { backgroundColor: "#F1EEE8", color: NAVY }}>
                              {t(`messagingList.badge.${b.key}`, b.params)}
                            </span>
                          ))}
                        </span>
                        <span className="mt-1.5 flex items-center gap-2">
                          <span className={`min-w-0 flex-1 truncate text-sm ${unread ? "font-semibold" : ""}`} style={{ color: unread ? NAVY : "#374151" }}>{previewText}</span>
                          {unread && (
                            <span className="inline-flex h-6 min-w-[24px] shrink-0 items-center justify-center rounded-full px-1.5 text-xs font-bold"
                              style={{ backgroundColor: GOLD, color: NAVY }}>{r.unread_count}</span>
                          )}
                        </span>
                      </span>
                    </Link>
                    <div className="py-3 pr-2">
                      <DeleteExchangeMenu searchId={r.search_id} partnerId={r.partner_id}
                        partnerFirstName={firstName(r.partner_name?.trim() ?? "")}
                        canDelete={r.can_delete !== false}
                        onDeleted={() => handleDeleted(r.search_id, r.partner_id)} />
                    </div>
                  </li>
                );
              })}
            </ul>
            {hasMore && (
              <div className="mt-4 text-center">
                <button type="button" onClick={loadMore} disabled={loadingMore}
                  className="inline-flex min-h-[44px] items-center rounded-full px-5 text-sm font-semibold focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
                  style={{ border: `1px solid ${NAVY}`, color: NAVY, outlineColor: NAVY }}>
                  {loadingMore ? t("common.loading") : t("messagingList.more")}
                </button>
              </div>
            )}
          </>
        )}
      </section>
     </div>
      {wide && (
        <section className="flex min-h-0 min-w-0 flex-col overflow-hidden rounded-lg" style={{ border: "1px solid #E5E1D8" }}>
          {selectedId ? (
            <ConversationView key={`${selectedId}:${selectedWith ?? ""}`} searchId={selectedId} withUserId={selectedWith} embedded
              onDeleted={handleDeleted} />
          ) : (
            <div className="flex h-full items-center justify-center p-8 text-sm" style={{ color: MUTED, backgroundColor: "#FAF7F2" }}>
              {t("messagingList.selectHint")}
            </div>
          )}
        </section>
      )}
    </main>
    {!wide && (
      <MySpaceBottomBar active="messagerie"
        actionCounts={{ aujourdhui: todoItems.length, compte: todoItems.filter((i) => ACCOUNT_TODO_KINDS.includes(i.kind)).length }} />
    )}
    </>
  );
};

export default MessagingHub;
