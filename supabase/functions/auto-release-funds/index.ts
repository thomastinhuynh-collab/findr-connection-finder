// Tâche planifiée :
// 1. Libère automatiquement les fonds des réservations livrées depuis + de 48 h
//    sans litige en cours.
// 2. Filet de sécurité : alerte buyr et findr si un colis expédié depuis 10 jours
//    n'a jamais été signalé comme livré.
// 3. Lève les réservations exclusives expirées sans proposition.
import { createClient } from "npm:@supabase/supabase-js@2";
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";
import { isAuthorizedCron } from "../_shared/cronAuth.ts";
import Stripe from "npm:stripe@18";
import { releaseFundsForReservation } from "../_shared/payout.ts";
import { recheckUnrecognizedTracking } from "../_shared/trackingVerification.ts";
import { checkTracking } from "../_shared/track17.ts";
import { applyShipmentDetection, planShipmentDetection } from "../_shared/shipmentDetection.ts";
import { putTrackingInReview } from "../_shared/trackingReview.ts";
import { canAutoReleaseShipped, cancellationDays, isOldTrackingEvent } from "../_shared/trackingValidation.ts";
import { AWAITING_LABEL, labelDeadlineAt, loadLabelFlowEnabled } from "../_shared/paymentStatus.ts";
import { sendEmailToUser } from "../_shared/brevo.ts";

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

const DAY = 24 * 60 * 60 * 1000;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (!(await isAuthorizedCron(req))) return json({ error: "unauthorized" }, 401);

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
    await recheckUnrecognizedTracking(admin, now);

    // 0. Parcours étiquette : détecte le premier scan physique sans dépendre des notifications 17TRACK.
    const { data: awaitingScan } = await admin.from("reservations")
      .select("id, buyr_id, findr_id, payment_status, label_provided_at, shipped_at, tracking_number, carrier, accepted_at")
      .eq("payment_status", "paye_en_attente_reception")
      .not("label_provided_at", "is", null).is("shipped_at", null).not("tracking_number", "is", null);
    for (const r of awaitingScan ?? []) {
      try {
        const evidence = await checkTracking(r.tracking_number, r.carrier ?? "");
        const old = isOldTrackingEvent(evidence?.firstEventAt ?? null, r.accepted_at);
        const detection = planShipmentDetection(r, evidence, old, now);
        if (detection) await applyShipmentDetection(admin, r, detection);
      } catch (e) {
        console.error("shipment detection failed for", r.id, e);
      }
    }

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
        "id, buyr_id, findr_id, proposal_id, findr_payout_amount, stripe_payment_intent_id, tracking_recognized, shipped_at, delivered_at, dispute_open",
      )
      .in("payment_status", ["paye_en_attente_reception", "expedie"])
      .eq("dispute_open", false)
      .is("delivered_at", null)
      .not("shipped_at", "is", null)
      .lt("shipped_at", new Date(now - 14 * DAY).toISOString());

    for (const reservation of staleShipped ?? []) {
      try {
        if (!canAutoReleaseShipped(reservation, now)) {
          await putTrackingInReview(admin, reservation);
          continue;
        }
        const result = await releaseFundsForReservation(admin, stripe, reservation, true);
        if (result.ok) released.push(reservation.id);
        else failed.push(reservation.id);
      } catch (e) {
        console.error("auto-release (stale shipped) failed for", reservation.id, e);
        failed.push(reservation.id);
      }
    }

    // 1 ter. Versements mis en revue (payout_hold — Art. 12 CGV) : on retente à chaque
    // passage. Tant que la retenue est active, le helper renvoie { held: true } sans rien
    // changer ; dès que l'admin lève la retenue, le versement part automatiquement.
    const stillHeld: string[] = [];
    const { data: inReview } = await admin
      .from("reservations")
      .select(
        "id, buyr_id, findr_id, proposal_id, findr_payout_amount, stripe_payment_intent_id",
      )
      .eq("payment_status", "versement_en_revue")
      .is("tracking_review_notified_at", null)
      .eq("dispute_open", false);

    for (const reservation of inReview ?? []) {
      try {
        const result = await releaseFundsForReservation(admin, stripe, reservation, true);
        if (result.ok) released.push(reservation.id);
        else if (result.held) stillHeld.push(reservation.id);
        else failed.push(reservation.id);
      } catch (e) {
        console.error("auto-release (in review) failed for", reservation.id, e);
        failed.push(reservation.id);
      }
    }

    // 2. Filet de sécurité : colis expédié depuis 10 jours et jamais livré
    const { data: lost } = await admin
      .from("reservations")
      .select("id, buyr_id, findr_id, shipped_at, tracking_recognized")
      .in("payment_status", ["paye_en_attente_reception", "expedie", "versement_en_revue"])
      .is("delivered_at", null)
      .is("lost_notified_at", null)
      .not("shipped_at", "is", null)
      .lt("shipped_at", new Date(now - 7 * DAY).toISOString());

    let lostNotified = 0;
    for (const reservation of lost ?? []) {
      const days = cancellationDays(reservation.tracking_recognized);
      if (now - Date.parse(reservation.shipped_at) < days * DAY) continue;
      lostNotified++;
      await admin.from("notifications").insert([
        {
          user_id: reservation.buyr_id,
          type: "shipment_lost",
          title: "Colis toujours pas livré",
          message:
            `Ton colis n'a pas été signalé comme livré depuis ${days} jours. Tu peux demander l'annulation et le remboursement complet.`,
          link: `/transaction/${reservation.id}`,
        },
        {
          user_id: reservation.findr_id,
          type: "shipment_lost",
          title: "Colis toujours pas livré",
          message:
            `Le colis expédié il y a ${days} jours n'a pas été livré. Le buyr peut demander un remboursement.`,
          link: `/transaction/${reservation.id}`,
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

    // 4. Nouveau parcours : le findr a renseigné son adresse après le paiement.
    // On recopie l'adresse, on pose l'échéance de l'étiquette et on prévient le buyr.
    // Actif seulement si app_settings.label_flow_enabled est vrai (lu à chaque exécution).
    const labelFlowEnabled = await loadLabelFlowEnabled(admin);
    const { data: awaitingAddress } = labelFlowEnabled
      ? await admin
        .from("reservations")
        .select("id, buyr_id, findr_id")
        .eq("payment_status", AWAITING_LABEL)
        .is("ship_from", null)
      : { data: [] as { id: string; buyr_id: string; findr_id: string }[] };

    let labelReady = 0;
    for (const reservation of awaitingAddress ?? []) {
      try {
        const { data: fp } = await admin
          .from("profiles")
          .select("ship_from_first_name, ship_from_last_name, ship_from_street, ship_from_postal_code, ship_from_city, ship_from_country")
          .eq("user_id", reservation.findr_id).maybeSingle();
        if (!fp?.ship_from_street || !fp.ship_from_postal_code || !fp.ship_from_city) continue;
        const shipFrom = {
          first_name: fp.ship_from_first_name ?? "",
          last_name: fp.ship_from_last_name ?? "",
          street: fp.ship_from_street,
          postal_code: fp.ship_from_postal_code,
          city: fp.ship_from_city,
          country: fp.ship_from_country ?? "FR",
        };
        // Mise à jour conditionnelle : un seul passage prévient le buyr.
        const { data: updated } = await admin
          .from("reservations")
          .update({ ship_from: shipFrom, label_deadline_at: labelDeadlineAt(shipFrom, Date.now()) })
          .eq("id", reservation.id).eq("payment_status", AWAITING_LABEL).is("ship_from", null)
          .select("id").maybeSingle();
        if (!updated) continue;
        labelReady++;
        await admin.from("notifications").insert({
          user_id: reservation.buyr_id,
          type: "label_ready",
          title: "Tu peux créer l'étiquette d'envoi",
          message: "Le findr a renseigné son adresse d'expédition. Tu as 3 jours pour fournir l'étiquette.",
          link: `/transaction/${reservation.id}`,
        });
        await sendEmailToUser(admin, reservation.buyr_id, "label_ready", { reservationId: reservation.id });
      } catch (e) {
        console.error("label-ready step failed for", reservation.id, e);
      }
    }

    return json({
      labelReady,
      released,
      failed,
      stillHeld,
      lostNotified,
      expired: (expired ?? []).length,
    });
  } catch (err) {
    console.error("auto-release-funds error:", err);
    return json({ error: (err as Error).message ?? "Erreur serveur" }, 500);
  }
});
