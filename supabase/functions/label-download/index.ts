// Lien signé de courte durée pour télécharger l'étiquette d'une réservation (buyr ou findr uniquement).
import { createClient } from "npm:@supabase/supabase-js@2";
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";
import { z } from "npm:zod@3";
import { LABEL_DOWNLOAD_TTL_SECONDS } from "../_shared/labelFlow.ts";

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { ...corsHeaders, "Content-Type": "application/json" } });

const BodySchema = z.object({ reservationId: z.string().uuid() });

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);
  try {
    const authHeader = req.headers.get("Authorization") ?? "";
    if (!authHeader.startsWith("Bearer ")) return json({ error: "Non authentifié" }, 401);
    const url = Deno.env.get("SUPABASE_URL")!;
    const userClient = createClient(url, Deno.env.get("SUPABASE_ANON_KEY")!, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: claims, error } = await userClient.auth.getClaims(authHeader.slice(7));
    const userId = claims?.claims?.sub;
    if (error || !userId) return json({ error: "Non authentifié" }, 401);

    const parsed = BodySchema.safeParse(await req.json().catch(() => ({})));
    if (!parsed.success) return json({ error: parsed.error.flatten().fieldErrors }, 400);

    const admin = createClient(url, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
    const { data: r } = await admin.from("reservations").select("id, buyr_id, findr_id, label_path")
      .eq("id", parsed.data.reservationId).maybeSingle();
    if (!r) return json({ error: "Réservation introuvable" }, 404);
    if (r.buyr_id !== userId && r.findr_id !== userId) return json({ error: "Non autorisé" }, 403);
    if (!r.label_path) return json({ error: "Aucune étiquette disponible." }, 404);

    const ext = r.label_path.split(".").pop() ?? "pdf";
    const { data: signed, error: sErr } = await admin.storage.from("labels")
      .createSignedUrl(r.label_path, LABEL_DOWNLOAD_TTL_SECONDS, { download: `etiquette-findr.${ext}` });
    if (sErr || !signed) throw sErr ?? new Error("signed url failed");
    return json({ url: signed.signedUrl, expiresIn: LABEL_DOWNLOAD_TTL_SECONDS });
  } catch (err) {
    console.error("label-download error:", err);
    return json({ error: "Erreur serveur" }, 500);
  }
});
