// Règles pures de détection de l'envoi (parcours étiquette).
import type { TrackingEvidence } from "./trackingEvidence.ts";

export interface LabelShipmentRow {
  payment_status: string | null;
  label_provided_at: string | null;
  shipped_at: string | null;
}

/** Vente dont l'étiquette est fournie et pas encore expédiée : en attente d'un premier scan. */
export function awaitsLabelScan(r: LabelShipmentRow): boolean {
  return r.payment_status === "paye_en_attente_reception" && !!r.label_provided_at && !r.shipped_at;
}

/** Champs posés quand un premier scan physique est détecté ; null si rien ne doit changer. */
export function planShipmentDetection(
  r: LabelShipmentRow,
  evidence: (TrackingEvidence & { checkedAt: string }) | null,
  old: boolean,
  now: number,
) {
  if (!awaitsLabelScan(r) || !evidence?.recognized || old) return null;
  return {
    payment_status: "expedie",
    shipped_at: new Date(now).toISOString(),
    tracking_recognized: true,
    tracking_first_event_at: evidence.firstEventAt,
    tracking_checked_at: evidence.checkedAt,
    tracking_status: "En transit",
  };
}

