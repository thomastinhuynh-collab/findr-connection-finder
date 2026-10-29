// Annulation avant expédition : remboursement intégral du buyr (frais inclus).
// Peut être déclenché par le buyr (findr sans nouvelles depuis 5 jours ou colis perdu)
// ou par le findr lui-même (objet finalement indisponible).
import { createClient } from "npm:@supabase/supabase-js@2";
import { CANCELLABLE_STATUSES } from "../_shared/paymentStatus.ts";
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";
import { refundAndCancelReservation } from "../_shared/refundReservation.ts";
import { z } from "npm:zod@3";
import { sendEmailToUser } from "../_shared/brevo.ts";
import { cancellationDays } from "../_shared/trackingValidation.ts";

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

const BodySchema = z.object({
  reservationId: z.string().uuid(),
  reason: z.string().trim().max(500).optional(),
});

const DAY = 24 * 60 * 60 * 1000;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);

  try {
    if (!Deno.env.get("STRIPE_SECRET_KEY")) return json({ error: "Stripe non configuré" }, 500);

    const authHeader = req.headers.get("Authorization") ?? "";
    if (!authHeader) return json({ error: "Non authentifié" }, 401);

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const userClient = createClient(supabaseUrl, Deno.env.get("SUPABASE_ANON_KEY")!, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: userData, error: userErr } = await userClient.auth.getUser();
    if (userErr || !userData?.user) return json({ error: "Non authentifié" }, 401);
    const user = userData.user;

    const parsed = BodySchema.safeParse(await req.json().catch(() => ({})));
    if (!parsed.success) return json({ error: parsed.error.flatten().fieldErrors }, 400);
    const { reservationId, reason } = parsed.data;

    const admin = createClient(supabaseUrl, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
    const { data: reservation } = await admin
      .from("reservations")
      .select(
        "id, buyr_id, findr_id, proposal_id, payment_status, stripe_payment_intent_id, shipped_at, accepted_at, created_at, total_buyr_amount, tracking_recognized, tracking_review_notified_at",
      )
      .eq("id", reservationId)
      .maybeSingle();

    if (!reservation) return json({ error: "Réservation introuvable" }, 404);

    const isBuyr = reservation.buyr_id === user.id;
    const isFindr = reservation.findr_id === user.id;
    if (!isBuyr && !isFindr) return json({ error: "Non autorisé" }, 403);

    if (!CANCELLABLE_STATUSES.includes(reservation.payment_status ?? "") && !(reservation.payment_status === "versement_en_revue" && reservation.tracking_review_notified_at)) {
      return json({ error: "Cette réservation ne peut plus être annulée." }, 400);
    }

    const shippedAt = reservation.shipped_at ? new Date(reservation.shipped_at).getTime() : null;

    if (isBuyr) {
      // Le buyr peut annuler si pas d'expédition après 5 jours,
      // ou si le colis expédié n'a pas été livré après 10 jours.
      const acceptedAt = new Date(
        reservation.accepted_at ?? reservation.created_at,
      ).getTime();
      const noShipment5d = !shippedAt && Date.now() - acceptedAt >= 5 * DAY;
      const days = cancellationDays(reservation.tracking_recognized);
      const lost10d = !!shippedAt && Date.now() - shippedAt >= days * DAY;
      if (!noShipment5d && !lost10d) {
        return json(
          {
            error:
              `L'annulation est possible 5 jours après l'acceptation sans expédition, ou ${days} jours après une expédition non livrée.`,
          },
          400,
        );
      }
    } else if (shippedAt) {
      return json({ error: "Le colis est déjà expédié, l'annulation n'est plus possible." }, 400);
    }

    if (!reservation.stripe_payment_intent_id) {
      return json({ error: "Aucun paiement à rembourser." }, 400);
    }

    const refund = { id: (await refundAndCancelReservation(admin, reservation, reason ?? "")).refundId };

    const amount = Number(reservation.total_buyr_amount ?? 0).toFixed(2);
    await admin.from("notifications").insert([
      {
        user_id: reservation.findr_id,
        type: "cancellation",
        title: "Transaction annulée",
        message: isBuyr
          ? "Le buyr a demandé l'annulation et a été intégralement remboursé."
          : "Tu as annulé cette transaction. Le buyr a été intégralement remboursé.",
        link: `/transaction/${reservation.id}`,
      },
      {
        user_id: reservation.buyr_id,
        type: "cancellation",
        title: "Remboursement en cours",
        message: `${amount} € (frais inclus) te seront recrédités sous quelques jours.`,
        link: `/transaction/${reservation.id}`,
      },
    ]);

    await sendEmailToUser(admin, reservation.buyr_id, "refund", {
      reservationId: reservation.id,
      amount: reservation.total_buyr_amount,
      reason: isBuyr
        ? "annulation demandée faute d'expédition ou de livraison dans les délais"
        : "le findr n'a finalement pas pu fournir l'objet",
    });

    return json({ success: true, refundId: refund.id });
  } catch (err) {
    console.error("cancel-reservation-refund error:", err);
    return json({ error: (err as Error).message ?? "Erreur serveur" }, 500);
  }
});
