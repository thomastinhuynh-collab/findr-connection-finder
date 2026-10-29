// Le buyr fournit l'étiquette d'expédition (parcours étiquette, derrière app_settings.label_flow_enabled).
import { createClient } from "npm:@supabase/supabase-js@2";
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";
import { z } from "npm:zod@3";
import { normalizeTrackingNumber, normalizeCarrier, validateTrackingNumber, isOldTrackingEvent } from "../_shared/trackingValidation.ts";
import { checkTracking } from "../_shared/track17.ts";
import { loadLabelFlowEnabled } from "../_shared/paymentStatus.ts";
import {
  LABEL_CARRIERS, LABEL_EXT, LABEL_MIME, LABEL_UPLOAD_STATUSES, checkLabelEligibility, validateLabelFile,
} from "../_shared/labelFlow.ts";

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { ...corsHeaders, "Content-Type": "application/json" } });

const FieldsSchema = z.object({
  reservationId: z.string().uuid(),
  carrier: z.enum(LABEL_CARRIERS),
  trackingNumber: z.string().trim().min(1).max(64),
});

const ELIGIBILITY: Record<string, [number, string]> = {
  flow_disabled: [403, "Le dépôt d'étiquette n'est pas encore disponible."],
  not_found: [404, "Réservation introuvable"],
  forbidden: [403, "Non autorisé"],
  status: [400, "Cette réservation n'attend pas d'étiquette."],
};
const FILE_ERRORS: Record<string, string> = {
  empty: "Fichier vide.",
  too_large: "Le fichier dépasse 1,5 Mo.",
  signature: "Format accepté : PDF, PNG ou JPEG.",
  pdf_active_content: "Ce PDF contient du contenu actif et ne peut pas être accepté.",
  pdf_refused: "Ce PDF n'est pas accepté. Exporte ton étiquette en image (PNG ou JPEG) ou réimprime-la en PDF.",
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

    const form = await req.formData().catch(() => null);
    if (!form) return json({ error: "Requête invalide" }, 400);
    const parsed = FieldsSchema.safeParse({
      reservationId: form.get("reservationId"),
      carrier: form.get("carrier"),
      trackingNumber: form.get("trackingNumber"),
    });
    if (!parsed.success) return json({ error: parsed.error.flatten().fieldErrors }, 400);
    const { reservationId, carrier } = parsed.data;

    const { data: reservation } = await admin.from("reservations")
      .select("id, buyr_id, findr_id, payment_status, accepted_at")
      .eq("id", reservationId).maybeSingle();
    const elig = checkLabelEligibility(flowEnabled, reservation, userId);
    if (elig) return json({ error: ELIGIBILITY[elig][1], errorCode: elig }, ELIGIBILITY[elig][0]);

    const file = form.get("file");
    if (!(file instanceof File)) return json({ error: FILE_ERRORS.empty, errorCode: "empty" }, 400);
    if (file.size > 1.5 * 1024 * 1024) return json({ error: FILE_ERRORS.too_large, errorCode: "too_large" }, 400);
    const bytes = new Uint8Array(await file.arrayBuffer());
    const fileCheck = validateLabelFile(bytes);
    if ("error" in fileCheck) return json({ error: FILE_ERRORS[fileCheck.error], errorCode: fileCheck.error }, 400);

    const trackingNumber = normalizeTrackingNumber(parsed.data.trackingNumber);
    const invalid = validateTrackingNumber(trackingNumber, carrier);
    if (invalid) return json({ error: "Numéro de suivi invalide", errorCode: invalid }, 400);
    const { data: duplicate, error: dupErr } = await admin.from("reservations").select("id")
      .eq("tracking_carrier_key", normalizeCarrier(carrier)).eq("tracking_number_key", trackingNumber)
      .neq("id", reservationId).limit(1);
    if (dupErr) throw dupErr;
    if (duplicate?.length) return json({ error: "Ce numéro de suivi est déjà utilisé.", errorCode: "duplicate" }, 409);

    const evidence = await checkTracking(trackingNumber, carrier, true);
    if (isOldTrackingEvent(evidence?.firstEventAt ?? null, reservation!.accepted_at)) {
      return json({ error: "Ce numéro correspond à un envoi plus ancien.", errorCode: "old" }, 400);
    }

    const path = `${reservationId}/${crypto.randomUUID()}.${LABEL_EXT[fileCheck.kind]}`;
    const { error: upErr } = await admin.storage.from("labels")
      .upload(path, bytes, { contentType: LABEL_MIME[fileCheck.kind], upsert: false });
    if (upErr) throw upErr;

    const now = new Date().toISOString();
    const { data: updated, error: updErr } = await admin.from("reservations").update({
      label_path: path,
      label_carrier: carrier,
      label_tracking_number: trackingNumber,
      tracking_number: trackingNumber,
      carrier,
      label_provided_at: now,
      payment_status: "paye_en_attente_reception",
      tracking_recognized: evidence?.recognized ?? false,
      tracking_first_event_at: evidence?.firstEventAt ?? null,
      tracking_checked_at: evidence?.checkedAt ?? null,
    }).eq("id", reservationId).in("payment_status", LABEL_UPLOAD_STATUSES).select("id").maybeSingle();
    if (updErr || !updated) {
      await admin.storage.from("labels").remove([path]);
      if (updErr?.code === "23505") return json({ error: "Ce numéro de suivi est déjà utilisé.", errorCode: "duplicate" }, 409);
      if (updErr) throw updErr;
      return json({ error: ELIGIBILITY.status[1], errorCode: "status" }, 409);
    }

    const { data: prof } = await admin.from("profiles").select("full_name").eq("user_id", userId).maybeSingle();
    const firstName = (prof?.full_name ?? "").trim().split(/\s+/)[0] || "Le buyr";
    await admin.from("notifications").insert({
      user_id: reservation!.findr_id,
      type: "label_provided",
      title: `${firstName} t'a envoyé l'étiquette d'expédition`,
      message: `Transporteur : ${carrier} — suivi n° ${trackingNumber}.`,
      link: `/transaction/${reservationId}`,
    });

    return json({ success: true, tracking_recognized: evidence?.recognized ?? false });
  } catch (err) {
    console.error("provide-label error:", err);
    return json({ error: "Erreur serveur" }, 500);
  }
});
