// Annulation + remboursement intégral du buyr (frais de service compris), partagé
// par cancel-reservation-refund et reject-label.
// deno-lint-ignore-file no-explicit-any
import Stripe from "npm:stripe@18";

export async function refundAndCancelReservation(
  admin: any,
  reservation: { id: string; proposal_id: string | null; stripe_payment_intent_id: string | null },
  reason: string,
  extraUpdate: Record<string, unknown> = {},
): Promise<{ refundId: string }> {
  const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
  if (!stripeKey) throw new Error("Stripe non configuré");
  if (!reservation.stripe_payment_intent_id) throw new Error("Aucun paiement à rembourser.");
  const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });
  const refund = await stripe.refunds.create({
    payment_intent: reservation.stripe_payment_intent_id,
    metadata: { reservation_id: reservation.id, reason },
  });
  await admin.from("reservations")
    .update({ ...extraUpdate, status: "annule", payment_status: "annule", tracking_status: "Annulé" })
    .eq("id", reservation.id);
  if (reservation.proposal_id) {
    await admin.from("proposals").update({ status: "cancelled" }).eq("id", reservation.proposal_id);
  }
  return { refundId: refund.id };
}
