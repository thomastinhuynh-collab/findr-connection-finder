// Notification interne : alerte l'équipe findr à chaque inscription à la
// liste d'attente. Appelée depuis le front juste après l'insert réussi.
// L'envoi ne doit jamais faire échouer l'appelant : réponse toujours 200.
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";
import { z } from "npm:zod@3";
import { sendEmailTo } from "../_shared/brevo.ts";

const NOTIFY_EMAIL = "thomas@findrapp.fr";

const BodySchema = z.object({
  email: z.string().email().max(255),
  role: z.enum(["buyr", "findr", "unknown"]).optional(),
  count: z.number().int().positive().max(1_000_000).optional(),
});

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);

  try {
    const parsed = BodySchema.safeParse(await req.json().catch(() => ({})));
    if (!parsed.success) return json({ sent: false });
    const { email, role, count } = parsed.data;

    const sent = await sendEmailTo(NOTIFY_EMAIL, "waitlist_signup", {
      email,
      role: role ?? "unknown",
      count,
    });
    return json({ sent });
  } catch (err) {
    console.error("notify-waitlist-signup error:", err);
    return json({ sent: false }, 200);
  }
});
