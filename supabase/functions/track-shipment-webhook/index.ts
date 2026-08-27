// Webhook 17TRACK : met à jour le statut de livraison des réservations.
import { createClient } from "npm:@supabase/supabase-js@2";
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";

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
    const payload = await req.json().catch(() => null);
    if (!payload) return json({ error: "Payload invalide" }, 400);

    const data = payload?.data ?? payload;
    const trackingNumber: string | undefined = data?.number ?? data?.tracking_number;
    const statusCode: string | undefined =
      data?.track_info?.latest_status?.status ?? data?.status ?? data?.track?.e;

    if (!trackingNumber) return json({ error: "Numéro de suivi absent" }, 400);

    const admin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    const { data: reservation } = await admin
      .from("reservations")
      .select("id, buyr_id, findr_id, payment_status")
      .eq("tracking_number", trackingNumber)
      .maybeSingle();

    if (!reservation) {
      console.log("Aucune réservation pour le suivi", trackingNumber);
      return json({ received: true });
    }

    const label = (statusCode && STATUS_LABELS[statusCode]) || statusCode || "En transit";
    const isDelivered = statusCode === "Delivered";

    // deno-lint-ignore no-explicit-any
    const update: any = { tracking_status: label };
    if (isDelivered && reservation.payment_status === "paye_en_attente_reception") {
      update.delivered_at = new Date().toISOString();
      update.payment_status = "livre";
    }

    await admin.from("reservations").update(update).eq("id", reservation.id);

    if (isDelivered) {
      await admin.from("notifications").insert([
        {
          user_id: reservation.buyr_id,
          type: "delivery",
          title: "Colis livré 📬",
          message:
            "Confirme la réception de ton objet. Sans action de ta part, les fonds seront libérés automatiquement sous 48 h.",
          link: "/mon-espace",
        },
        {
          user_id: reservation.findr_id,
          type: "delivery",
          title: "Colis livré 📬",
          message: "Le buyr a reçu l'objet. Les fonds seront libérés sous 48 h.",
          link: "/mon-espace",
        },
      ]);
    }

    return json({ received: true });
  } catch (err) {
    console.error("track-shipment-webhook error:", err);
    return json({ error: (err as Error).message ?? "Erreur serveur" }, 500);
  }
});
