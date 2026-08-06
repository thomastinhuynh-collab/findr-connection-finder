import { createClient } from "npm:@supabase/supabase-js@2";
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";
import Stripe from "npm:stripe@18";

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);

  try {
    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) return json({ error: "Stripe non configuré" }, 500);

    const authHeader = req.headers.get("Authorization") ?? "";
    if (!authHeader) return json({ error: "Non authentifié" }, 401);

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const userClient = createClient(supabaseUrl, Deno.env.get("SUPABASE_ANON_KEY")!, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: userData, error: userErr } = await userClient.auth.getUser();
    if (userErr || !userData?.user) return json({ error: "Non authentifié" }, 401);
    const user = userData.user;

    const body = await req.json().catch(() => ({}));
    const reservationId = typeof body?.reservationId === "string" ? body.reservationId : null;
    if (!reservationId) return json({ error: "Paramètres invalides" }, 400);

    const admin = createClient(supabaseUrl, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);

    const { data: reservation, error: rErr } = await admin
      .from("reservations")
      .select("id, buyr_id, findr_id, proposal_id, payment_status, findr_payout_amount, stripe_payment_intent_id")
      .eq("id", reservationId)
      .maybeSingle();
    if (rErr || !reservation) return json({ error: "Réservation introuvable" }, 404);
    if (reservation.buyr_id !== user.id) return json({ error: "Non autorisé" }, 403);
    if (reservation.payment_status !== "paye_en_attente_reception") {
      return json({ error: "Cette réservation n'est pas en attente de réception." }, 400);
    }

    const { data: findrProfile } = await admin
      .from("profiles")
      .select("stripe_account_id, stripe_onboarding_complete")
      .eq("user_id", reservation.findr_id)
      .maybeSingle();

    if (!findrProfile?.stripe_account_id) {
      return json({ error: "Le findr n'a pas encore configuré ses paiements." }, 400);
    }

    const amount = Math.round(Number(reservation.findr_payout_amount) * 100);
    const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });

    // On rattache le virement à la charge du buyr (source_transaction) :
    // Stripe puise directement dans ce paiement, sans dépendre du solde
    // disponible de la plateforme (essentiel en mode Test).
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
      metadata: { reservation_id: reservation.id },
    });


    const { error: upErr } = await admin
      .from("reservations")
      .update({ payment_status: "termine", stripe_transfer_id: transfer.id })
      .eq("id", reservation.id);
    if (upErr) throw upErr;

    await admin.from("transactions").insert({
      findr_id: reservation.findr_id,
      reservation_id: reservation.id,
      amount: Number(reservation.findr_payout_amount),
    });

    if (reservation.proposal_id) {
      await admin.from("proposals").update({ status: "completed" }).eq("id", reservation.proposal_id);
    }

    await admin.from("notifications").insert({
      user_id: reservation.findr_id,
      type: "payout_released",
      title: "Paiement reçu ! 💰",
      message: `${Number(reservation.findr_payout_amount).toFixed(2)} € ont été versés sur ton compte.`,
      link: "/mon-espace",
    });

    return json({ success: true, transferId: transfer.id });
  } catch (err) {
    console.error("release-funds-to-findr error:", err);
    return json({ error: (err as Error).message ?? "Erreur serveur" }, 500);
  }
});
