import { createClient } from "npm:@supabase/supabase-js@2";
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";
import Stripe from "npm:stripe@18";
import { isStripeAccountComplete } from "../_shared/stripeAccount.ts";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  const json = (body: unknown, status = 200) =>
    new Response(JSON.stringify(body), {
      status,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) return json({ error: "Unauthorized" }, 401);
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } },
    );
    const { data: claimsData, error: claimsError } = await supabase.auth.getClaims(
      authHeader.replace("Bearer ", ""),
    );
    if (claimsError || !claimsData?.claims) return json({ error: "Unauthorized" }, 401);
    const userId = claimsData.claims.sub as string;

    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) return json({ error: "Stripe non configuré" }, 500);
    const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });

    const admin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );
    const { data: profile, error: profileError } = await admin
      .from("profiles")
      .select("stripe_account_id")
      .eq("user_id", userId)
      .maybeSingle();
    if (profileError) throw profileError;
    if (!profile?.stripe_account_id) {
      return json({ complete: false, details_submitted: false, payouts_enabled: false, transfers: null });
    }

    const account = await stripe.accounts.retrieve(profile.stripe_account_id);
    const complete = isStripeAccountComplete(account);
    const { error: updateError } = await admin
      .from("profiles")
      .update({ stripe_onboarding_complete: complete })
      .eq("user_id", userId);
    if (updateError) throw updateError;

    return json({
      complete,
      details_submitted: !!account.details_submitted,
      payouts_enabled: !!account.payouts_enabled,
      transfers: account.capabilities?.transfers ?? null,
    });
  } catch (err) {
    console.error("sync-stripe-account error:", err);
    return json({ error: (err as Error).message ?? "Erreur inconnue" }, 500);
  }
});
