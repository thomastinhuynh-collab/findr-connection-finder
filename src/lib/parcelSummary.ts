// Résumé du suivi d'un colis pour la conversation : dernier scan physique ou attente de prise en charge.
// Mêmes statuts physiques que le serveur (_shared/trackingEvidence.ts, InfoReceived exclu).
export const PHYSICAL_SCAN_STATUSES = ["InTransit", "AvailableForPickup", "OutForDelivery", "Delivered"];

export interface SummaryEvent { occurred_at: string; status: string; description?: string | null; location?: string | null }
export type ParcelStatusKey = "awaiting" | "InTransit" | "AvailableForPickup" | "OutForDelivery" | "Delivered" | "other";

export function parcelSummary<E extends SummaryEvent>(events: E[]): { key: ParcelStatusKey; latest: E | null } {
  const sorted = [...events].sort((a, b) => b.occurred_at.localeCompare(a.occurred_at));
  if (!sorted.some((e) => PHYSICAL_SCAN_STATUSES.includes(e.status))) return { key: "awaiting", latest: null };
  const latest = sorted[0];
  const key = (PHYSICAL_SCAN_STATUSES.includes(latest.status) ? latest.status : "other") as ParcelStatusKey;
  return { key, latest };
}
