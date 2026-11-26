// Suppression personnelle d'une conversation (hide_exchange) : règles partagées par la liste et la conversation.

/** Ventes payées non finalisées : la suppression est refusée (même liste que hide_exchange côté serveur). */
export const SALE_OPEN_STATUSES = [
  "paye_attente_etiquette", "etiquette_refusee", "paye_en_attente_reception", "expedie", "livre", "versement_en_revue",
] as const;

export function isSaleOpen(paymentStatus: string | null | undefined): boolean {
  return (SALE_OPEN_STATUSES as readonly string[]).includes(paymentStatus ?? "");
}

/** Clé i18n (sous messagingList.deleteExchange) pour un refus de hide_exchange. */
export function deleteErrorKey(message: string | null | undefined): "blocked" | "errorGeneric" {
  return (message ?? "").includes("sale_in_progress") ? "blocked" : "errorGeneric";
}

/** Après suppression, l'échange à sélectionner sur ordinateur : le suivant, sinon le précédent, sinon aucun. */
export function nextAfterDelete<T>(rows: T[], removedKey: string, keyOf: (r: T) => string): T | null {
  const i = rows.findIndex((r) => keyOf(r) === removedKey);
  if (i === -1) return null;
  return rows[i + 1] ?? rows[i - 1] ?? null;
}
