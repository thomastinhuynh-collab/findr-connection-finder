import { createClient } from "npm:@supabase/supabase-js@2";
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";
import Stripe from "npm:stripe@18";
import { computeFees } from "../_shared/fees.ts";

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

const eur = (n: number) => n.toFixed(2).replace(".", ",");

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);

  try {
    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) return json({ error: "Stripe non configuré" }, 500);

    const authHeader = req.headers.get("Authorization") ?? "";
    if (!authHeader) return json({ error: "Non authentifié" }, 401);

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const userClient = createClient(supabaseUrl, Deno.env.get("SUPABASE_ANON_KEY")!, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: userData, error: userErr } = await userClient.auth.getUser();
    if (userErr || !userData?.user) return json({ error: "Non authentifié" }, 401);
    const user = userData.user;

    const body = await req.json().catch(() => ({}));
    const proposalId = typeof body?.proposalId === "string" ? body.proposalId : null;
    const origin = typeof body?.origin === "string" ? body.origin : "";
    if (!proposalId || !origin) return json({ error: "Paramètres invalides" }, 400);

    const admin = createClient(supabaseUrl, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);

    const { data: proposal, error: pErr } = await admin
      .from("proposals")
      .select("id, search_id, findr_id, title, proposed_price")
      .eq("id", proposalId)
      .maybeSingle();
    if (pErr || !proposal) return json({ error: "Proposition introuvable" }, 404);

    const { data: search } = await admin
      .from("searches")
      .select("id, user_id, title")
      .eq("id", proposal.search_id)
      .maybeSingle();
    if (!search) return json({ error: "Recherche introuvable" }, 404);
    if (search.user_id !== user.id) return json({ error: "Non autorisé" }, 403);

    const {
      objectPrice,
      buyrFee,
      findrFee,
      total: totalBuyrAmount,
      payout: findrPayoutAmount,
    } = computeFees(Number(proposal.proposed_price));

    const amounts = {
      search_id: proposal.search_id,
      proposal_id: proposal.id,
      findr_id: proposal.findr_id,
      buyr_id: user.id,
      object_price: objectPrice,
      buyr_fee: buyrFee,
      findr_fee: findrFee,
      total_buyr_amount: totalBuyrAmount,
      findr_payout_amount: findrPayoutAmount,
      payment_status: "en_attente_paiement",
    };

    const { data: existing } = await admin
      .from("reservations")
      .select("id, payment_status")
      .eq("proposal_id", proposal.id)
      .maybeSingle();

    let reservationId: string;
    if (existing) {
      if (["paye_attente_etiquette", "etiquette_refusee", "paye_en_attente_reception", "termine"].includes(existing.payment_status ?? "")) {
        return json({ error: "Cette proposition est déjà payée." }, 400);
      }
      const { error } = await admin.from("reservations").update(amounts).eq("id", existing.id);
      if (error) throw error;
      reservationId = existing.id;
    } else {
      const { data: inserted, error } = await admin
        .from("reservations")
        .insert({
          ...amounts,
          justification: `Achat de la proposition « ${proposal.title} »`,
          status: "approved",
        })
        .select("id")
        .single();
      if (error) throw error;
      reservationId = inserted.id;
    }

    const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: [
        {
          price_data: {
            currency: "eur",
            unit_amount: Math.round(totalBuyrAmount * 100),
            product_data: {
              name: proposal.title,
              description: `Prix ${eur(objectPrice)} € + frais de service (0,50 € + 4 % = ${eur(buyrFee)} €)`,
            },
          },
          quantity: 1,
        },
      ],
      customer_email: user.email ?? undefined,
      metadata: { reservation_id: reservationId, proposal_id: proposal.id },
      payment_intent_data: {
        metadata: { reservation_id: reservationId, proposal_id: proposal.id },
      },
      success_url: `${origin}/recherche/${proposal.search_id}?paiement=succes`,
      cancel_url: `${origin}/recherche/${proposal.search_id}?paiement=annule`,
    });

    return json({ url: session.url, reservationId });
  } catch (err) {
    console.error("create-payment-checkout error:", err);
    return json({ error: (err as Error).message ?? "Erreur serveur" }, 500);
  }
});
