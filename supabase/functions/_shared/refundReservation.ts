// Annulation + remboursement intégral du buyr (frais de service compris), partagé
// par cancel-reservation-refund, reject-label et la tâche horaire (échéance de l'étiquette).
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
  let refundId = "already_refunded";
  try {
    // Clé d'idempotence : une nouvelle tentative après un échec partiel ne rembourse jamais deux fois.
    const refund = await stripe.refunds.create(
      { payment_intent: reservation.stripe_payment_intent_id, metadata: { reservation_id: reservation.id, reason } },
      { idempotencyKey: `refund-${reservation.id}` },
    );
    refundId = refund.id;
  } catch (e) {
    // Remboursement déjà effectué lors d'une exécution précédente : on finalise l'annulation.
    if ((e as any)?.code !== "charge_already_refunded") throw e;
  }
  const { error } = await admin.from("reservations")
    .update({ ...extraUpdate, status: "annule", payment_status: "annule", tracking_status: "Annulé" })
    .eq("id", reservation.id);
  if (error) throw error;
  if (reservation.proposal_id) {
    await admin.from("proposals").update({ status: "cancelled" }).eq("id", reservation.proposal_id);
  }
  return { refundId };
}
