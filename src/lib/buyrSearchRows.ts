// Classement, tri et action principale des lignes de l'onglet « Mes recherches » (buyr).
export type SearchTab = "active" | "ongoing" | "done" | "cancelled";
export type PrimaryAction = "pay" | "proposals" | "label" | "receipt" | "transaction" | "edit";

/** Statuts d'une vente acceptée ET payée, pas encore finalisée → « Achats en cours ». */
export const BUYR_ONGOING_STATUSES = [
  "paye_attente_etiquette", "etiquette_refusee", "paye_en_attente_reception", "expedie", "livre", "versement_en_revue",
];

export interface BuyrSearchFlags {
  created_at: string;
  paidStatus: string | null;
  paymentPending: boolean;
  recentReservation: boolean;
  unreadCount: number;
  labelPending: boolean;
  receiptPending: boolean;
  hasTransaction: boolean;
}

export const classifySearchTab = (paidStatus: string | null): SearchTab => {
  if (paidStatus === "termine") return "done";
  if (paidStatus === "annule") return "cancelled";
  if (paidStatus && BUYR_ONGOING_STATUSES.includes(paidStatus)) return "ongoing";
  return "active";
};

/** Rang dans le filtre ; 1 = « À faire d'abord ». */
export const searchRank = (s: BuyrSearchFlags): number => {
  const tab = classifySearchTab(s.paidStatus);
  if (tab === "active") {
    if (s.paymentPending) return 1;
    if (s.recentReservation) return 2;
    if (s.unreadCount > 0) return 3;
    return 4;
  }
  if (tab === "ongoing") {
    if (s.labelPending) return 1;
    if (s.receiptPending) return 2;
    return 3;
  }
  return 9;
};

export const sortSearchRows = <T extends BuyrSearchFlags>(rows: T[]): T[] =>
  [...rows].sort((a, b) => {
    const r = searchRank(a) - searchRank(b);
    if (r !== 0) return r;
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  });

export const primaryAction = (s: BuyrSearchFlags): PrimaryAction => {
  const tab = classifySearchTab(s.paidStatus);
  if (tab === "active") {
    if (s.paymentPending) return "pay";
    if (s.unreadCount > 0 || s.recentReservation) return "proposals";
    return "edit";
  }
  if (tab === "ongoing") {
    if (s.labelPending) return "label";
    if (s.receiptPending) return "receipt";
  }
  return s.hasTransaction ? "transaction" : "edit";
};

/** Point doré sur « Achats en cours » : au moins une vente demande une action du buyr. */
export const ongoingNeedsAction = (rows: BuyrSearchFlags[]): boolean =>
  rows.some((s) => classifySearchTab(s.paidStatus) === "ongoing" && (s.labelPending || s.receiptPending));
