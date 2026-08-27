// Logique de versement des fonds au findr, partagée entre la libération
// manuelle (buyr) et la libération automatique (tâche planifiée).
import Stripe from "npm:stripe@18";

// deno-lint-ignore no-explicit-any
type Admin = any;

export async function releaseFundsForReservation(
  admin: Admin,
  stripe: Stripe,
  // deno-lint-ignore no-explicit-any
  reservation: any,
  auto = false,
): Promise<{ ok: true; transferId: string } | { ok: false; error: string }> {
  const { data: findrProfile } = await admin
    .from("profiles")
    .select("stripe_account_id")
    .eq("user_id", reservation.findr_id)
    .maybeSingle();

  if (!findrProfile?.stripe_account_id) {
    return { ok: false, error: "Le findr n'a pas encore configuré ses paiements." };
  }

  const amount = Math.round(Number(reservation.findr_payout_amount) * 100);

  let sourceTransaction: string | undefined;
  if (reservation.stripe_payment_intent_id) {
    try {
      const pi = await stripe.paymentIntents.retrieve(reservation.stripe_payment_intent_id);
      const latest = pi.latest_charge;
      sourceTransaction = typeof latest === "string" ? latest : latest?.id;
    } catch (e) {
      console.error("Impossible de récupérer la charge d'origine:", e);
    }
  }

  const transfer = await stripe.transfers.create({
    amount,
    currency: "eur",
    destination: findrProfile.stripe_account_id,
    ...(sourceTransaction ? { source_transaction: sourceTransaction } : {}),
    metadata: { reservation_id: reservation.id, auto: String(auto) },
  });

  await admin
    .from("reservations")
    .update({ payment_status: "termine", status: "termine", stripe_transfer_id: transfer.id })
    .eq("id", reservation.id);

  await admin.from("transactions").insert({
    findr_id: reservation.findr_id,
    reservation_id: reservation.id,
    amount: Number(reservation.findr_payout_amount),
  });

  if (reservation.proposal_id) {
    await admin.from("proposals").update({ status: "completed" }).eq("id", reservation.proposal_id);
  }

  const notifications = [
    {
      user_id: reservation.findr_id,
      type: "payout_released",
      title: auto ? "Paiement libéré automatiquement 💰" : "Paiement reçu ! 💰",
      message: `${Number(reservation.findr_payout_amount).toFixed(2)} € ont été versés sur ton compte.`,
      link: "/mon-espace",
    },
  ];
  if (auto) {
    notifications.push({
      user_id: reservation.buyr_id,
      type: "payout_released",
      title: "Fonds libérés automatiquement",
      message:
        "48 h après la livraison sans réclamation, le paiement a été versé au findr. Merci pour ta confiance !",
      link: "/mon-espace",
    });
  }
  await admin.from("notifications").insert(notifications);

  return { ok: true, transferId: transfer.id };
}
