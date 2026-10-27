// Webhook 17TRACK : met à jour le statut de livraison des réservations.
import { createClient } from "npm:@supabase/supabase-js@2";
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";
import { sendEmailToUser } from "../_shared/brevo.ts";
import { checkTracking } from "../_shared/track17.ts";
import { normalizeTrackingNumber, isOldTrackingEvent } from "../_shared/trackingValidation.ts";
import { putTrackingInReview } from "../_shared/trackingReview.ts";

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

// Correspondance des statuts 17TRACK vers un libellé lisible
const STATUS_LABELS: Record<string, string> = {
  NotFound: "En attente de prise en charge",
  InfoReceived: "Informations reçues",
  InTransit: "En transit",
  Expired: "Suivi expiré",
  AvailableForPickup: "Arrivé en point relais",
  OutForDelivery: "En cours de livraison",
  DeliveryFailure: "Échec de livraison",
  Delivered: "Livré",
  Exception: "Incident de livraison",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);

  try {
    const raw = await req.text();
    const key = Deno.env.get("TRACK17_API_KEY");
    if (!key) return json({ error: "Tracking verification unavailable" }, 503);
    const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(`${raw}/${key}`));
    const expected = Array.from(new Uint8Array(digest), b => b.toString(16).padStart(2, "0")).join("");
    const signature = req.headers.get("sign")?.toLowerCase() ?? "";
    if (signature.length !== expected.length || Array.from(expected).reduce((diff, c, i) => diff | (c.charCodeAt(0) ^ signature.charCodeAt(i)), 0) !== 0) return json({ error: "Invalid signature" }, 401);
    const payload = JSON.parse(raw);
    if (!payload) return json({ error: "Payload invalide" }, 400);

    const data = payload?.data ?? payload;
    const number = data?.number ?? data?.tracking_number;
    const trackingNumber = typeof number === "string" && number.length <= 64 ? normalizeTrackingNumber(number) : null;

    if (!trackingNumber) return json({ error: "Numéro de suivi absent" }, 400);

    const admin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    const { data: reservations } = await admin
      .from("reservations")
      .select("id, buyr_id, findr_id, payment_status, tracking_number, carrier, accepted_at, tracking_review_notified_at, delivered_at")
      .eq("tracking_number_key", trackingNumber);

    for (const reservation of reservations ?? []) {
    // Never trust a supplied Delivered status alone: read back official evidence
    // for this reservation's carrier and reject recycled shipments.
    const evidence = await checkTracking(trackingNumber, reservation.carrier ?? "");
    if (!evidence) continue;
    if (isOldTrackingEvent(evidence.firstEventAt, reservation.accepted_at)) {
      await putTrackingInReview(admin, reservation, "old");
      continue;
    }
    const statusCode = evidence.status;

    const label = (statusCode && STATUS_LABELS[statusCode]) || statusCode || "En transit";
    const isDelivered = evidence.recognized && statusCode === "Delivered" && !reservation.delivered_at && !reservation.tracking_review_notified_at;

    // deno-lint-ignore no-explicit-any
    const update: any = { tracking_status: label, tracking_recognized: evidence.recognized, tracking_first_event_at: evidence.firstEventAt, tracking_checked_at: evidence.checkedAt };
    if (isDelivered && ["paye_en_attente_reception", "expedie"].includes(reservation.payment_status ?? "")) {
      update.delivered_at = new Date().toISOString();
      update.payment_status = "livre";
    }

    const { data: updated, error } = await admin.from("reservations").update(update).eq("id", reservation.id)
      .eq("payment_status", reservation.payment_status).is("delivered_at", reservation.delivered_at)
      .select("id").maybeSingle();
    if (error) throw error;
    if (!updated) continue;

    if (isDelivered && update.payment_status === "livre") {
      await admin.from("notifications").insert([
        {
          user_id: reservation.buyr_id,
          type: "delivery",
          title: "Colis livré",
          message:
            "Confirme la réception de ton objet. Sans action de ta part, le versement au findr sera déclenché automatiquement sous 48 h.",
          link: `/transaction/${reservation.id}`,
        },
        {
          user_id: reservation.findr_id,
          type: "delivery",
          title: "Colis livré",
          message: "Le buyr a reçu l'objet. Ton versement sera déclenché sous 48 h.",
          link: `/transaction/${reservation.id}`,
        },
      ]);

      await sendEmailToUser(admin, reservation.buyr_id, "delivered", {
      reservationId: reservation.id,});
    }
    }

    return json({ received: true });
  } catch (err) {
    console.error("track-shipment-webhook error:", err);
    return json({ error: (err as Error).message ?? "Erreur serveur" }, 500);
  }
});
