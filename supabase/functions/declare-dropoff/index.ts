// Le findr déclare avoir déposé le colis (parcours étiquette). Simple déclaration :
// aucun effet sur le versement, qui reste fondé sur le suivi officiel.
import { createClient } from "npm:@supabase/supabase-js@2";
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";
import { z } from "npm:zod@3";
import { loadLabelFlowEnabled } from "../_shared/paymentStatus.ts";
import { checkFindrLabelEligibility } from "../_shared/labelFlow.ts";

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { ...corsHeaders, "Content-Type": "application/json" } });

const BodySchema = z.object({ reservationId: z.string().uuid() });

const ELIGIBILITY: Record<string, [number, string]> = {
  flow_disabled: [403, "Le parcours étiquette n'est pas encore disponible."],
  not_found: [404, "Réservation introuvable"],
  forbidden: [403, "Non autorisé"],
  status: [400, "Le dépôt ne peut pas être déclaré pour cette réservation."],
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);

  try {
    const authHeader = req.headers.get("Authorization") ?? "";
    if (!authHeader.startsWith("Bearer ")) return json({ error: "Non authentifié" }, 401);
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const userClient = createClient(supabaseUrl, Deno.env.get("SUPABASE_ANON_KEY")!, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: claims, error: claimsErr } = await userClient.auth.getClaims(authHeader.slice(7));
    const userId = claims?.claims?.sub;
    if (claimsErr || !userId) return json({ error: "Non authentifié" }, 401);

    const admin = createClient(supabaseUrl, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
    const flowEnabled = await loadLabelFlowEnabled(admin);
    if (!flowEnabled) return json({ error: ELIGIBILITY.flow_disabled[1], errorCode: "flow_disabled" }, 403);

    const parsed = BodySchema.safeParse(await req.json().catch(() => ({})));
    if (!parsed.success) return json({ error: "Requête invalide" }, 400);
    const { reservationId } = parsed.data;

    const { data: reservation } = await admin.from("reservations")
      .select("id, buyr_id, findr_id, payment_status, label_provided_at, shipped_at, dropoff_declared_at")
      .eq("id", reservationId).maybeSingle();
    const elig = checkFindrLabelEligibility(flowEnabled, reservation, userId);
    if (elig) return json({ error: ELIGIBILITY[elig][1], errorCode: elig }, ELIGIBILITY[elig][0]);
    if (reservation!.dropoff_declared_at) return json({ success: true, alreadyDeclared: true });

    const { data: updated, error: updErr } = await admin.from("reservations")
      .update({ dropoff_declared_at: new Date().toISOString() })
      .eq("id", reservationId).is("dropoff_declared_at", null).select("id").maybeSingle();
    if (updErr) throw updErr;
    if (!updated) return json({ success: true, alreadyDeclared: true });

    const { data: prof } = await admin.from("profiles").select("full_name").eq("user_id", userId).maybeSingle();
    const firstName = (prof?.full_name ?? "").trim().split(/\s+/)[0] || "Le findr";
    await admin.from("notifications").insert({
      user_id: reservation!.buyr_id,
      type: "dropoff_declared",
      title: `${firstName} a déposé le colis`,
      message: null,
      link: `/transaction/${reservationId}`,
    });

    return json({ success: true });
  } catch (err) {
    console.error("declare-dropoff error:", err);
    return json({ error: "Erreur serveur" }, 500);
  }
});
