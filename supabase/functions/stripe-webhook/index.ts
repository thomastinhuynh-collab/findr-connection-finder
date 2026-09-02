import { createClient } from "npm:@supabase/supabase-js@2";
import Stripe from "npm:stripe@18";
import { sendEmailTo, sendEmailToUser } from "../_shared/brevo.ts";

const ADMIN_EMAIL = "thomas@findrapp.fr";

Deno.serve(async (req) => {
  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
  const rawBody = await req.text();
  const webhookType = (JSON.parse(rawBody) as { type?: string }).type ?? "";

  const webhookSecret = webhookType === "account.updated"
    ? Deno.env.get("STRIPE_WEBHOOK_SECRET")
    : Deno.env.get("STRIPE_WEBHOOK_SECRET_PLATFORM");

  if (!stripeKey || !webhookSecret) {
    console.error("Missing STRIPE_SECRET_KEY or appropriate webhook secret");
    return new Response("Server not configured", { status: 500 });
  }

  const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });
  const signature = req.headers.get("stripe-signature");
  if (!signature) return new Response("Missing signature", { status: 400 });

  let event: Stripe.Event;
  try {
    event = await stripe.webhooks.constructEventAsync(rawBody, signature, webhookSecret);
  } catch (err) {
    console.error("Signature verification failed:", (err as Error).message);
    return new Response("Invalid signature", { status: 400 });
  }


  try {
    const admin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    if (event.type === "account.updated") {
      const account = event.data.object as Stripe.Account;
      const complete = !!account.charges_enabled && !!account.payouts_enabled;

      const { error } = await admin
        .from("profiles")
        .update({ stripe_onboarding_complete: complete })
        .eq("stripe_account_id", account.id);

      if (error) {
        console.error("Profile update failed:", error.message);
        return new Response("Database error", { status: 500 });
      }
      console.log(`account.updated ${account.id} -> onboarding_complete=${complete}`);
    }

    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session;
      const reservationId = session.metadata?.reservation_id;
      const proposalId = session.metadata?.proposal_id;

      if (reservationId) {
        const paymentIntentId =
          typeof session.payment_intent === "string"
            ? session.payment_intent
            : session.payment_intent?.id ?? null;

        const { data: reservation, error } = await admin
          .from("reservations")
          .update({
            payment_status: "paye_en_attente_reception",
            accepted_at: new Date().toISOString(),
            stripe_payment_intent_id: paymentIntentId,
          })
          .eq("id", reservationId)
          .select("findr_id, search_id, findr_payout_amount")
          .maybeSingle();

        if (error) {
          console.error("Reservation update failed:", error.message);
          return new Response("Database error", { status: 500 });
        }

        if (proposalId) {
          await admin
            .from("proposals")
            .update({ status: "accepted_pending" })
            .eq("id", proposalId);
        }

        if (reservation?.findr_id) {
          await admin.from("notifications").insert({
            user_id: reservation.findr_id,
            type: "proposal_accepted",
            title: "Proposition acceptée et payée ! 🎉",
            message:
              "Le paiement est sécurisé jusqu'à la confirmation de réception de l'article.",
            link: "/mes-propositions",
          });

          let itemTitle: string | undefined;
          if (proposalId) {
            const { data: proposal } = await admin
              .from("proposals")
              .select("title")
              .eq("id", proposalId)
              .maybeSingle();
            itemTitle = proposal?.title ?? undefined;
          }

          await sendEmailToUser(admin, reservation.findr_id, "proposal_accepted", {
            itemTitle,
            payoutAmount: reservation.findr_payout_amount,
          });
        }
        console.log(`checkout.session.completed -> reservation ${reservationId} paid`);
      }
    }

    // ===== Article 12 CGV : contestations bancaires (chargebacks) =====
    if (event.type.startsWith("charge.dispute.")) {
      const dispute = event.data.object as Stripe.Dispute;
      const chargeId = typeof dispute.charge === "string" ? dispute.charge : dispute.charge?.id;
      const paymentIntentId =
        typeof dispute.payment_intent === "string"
          ? dispute.payment_intent
          : dispute.payment_intent?.id ?? null;
      const disputeAmount = Number(dispute.amount ?? 0) / 100;

      let reservation: {
        id: string;
        findr_id: string;
        buyr_id: string;
        proposal_id: string | null;
        stripe_transfer_id: string | null;
      } | null = null;

      if (paymentIntentId) {
        const { data } = await admin
          .from("reservations")
          .select("id, findr_id, buyr_id, proposal_id, stripe_transfer_id")
          .eq("stripe_payment_intent_id", paymentIntentId)
          .maybeSingle();
        reservation = data ?? null;
      }

      if (!reservation) {
        console.log(`${event.type}: aucune réservation pour charge=${chargeId} pi=${paymentIntentId}`);
        return new Response(JSON.stringify({ received: true }), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        });
      }

      if (event.type === "charge.dispute.created") {
        // Les fonds n'ont pas encore été versés : le litige suit le flux escrow habituel.
        if (!reservation.stripe_transfer_id) {
          console.log(`dispute.created sur réservation ${reservation.id} non encore versée — aucun débit`);
        } else {
          const { data: existing } = await admin
            .from("findr_debits")
            .select("id")
            .eq("stripe_dispute_id", dispute.id)
            .maybeSingle();

          if (existing) {
            console.log(`dispute ${dispute.id} déjà enregistrée`);
          } else {
            await admin.from("findr_debits").insert({
              findr_id: reservation.findr_id,
              reservation_id: reservation.id,
              amount: disputeAmount,
              reason: "chargeback",
              status: "en_attente",
              stripe_dispute_id: dispute.id,
            });

            const { data: prof } = await admin
              .from("profiles")
              .select("negative_balance")
              .eq("user_id", reservation.findr_id)
              .maybeSingle();
            const newBalance = Number(
              ((Number(prof?.negative_balance) || 0) + disputeAmount).toFixed(2),
            );
            await admin
              .from("profiles")
              .update({ negative_balance: newBalance })
              .eq("user_id", reservation.findr_id);

            let itemTitle: string | undefined;
            if (reservation.proposal_id) {
              const { data: proposal } = await admin
                .from("proposals")
                .select("title")
                .eq("id", reservation.proposal_id)
                .maybeSingle();
              itemTitle = proposal?.title ?? undefined;
            }

            await admin.from("notifications").insert({
              user_id: reservation.findr_id,
              type: "chargeback_opened",
              title: "Contestation bancaire sur une transaction réglée",
              message: `${disputeAmount.toFixed(2)} € seront déduits de tes prochains versements.`,
              link: "/mon-espace",
            });

            await sendEmailToUser(admin, reservation.findr_id, "chargeback_opened", {
              amount: disputeAmount,
              itemTitle,
            });

            await sendEmailTo(ADMIN_EMAIL, "chargeback_opened", {
              firstName: "équipe findr",
              amount: disputeAmount,
              itemTitle: itemTitle ?? `Réservation ${reservation.id}`,
            });

            console.log(
              `dispute.created -> débit ${disputeAmount}€ imputé au findr ${reservation.findr_id}`,
            );
          }
        }
      }

      if (event.type === "charge.dispute.closed" && dispute.status === "won") {
        const { data: debit } = await admin
          .from("findr_debits")
          .select("id, findr_id, amount, status")
          .eq("stripe_dispute_id", dispute.id)
          .maybeSingle();

        if (debit && debit.status === "en_attente") {
          await admin
            .from("findr_debits")
            .update({
              status: "annule",
              resolved_at: new Date().toISOString(),
              admin_notes: "Contestation bancaire gagnée — débit annulé automatiquement.",
            })
            .eq("id", debit.id);

          const { data: prof } = await admin
            .from("profiles")
            .select("negative_balance")
            .eq("user_id", debit.findr_id)
            .maybeSingle();
          const newBalance = Math.max(
            0,
            Number(((Number(prof?.negative_balance) || 0) - Number(debit.amount)).toFixed(2)),
          );
          await admin
            .from("profiles")
            .update({ negative_balance: newBalance })
            .eq("user_id", debit.findr_id);

          await admin.from("notifications").insert({
            user_id: debit.findr_id,
            type: "chargeback_closed",
            title: "Contestation bancaire rejetée",
            message: `Le débit de ${Number(debit.amount).toFixed(2)} € a été annulé. Ton solde à régulariser est de ${newBalance.toFixed(2)} €.`,
            link: "/mon-espace",
          });
          console.log(`dispute.closed(won) -> débit ${debit.id} annulé`);
        }
      }

      if (event.type === "charge.dispute.updated") {
        console.log(`dispute.updated ${dispute.id} status=${dispute.status}`);
      }
    }




    return new Response(JSON.stringify({ received: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("stripe-webhook error:", err);
    return new Response("Webhook handler error", { status: 500 });
  }
});
