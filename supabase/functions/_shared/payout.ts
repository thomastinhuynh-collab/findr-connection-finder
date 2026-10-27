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
  // Re-read the server-owned review marker before any automatic transfer.
  // Tracking review must never be treated as an ordinary account payout hold.
  if (auto) {
    const { data: current, error } = await admin.from("reservations")
      .select("tracking_review_notified_at, tracking_recognized, shipped_at, delivered_at, payment_status")
      .eq("id", reservation.id).maybeSingle();
    if (error || !current) return { ok: false, error: "Vérification du versement impossible." };
    if (current.tracking_review_notified_at || (current.shipped_at && !current.delivered_at && current.tracking_recognized !== true)) {
      return { ok: false, held: true, error: "Le suivi doit être examiné avant tout versement automatique." };
    }
    if (current.payment_status === "termine") return { ok: false, error: "Versement déjà effectué." };
  }
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
      title: "Montant régularisé sur ton versement",
      message: `${compensated.toFixed(2)} € ont été déduits de ce versement au titre de ton montant à régulariser. Reste à régulariser : ${remaining.toFixed(2)} €.`,
      link: `/transaction/${reservation.id}`,
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
      title: auto ? "Versement déclenché automatiquement" : "Versement effectué",
      message: `Un versement de ${netAmount.toFixed(2)} € a été effectué par Stripe.`,
      link: `/transaction/${reservation.id}`,
    },
  ];

  if (auto) {
    notifications.push({
      user_id: reservation.buyr_id,
      type: "payout_released",
      title: "Versement au findr déclenché automatiquement",
      message:
        "48 h après la livraison sans réclamation, le versement au findr a été effectué. Merci pour ta confiance !",
      link: `/transaction/${reservation.id}`,
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
  const payoutAmount = netAmount;

  if (auto) {
    await sendEmailToUser(admin, reservation.findr_id, "auto_release", {
      reservationId: reservation.id,
      role: "findr",
      amount: payoutAmount,
      itemTitle,
    });
    await sendEmailToUser(admin, reservation.buyr_id, "auto_release", {
      reservationId: reservation.id,
      role: "buyr",
      amount: payoutAmount,
      itemTitle,
    });
  } else {
    await sendEmailToUser(admin, reservation.findr_id, "funds_released", {
      reservationId: reservation.id,
      amount: payoutAmount,
      itemTitle,
    });
  }


  return { ok: true, transferId, compensated };
}
