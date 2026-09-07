// Le findr marque sa proposition comme expédiée : numéro de suivi obligatoire.
// Le colis est enregistré auprès de 17TRACK pour un suivi automatique.
import { createClient } from "npm:@supabase/supabase-js@2";
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";
import { z } from "npm:zod@3";
import { sendEmailToUser } from "../_shared/brevo.ts";
import { trackingUrl } from "../_shared/tracking.ts";


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
    const { reservationId, trackingNumber, carrier } = parsed.data;

    const admin = createClient(supabaseUrl, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
    const { data: reservation } = await admin
      .from("reservations")
      .select("id, buyr_id, findr_id, payment_status, shipped_at")
      .eq("id", reservationId)
      .maybeSingle();

    if (!reservation) return json({ error: "Réservation introuvable" }, 404);
    if (reservation.findr_id !== user.id) return json({ error: "Non autorisé" }, 403);
    if (reservation.payment_status !== "paye_en_attente_reception") {
      return json({ error: "Cette réservation n'est pas au stade de l'expédition." }, 400);
    }
    if (reservation.shipped_at) return json({ error: "Colis déjà marqué comme expédié." }, 400);

    // Enregistrement du colis auprès de 17TRACK (mode sandbox tant que la clé est en test)
    const trackKey = Deno.env.get("TRACK17_API_KEY");
    if (trackKey) {
      try {
        const res = await fetch("https://api.17track.net/track/v2.2/register", {
          method: "POST",
          headers: { "17token": trackKey, "Content-Type": "application/json" },
          body: JSON.stringify([{ number: trackingNumber, auto_detection: true }]),
        });
        console.log("17track register:", res.status, await res.text());
      } catch (e) {
        console.error("17track register failed:", e);
      }
    }

    const { error: upErr } = await admin
      .from("reservations")
      .update({
        tracking_number: trackingNumber,
        carrier,
        shipped_at: new Date().toISOString(),
        tracking_status: "expedie",
      })
      .eq("id", reservation.id);
    if (upErr) throw upErr;

    const trackUrl = trackingUrl(carrier, trackingNumber);

    await admin.from("notifications").insert({
      user_id: reservation.buyr_id,
      type: "shipment",
      title: "Ton objet est en route 📦",
      message: `Expédié via ${carrier} — suivi n° ${trackingNumber}. Clique pour suivre ton colis.`,
      link: trackUrl ?? "/mon-espace",
    });

    await sendEmailToUser(admin, reservation.buyr_id, "shipped", {
      trackingNumber,
      carrier,
    });


    return json({ success: true });
  } catch (err) {
    console.error("mark-shipped error:", err);
    return json({ error: (err as Error).message ?? "Erreur serveur" }, 500);
  }
});
