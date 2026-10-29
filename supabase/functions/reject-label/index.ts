// Le findr signale l'étiquette fournie par le buyr comme inutilisable (parcours étiquette).
import { createClient } from "npm:@supabase/supabase-js@2";
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";
import { z } from "npm:zod@3";
import { loadLabelFlowEnabled } from "../_shared/paymentStatus.ts";
import { sendEmailToUser } from "../_shared/brevo.ts";
import { checkFindrLabelEligibility, normalizeRejectReason, planLabelRejection } from "../_shared/labelFlow.ts";
import { refundAndCancelReservation } from "../_shared/refundReservation.ts";

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { ...corsHeaders, "Content-Type": "application/json" } });

const BodySchema = z.object({ reservationId: z.string().uuid(), reason: z.string() });

const ELIGIBILITY: Record<string, [number, string]> = {
  flow_disabled: [403, "Le parcours étiquette n'est pas encore disponible."],
  not_found: [404, "Réservation introuvable"],
  forbidden: [403, "Non autorisé"],
  status: [400, "Cette étiquette ne peut plus être refusée."],
};

const first = (full: string | null | undefined, fallback: string) => (full ?? "").trim().split(/\s+/)[0] || fallback;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);

  try {
    const authHeader = req.headers.get("Authorization") ?? "";
    if (!authHeader.startsWith("Bearer ")) return json({ error: "Non authentifié" }, 401);
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const userClient = createClient(supabaseUrl, Deno.env.get("SUPABASE_ANON_KEY")!, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: claims, error: claimsErr } = await userClient.auth.getClaims(authHeader.slice(7));
    const userId = claims?.claims?.sub;
    if (claimsErr || !userId) return json({ error: "Non authentifié" }, 401);

    const admin = createClient(supabaseUrl, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
    const flowEnabled = await loadLabelFlowEnabled(admin);
    if (!flowEnabled) return json({ error: ELIGIBILITY.flow_disabled[1], errorCode: "flow_disabled" }, 403);

    const parsed = BodySchema.safeParse(await req.json().catch(() => ({})));
    if (!parsed.success) return json({ error: "Requête invalide" }, 400);
    const reason = normalizeRejectReason(parsed.data.reason);
    if (!reason) return json({ error: "Le motif doit faire entre 3 et 200 caractères.", errorCode: "reason" }, 400);
    const { reservationId } = parsed.data;

    const { data: reservation } = await admin.from("reservations")
      .select("id, buyr_id, findr_id, proposal_id, payment_status, label_provided_at, label_path, shipped_at, label_rejection_count, stripe_payment_intent_id, total_buyr_amount")
      .eq("id", reservationId).maybeSingle();
    const elig = checkFindrLabelEligibility(flowEnabled, reservation, userId);
    if (elig) return json({ error: ELIGIBILITY[elig][1], errorCode: elig }, ELIGIBILITY[elig][0]);
    const r = reservation!;

    const plan = planLabelRejection(r.label_rejection_count ?? 0, Date.now());
    const { data: updated, error: updErr } = await admin.from("reservations").update(plan.update)
      .eq("id", reservationId).eq("payment_status", "paye_en_attente_reception")
      .not("label_provided_at", "is", null).is("shipped_at", null)
      .select("id").maybeSingle();
    if (updErr) throw updErr;
    if (!updated) return json({ error: ELIGIBILITY.status[1], errorCode: "status" }, 409);

    if (r.label_path) {
      const { error: rmErr } = await admin.storage.from("labels").remove([r.label_path]);
      if (rmErr) console.error("reject-label: label file not removed for", reservationId, rmErr.message);
    }

    const { data: profiles } = await admin.from("profiles").select("user_id, full_name").in("user_id", [r.buyr_id, r.findr_id]);
    const findrFirst = first(profiles?.find((p) => p.user_id === r.findr_id)?.full_name, "Le findr");
    const link = `/transaction/${reservationId}`;

    if (plan.refund) {
      // 2e refus : annulation et remboursement intégral du buyr, frais de service compris.
      await refundAndCancelReservation(admin, r, "label_rejected_twice");
      const amount = Number(r.total_buyr_amount ?? 0).toFixed(2);
      await admin.from("notifications").insert([
        {
          user_id: r.findr_id,
          type: "cancellation",
          title: "Transaction annulée",
          message: "L'étiquette a été refusée deux fois : la vente est annulée et le buyr intégralement remboursé.",
          link,
        },
        {
          user_id: r.buyr_id,
          type: "cancellation",
          title: "Remboursement en cours",
          message: `${findrFirst} n'a pas pu utiliser l'étiquette une deuxième fois. ${amount} € (frais inclus) te seront recrédités sous quelques jours.`,
          link,
        },
      ]);
      try {
        await sendEmailToUser(admin, r.buyr_id, "refund", {
          reservationId,
          amount: r.total_buyr_amount,
          reason: "l'étiquette d'expédition a été refusée deux fois par le findr",
        });
      } catch (e) {
        console.error("reject-label: refund email failed for", reservationId, (e as Error).message);
      }
      return json({ success: true, refunded: true });
    }

    await admin.from("notifications").insert({
      user_id: r.buyr_id,
      type: "label_rejected",
      title: `${findrFirst} n'a pas pu utiliser l'étiquette`,
      message: `Envoie-en une nouvelle sous 48 h. Motif : ${reason}`,
      link,
    });
    try {
      const sent = await sendEmailToUser(admin, r.buyr_id, "label_rejected", { reservationId, findrFirstName: findrFirst, reason });
      if (!sent) console.error("reject-label: label_rejected email not sent for", reservationId);
    } catch (e) {
      console.error("reject-label: label_rejected email failed for", reservationId, (e as Error).message);
    }

    return json({ success: true, refunded: false, deadline: plan.update.label_deadline_at });
  } catch (err) {
    console.error("reject-label error:", err);
    return json({ error: "Erreur serveur" }, 500);
  }
});
