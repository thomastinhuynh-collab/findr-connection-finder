import { createClient } from "npm:@supabase/supabase-js@2";
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";
import Stripe from "npm:stripe@18";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  const json = (body: unknown, status = 200) =>
    new Response(JSON.stringify(body), {
      status,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return json({ error: "Unauthorized" }, 401);
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } },
    );

    const token = authHeader.replace("Bearer ", "");
    const { data: claimsData, error: claimsError } = await supabase.auth.getClaims(token);
    if (claimsError || !claimsData?.claims) {
      return json({ error: "Unauthorized" }, 401);
    }
    const userId = claimsData.claims.sub as string;
    const email = (claimsData.claims.email as string | undefined) ?? undefined;

    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) return json({ error: "Stripe non configuré" }, 500);
    const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });

    // Origin for return/refresh URLs
    let origin = req.headers.get("origin") ?? "";
    try {
      const body = await req.json();
      if (body?.origin && typeof body.origin === "string") origin = body.origin;
    } catch (_) {
      // no body — fine
    }
    if (!origin) return json({ error: "Origine manquante" }, 400);

    // Service role client to write the account id (bypasses RLS safely, scoped to this user)
    const admin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    const { data: profile, error: profileError } = await admin
      .from("profiles")
      .select("id, stripe_account_id")
      .eq("user_id", userId)
      .maybeSingle();
    if (profileError) throw profileError;
    if (!profile) return json({ error: "Profil introuvable" }, 404);

    let accountId: string | null = profile.stripe_account_id ?? null;

    if (accountId) {
      // Make sure the stored account still exists on this Stripe key
      try {
        await stripe.accounts.retrieve(accountId);
      } catch (_) {
        accountId = null;
      }
    }

    if (!accountId) {
      const account = await stripe.accounts.create({
        type: "express",
        country: "FR",
        email,
        business_type: "individual",
        capabilities: {
          card_payments: { requested: true },
          transfers: { requested: true },
        },
        metadata: { supabase_user_id: userId },
      });
      accountId = account.id;

      const { error: updateError } = await admin
        .from("profiles")
        .update({ stripe_account_id: accountId })
        .eq("user_id", userId);
      if (updateError) throw updateError;
    }

    const accountLink = await stripe.accountLinks.create({
      account: accountId,
      refresh_url: `${origin}/mon-espace?stripe=refresh`,
      return_url: `${origin}/mon-espace?stripe=success`,
      type: "account_onboarding",
    });

    return json({ url: accountLink.url, accountId });
  } catch (err) {
    console.error("create-stripe-connect-account error:", err);
    return json({ error: (err as Error).message ?? "Erreur inconnue" }, 500);
  }
});
