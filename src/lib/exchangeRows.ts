// Messagerie (liste) : pastilles, aperçu, heure et libellé d'accessibilité d'un échange.
// Les données viennent de list_my_exchanges ; ce module ne fait que les présenter.

export const EXCHANGE_FILTERS = ["toutes", "non_lus", "en_attente", "ventes_en_cours", "finalisees"] as const;
export type ExchangeFilter = (typeof EXCHANGE_FILTERS)[number];
export const EXCHANGE_PAGE_SIZE = 30;

export function parseExchangeFilter(v: string | null): ExchangeFilter {
  return (EXCHANGE_FILTERS as readonly string[]).includes(v ?? "") ? (v as ExchangeFilter) : "toutes";
}

export interface ExchangeRow {
  search_id: string;
  search_title: string | null;
  partner_id: string;
  partner_name: string | null;
  partner_avatar_url: string | null;
  partner_role: "buyr" | "findr" | string;
  last_message_preview: string | null;
  last_message_at: string | null;
  unread_count: number;
  kind: "message" | "proposition" | "reservation" | "vente" | string;
  state: string | null;
  amount: number | null;
  expires_at: string | null;
  last_activity_at: string | null;
  needs_action: boolean;
}

export interface Badge { key: string; params?: Record<string, string | number>; amber?: boolean }

const DAY = 86_400_000;
export function daysRemaining(iso: string | null, now = Date.now()): number {
  if (!iso) return 0;
  return Math.max(0, Math.ceil((new Date(iso).getTime() - now) / DAY));
}

/** Pastilles de type puis d'état (clés i18n sous messagingList.badge). */
export function exchangeBadges(r: ExchangeRow, formatAmount: (n: number) => string, now = Date.now()): Badge[] {
  const iAmBuyr = r.partner_role === "findr";
  const amount = r.amount != null ? formatAmount(Number(r.amount)) : "";
  const st = r.state ?? "";
  switch (r.kind) {
    case "vente":
      if (st === "termine") return [{ key: "saleDone" }];
      if (st === "annule" || st === "rembourse") return [{ key: "saleCancelled" }];
      if (st === "litige") return [{ key: "dispute", amber: true }];
      {
        let action: string | null = null;
        if (iAmBuyr && (st === "paye_attente_etiquette" || st === "etiquette_refusee")) action = "actionLabel";
        else if (!iAmBuyr && st === "paye_en_attente_reception") action = "actionDropoff";
        else if (iAmBuyr && (st === "expedie" || st === "livre")) action = "actionReceipt";
        return action ? [{ key: "saleOngoing" }, { key: action, amber: true }] : [{ key: "saleOngoing" }];
      }
    case "proposition": {
      const ps = st.replace(/^proposition_/, "");
      if (ps === "rejected") return [{ key: "proposalRejected" }];
      if (ps === "withdrawn") return [{ key: "proposalWithdrawn" }];
      if (ps === "completed") return [{ key: "saleDone" }];
      if (ps === "cancelled" || ps === "expired") return [{ key: "saleCancelled" }];
      if (ps === "accepted_pending") {
        return iAmBuyr
          ? [{ key: "proposalAccepted", params: { amount } }, { key: "actionPay", amber: true }]
          : [{ key: "proposalMine", params: { amount } }, { key: "acceptedAwaitingPayment" }];
      }
      return iAmBuyr
        ? [{ key: "proposalReceived", params: { amount } }, { key: "toReview", amber: true }]
        : [{ key: "proposalMine", params: { amount } }, { key: "pending" }];
    }
    case "reservation":
      if (st === "exclusivite_expiree") return [{ key: "reservationExpired" }];
      if (st === "exclusivite_rejected") return [{ key: "message" }];
      return iAmBuyr
        ? [{ key: "reservedBy", params: { name: firstName(r.partner_name), days: daysRemaining(r.expires_at, now) } }]
        : [{ key: "reservedByMe", params: { days: daysRemaining(r.expires_at, now) } }];
    default:
      return [{ key: "message" }];
  }
}

export function firstName(name: string | null): string {
  return (name ?? "").trim().split(/\s+/)[0] || "";
}

/** Aperçu : début du dernier message, « Photo », ou texte selon le type d'échange (clé i18n). */
/** Valeur renvoyée par list_my_exchanges à la place du texte d'un message masqué par l'équipe. */
export const HIDDEN_MESSAGE_PREVIEW = "__hidden__";

export function exchangePreview(r: ExchangeRow): { text: string } | { key: string } {
  if (r.last_message_at) {
    if (r.last_message_preview === HIDDEN_MESSAGE_PREVIEW) return { key: "previewHidden" };
    const txt = (r.last_message_preview ?? "").trim();
    return txt ? { text: txt.slice(0, 80) } : { key: "previewPhoto" };
  }
  if (r.kind === "reservation") return { key: "previewReservation" };
  if (r.kind === "proposition" && r.state === "proposition_withdrawn") return { key: "previewWithdrawn" };
  return { key: "previewProposal" };
}

/** « 14:32 » aujourd'hui, « Hier », jour abrégé sur la semaine, sinon « 8 nov. ». */
export function formatExchangeTime(iso: string | null, lang: string, yesterday: string, now = new Date()): string {
  if (!iso) return "";
  const d = new Date(iso);
  const start = (x: Date) => new Date(x.getFullYear(), x.getMonth(), x.getDate()).getTime();
  const diff = Math.round((start(now) - start(d)) / DAY);
  const locale = lang.startsWith("en") ? "en-GB" : "fr-FR";
  if (diff <= 0) return d.toLocaleTimeString(locale, { hour: "2-digit", minute: "2-digit" });
  if (diff === 1) return yesterday;
  if (diff < 7) {
    const w = d.toLocaleDateString(locale, { weekday: "short" });
    return w.charAt(0).toUpperCase() + w.slice(1);
  }
  const opts: Intl.DateTimeFormatOptions = { day: "numeric", month: "short" };
  if (d.getFullYear() !== now.getFullYear()) opts.year = "numeric";
  return d.toLocaleDateString(locale, opts);
}

export function exchangeKey(r: Pick<ExchangeRow, "search_id" | "partner_id">) {
  return `${r.search_id}:${r.partner_id}`;
}

/** Ajoute une page en retirant les doublons éventuels. */
export function mergePages(prev: ExchangeRow[], next: ExchangeRow[]): ExchangeRow[] {
  const seen = new Set(prev.map(exchangeKey));
  return [...prev, ...next.filter((r) => !seen.has(exchangeKey(r)))];
}

export function nextCursor(rows: ExchangeRow[]) {
  const last = rows[rows.length - 1];
  return last ? { _before: last.last_activity_at, _before_unread: last.unread_count > 0 } : null;
}

/** Ordinateur : l'échange à ouvrir à l'arrivée (premier non lu, sinon aucun). */
export function firstUnreadExchange(rows: ExchangeRow[]): ExchangeRow | null {
  return rows.find((r) => r.unread_count > 0) ?? null;
}
