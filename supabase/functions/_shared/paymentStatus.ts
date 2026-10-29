// Statuts de paiement d'une réservation, partagés par les fonctions serveur.
// paye_attente_etiquette : payé, étiquette attendue de la part du buyr (nouveau parcours).
// paye_en_attente_reception : étiquette fournie (ou ancien parcours), colis à déposer.
export const AWAITING_LABEL = "paye_attente_etiquette";

/** Parcours étiquette pas encore construit : tant que false, les paiements démarrent dans l'ancien parcours. */
export const LABEL_FLOW_ENABLED = false;

/** Statut posé par le webhook Stripe à la confirmation du paiement. */
export const INITIAL_PAID_STATUS = LABEL_FLOW_ENABLED ? AWAITING_LABEL : "paye_en_attente_reception";

/** Statuts où le paiement est déjà enregistré (idempotence du webhook Stripe). */
export const ALREADY_PAID_STATUSES = [
  AWAITING_LABEL,
  "paye_en_attente_reception",
  "expedie",
  "livre",
  "versement_en_revue",
  "termine",
  "annule",
];

/** Statuts payés et encore annulables/remboursables. */
export const CANCELLABLE_STATUSES = [AWAITING_LABEL, "paye_en_attente_reception", "expedie", "livre"];

export const LABEL_DEADLINE_DAYS = 3;
const DAY = 24 * 60 * 60 * 1000;

/** Échéance de l'étiquette : départ + 3 jours si le findr a une adresse d'expédition, sinon aucune. */
export function labelDeadlineAt(shipFrom: unknown, from: number): string | null {
  if (!shipFrom || typeof shipFrom !== "object" || Object.keys(shipFrom).length === 0) return null;
  return new Date(from + LABEL_DEADLINE_DAYS * DAY).toISOString();
}
