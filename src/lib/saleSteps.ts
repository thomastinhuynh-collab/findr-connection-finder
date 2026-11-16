// Frise d'une vente : module unique utilisé par la page de transaction et par
// « Achats et ventes en cours » dans Mon espace (même vocabulaire, même calcul).
import { isLabelFlowSale } from "./deliveryChoice";

export const PAID_STATUSES = ["paye_attente_etiquette", "etiquette_refusee", "paye_en_attente_reception", "expedie", "livre", "versement_en_revue", "termine"];

export const LABEL_STEP_KEYS = ["payment", "label", "shipping", "reception", "payout"] as const;
export const LEGACY_STEP_KEYS = ["paid", "deliveryChosen", "toShip", "enRoute", "received", "payout"] as const;

export interface SaleStepRow {
  payment_status?: string | null;
  delivery_type?: string | null;
  label_provided_at?: string | null;
  shipped_at?: string | null;
  delivered_at?: string | null;
  tracking_review_notified_at?: string | null;
}

export interface SaleSteps {
  labelFlow: boolean;
  keys: readonly string[];
  done: boolean[];
  /** Index de l'étape en cours, -1 si tout est terminé. */
  current: number;
}

export const isLabelFlowRow = (r: SaleStepRow): boolean => isLabelFlowSale(r) || !!r.label_provided_at;

export function computeSaleSteps(r: SaleStepRow): SaleSteps {
  const ps = r.payment_status ?? "";
  const paid = PAID_STATUSES.includes(ps);
  const shipped = paid && (!!r.shipped_at || ["expedie", "livre", "versement_en_revue", "termine"].includes(ps));
  const arrived = !!r.delivered_at || ["livre", "termine"].includes(ps);
  const received = ps === "termine" || (ps === "versement_en_revue" && !r.tracking_review_notified_at);
  const payoutDone = ps === "termine";
  const labelFlow = isLabelFlowRow(r);
  let done: boolean[];
  if (labelFlow) {
    done = [paid, paid && !!r.label_provided_at, paid && !!r.shipped_at, paid && (arrived || received), payoutDone];
  } else {
    const deliveryChosen = paid && (!!r.delivery_type || shipped);
    done = [paid, deliveryChosen, shipped, arrived, received, payoutDone];
  }
  return { labelFlow, keys: labelFlow ? LABEL_STEP_KEYS : LEGACY_STEP_KEYS, done, current: done.findIndex((d) => !d) };
}

/** Vente payée et non finalisée (affichée dans « Achats et ventes en cours »). */
export const isOngoingSale = (r: SaleStepRow): boolean => {
  const ps = r.payment_status ?? "";
  return PAID_STATUSES.includes(ps) && ps !== "termine";
};
