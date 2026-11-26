// Signalement d'un message reçu : les règles (destinataire, limite horaire, capture) sont
// vérifiées par la fonction SQL report_message appelée avec le jeton de l'utilisateur.
import { createClient } from "npm:@supabase/supabase-js@2";
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";
import { z } from "npm:zod@3";
import { sendEmailTo } from "../_shared/brevo.ts";
import { CONTACT_EMAIL } from "../_shared/emails.ts";

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { ...corsHeaders, "Content-Type": "application/json" } });

const REASON_LABELS = {
  insultes_harcelement: "Insultes ou harcèlement",
  arnaque_lien_suspect: "Arnaque ou lien suspect",
  paiement_hors_findr: "Demande de payer hors de findr",
  contenu_interdit: "Contenu interdit",
  autre: "Autre",
} as const;

const BodySchema = z.object({
  messageId: z.string().uuid(),
  reason: z.enum(Object.keys(REASON_LABELS) as [keyof typeof REASON_LABELS, ...(keyof typeof REASON_LABELS)[]]),
  comment: z.string().trim().max(240).optional().nullable(),
}).strict();

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);
  const authHeader = req.headers.get("Authorization") ?? "";
  if (!authHeader.startsWith("Bearer ")) return json({ error: "unauthorized" }, 401);
  const parsed = BodySchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return json({ error: "invalid_parameters" }, 400);
  const { messageId, reason, comment } = parsed.data;

  const url = Deno.env.get("SUPABASE_URL")!;
  const userClient = createClient(url, Deno.env.get("SUPABASE_ANON_KEY")!, {
    global: { headers: { Authorization: authHeader } },
  });
  const { data: userData, error: userErr } = await userClient.auth.getUser();
  if (userErr || !userData?.user) return json({ error: "unauthorized" }, 401);

  const { data: reportId, error } = await userClient.rpc("report_message", {
    _message_id: messageId, _reason: reason, _comment: comment ?? null,
  });
  if (error) {
    const code = ["report_rate_limited", "not_receiver", "invalid_reason", "comment_too_long"]
      .find((c) => error.message.includes(c)) ?? "report_failed";
    return json({ error: code }, code === "report_rate_limited" ? 429 : 400);
  }

  // L'email à l'équipe ne doit jamais annuler un signalement déjà enregistré.
  try {
    const admin = createClient(url, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
    const { data: msg } = await admin.from("messages").select("content").eq("id", messageId).maybeSingle();
    await sendEmailTo(CONTACT_EMAIL, "message_report", {
      reasonLabel: REASON_LABELS[reason], content: msg?.content ?? "", comment: comment ?? "",
    }, undefined, undefined, `message-report-${reportId}`);
  } catch (e) {
    console.error("[report-message] email failed", e instanceof Error ? e.message : e);
  }
  return json({ ok: true });
});
