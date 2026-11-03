import { createClient } from "npm:@supabase/supabase-js@2";
import Stripe from "npm:stripe@18";
import { isStripeAccountComplete } from "../_shared/stripeAccount.ts";
import { sendEmailTo, sendEmailToUser } from "../_shared/brevo.ts";
import { ALREADY_PAID_STATUSES, AWAITING_LABEL, initialPaidStatus, labelDeadlineAt, loadLabelFlowEnabled } from "../_shared/paymentStatus.ts";
import {
  buyrPaymentText,
  moneyFr,
  findrAcceptedParagraphs,
  type SaleContext,
  SHIP_FROM_PATH,
  shipFromNeededText,
} from "../_shared/saleMessages.ts";

const ADMIN_EMAIL = "thomas@findrapp.fr";

Deno.serve(async (req) => {
  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
  const rawBody = await req.text();
  // Try every configured signing secret: the endpoint that delivered the event
  // (platform or Connect) is not reliably inferable from the event type.
  const secrets = [
    Deno.env.get("STRIPE_WEBHOOK_SECRET_PLATFORM"),
    Deno.env.get("STRIPE_WEBHOOK_SECRET"),
  ].filter((s): s is string => !!s);

  if (!stripeKey || secrets.length === 0) {
    console.error("Missing STRIPE_SECRET_KEY or webhook secrets");
    return new Response("Server not configured", { status: 500 });
  }

  const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });
  const signature = req.headers.get("stripe-signature");
  if (!signature) return new Response("Missing signature", { status: 400 });

  let event: Stripe.Event | null = null;
  let lastError = "";
  for (const secret of secrets) {
    try {
      event = await stripe.webhooks.constructEventAsync(rawBody, signature, secret);
      break;
    } catch (err) {
      lastError = (err as Error).message;
    }
  }
  if (!event) {
    console.error("Signature verification failed:", lastError);
    return new Response("Invalid signature", { status: 400 });
  }


  try {
    const admin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    if (event.type === "account.updated") {
      const account = event.data.object as Stripe.Account;
      const complete = isStripeAccountComplete(account);

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

        // Idempotence : si le paiement est déjà enregistré (ou plus avancé), on ignore.
        const { data: current } = await admin
          .from("reservations")
          .select("payment_status")
          .eq("id", reservationId)
          .maybeSingle();

        if (current?.payment_status && ALREADY_PAID_STATUSES.includes(current.payment_status)) {
          console.log(
            `checkout.session.completed ignoré (doublon) — réservation ${reservationId} déjà en ${current.payment_status}`,
          );
          return new Response(JSON.stringify({ received: true, ignored: true }), {
            status: 200,
            headers: { "Content-Type": "application/json" },
          });
        }

        // Copie de l'adresse d'expédition du findr (expéditeur des étiquettes)
        const { data: resFindr } = await admin
          .from("reservations").select("findr_id").eq("id", reservationId).maybeSingle();
        let shipFrom: Record<string, string> | null = null;
        if (resFindr?.findr_id) {
          const { data: fp } = await admin
            .from("profiles")
            .select("ship_from_first_name, ship_from_last_name, ship_from_street, ship_from_postal_code, ship_from_city, ship_from_country")
            .eq("user_id", resFindr.findr_id).maybeSingle();
          if (fp?.ship_from_street && fp.ship_from_postal_code && fp.ship_from_city) {
            shipFrom = {
              first_name: fp.ship_from_first_name ?? "",
              last_name: fp.ship_from_last_name ?? "",
              street: fp.ship_from_street,
              postal_code: fp.ship_from_postal_code,
              city: fp.ship_from_city,
              country: fp.ship_from_country ?? "FR",
            };
          }
        }

        const labelFlowEnabled = await loadLabelFlowEnabled(admin);
        const paidAt = Date.now();
        const { data: reservation, error } = await admin
          .from("reservations")
          .update({
            ship_from: shipFrom,
            payment_status: initialPaidStatus(labelFlowEnabled),
            label_deadline_at: labelFlowEnabled ? labelDeadlineAt(shipFrom, paidAt) : null,
            accepted_at: new Date(paidAt).toISOString(),
            stripe_payment_intent_id: paymentIntentId,
          })
          .eq("id", reservationId)
          // Mise à jour conditionnelle : une seule notification Stripe (même en double, simultanée)
          // enregistre le paiement, donc emails et notifications ne partent qu'une fois par vente.
          .or(`payment_status.is.null,payment_status.not.in.(${ALREADY_PAID_STATUSES.join(",")})`)
          .select("findr_id, buyr_id, search_id, findr_payout_amount, total_buyr_amount, payment_status, label_deadline_at")
          .maybeSingle();

        if (error) {
          console.error("Reservation update failed:", error.message);
          return new Response("Database error", { status: 500 });
        }
        if (!reservation) {
          console.log(`checkout.session.completed ignoré (doublon ou réservation absente) — ${reservationId}`);
          return new Response(JSON.stringify({ received: true, ignored: true }), {
            status: 200,
            headers: { "Content-Type": "application/json" },
          });
        }

        if (proposalId) {
          await admin
            .from("proposals")
            .update({ status: "accepted_pending" })
            .eq("id", proposalId);
        }

        // La recherche passe en "réservée" et les autres propositions sont refusées
        if (reservation?.search_id) {
          await admin
            .from("searches")
            .update({ status: "reserved" })
            .eq("id", reservation.search_id);

          const { data: others } = await admin
            .from("proposals")
            .select("id, findr_id")
            .eq("search_id", reservation.search_id)
            .eq("status", "pending");

          for (const other of others ?? []) {
            if (proposalId && other.id === proposalId) continue;
            await admin.from("proposals").update({ status: "rejected" }).eq("id", other.id);
            await admin.from("notifications").insert({
              user_id: other.findr_id,
              type: "proposal_rejected",
              title: "Proposition non retenue",
              message: "Une autre proposition a été acceptée pour cette recherche.",
              link: "/mon-espace?onglet=propositions",
            });
          }

          // Les demandes de réservation encore en attente sont annulées
          const { data: pendingReservations } = await admin
            .from("reservations")
            .select("id, findr_id")
            .eq("search_id", reservation.search_id)
            .eq("status", "pending");

          for (const pending of pendingReservations ?? []) {
            if (pending.id === reservationId) continue;
            await admin
              .from("reservations")
              .update({ status: "cancelled" })
              .eq("id", pending.id);
            await admin.from("notifications").insert({
              user_id: pending.findr_id,
              type: "reservation_cancelled",
              title: "Demande de réservation annulée",
              message:
                "Cette recherche a trouvé son objet auprès d'un autre findr — ta demande de réservation n'est plus applicable.",
              link: `/recherche/${reservation.search_id}`,
            });
          }
        }


        if (reservation.findr_id) {
          const link = `/transaction/${reservationId}`;
          let itemTitle: string | undefined;
          let weightKg: number | null = null;
          if (proposalId) {
            const { data: proposal } = await admin
              .from("proposals")
              .select("title, parcel_weight_kg")
              .eq("id", proposalId)
              .maybeSingle();
            itemTitle = proposal?.title ?? undefined;
            weightKg = proposal?.parcel_weight_kg != null ? Number(proposal.parcel_weight_kg) : null;
          }
          const { data: names } = await admin
            .from("profiles")
            .select("user_id, full_name")
            .in("user_id", [reservation.findr_id, reservation.buyr_id].filter(Boolean));
          const firstOf = (uid: string) =>
            ((names ?? []).find((p: { user_id: string }) => p.user_id === uid)?.full_name ?? "").trim().split(/\s+/)[0] || null;
          const ctx: SaleContext = {
            labelFlow: reservation.payment_status === AWAITING_LABEL,
            findrFirstName: firstOf(reservation.findr_id),
            buyrFirstName: reservation.buyr_id ? firstOf(reservation.buyr_id) : null,
            deadlineAt: reservation.label_deadline_at ?? null,
            weightKg,
            hasShipFrom: !!shipFrom,
            totalPaid: reservation.total_buyr_amount,
          };
          const emailData = { reservationId, itemTitle, payoutAmount: reservation.findr_payout_amount, ...ctx };
          const needsShipFrom = ctx.labelFlow && !ctx.hasShipFrom;

          // Findr : proposition acceptée (texte de la variante du parcours)
          await admin.from("notifications").insert({
            user_id: reservation.findr_id,
            type: "proposal_accepted",
            title: "Proposition acceptée et payée !",
            message: findrAcceptedParagraphs(ctx).join(" "),
            link,
          });
          await sendEmailToUser(admin, reservation.findr_id, "proposal_accepted", {
            ...emailData,
            firstName: ctx.findrFirstName ?? undefined,
          });

          // Findr sans adresse d'expédition (parcours avec étiquette)
          if (needsShipFrom) {
            await admin.from("notifications").insert({
              user_id: reservation.findr_id,
              type: "ship_from_needed",
              title: "Renseigne ton adresse d'expédition",
              message: shipFromNeededText(ctx),
              link: SHIP_FROM_PATH,
            });
            await sendEmailToUser(admin, reservation.findr_id, "ship_from_needed", {
              ...emailData,
              firstName: ctx.findrFirstName ?? undefined,
            });
          }

          // Buyr : paiement confirmé
          if (reservation.buyr_id) {
            await admin.from("notifications").insert({
              user_id: reservation.buyr_id,
              type: "payment_confirmed",
              title: "Paiement confirmé",
              message: buyrPaymentText(ctx),
              link,
            });
            await sendEmailToUser(admin, reservation.buyr_id, "payment_confirmed", {
              ...emailData,
              firstName: ctx.buyrFirstName ?? undefined,
            });
          }
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
              message: `${moneyFr(disputeAmount)} seront déduits de tes prochains versements.`,
              link: `/transaction/${reservation.id}`,
            });

            await sendEmailToUser(admin, reservation.findr_id, "chargeback_opened", {
              reservationId: reservation.id,
              amount: disputeAmount,
              itemTitle,
            });

            await sendEmailTo(ADMIN_EMAIL, "chargeback_opened", {
              reservationId: reservation.id,
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
            message: `Le débit de ${moneyFr(debit.amount)} a été annulé. Ton montant à régulariser est de ${moneyFr(newBalance)}.`,
            link: `/transaction/${reservation.id}`,
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
