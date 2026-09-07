// TEST INTERNE — force une réservation en statut "expédiée" avec un suivi factice.
// Réservé aux administrateurs (vérification serveur via has_role).
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
  trackingNumber: z.string().trim().min(4).max(64).optional(),
  carrier: z.string().trim().min(2).max(60).optional(),
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

    const admin = createClient(supabaseUrl, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
    const { data: isAdmin } = await admin.rpc("has_role", {
      _user_id: userData.user.id,
      _role: "admin",
    });
    if (!isAdmin) return json({ error: "Accès réservé aux administrateurs" }, 403);

    const parsed = BodySchema.safeParse(await req.json().catch(() => ({})));
    if (!parsed.success) return json({ error: "Paramètres invalides" }, 400);

    const { reservationId } = parsed.data;
    const trackingNumber =
      parsed.data.trackingNumber ?? `TEST-${Date.now().toString(36).toUpperCase()}`;
    const carrier = parsed.data.carrier ?? "Test interne";

    const { data: reservation } = await admin
      .from("reservations")
      .select("id, buyr_id, shipped_at")
      .eq("id", reservationId)
      .maybeSingle();
    if (!reservation) return json({ error: "Réservation introuvable" }, 404);
    if (reservation.shipped_at) return json({ error: "Déjà marquée comme expédiée." }, 400);

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

    return json({ success: true, trackingNumber, carrier });
  } catch (err) {
    console.error("admin-force-shipped error:", err);
    return json({ error: (err as Error).message ?? "Erreur serveur" }, 500);
  }
});
