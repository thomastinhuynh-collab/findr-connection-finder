// Tâche planifiée quotidienne : rappel aux findrs dont la réservation exclusive
// expire dans 2 jours et qui n'ont pas encore déposé de proposition.
import { createClient } from "npm:@supabase/supabase-js@2";
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";
import { sendEmailToUser } from "../_shared/brevo.ts";

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

const DAY = 24 * 60 * 60 * 1000;
const BATCH = 100;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const admin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    const now = Date.now();
    // Fenêtre J-2 : expiration entre dans 24 h et dans 48 h.
    const from = new Date(now + DAY).toISOString();
    const to = new Date(now + 2 * DAY).toISOString();

    const { data: reservations, error } = await admin
      .from("reservations")
      .select("id, findr_id, search_id, expires_at, searches(title)")
      .eq("status", "approved")
      .is("proposal_id", null)
      .gt("expires_at", from)
      .lte("expires_at", to)
      .limit(BATCH);
    if (error) throw error;

    let reminded = 0;
    for (const r of reservations ?? []) {
      // deno-lint-ignore no-explicit-any
      const searchTitle = (r as any).searches?.title ?? "une recherche";

      // Anti-doublon : une seule notification de rappel par réservation.
      const { data: existing } = await admin
        .from("notifications")
        .select("id")
        .eq("user_id", r.findr_id)
        .eq("type", "reservation_reminder")
        .eq("link", `/proposition/${r.search_id}`)
        .limit(1);
      if (existing && existing.length > 0) continue;

      await admin.from("notifications").insert({
        user_id: r.findr_id,
        type: "reservation_reminder",
        title: "Ta réservation expire dans 2 jours ⏳",
        message: `Fais ta proposition sur « ${searchTitle} » avant l'expiration, sinon la recherche redevient ouverte à tous.`,
        link: `/proposition/${r.search_id}`,
      });

      await sendEmailToUser(admin, r.findr_id, "reservation_reminder", {
        searchTitle,
        searchId: r.search_id,
      });
      reminded++;
    }

    return json({ reminded });
  } catch (err) {
    console.error("reservation-reminders error:", err);
    return json({ error: (err as Error).message ?? "Erreur serveur" }, 500);
  }
});
