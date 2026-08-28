import { createClient } from "npm:@supabase/supabase-js@2";
import Stripe from "npm:stripe@18";
import { sendEmailToUser } from "../_shared/brevo.ts";

Deno.serve(async (req) => {
  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
  const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET");
  if (!stripeKey || !webhookSecret) {
    console.error("Missing STRIPE_SECRET_KEY or STRIPE_WEBHOOK_SECRET");
    return new Response("Server not configured", { status: 500 });
  }

  const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });
  const signature = req.headers.get("stripe-signature");
  if (!signature) return new Response("Missing signature", { status: 400 });

  const rawBody = await req.text();

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


    return new Response(JSON.stringify({ received: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("stripe-webhook error:", err);
    return new Response("Webhook handler error", { status: 500 });
  }
});
