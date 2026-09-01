// Actions administrateur sur les soldes à recouvrer (Article 12 CGV).
// Vérification STRICTE du rôle admin côté serveur (table user_roles).
import { createClient } from "npm:@supabase/supabase-js@2";
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";
import { z } from "npm:zod@3";

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

const BodySchema = z.discriminatedUnion("action", [
  z.object({
    action: z.literal("mark_settled"),
    findrId: z.string().uuid(),
    notes: z.string().trim().min(5).max(2000),
  }),
  z.object({
    action: z.literal("set_payout_hold"),
    findrId: z.string().uuid(),
    hold: z.boolean(),
    notes: z.string().trim().min(5).max(2000),
  }),
]);

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);

  try {
    const authHeader = req.headers.get("Authorization") ?? "";
    if (!authHeader) return json({ error: "Non authentifié" }, 401);

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const userClient = createClient(supabaseUrl, Deno.env.get("SUPABASE_ANON_KEY")!, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: userData, error: userErr } = await userClient.auth.getUser();
    if (userErr || !userData?.user) return json({ error: "Non authentifié" }, 401);
    const user = userData.user;

    const admin = createClient(supabaseUrl, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);

    const { data: isAdmin } = await admin.rpc("has_role", {
      _user_id: user.id,
      _role: "admin",
    });
    if (!isAdmin) return json({ error: "Accès réservé aux administrateurs" }, 403);

    const parsed = BodySchema.safeParse(await req.json().catch(() => ({})));
    if (!parsed.success) return json({ error: "Paramètres invalides" }, 400);
    const body = parsed.data;

    const { data: profile } = await admin
      .from("profiles")
      .select("user_id, negative_balance, payout_hold")
      .eq("user_id", body.findrId)
      .maybeSingle();
    if (!profile) return json({ error: "Findr introuvable" }, 404);

    if (body.action === "mark_settled") {
      const settled = Number(profile.negative_balance) || 0;

      await admin
        .from("findr_debits")
        .update({
          status: "rembourse_manuellement",
          resolved_at: new Date().toISOString(),
          admin_notes: body.notes,
        })
        .eq("findr_id", body.findrId)
        .eq("status", "en_attente");

      await admin
        .from("profiles")
        .update({ negative_balance: 0 })
        .eq("user_id", body.findrId);

      await admin.from("notifications").insert({
        user_id: body.findrId,
        type: "balance_settled",
        title: "Solde régularisé",
        message: `Ton solde à régulariser (${settled.toFixed(2)} €) a été marqué comme réglé par l'équipe findr.`,
        link: "/mon-espace",
      });

      console.log(`admin ${user.id} a réglé manuellement ${settled}€ pour findr ${body.findrId}`);
      return json({ success: true, settled });
    }

    // set_payout_hold
    await admin
      .from("profiles")
      .update({ payout_hold: body.hold })
      .eq("user_id", body.findrId);

    await admin.from("findr_debits").insert({
      findr_id: body.findrId,
      amount: 0,
      reason: "ajustement_admin",
      status: body.hold ? "en_attente" : "annule",
      resolved_at: body.hold ? null : new Date().toISOString(),
      admin_notes: `${body.hold ? "Activation" : "Désactivation"} de la mise en attente des versements : ${body.notes}`,
    });

    console.log(
      `admin ${user.id} a mis payout_hold=${body.hold} pour findr ${body.findrId}`,
    );
    return json({ success: true, payoutHold: body.hold });
  } catch (err) {
    console.error("admin-findr-balances error:", err);
    return json({ error: (err as Error).message ?? "Erreur serveur" }, 500);
  }
});
