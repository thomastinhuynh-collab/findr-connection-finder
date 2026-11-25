// Classement, tri et état des lignes de la rubrique « Mes propositions » (findr).
import { BUYR_ONGOING_STATUSES } from "./buyrSearchRows";
import { isLabelFlowRow } from "./saleSteps";

export type ProposalTab = "pending" | "ongoing" | "done";
export type FinalBadge = "sold" | "rejected" | "cancelled" | "withdrawn";
export type ProposalState =
  | "labelReceived" | "awaitingLabel" | "labelRefused" | "awaitingDelivery" | "toShip"
  | "shipped" | "delivered" | "payoutReview" | "dispute";

export interface FindrProposalFlags {
  created_at: string;
  proposalStatus: string;
  payment_status?: string | null;
  delivery_type?: string | null;
  label_provided_at?: string | null;
  shipped_at?: string | null;
  dispute_open?: boolean | null;
}

export const classifyProposalTab = (p: FindrProposalFlags): ProposalTab => {
  const ps = p.payment_status ?? "";
  if (ps === "termine" || ps === "annule") return "done";
  if (BUYR_ONGOING_STATUSES.includes(ps)) return "ongoing";
  if (FINAL_PROPOSAL_STATUSES.includes(p.proposalStatus)) return "done";
  return "pending";
};

/** Statuts de proposition qui la sortent définitivement de « En attente ». */
const FINAL_PROPOSAL_STATUSES = ["rejected", "completed", "cancelled", "expired", "withdrawn"];

/** Chiffre gris de « Mes propositions » : exactement les lignes du filtre « En attente ». */
export const pendingProposalCount = (rows: FindrProposalFlags[]): number =>
  rows.filter((p) => classifyProposalTab(p) === "pending").length;

export const finalBadge = (p: FindrProposalFlags): FinalBadge | null => {
  if (classifyProposalTab(p) !== "done") return null;
  if (p.payment_status === "annule" || p.proposalStatus === "cancelled" || p.proposalStatus === "expired") return "cancelled";
  if (p.proposalStatus === "rejected") return "rejected";
  if (p.proposalStatus === "withdrawn") return "withdrawn";
  return "sold";
};

/** Vente en cours qui attend que le findr dépose son colis. */
export const findrNeedsAction = (p: FindrProposalFlags): boolean =>
  classifyProposalTab(p) === "ongoing" && !p.dispute_open && p.payment_status === "paye_en_attente_reception" && !p.shipped_at &&
  (!!p.label_provided_at || (!isLabelFlowRow(p) && !!p.delivery_type));

export const proposalState = (p: FindrProposalFlags): ProposalState | null => {
  if (classifyProposalTab(p) !== "ongoing") return null;
  if (p.dispute_open) return "dispute";
  switch (p.payment_status) {
    case "paye_attente_etiquette": return "awaitingLabel";
    case "etiquette_refusee": return "labelRefused";
    case "expedie": return "shipped";
    case "livre": return "delivered";
    case "versement_en_revue": return "payoutReview";
  }
  if (p.shipped_at) return "shipped";
  if (p.label_provided_at) return "labelReceived";
  return p.delivery_type ? "toShip" : "awaitingDelivery";
};

export const sortProposalRows = <T extends FindrProposalFlags>(rows: T[]): T[] =>
  [...rows].sort((a, b) => {
    const r = Number(findrNeedsAction(b)) - Number(findrNeedsAction(a));
    if (r !== 0) return r;
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  });

/** Point doré sur « Ventes en cours ». */
export const ongoingProposalNeedsAction = (rows: FindrProposalFlags[]): boolean => rows.some(findrNeedsAction);

/** Montant net enregistré : prix de l'objet moins findr_fee, sans recalcul. */
export const netAmount = (objectPrice?: number | null, findrFee?: number | null): number | null =>
  objectPrice == null ? null : Math.round((Number(objectPrice) - Number(findrFee ?? 0)) * 100) / 100;

/** « 2 j 23 h » restant avant l'échéance ; null si dépassée. */
export const remainingParts = (deadline: string | null | undefined, now = Date.now()): { d: number; h: number } | null => {
  if (!deadline) return null;
  const ms = new Date(deadline).getTime() - now;
  if (ms <= 0) return null;
  const totalH = Math.floor(ms / 3600000);
  return { d: Math.floor(totalH / 24), h: totalH % 24 };
};
