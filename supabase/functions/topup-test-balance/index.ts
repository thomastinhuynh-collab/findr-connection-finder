import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";
import Stripe from "npm:stripe@18";

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);

  try {
    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) return json({ error: "Stripe non configuré" }, 500);
    if (!stripeKey.startsWith("sk_test")) {
      return json({ error: "Cette fonction est réservée au mode Test." }, 403);
    }

    const body = await req.json().catch(() => ({}));
    const euros = Number(body?.amount ?? 1000);
    if (!Number.isFinite(euros) || euros <= 0 || euros > 100000) {
      return json({ error: "Montant invalide" }, 400);
    }

    const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });

    const attempts: { strategy: string; ok: boolean; detail: string }[] = [];
    let topupId: string | null = null;

    const run = async (strategy: string, fn: () => Promise<string>) => {
      if (topupId) return;
      try {
        topupId = await fn();
        attempts.push({ strategy, ok: true, detail: topupId });
      } catch (e) {
        attempts.push({ strategy, ok: false, detail: (e as Error).message });
      }
    };

    const amountCents = Math.round(euros * 100);

    // 1) Top-up EUR via un bank token de test (IBAN de test SEPA)
    await run("topup_eur_bank_token", async () => {
      const btok = await stripe.tokens.create({
        bank_account: {
          country: "DE",
          currency: "eur",
          account_holder_name: "findr Test",
          account_holder_type: "individual",
          account_number: "DE89370400440532013000",
        },
      });
      const t = await stripe.topups.create({
        amount: amountCents,
        currency: "eur",
        description: `Alimentation solde test (${euros} EUR)`,
        source: btok.id,
      });
      return t.id;
    });

    // 2) Fallback : token de test générique fourni par Stripe
    await run("topup_eur_btok_verified", async () => {
      const t = await stripe.topups.create({
        amount: amountCents,
        currency: "eur",
        description: `Alimentation solde test (${euros} EUR)`,
        source: "btok_de_verified",
      });
      return t.id;
    });

    const balance = await stripe.balance.retrieve();

    return json(
      {
        success: !!topupId,
        topupId,
        amount: euros,
        attempts,
        available: balance.available,
        pending: balance.pending,
      },
      topupId ? 200 : 500,
    );

  } catch (err) {
    console.error("topup-test-balance error:", err);
    return json({ error: (err as Error).message ?? "Erreur serveur" }, 500);
  }
});
