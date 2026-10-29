// Tâche quotidienne : efface les fichiers d'étiquette des ventes terminées (30 j) ou livrées (7 j), hors litige ouvert.
import { createClient } from "npm:@supabase/supabase-js@2";
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";
import { isAuthorizedCron } from "../_shared/cronAuth.ts";
import { isLabelPurgeable } from "../_shared/labelFlow.ts";

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { ...corsHeaders, "Content-Type": "application/json" } });

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (!(await isAuthorizedCron(req))) return json({ error: "Unauthorized" }, 401);
  try {
    const admin = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
    const { data, error } = await admin.from("reservations")
      .select("id, label_path, payment_status, dispute_open, dispute_status, dispute_resolved_at, delivered_at, updated_at")
      .not("label_path", "is", null)
      .in("payment_status", ["termine", "annule", "rembourse", "livre"])
      .limit(500);
    if (error) throw error;
    let purged = 0;
    for (const r of data ?? []) {
      if (!isLabelPurgeable(r)) continue;
      const { error: rmErr } = await admin.storage.from("labels").remove([r.label_path]);
      if (rmErr) { console.error("purge-labels remove failed", r.id); continue; }
      const { error: upErr } = await admin.from("reservations").update({ label_path: null })
        .eq("id", r.id).eq("label_path", r.label_path).eq("dispute_open", false);
      if (upErr) { console.error("purge-labels update failed", r.id); continue; }
      purged++;
    }
    return json({ purged });
  } catch (err) {
    console.error("purge-labels error:", (err as Error).message);
    return json({ error: "Erreur serveur" }, 500);
  }
});
