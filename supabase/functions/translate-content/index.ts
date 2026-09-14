import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";
import { z } from "npm:zod";
import { serviceClient, sha256, translateWithLovableAI } from "../_shared/content-translation.ts";

const BodySchema = z.object({
  type: z.enum(["search", "proposal"]),
  id: z.string().uuid(),
  targetLang: z.enum(["fr", "en"]),
});

const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), {
  status,
  headers: { ...corsHeaders, "Content-Type": "application/json" },
});

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "Méthode non autorisée." }, 405);
  try {
    const parsed = BodySchema.safeParse(await req.json());
    if (!parsed.success) return json({ error: "Paramètres de traduction invalides." }, 400);
    const { type, id, targetLang } = parsed.data;
    const db = serviceClient();
    const sourceTable = type === "search" ? "searches" : "proposals";
    const translationTable = type === "search" ? "search_translations" : "proposal_translations";
    const foreignKey = type === "search" ? "search_id" : "proposal_id";

    if (type === "proposal") {
      const authHeader = req.headers.get("Authorization") ?? "";
      const token = authHeader.replace(/^Bearer\s+/i, "");
      const { data: authData } = await db.auth.getUser(token);
      if (!authData.user) return json({ error: "Connexion requise." }, 401);
      const { data: proposal } = await db.from("proposals").select("findr_id, searches!inner(user_id)").eq("id", id).maybeSingle();
      const ownerId = (proposal?.searches as { user_id?: string } | null)?.user_id;
      if (!proposal || (proposal.findr_id !== authData.user.id && ownerId !== authData.user.id)) return json({ error: "Accès refusé." }, 403);
    }

    const { data: source, error: sourceError } = await db.from(sourceTable).select("title, description, source_lang").eq("id", id).maybeSingle();
    if (sourceError || !source) return json({ error: "Contenu introuvable." }, 404);
    const sourceLang = source.source_lang === "en" ? "en" : "fr";
    if (sourceLang === targetLang) return json({ title: source.title, description: source.description, translated: false });
    const sourceHash = await sha256(`${sourceLang}\n${source.title}\n${source.description ?? ""}`);
    const { data: cached } = await db.from(translationTable).select("title, description, source_hash").eq(foreignKey, id).eq("target_lang", targetLang).maybeSingle();
    if (cached?.source_hash === sourceHash) return json({ title: cached.title, description: cached.description, translated: true, cached: true });

    const apiKey = Deno.env.get("LOVABLE_API_KEY");
    if (!apiKey) return json({ error: "La traduction automatique n'est pas configurée." }, 500);
    const translated = await translateWithLovableAI(apiKey, sourceLang, targetLang, source.title, source.description);
    await db.from(translationTable).upsert({
      [foreignKey]: id,
      target_lang: targetLang,
      title: translated.title.slice(0, 500),
      description: translated.description?.slice(0, 5000) ?? null,
      source_hash: sourceHash,
    }, { onConflict: `${foreignKey},target_lang` });
    return json({ ...translated, translated: true, cached: false });
  } catch (error) {
    const status = typeof (error as { status?: unknown })?.status === "number" ? (error as { status: number }).status : 500;
    const message = error instanceof Error ? error.message : "La traduction automatique est momentanément indisponible.";
    return json({ error: message }, status);
  }
});