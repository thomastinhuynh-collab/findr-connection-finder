// Le findr marque sa proposition comme expédiée : numéro de suivi obligatoire.
// Le colis est enregistré auprès de 17TRACK pour un suivi automatique.
import { createClient } from "npm:@supabase/supabase-js@2";
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";
import { z } from "npm:zod@3";
import { sendEmailToUser } from "../_shared/brevo.ts";
import { normalizeTrackingNumber, normalizeCarrier, validateTrackingNumber, isOldTrackingEvent } from "../_shared/trackingValidation.ts";
import { checkTracking } from "../_shared/track17.ts";



const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

const BodySchema = z.object({
  reservationId: z.string().uuid(),
  trackingNumber: z.string().trim().min(4).max(64),
  carrier: z.string().trim().min(2).max(60),
});

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);

  try {
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
    if (!parsed.success) {
      return json({ error: parsed.error.flatten().fieldErrors }, 400);
    }
    const { reservationId } = parsed.data;
    const trackingNumber = normalizeTrackingNumber(parsed.data.trackingNumber);
    const carrier = parsed.data.carrier;
    const validation = validateTrackingNumber(trackingNumber, carrier);
    if (validation) return json({ error: "Numéro de suivi invalide", errorCode: validation }, 400);

    const admin = createClient(supabaseUrl, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
    const { data: reservation } = await admin
      .from("reservations")
      .select("id, buyr_id, findr_id, payment_status, shipped_at, delivery_type, accepted_at")
      .eq("id", reservationId)
      .maybeSingle();

    if (!reservation) return json({ error: "Réservation introuvable" }, 404);
    if (reservation.findr_id !== user.id) return json({ error: "Non autorisé" }, 403);
    if (reservation.payment_status !== "paye_en_attente_reception") {
      return json({ error: "Cette réservation n'est pas au stade de l'expédition." }, 400);
    }
    if (reservation.shipped_at) return json({ error: "Colis déjà marqué comme expédié." }, 400);
    if (!reservation.delivery_type) {
      return json(
        { error: "Le buyr n'a pas encore indiqué son mode de livraison." },
        400,
      );
    }

    const { data: duplicate, error: duplicateError } = await admin.from("reservations")
      .select("id").eq("tracking_carrier_key", normalizeCarrier(carrier))
      .eq("tracking_number_key", trackingNumber).neq("id", reservation.id).limit(1);
    if (duplicateError) throw duplicateError;
    if (duplicate?.length) return json({ error: "Ce numéro de suivi est déjà utilisé.", errorCode: "duplicate" }, 409);
    const evidence = await checkTracking(trackingNumber, carrier, true);
    if (isOldTrackingEvent(evidence?.firstEventAt ?? null, reservation.accepted_at)) {
      return json({ error: "Ce numéro correspond à un envoi plus ancien.", errorCode: "old" }, 400);
    }

    const { error: upErr } = await admin
      .from("reservations")
      .update({
        tracking_number: trackingNumber,
        carrier,
        shipped_at: new Date().toISOString(),
        payment_status: "expedie",
        tracking_status: "expedie",
        tracking_recognized: evidence?.recognized ?? false,
        tracking_first_event_at: evidence?.firstEventAt ?? null,
        tracking_checked_at: evidence?.checkedAt ?? null,
      })
      .eq("id", reservation.id).eq("payment_status", "paye_en_attente_reception").is("shipped_at", null)
      .select("id").single();
    if (upErr?.code === "23505") return json({ error: "Ce numéro de suivi est déjà utilisé.", errorCode: "duplicate" }, 409);
    if (upErr) throw upErr;



    await admin.from("notifications").insert({
      user_id: reservation.buyr_id,
      type: "shipment",
      title: "Ton objet est en route",
      message: `Expédié via ${carrier} — suivi n° ${trackingNumber}. Clique pour suivre ton colis.`,
      link: `/transaction/${reservation.id}`,
    });

    await sendEmailToUser(admin, reservation.buyr_id, "shipped", {
      reservationId: reservation.id,
      trackingNumber,
      carrier,
    });


    return json({ success: true, tracking_recognized: evidence?.recognized ?? false });
  } catch (err) {
    console.error("mark-shipped error:", err);
    return json({ error: (err as Error).message ?? "Erreur serveur" }, 500);
  }
});
