// Lien signé de courte durée pour télécharger l'étiquette d'une réservation (buyr ou findr uniquement).
import { createClient } from "npm:@supabase/supabase-js@2";
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";
import { z } from "npm:zod@3";
import { LABEL_DOWNLOAD_TTL_SECONDS } from "../_shared/labelFlow.ts";

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { ...corsHeaders, "Content-Type": "application/json" } });

const BodySchema = z.object({ reservationId: z.string().uuid() });

const enc = new TextEncoder();
async function sign(payload: string): Promise<string> {
  const key = await crypto.subtle.importKey("raw", enc.encode(Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!),
    { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  const mac = new Uint8Array(await crypto.subtle.sign("HMAC", key, enc.encode(payload)));
  return Array.from(mac, (b) => b.toString(16).padStart(2, "0")).join("");
}
function safeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let d = 0;
  for (let i = 0; i < a.length; i++) d |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return d === 0;
}
const MIME: Record<string, string> = { pdf: "application/pdf", png: "image/png", jpg: "image/jpeg" };

// GET : lien signé (HMAC, expiration courte) — sert le fichier en pièce jointe, sans interprétation par le navigateur.
async function serveSigned(req: Request): Promise<Response> {
  const q = new URL(req.url).searchParams;
  const id = q.get("r") ?? "", exp = Number(q.get("exp")), sig = q.get("sig") ?? "";
  if (!z.string().uuid().safeParse(id).success || !Number.isFinite(exp) || Date.now() / 1000 > exp) {
    return new Response("Lien expiré ou invalide", { status: 403, headers: { "X-Content-Type-Options": "nosniff" } });
  }
  if (!safeEqual(sig, await sign(`${id}.${exp}`))) {
    return new Response("Lien expiré ou invalide", { status: 403, headers: { "X-Content-Type-Options": "nosniff" } });
  }
  const admin = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
  const { data: r } = await admin.from("reservations").select("label_path").eq("id", id).maybeSingle();
  if (!r?.label_path) return new Response("Introuvable", { status: 404, headers: { "X-Content-Type-Options": "nosniff" } });
  const { data: file, error } = await admin.storage.from("labels").download(r.label_path);
  if (error || !file) return new Response("Introuvable", { status: 404, headers: { "X-Content-Type-Options": "nosniff" } });
  const ext = r.label_path.split(".").pop() ?? "pdf";
  return new Response(file.stream(), {
    status: 200,
    headers: {
      "Content-Type": MIME[ext] ?? "application/octet-stream",
      "Content-Disposition": `attachment; filename="etiquette-findr.${ext}"`,
      "X-Content-Type-Options": "nosniff",
      "Cache-Control": "private, no-store",
    },
  });
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method === "GET") return serveSigned(req);
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

    const exp = Math.floor(Date.now() / 1000) + LABEL_DOWNLOAD_TTL_SECONDS;
    const sig = await sign(`${r.id}.${exp}`);
    return json({ url: `${url}/functions/v1/label-download?r=${r.id}&exp=${exp}&sig=${sig}`, expiresIn: LABEL_DOWNLOAD_TTL_SECONDS });
  } catch (err) {
    console.error("label-download error:", err);
    return json({ error: "Erreur serveur" }, 500);
  }
});
