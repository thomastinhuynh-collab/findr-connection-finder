import { createClient } from "npm:@supabase/supabase-js@2";
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";
import Stripe from "npm:stripe@18";
import { isStripeAccountComplete } from "../_shared/stripeAccount.ts";

// Fonction temporaire (admin uniquement) : synchronisation unique des comptes existants.
Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  const json = (b: unknown, s = 200) =>
    new Response(JSON.stringify(b), { status: s, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  const auth = req.headers.get("Authorization");
  if (!auth?.startsWith("Bearer ")) return json({ error: "Unauthorized" }, 401);
  const admin = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
  const { data: c } = await admin.auth.getClaims(auth.replace("Bearer ", ""));
  const uid = c?.claims?.sub;
  if (!uid) return json({ error: "Unauthorized" }, 401);
  const { data: isAdmin } = await admin.rpc("has_role", { _user_id: uid, _role: "admin" });
  if (!isAdmin) return json({ error: "Forbidden" }, 403);

  const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY")!, { apiVersion: "2025-08-27.basil" });
  const { data: rows } = await admin.from("profiles").select("user_id, stripe_account_id")
    .not("stripe_account_id", "is", null).or("stripe_onboarding_complete.is.null,stripe_onboarding_complete.eq.false");
  let checked = 0, nowComplete = 0, errors = 0;
  for (const r of rows ?? []) {
    checked++;
    try {
      const a = await stripe.accounts.retrieve(r.stripe_account_id!);
      const complete = isStripeAccountComplete(a);
      await admin.from("profiles").update({ stripe_onboarding_complete: complete }).eq("user_id", r.user_id);
      if (complete) nowComplete++;
    } catch (e) { errors++; console.error(r.stripe_account_id, (e as Error).message); }
  }
  return json({ checked, nowComplete, errors });
});
