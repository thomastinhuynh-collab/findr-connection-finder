// Carte épinglée en haut d'une conversation : situation et action unique de l'échange.
// Les actions reprennent les règles du bloc « À faire maintenant » (todoActions / TodoNowBlock).
import { isSaleOpen } from "./deleteExchange";
import { PAID_STATUSES, computeSaleSteps, type SaleStepRow } from "./saleSteps";

export interface CardProposal { id: string; status: string | null; proposed_price: number | null; created_at: string; image_urls?: string[] | null; title?: string | null }
export interface CardReservation extends SaleStepRow {
  id: string; status: string | null; proposal_id?: string | null; expires_at?: string | null;
  object_price?: number | null; total_buyr_amount?: number | null; findr_payout_amount?: number | null; dispute_open?: boolean | null;
  created_at: string;
  tracking_number?: string | null; carrier?: string | null; label_tracking_number?: string | null; label_carrier?: string | null;
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
  /** Proposition annulée par le findr (statut withdrawn) : aucune action. */
  withdrawn?: boolean;
  /** findr, proposition en attente : peut l'annuler (withdraw_proposal). */
  withdrawableId?: string | null;
  /** Vente payée non finalisée : la conversation ne peut pas être supprimée. */
  saleOpen?: boolean;
  /** Vente payée avec un numéro de suivi : carte de suivi sous la carte épinglée. */
  tracking?: { reservationId: string; carrier: string | null; trackingNumber: string } | null;
  /** findr : colis livré, en attente de la confirmation du buyr. */
  awaitingReceipt?: boolean;
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
      saleOpen: isSaleOpen(ps),
      tracking: saleTracking(sale),
      awaitingReceipt: !iAmBuyr && ps === "livre" && !sale.dispute_open,
    };
  }

  if (latest) {
    const st = latest.status ?? "pending";
    let action: ExchangeCardState["action"] = { key: "viewProposal", href: `/recherche/${searchId}` };
    if (iAmBuyr && st === "accepted_pending") action = { key: "pay", href: `/recherche/${searchId}?payer=${latest.id}` };
    else if (!iAmBuyr && st === "pending") action = { key: "editProposal", href: `/modifier-proposition/${latest.id}` };
    if (st === "withdrawn") return { kind: "proposition", price: latest.proposed_price, payout: null, action: null, multipleProposals, withdrawn: true };
    return { kind: "proposition", price: latest.proposed_price, payout: null, action, multipleProposals,
      withdrawableId: !iAmBuyr && st === "pending" ? latest.id : null };
  }

  const resa = [...input.reservations].filter((r) => !SALE_STATUSES.includes(r.payment_status ?? ""))
    .sort((a, b) => b.created_at.localeCompare(a.created_at))[0];
  if (resa && ["pending", "approved"].includes(resa.status ?? "") && (!resa.expires_at || Date.parse(resa.expires_at) > now)) {
    return { kind: "reservation", price: null, payout: null, reservedUntil: resa.expires_at ?? null, action: null, multipleProposals: false };
  }
  return null;
}

/** Message d'erreur (clé i18n sous exchangeCard.withdraw) pour un refus de withdraw_proposal. */
export function withdrawErrorKey(message: string | null | undefined): "errorCheckout" | "errorNotPending" | "errorGeneric" {
  const m = message ?? "";
  if (m.includes("checkout_in_progress")) return "errorCheckout";
  if (m.includes("not_pending")) return "errorNotPending";
  return "errorGeneric";
}

/** Bannière « Proposition envoyée » : paramètre d'adresse lu une seule fois. */
export const PROPOSAL_SENT_PARAM = "proposition";
export const PROPOSAL_SENT_VALUE = "envoyee";
export function proposalSentUrl(searchId: string, buyrId: string) {
  return `/messagerie/${searchId}?with=${buyrId}&${PROPOSAL_SENT_PARAM}=${PROPOSAL_SENT_VALUE}`;
}

/** Suivi affiché seulement pour une vente payée ayant un numéro de suivi (étiquette fournie ou saisi). */
export function saleTracking(sale: CardReservation): ExchangeCardState["tracking"] {
  if (!PAID_STATUSES.includes(sale.payment_status ?? "")) return null;
  const trackingNumber = (sale.tracking_number || sale.label_tracking_number || "").trim();
  if (!trackingNumber) return null;
  return { reservationId: sale.id, carrier: sale.carrier || sale.label_carrier || null, trackingNumber };
}
