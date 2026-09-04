// Tâche planifiée :
// 1. Libère automatiquement les fonds des réservations livrées depuis + de 48 h
//    sans litige en cours.
// 2. Filet de sécurité : alerte buyr et findr si un colis expédié depuis 10 jours
//    n'a jamais été signalé comme livré.
// 3. Lève les réservations exclusives expirées sans proposition.
import { createClient } from "npm:@supabase/supabase-js@2";
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";
import Stripe from "npm:stripe@18";
import { releaseFundsForReservation } from "../_shared/payout.ts";

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

const DAY = 24 * 60 * 60 * 1000;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) return json({ error: "Stripe non configuré" }, 500);
    const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });

    const admin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    const now = Date.now();
    const released: string[] = [];
    const failed: string[] = [];

    // 1. Libération automatique 48 h après livraison
    const { data: toRelease } = await admin
      .from("reservations")
      .select(
        "id, buyr_id, findr_id, proposal_id, findr_payout_amount, stripe_payment_intent_id",
      )
      .eq("payment_status", "livre")
      .eq("dispute_open", false)
      .lt("delivered_at", new Date(now - 2 * DAY).toISOString());

    for (const reservation of toRelease ?? []) {
      try {
        const result = await releaseFundsForReservation(admin, stripe, reservation, true);
        if (result.ok) released.push(reservation.id);
        else failed.push(reservation.id);
      } catch (e) {
        console.error("auto-release failed for", reservation.id, e);
        failed.push(reservation.id);
      }
    }

    // 1 bis. Filet de sécurité : colis expédié depuis + de 14 jours mais jamais détecté
    // "livré" par le transporteur (faux numéro, transporteur non couvert par 17TRACK…).
    // Sans cela une transaction resterait bloquée indéfiniment.
    const { data: staleShipped } = await admin
      .from("reservations")
      .select(
        "id, buyr_id, findr_id, proposal_id, findr_payout_amount, stripe_payment_intent_id",
      )
      .in("payment_status", ["paye_en_attente_reception", "expedie"])
      .eq("dispute_open", false)
      .is("delivered_at", null)
      .not("shipped_at", "is", null)
      .lt("shipped_at", new Date(now - 14 * DAY).toISOString());

    for (const reservation of staleShipped ?? []) {
      try {
        const result = await releaseFundsForReservation(admin, stripe, reservation, true);
        if (result.ok) released.push(reservation.id);
        else failed.push(reservation.id);
      } catch (e) {
        console.error("auto-release (stale shipped) failed for", reservation.id, e);
        failed.push(reservation.id);
      }
    }

    // 2. Filet de sécurité : colis expédié depuis 10 jours et jamais livré
    const { data: lost } = await admin
      .from("reservations")
      .select("id, buyr_id, findr_id")
      .eq("payment_status", "paye_en_attente_reception")
      .is("delivered_at", null)
      .is("lost_notified_at", null)
      .not("shipped_at", "is", null)
      .lt("shipped_at", new Date(now - 10 * DAY).toISOString());

    for (const reservation of lost ?? []) {
      await admin.from("notifications").insert([
        {
          user_id: reservation.buyr_id,
          type: "shipment_lost",
          title: "Colis toujours pas livré",
          message:
            "Ton colis n'a pas été signalé comme livré depuis 10 jours. Tu peux demander l'annulation et le remboursement complet.",
          link: "/mon-espace",
        },
        {
          user_id: reservation.findr_id,
          type: "shipment_lost",
          title: "Colis toujours pas livré",
          message:
            "Le colis expédié il y a 10 jours n'a pas été livré. Le buyr peut demander un remboursement.",
          link: "/mon-espace",
        },
      ]);
      await admin
        .from("reservations")
        .update({ lost_notified_at: new Date().toISOString() })
        .eq("id", reservation.id);
    }

    // 3. Réservations exclusives expirées sans proposition
    const { data: expired } = await admin
      .from("reservations")
      .select("id, findr_id, search_id, proposal_id")
      .eq("status", "approved")
      .is("proposal_id", null)
      .lt("expires_at", new Date(now).toISOString());

    for (const reservation of expired ?? []) {
      await admin
        .from("reservations")
        .update({ status: "expired", expired_without_proposal: true })
        .eq("id", reservation.id);
      await admin
        .from("searches")
        .update({ status: "active" })
        .eq("id", reservation.search_id)
        .eq("status", "reserved");
      await admin.from("notifications").insert({
        user_id: reservation.findr_id,
        type: "reservation_expired",
        title: "Réservation expirée",
        message:
          "Ta réservation exclusive a expiré sans proposition : la recherche est de nouveau ouverte à tous les findrs.",
        link: "/mon-espace",
      });
    }

    return json({
      released,
      failed,
      lostNotified: (lost ?? []).length,
      expired: (expired ?? []).length,
    });
  } catch (err) {
    console.error("auto-release-funds error:", err);
    return json({ error: (err as Error).message ?? "Erreur serveur" }, 500);
  }
});
