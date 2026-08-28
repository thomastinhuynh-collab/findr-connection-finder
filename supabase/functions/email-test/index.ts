// Fonction temporaire de test : envoie un ou plusieurs gabarits d'email
// à l'utilisateur ciblé. Protégée par un secret d'en-tête.
import { createClient } from "npm:@supabase/supabase-js@2";
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";
import { sendEmailToUser } from "../_shared/brevo.ts";
import type { EmailType } from "../_shared/emails.ts";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  const secret = Deno.env.get("EMAIL_TEST_SECRET");
  if (!secret || req.headers.get("x-test-secret") !== secret) {
    return new Response("forbidden", { status: 403, headers: corsHeaders });
  }

  const body = await req.json().catch(() => ({}));
  const userId: string = body.userId;
  const types: EmailType[] = body.types ?? ["welcome"];

  const admin = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );

  const results: Record<string, boolean> = {};
  for (const t of types) {
    results[t] = await sendEmailToUser(admin, userId, t, {
      searchTitle: "Sac Longchamp Pliage vintage",
      searchId: "00000000-0000-0000-0000-000000000000",
      proposalTitle: "Longchamp - Très bon état",
      itemTitle: "Longchamp - Très bon état",
      findrName: "Olga T.",
      price: 89,
      payoutAmount: 85.44,
      amount: 85.44,
      trackingNumber: "6A1234567890",
      carrier: "Colissimo",
      reasonLabel: "Objet non conforme à la description",
      role: body.role ?? "findr",
      reason: "le colis n'a pas été expédié dans les délais",
    });
  }

  return new Response(JSON.stringify(results), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
});
