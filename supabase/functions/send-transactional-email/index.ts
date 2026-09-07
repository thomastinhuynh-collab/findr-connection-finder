// Point d'entrée centralisé pour les emails transactionnels findr.
// Appelable :
//  - depuis le front (JWT utilisateur) : l'utilisateur ne peut déclencher que
//    des emails vers un destinataire légitime (lui-même ou l'autre partie).
//  - depuis les autres Edge Functions (clé service_role).
import { createClient } from "npm:@supabase/supabase-js@2";
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";
import { z } from "npm:zod@3";
import { sendEmailToUser } from "../_shared/brevo.ts";
import type { EmailType } from "../_shared/emails.ts";

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

const TYPES = [
  "welcome",
  "new_proposal",
  "proposal_accepted",
  "shipped",
  "delivered",
  "funds_released",
  "auto_release",
  "refund",
  "dispute_opened",
  "dispute_received",
  "dispute_resolved_buyr",
  "dispute_resolved_findr",
  "reservation_reminder",
] as const;

const BodySchema = z.object({
  type: z.enum(TYPES),
  userId: z.string().uuid(),
  data: z.record(z.unknown()).optional(),
});

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const admin = createClient(supabaseUrl, serviceKey);

    const authHeader = req.headers.get("Authorization") ?? "";
    const token = authHeader.replace(/^Bearer\s+/i, "");
    const internal = token === serviceKey;

    const { data: userData } = internal ? { data: null } : await admin.auth.getUser(token);
    const caller = userData?.user ?? null;

    const parsed = BodySchema.safeParse(await req.json().catch(() => ({})));
    if (!parsed.success) return json({ error: "Paramètres invalides" }, 400);
    const { type, userId, data } = parsed.data;

    if (!internal && !caller) {
      // Seul l'email de bienvenue peut être déclenché sans session (inscription
      // avec confirmation d'email) et uniquement pour un compte tout juste créé.
      if (type !== "welcome") return json({ error: "Non authentifié" }, 401);
      const { data: target } = await admin.auth.admin.getUserById(userId);
      const createdAt = target?.user?.created_at
        ? new Date(target.user.created_at).getTime()
        : 0;
      if (!createdAt || Date.now() - createdAt > 10 * 60 * 1000) {
        return json({ error: "Non authentifié" }, 401);
      }
    }


    // L'envoi ne doit jamais faire échouer l'appelant : on répond toujours 200.
    const sent = await sendEmailToUser(admin, userId, type as EmailType, data ?? {});
    return json({ sent });
  } catch (err) {
    console.error("send-transactional-email error:", err);
    return json({ sent: false }, 200);
  }
});
