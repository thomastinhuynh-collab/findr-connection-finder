// Carte épinglée en haut d'une conversation : situation et action unique de l'échange.
// Les actions reprennent les règles du bloc « À faire maintenant » (todoActions / TodoNowBlock).
import { PAID_STATUSES, computeSaleSteps, type SaleStepRow } from "./saleSteps";

export interface CardProposal { id: string; status: string | null; proposed_price: number | null; created_at: string; image_urls?: string[] | null; title?: string | null }
export interface CardReservation extends SaleStepRow {
  id: string; status: string | null; proposal_id?: string | null; expires_at?: string | null;
  object_price?: number | null; total_buyr_amount?: number | null; findr_payout_amount?: number | null; dispute_open?: boolean | null;
  created_at: string;
}

export type CardActionKey = "pay" | "provideLabel" | "confirmReceipt" | "viewLabel" | "viewSale" | "viewProposal" | "editProposal";
export interface ExchangeCardState {
  kind: "vente" | "proposition" | "reservation";
  /** Montant affiché (prix), tel qu'enregistré. */
  price: number | null;
  /** findr : montant net enregistré sur la vente (« tu recevras »), sinon null. */
  payout: number | null;
  step?: { index: number; total: number; key: string; labelFlow: boolean };
  reservedUntil?: string | null;
  action: { key: CardActionKey; href: string } | null;
  /** Plusieurs propositions du même findr : lien « Voir les propositions ». */
  multipleProposals: boolean;
}

const SALE_STATUSES = [...PAID_STATUSES, "annule", "rembourse"];

export function exchangeCardState(input: {
  iAmBuyr: boolean;
  searchId: string;
  proposals: CardProposal[];
  reservations: CardReservation[];
  now?: number;
}): ExchangeCardState | null {
  const { iAmBuyr, searchId } = input;
  const now = input.now ?? Date.now();
  const proposals = [...input.proposals].sort((a, b) => b.created_at.localeCompare(a.created_at));
  const latest = proposals[0] ?? null;
  const multipleProposals = proposals.length > 1;
  const sales = input.reservations.filter((r) => SALE_STATUSES.includes(r.payment_status ?? "")).sort((a, b) => b.created_at.localeCompare(a.created_at));
  const sale = sales[0] ?? null;
  const saleOpen = !!sale && PAID_STATUSES.includes(sale.payment_status ?? "") && sale.payment_status !== "termine";
  // Une nouvelle proposition en attente, plus récente qu'une vente close, passe devant.
  const newerPending = !!latest && !!sale && !saleOpen && ["pending", "accepted_pending"].includes(latest.status ?? "") && latest.created_at > sale.created_at;

  if (sale && !newerPending) {
    const ps = sale.payment_status ?? "";
    const s = computeSaleSteps(sale);
    const idx = s.current === -1 ? s.keys.length - 1 : s.current;
    const tx = `/transaction/${sale.id}`;
    let key: CardActionKey = "viewSale";
    if (iAmBuyr && (ps === "paye_attente_etiquette" || ps === "etiquette_refusee")) key = "provideLabel";
    else if (iAmBuyr && (ps === "expedie" || ps === "livre") && !sale.dispute_open) key = "confirmReceipt";
    else if (!iAmBuyr && ps === "paye_en_attente_reception" && !!sale.label_provided_at) key = "viewLabel";
    return {
      kind: "vente",
      price: sale.object_price ?? latest?.proposed_price ?? null,
      payout: iAmBuyr ? null : sale.findr_payout_amount ?? null,
      step: PAID_STATUSES.includes(ps) ? { index: idx + 1, total: s.keys.length, key: s.keys[idx], labelFlow: s.labelFlow } : undefined,
      action: { key, href: tx },
      multipleProposals,
    };
  }

  if (latest) {
    const st = latest.status ?? "pending";
    let action: ExchangeCardState["action"] = { key: "viewProposal", href: `/recherche/${searchId}` };
    if (iAmBuyr && st === "accepted_pending") action = { key: "pay", href: `/recherche/${searchId}?payer=${latest.id}` };
    else if (!iAmBuyr && st === "pending") action = { key: "editProposal", href: `/modifier-proposition/${latest.id}` };
    return { kind: "proposition", price: latest.proposed_price, payout: null, action, multipleProposals };
  }

  const resa = [...input.reservations].filter((r) => !SALE_STATUSES.includes(r.payment_status ?? ""))
    .sort((a, b) => b.created_at.localeCompare(a.created_at))[0];
  if (resa && ["pending", "approved"].includes(resa.status ?? "") && (!resa.expires_at || Date.parse(resa.expires_at) > now)) {
    return { kind: "reservation", price: null, payout: null, reservedUntil: resa.expires_at ?? null, action: null, multipleProposals: false };
  }
  return null;
}

/** Bannière « Proposition envoyée » : paramètre d'adresse lu une seule fois. */
export const PROPOSAL_SENT_PARAM = "proposition";
export const PROPOSAL_SENT_VALUE = "envoyee";
export function proposalSentUrl(searchId: string, buyrId: string) {
  return `/messagerie/${searchId}?with=${buyrId}&${PROPOSAL_SENT_PARAM}=${PROPOSAL_SENT_VALUE}`;
}
