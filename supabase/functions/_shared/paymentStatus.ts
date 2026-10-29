// Statuts de paiement d'une réservation, partagés par les fonctions serveur.
// paye_attente_etiquette : payé, étiquette attendue de la part du buyr (nouveau parcours).
// paye_en_attente_reception : étiquette fournie (ou ancien parcours), colis à déposer.
export const AWAITING_LABEL = "paye_attente_etiquette";
/** Étiquette refusée par le findr : le buyr doit en fournir une nouvelle. */
export const LABEL_REJECTED = "etiquette_refusee";

/** Statut posé par le webhook Stripe à la confirmation du paiement, selon app_settings.label_flow_enabled. */
export function initialPaidStatus(labelFlowEnabled: boolean): string {
  return labelFlowEnabled ? AWAITING_LABEL : "paye_en_attente_reception";
}

/** Lit app_settings.label_flow_enabled à chaque exécution ; faux si la lecture échoue. */
// deno-lint-ignore no-explicit-any
export async function loadLabelFlowEnabled(admin: any): Promise<boolean> {
  try {
    const { data, error } = await admin.from("app_settings").select("label_flow_enabled").maybeSingle();
    if (error) return false;
    return data?.label_flow_enabled === true;
  } catch {
    return false;
  }
}

/** Statuts où le paiement est déjà enregistré (idempotence du webhook Stripe). */
export const ALREADY_PAID_STATUSES = [
  AWAITING_LABEL,
  LABEL_REJECTED,
  "paye_en_attente_reception",
  "expedie",
  "livre",
  "versement_en_revue",
  "termine",
  "annule",
];

/** Statuts payés et encore annulables/remboursables. */
export const CANCELLABLE_STATUSES = [AWAITING_LABEL, LABEL_REJECTED, "paye_en_attente_reception", "expedie", "livre"];

export const LABEL_DEADLINE_DAYS = 3;
const DAY = 24 * 60 * 60 * 1000;

/** Échéance de l'étiquette : départ + 3 jours si le findr a une adresse d'expédition, sinon aucune. */
export function labelDeadlineAt(shipFrom: unknown, from: number): string | null {
  if (!shipFrom || typeof shipFrom !== "object" || Object.keys(shipFrom).length === 0) return null;
  return new Date(from + LABEL_DEADLINE_DAYS * DAY).toISOString();
}

/** Le buyr ne peut confirmer la réception qu'à partir de l'expédition. */
export const RECEIPT_CONFIRMABLE_STATUSES = ["expedie", "livre"];
const PAID_NOT_SHIPPED = [AWAITING_LABEL, LABEL_REJECTED, "paye_en_attente_reception"];

/** Message de refus de « Confirmer la réception », ou null si la confirmation est possible. */
export function receiptConfirmationError(status: string | null): string | null {
  const s = status ?? "";
  if (RECEIPT_CONFIRMABLE_STATUSES.includes(s)) return null;
  if (s === "termine") return "Le versement de cette réservation a déjà été effectué.";
  if (PAID_NOT_SHIPPED.includes(s)) return "L'objet n'a pas encore été expédié";
  if (s === "versement_en_revue") return "Ta réception est bien enregistrée. Le versement au findr est en cours de revue par l'équipe findr : il partira automatiquement dès validation.";
  return `Cette réservation n'est pas en cours (statut : ${s || "aucun"}).`;
}
