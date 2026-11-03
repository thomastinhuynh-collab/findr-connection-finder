// Parcours étiquette, vue buyr : ce que la carte de proposition et sa fenêtre de détail
// doivent montrer après le paiement. Règles pures, partagées avec Mon espace.

export interface BuyrLabelRow {
  payment_status?: string | null;
  label_provided_at?: string | null;
  label_deadline_at?: string | null;
  shipped_at?: string | null;
  ship_from?: { street?: string | null; postal_code?: string | null; city?: string | null } | null;
}

export type BuyrLabelAction = "provide" | "rejected" | "waitingShipFrom";

const LABEL_STATUSES = ["paye_attente_etiquette", "etiquette_refusee"];

/** Vente en attente d'une étiquette du buyr (première ou nouvelle après refus). */
export const isAwaitingBuyrLabel = (r?: BuyrLabelRow | null): boolean =>
  !!r && LABEL_STATUSES.includes(r.payment_status ?? "");

export const hasShipFrom = (r?: BuyrLabelRow | null): boolean =>
  !!(r?.ship_from?.street && r.ship_from.postal_code && r.ship_from.city);

/** Encadré d'action à afficher au buyr, ou null hors statuts d'étiquette. */
export const buyrLabelAction = (r?: BuyrLabelRow | null): BuyrLabelAction | null => {
  if (!isAwaitingBuyrLabel(r)) return null;
  if (r!.payment_status === "etiquette_refusee") return "rejected";
  return hasShipFrom(r) ? "provide" : "waitingShipFrom";
};

/** Le buyr a quelque chose à faire maintenant (pastille de Mon espace). */
export const buyrMustProvideLabel = (r?: BuyrLabelRow | null): boolean => {
  const action = buyrLabelAction(r);
  if (action === "rejected") return true;
  return action === "provide" && !!r?.label_deadline_at;
};

/** Bouton secondaire « Voir la transaction » sur les cartes buyr et findr. */
export const showTransactionLink = (r?: BuyrLabelRow | null): boolean =>
  !!r &&
  ((r.payment_status === "paye_en_attente_reception" && !!r.label_provided_at) ||
    r.payment_status === "expedie" ||
    r.payment_status === "livre");

/** « Tu pourras confirmer la réception dès que l'objet sera expédié » (fenêtre de détail). */
export const showConfirmAfterShipping = (r?: BuyrLabelRow | null): boolean =>
  !!r && r.payment_status === "paye_en_attente_reception" && !r.shipped_at;

/** Compte à rebours en jours et heures jusqu'à la date limite. */
export const labelCountdown = (deadline: string | null | undefined, now = Date.now()) => {
  if (!deadline) return null;
  const ms = new Date(deadline).getTime() - now;
  if (Number.isNaN(ms)) return null;
  if (ms <= 0) return { expired: true, days: 0, hours: 0 };
  return {
    expired: false,
    days: Math.floor(ms / 86_400_000),
    hours: Math.floor((ms % 86_400_000) / 3_600_000),
  };
};
