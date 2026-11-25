import { useCallback, useEffect, useRef, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { formatPrice } from "@/lib/fees";
import {
  EXCHANGE_FILTERS, EXCHANGE_PAGE_SIZE, type ExchangeFilter, type ExchangeRow,
  exchangeBadges, exchangeKey, exchangePreview, firstName, formatExchangeTime, mergePages, nextCursor, parseExchangeFilter,
} from "@/lib/exchangeRows";

const NAVY = "#070E42";
const GOLD = "#D9BB87";
const MUTED = "#5C5648";
const AMBER_BG = "#FDF1DC";
const AMBER_TEXT = "#7A4B00";
const ROW_MIN = 88;

const FILTER_KEYS: Record<ExchangeFilter, string> = {
  toutes: "all", non_lus: "unread", en_attente: "pending", ventes_en_cours: "ongoing", finalisees: "done",
};

type Counts = Partial<Record<ExchangeFilter, number>>;

const MessagingList = () => {
  const { t, i18n } = useTranslation();
  const { user } = useAuth();
  const uid = user?.id;
  const [params, setParams] = useSearchParams();
  const filter = parseExchangeFilter(params.get("filtre"));
  const [rows, setRows] = useState<ExchangeRow[]>([]);
  const [counts, setCounts] = useState<Counts>({});
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const stripRef = useRef<HTMLDivElement>(null);
  const filterRef = useRef(filter);
  filterRef.current = filter;

  const fetchPage = useCallback(async (f: ExchangeFilter, cursor: ReturnType<typeof nextCursor>) => {
    const { data, error } = await supabase.rpc("list_my_exchanges", {
      _filter: f, _limit: EXCHANGE_PAGE_SIZE,
      ...(cursor ? { _before: cursor._before ?? undefined, _before_unread: cursor._before_unread } : {}),
    });
    if (error) throw error;
    return (data ?? []) as ExchangeRow[];
  }, []);

  const loadCounts = useCallback(async () => {
    const { data } = await supabase.rpc("exchange_filter_counts");
    const c: Counts = {};
    (data ?? []).forEach((r: { filter: string; total: number }) => { c[r.filter as ExchangeFilter] = r.total; });
    setCounts(c);
  }, []);

  const loadFirst = useCallback(async () => {
    setLoading(true); setError(false);
    try {
      const page = await fetchPage(filter, null);
      setRows(page); setHasMore(page.length === EXCHANGE_PAGE_SIZE);
    } catch { setError(true); }
    setLoading(false);
    loadCounts();
  }, [fetchPage, filter, loadCounts]);

  useEffect(() => { if (uid) loadFirst(); }, [uid, loadFirst]);

  const loadMore = async () => {
    setLoadingMore(true);
    try {
      const page = await fetchPage(filter, nextCursor(rows));
      setRows((prev) => mergePages(prev, page)); setHasMore(page.length === EXCHANGE_PAGE_SIZE);
    } catch { setError(true); }
    setLoadingMore(false);
  };

  // Temps réel : chaque message reçu rafraîchit la tête de liste et les compteurs.
  useEffect(() => {
    if (!uid) return;
    let timer: ReturnType<typeof setTimeout> | undefined;
    const refresh = () => {
      clearTimeout(timer);
      timer = setTimeout(async () => {
        try {
          const top = await fetchPage(filterRef.current, null);
          const keys = new Set(top.map(exchangeKey));
          setRows((prev) => [...top, ...prev.filter((r) => !keys.has(exchangeKey(r)))]);
        } catch { /* la liste actuelle reste affichée */ }
        loadCounts();
      }, 400);
    };
    const channel = supabase
      .channel(`messaging-list-${uid}-${Math.random().toString(36).slice(2)}`)
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "messages", filter: `receiver_id=eq.${uid}` }, refresh)
      .subscribe();
    return () => { clearTimeout(timer); supabase.removeChannel(channel); };
  }, [uid, fetchPage, loadCounts]);

  // Téléphone : le filtre actif est amené en vue dans la bande.
  useEffect(() => {
    stripRef.current?.querySelector<HTMLElement>("[aria-pressed='true']")?.scrollIntoView({ block: "nearest", inline: "center" });
  }, [filter]);

  const setFilter = (f: ExchangeFilter) => {
    const next = new URLSearchParams(params);
    if (f === "toutes") next.delete("filtre"); else next.set("filtre", f);
    setParams(next, { replace: true });
  };

  const fmt = (n: number) => formatPrice(n, i18n.language);

  return (
    <main className="mx-auto w-full max-w-3xl px-4 pb-16 pt-24 sm:px-6">
      <h1 className="text-3xl" style={{ fontFamily: "'Playfair Display', serif", color: NAVY }}>{t("messagingList.title")}</h1>
      <p className="mt-2 text-sm" style={{ color: MUTED }}>{t("messagingList.intro")}</p>

      <div ref={stripRef} role="group" aria-label={t("messagingList.filterGroup")}
        className="-mx-4 mt-6 flex gap-2 overflow-x-auto px-4 pb-2 sm:mx-0 sm:flex-wrap sm:px-0">
        {EXCHANGE_FILTERS.map((f) => {
          const active = f === filter;
          const n = counts[f];
          return (
            <button key={f} type="button" aria-pressed={active} onClick={() => setFilter(f)}
              className="inline-flex min-h-[44px] shrink-0 items-center gap-2 rounded-full px-4 text-sm font-semibold focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
              style={{ backgroundColor: active ? NAVY : "#FFFFFF", color: active ? "#F5F1E8" : NAVY, border: `1px solid ${active ? NAVY : "#D4CCBC"}`, outlineColor: NAVY }}>
              {f === "non_lus" && (n ?? 0) > 0 && <span aria-hidden="true" className="h-2 w-2 rounded-full" style={{ backgroundColor: GOLD }} />}
              <span>{t(`messagingList.filters.${FILTER_KEYS[f]}`)}</span>
              {n != null && <span aria-label={t("messagingList.filterCount", { count: n })}>{n}</span>}
            </button>
          );
        })}
      </div>

      <section className="mt-4" aria-live="polite">
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
                  <li key={exchangeKey(r)}>
                    <Link to={`/messagerie/${r.search_id}?with=${r.partner_id}`} aria-label={aria}
                      className="flex w-full items-start gap-3 px-4 py-3 transition-colors hover:bg-[#FAF7F2] focus-visible:outline focus-visible:outline-2 focus-visible:-outline-offset-2"
                      style={{ minHeight: ROW_MIN, outlineColor: NAVY, backgroundColor: unread ? "#FBF7EE" : undefined }}>
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
    </main>
  );
};

export default MessagingList;
