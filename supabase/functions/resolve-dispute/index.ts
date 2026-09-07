// Résolution d'un litige par un administrateur.
// Vérification STRICTE du rôle admin côté serveur (table user_roles).
import { createClient } from "npm:@supabase/supabase-js@2";
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";
import Stripe from "npm:stripe@18";
import { z } from "npm:zod@3";
import { releaseFundsForReservation } from "../_shared/payout.ts";
import { sendEmailToUser } from "../_shared/brevo.ts";

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

const BodySchema = z.object({
  reservationId: z.string().uuid(),
  resolution: z.enum(["verse_findr", "rembourse_buyr"]),
  notes: z.string().trim().min(5).max(2000),
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

    const admin = createClient(supabaseUrl, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);

    // Contrôle d'accès strict : rôle admin obligatoire
    const { data: isAdmin } = await admin.rpc("has_role", {
      _user_id: user.id,
      _role: "admin",
    });
    if (!isAdmin) return json({ error: "Accès réservé aux administrateurs" }, 403);

    const parsed = BodySchema.safeParse(await req.json().catch(() => ({})));
    if (!parsed.success) return json({ error: "Paramètres invalides" }, 400);
    const { reservationId, resolution, notes } = parsed.data;

    const { data: reservation } = await admin
      .from("reservations")
      .select(
        "id, buyr_id, findr_id, proposal_id, payment_status, dispute_status, findr_payout_amount, total_buyr_amount, stripe_payment_intent_id",
      )
      .eq("id", reservationId)
      .maybeSingle();

    if (!reservation) return json({ error: "Réservation introuvable" }, 404);
    if (reservation.dispute_status !== "ouvert") {
      return json({ error: "Ce litige n'est plus ouvert." }, 400);
    }

    // Titre de l'objet pour les emails de décision (non bloquant).
    let itemTitle: string | undefined;
    if (reservation.proposal_id) {
      const { data: proposal } = await admin
        .from("proposals")
        .select("title")
        .eq("id", reservation.proposal_id)
        .maybeSingle();
      itemTitle = proposal?.title ?? undefined;
    }

    const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });
    const resolvedAt = new Date().toISOString();


    if (resolution === "verse_findr") {
      // La libération partage la même logique que release-funds-to-findr.
      const result = await releaseFundsForReservation(admin, stripe, reservation, false);
      if (!result.ok) return json({ error: result.error }, 400);

      await admin
        .from("reservations")
        .update({
          dispute_open: false,
          dispute_status: "resolu",
          dispute_resolution_type: "verse_findr",
          dispute_resolution_notes: notes,
          dispute_resolved_at: resolvedAt,
        })
        .eq("id", reservation.id);

      await admin.from("notifications").insert([
        {
          user_id: reservation.buyr_id,
          type: "dispute_resolved",
          title: "Litige résolu",
          message:
            "Après examen de ta réclamation, l'équipe findr a versé le paiement au findr.",
          link: "/mon-espace",
        },
        {
          user_id: reservation.findr_id,
          type: "dispute_resolved",
          title: "Litige résolu en ta faveur",
          message: "Le litige est clos, ton paiement a été versé.",
          link: "/mon-espace",
        },
      ]);

      await Promise.allSettled([
        sendEmailToUser(admin, reservation.buyr_id, "dispute_resolved_buyr", {
          outcome: "verse_findr",
          itemTitle,
          amount: reservation.total_buyr_amount,
          notes,
        }),
        sendEmailToUser(admin, reservation.findr_id, "dispute_resolved_findr", {
          outcome: "verse_findr",
          itemTitle,
          amount: reservation.findr_payout_amount,
          notes,
        }),
      ]);

      return json({ success: true, transferId: result.transferId });
    }


    // Remboursement intégral du buyr
    if (!reservation.stripe_payment_intent_id) {
      return json({ error: "Aucun paiement à rembourser." }, 400);
    }
    const refund = await stripe.refunds.create({
      payment_intent: reservation.stripe_payment_intent_id,
      metadata: { reservation_id: reservation.id, dispute: "rembourse_buyr" },
    });

    await admin
      .from("reservations")
      .update({
        status: "annule",
        payment_status: "annule",
        tracking_status: "Annulé",
        dispute_open: false,
        dispute_status: "resolu",
        dispute_resolution_type: "rembourse_buyr",
        dispute_resolution_notes: notes,
        dispute_resolved_at: resolvedAt,
      })
      .eq("id", reservation.id);

    if (reservation.proposal_id) {
      await admin
        .from("proposals")
        .update({ status: "cancelled" })
        .eq("id", reservation.proposal_id);
    }

    const amount = Number(reservation.total_buyr_amount ?? 0).toFixed(2);
    await admin.from("notifications").insert([
      {
        user_id: reservation.buyr_id,
        type: "dispute_resolved",
        title: "Litige résolu — remboursement",
        message: `Ta réclamation a été acceptée : ${amount} € (frais inclus) te seront recrédités sous quelques jours.`,
        link: "/mon-espace",
      },
      {
        user_id: reservation.findr_id,
        type: "dispute_resolved",
        title: "Litige résolu — remboursement du buyr",
        message: "Après examen, le buyr a été intégralement remboursé et la transaction annulée.",
        link: "/mon-espace",
      },
    ]);

    await Promise.allSettled([
      sendEmailToUser(admin, reservation.buyr_id, "dispute_resolved_buyr", {
        outcome: "rembourse_buyr",
        itemTitle,
        amount: reservation.total_buyr_amount,
        notes,
      }),
      sendEmailToUser(admin, reservation.findr_id, "dispute_resolved_findr", {
        outcome: "rembourse_buyr",
        itemTitle,
        notes,
      }),
    ]);


    return json({ success: true, refundId: refund.id });
  } catch (err) {
    console.error("resolve-dispute error:", err);
    return json({ error: (err as Error).message ?? "Erreur serveur" }, 500);
  }
});
