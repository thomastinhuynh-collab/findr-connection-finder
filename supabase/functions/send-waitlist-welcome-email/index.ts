// Email de bienvenue envoyé aux nouveaux inscrits de la table `waitlist`.
// Déclenché exclusivement par un trigger base de données (pg_net) qui envoie
// un secret partagé dans l'en-tête `x-webhook-secret`. Sans ce secret valide,
// la fonction refuse la requête : elle n'est donc pas appelable publiquement.
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";
import { createClient } from "npm:@supabase/supabase-js@2";
import { z } from "npm:zod@3";
import { sendEmailTo } from "../_shared/brevo.ts";
import { CONTACT_SENDER } from "../_shared/emails.ts";

const ADMIN_EMAIL = "thomas@findrapp.fr";

const BodySchema = z.object({
  record: z.object({
    id: z.string().uuid().optional(),
    email: z.string().email().max(255),
    first_name: z.string().max(120).nullish(),
  }),
  type: z.string().optional(),
});

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

/** Comparaison à temps constant pour éviter les attaques temporelles. */
function safeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);

  const admin = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    { auth: { persistSession: false } },
  );

  // 1. Authentification du webhook : secret partagé stocké en base,
  //    lisible uniquement par le service role.
  const provided = req.headers.get("x-webhook-secret") ?? "";
  const { data: secretRow } = await admin
    .from("webhook_secrets")
    .select("secret")
    .eq("name", "waitlist_welcome")
    .maybeSingle();

  if (!secretRow?.secret || !provided || !safeEqual(provided, secretRow.secret)) {
    console.error("[waitlist-welcome] secret de webhook invalide");
    return json({ error: "Unauthorized" }, 401);
  }

  try {
    const parsed = BodySchema.safeParse(await req.json().catch(() => ({})));
    if (!parsed.success) return json({ error: "Invalid payload" }, 400);
    const { email, first_name, id } = parsed.data.record;

    // 2. Idempotence : un seul email de bienvenue par inscription.
    const { error: claimError } = await admin
      .from("waitlist_welcome_emails")
      .insert({ email: email.toLowerCase(), waitlist_id: id ?? null });
    if (claimError) {
      if (claimError.code === "23505") {
        console.log(`[waitlist-welcome] déjà envoyé à ${email} — ignoré`);
        return json({ sent: false, reason: "already_sent" });
      }
      console.error("[waitlist-welcome] échec du verrou d'idempotence:", claimError);
      return json({ sent: false, reason: "claim_failed" });
    }

    const sent = await sendEmailTo(
      email,
      "waitlist_welcome",
      { firstName: first_name ?? undefined },
      CONTACT_SENDER,
    );

    // Si Brevo refuse, on libère le verrou pour permettre un renvoi ultérieur.
    if (!sent) {
      await admin.from("waitlist_welcome_emails").delete().eq("email", email.toLowerCase());
    }

    // 3. Alerte interne : notification de la nouvelle inscription (non bloquante).
    try {
      await sendEmailTo(
        ADMIN_EMAIL,
        "waitlist_signup",
        { email, firstName: first_name ?? undefined, createdAt: new Date().toISOString() },
        CONTACT_SENDER,
      );
    } catch (e) {
      console.error("[waitlist-welcome] alerte admin échouée:", e);
    }

    return json({ sent });
  } catch (err) {
    console.error("send-waitlist-welcome-email error:", err);
    return json({ sent: false }, 200);
  }
});
