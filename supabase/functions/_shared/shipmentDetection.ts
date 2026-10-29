// Parcours étiquette : le premier scan physique 17TRACK vaut preuve d'envoi.
// deno-lint-ignore-file no-explicit-any
import { sendEmailToUser } from "./brevo.ts";
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

/** Écrit la détection (mise à jour conditionnelle) et prévient buyr et findr. Retourne vrai si appliqué. */
export async function applyShipmentDetection(
  admin: any,
  r: LabelShipmentRow & { id: string; buyr_id: string; findr_id: string; tracking_number: string | null; carrier: string | null },
  update: Record<string, unknown>,
): Promise<boolean> {
  const { data: updated, error } = await admin.from("reservations").update(update)
    .eq("id", r.id).eq("payment_status", "paye_en_attente_reception")
    .not("label_provided_at", "is", null).is("shipped_at", null)
    .select("id").maybeSingle();
  if (error) throw error;
  if (!updated) return false;
  const link = `/transaction/${r.id}`;
  const message = r.tracking_number ? `${r.carrier ?? ""} — suivi n° ${r.tracking_number}.`.trim() : null;
  await admin.from("notifications").insert([
    { user_id: r.buyr_id, type: "shipment", title: "Colis expédié, en route", message, link },
    { user_id: r.findr_id, type: "shipment", title: "Colis expédié, en route", message, link },
  ]);
  try {
    await sendEmailToUser(admin, r.findr_id, "shipment_detected", {
      reservationId: r.id, trackingNumber: r.tracking_number, carrier: r.carrier,
    });
  } catch (e) {
    console.error("shipment detection email failed for", r.id, (e as Error).message);
  }
  return true;
}
