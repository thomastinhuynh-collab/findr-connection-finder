// Choix de livraison : seul l'ancien parcours demande au buyr un mode de livraison
// (delivery_type). Dans le parcours étiquette, le buyr choisit sa livraison sur le
// site du transporteur et delivery_type reste vide : il ne faut jamais en déduire
// qu'un choix de livraison est attendu.

export interface DeliveryChoiceRow {
  payment_status?: string | null;
  delivery_type?: string | null;
  label_provided_at?: string | null;
}

/** Vente du parcours étiquette (en attente, refusée, ou étiquette déjà fournie). */
export const isLabelFlowSale = (r?: DeliveryChoiceRow | null): boolean =>
  !!r &&
  (r.payment_status === "paye_attente_etiquette" ||
    r.payment_status === "etiquette_refusee" ||
    (r.payment_status === "paye_en_attente_reception" && !!r.label_provided_at));

/** Ancien parcours : vente payée à expédier dont le buyr n'a pas encore choisi sa livraison. */
export const awaitsDeliveryChoice = (r?: DeliveryChoiceRow | null): boolean =>
  !!r && r.payment_status === "paye_en_attente_reception" && !r.delivery_type && !isLabelFlowSale(r);
