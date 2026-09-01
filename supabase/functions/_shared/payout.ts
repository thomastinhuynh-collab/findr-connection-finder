// Logique de versement des fonds au findr, partagée entre la libération
// manuelle (buyr) et la libération automatique (tâche planifiée).
import Stripe from "npm:stripe@18";
import { sendEmailToUser } from "./brevo.ts";

// deno-lint-ignore no-explicit-any
type Admin = any;

export async function releaseFundsForReservation(
  admin: Admin,
  stripe: Stripe,
  // deno-lint-ignore no-explicit-any
  reservation: any,
  auto = false,
): Promise<
  | { ok: true; transferId: string | null; compensated?: number }
  | { ok: false; error: string; held?: boolean }
> {
  const { data: findrProfile } = await admin
    .from("profiles")
    .select("stripe_account_id, negative_balance, payout_hold")
    .eq("user_id", reservation.findr_id)
    .maybeSingle();

  if (!findrProfile?.stripe_account_id) {
    return { ok: false, error: "Le findr n'a pas encore configuré ses paiements." };
  }

  // Article 12 CGV — versements mis en attente pour revue manuelle.
  if (findrProfile.payout_hold) {
    await admin
      .from("reservations")
      .update({ payment_status: "versement_en_revue" })
      .eq("id", reservation.id);
    console.log(`payout_hold actif — réservation ${reservation.id} placée en revue manuelle`);
    return {
      ok: false,
      held: true,
      error: "Le versement de ce findr est en attente de revue manuelle par l'équipe findr.",
    };
  }

  const grossAmount = Number(reservation.findr_payout_amount) || 0;
  const negativeBalance = Number(findrProfile.negative_balance) || 0;

  // Article 12 CGV — compensation automatique du solde à régulariser.
  const compensated = negativeBalance > 0 ? Math.min(negativeBalance, grossAmount) : 0;
  const netAmount = Math.max(0, grossAmount - compensated);
  const amount = Math.round(netAmount * 100);

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

  let transferId: string | null = null;
  if (amount > 0) {
    const transfer = await stripe.transfers.create({
      amount,
      currency: "eur",
      destination: findrProfile.stripe_account_id,
      ...(sourceTransaction ? { source_transaction: sourceTransaction } : {}),
      metadata: {
        reservation_id: reservation.id,
        auto: String(auto),
        compensated: compensated.toFixed(2),
      },
    });
    transferId = transfer.id;
  }

  if (compensated > 0) {
    const remaining = Math.max(0, Number((negativeBalance - compensated).toFixed(2)));
    await admin
      .from("profiles")
      .update({ negative_balance: remaining })
      .eq("user_id", reservation.findr_id);

    await admin.from("findr_debits").insert({
      findr_id: reservation.findr_id,
      reservation_id: reservation.id,
      amount: Number(compensated.toFixed(2)),
      reason: "ajustement_admin",
      status: "compense",
      resolved_at: new Date().toISOString(),
      admin_notes: `Compensation automatique sur le versement de la réservation ${reservation.id}.`,
    });

    await admin.from("notifications").insert({
      user_id: reservation.findr_id,
      type: "balance_compensated",
      title: "Solde régularisé sur ton versement",
      message: `${compensated.toFixed(2)} € ont été déduits de ce versement au titre de ton solde à régulariser. Reste à régulariser : ${remaining.toFixed(2)} €.`,
      link: "/mon-espace",
    });
  }

  await admin
    .from("reservations")
    .update({ payment_status: "termine", stripe_transfer_id: transferId })
    .eq("id", reservation.id);


  await admin.from("transactions").insert({
    findr_id: reservation.findr_id,
    reservation_id: reservation.id,
    amount: netAmount,
  });

  if (reservation.proposal_id) {
    await admin.from("proposals").update({ status: "completed" }).eq("id", reservation.proposal_id);
  }

  const notifications = [
    {
      user_id: reservation.findr_id,
      type: "payout_released",
      title: auto ? "Paiement libéré automatiquement 💰" : "Paiement reçu ! 💰",
      message: `${netAmount.toFixed(2)} € ont été versés sur ton compte.`,
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

  // Emails (jamais bloquants)
  let itemTitle: string | undefined;
  if (reservation.proposal_id) {
    const { data: proposal } = await admin
      .from("proposals")
      .select("title")
      .eq("id", reservation.proposal_id)
      .maybeSingle();
    itemTitle = proposal?.title ?? undefined;
  }
  const payoutAmount = Number(reservation.findr_payout_amount);

  if (auto) {
    await sendEmailToUser(admin, reservation.findr_id, "auto_release", {
      role: "findr",
      amount: payoutAmount,
      itemTitle,
    });
    await sendEmailToUser(admin, reservation.buyr_id, "auto_release", {
      role: "buyr",
      amount: payoutAmount,
      itemTitle,
    });
  } else {
    await sendEmailToUser(admin, reservation.findr_id, "funds_released", {
      amount: payoutAmount,
      itemTitle,
    });
  }


  return { ok: true, transferId: transfer.id };
}
