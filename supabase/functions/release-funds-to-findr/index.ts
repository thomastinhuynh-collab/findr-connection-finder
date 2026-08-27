import { createClient } from "npm:@supabase/supabase-js@2";
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";
import Stripe from "npm:stripe@18";
import { releaseFundsForReservation } from "../_shared/payout.ts";

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
      .select(
        "id, buyr_id, findr_id, proposal_id, payment_status, dispute_open, findr_payout_amount, stripe_payment_intent_id",
      )
      .eq("id", reservationId)
      .maybeSingle();
    if (rErr || !reservation) return json({ error: "Réservation introuvable" }, 404);
    if (reservation.buyr_id !== user.id) return json({ error: "Non autorisé" }, 403);
    if (!["paye_en_attente_reception", "livre"].includes(reservation.payment_status ?? "")) {
      return json({ error: "Cette réservation n'est pas en attente de réception." }, 400);
    }
    if (reservation.dispute_open) {
      return json({ error: "Une réclamation est en cours sur cette transaction." }, 400);
    }

    const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });
    const result = await releaseFundsForReservation(admin, stripe, reservation, false);
    if (!result.ok) return json({ error: result.error }, 400);

    return json({ success: true, transferId: result.transferId });
  } catch (err) {
    console.error("release-funds-to-findr error:", err);
    return json({ error: (err as Error).message ?? "Erreur serveur" }, 500);
  }
});
