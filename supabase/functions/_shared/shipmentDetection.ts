// Parcours étiquette : le premier scan physique 17TRACK vaut preuve d'envoi.
// deno-lint-ignore-file no-explicit-any
import { sendEmailToUser } from "./brevo.ts";
import type { LabelShipmentRow } from "./shipmentRules.ts";
export { awaitsLabelScan, planShipmentDetection } from "./shipmentRules.ts";

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
    const { data: buyrProfile } = await admin.from("profiles").select("full_name").eq("user_id", r.buyr_id).maybeSingle();
    const buyrFirstName = (buyrProfile?.full_name ?? "").trim().split(/\s+/)[0];
    await sendEmailToUser(admin, r.findr_id, "shipment_detected", {
      reservationId: r.id, trackingNumber: r.tracking_number, carrier: r.carrier, buyrFirstName,
    });
  } catch (e) {
    console.error("shipment detection email failed for", r.id, (e as Error).message);
  }
  return true;
}
